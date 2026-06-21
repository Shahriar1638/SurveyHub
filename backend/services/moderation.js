const { GoogleGenerativeAI } = require('@google/generative-ai');
const ModerationPolicy = require('../models/ModerationPolicy');
const GeminiUsage = require('../models/GeminiUsage');

const MODEL = 'gemini-2.0-flash';
const OPENROUTER_TIMEOUT = 30000; // 30s

// ── OpenRouter smart model picker ───────────────────────────────────────────
let cachedFreeModel = null;
let cacheExpiry = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetches the best free model from OpenRouter (newest + highest context).
 * Cached for 1 hour. Falls back to deepseek/deepseek-v4-flash:free.
 */
async function getBestFreeModel() {
  // Use env override if set
  if (process.env.OPENROUTER_MODEL) {
    return process.env.OPENROUTER_MODEL;
  }

  // Return cached if fresh
  if (cachedFreeModel && Date.now() < cacheExpiry) {
    return cachedFreeModel;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return 'deepseek/deepseek-v4-flash:free';

  try {
    console.log('[Moderation] Fetching OpenRouter model list...');
    const res = await fetch('https://openrouter.ai/api/v1/models?sort=newest&output_modalities=text', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error(`[Moderation] Models API returned ${res.status}`);
      return cachedFreeModel || 'deepseek/deepseek-v4-flash:free';
    }

    const { data: models } = await res.json();
    if (!models?.length) return cachedFreeModel || 'deepseek/deepseek-v4-flash:free';

    // Filter: free, text output, no expiration
    const freeModels = models.filter(m => {
      if (m.expiration_date) return false;
      const price = parseFloat(m.pricing?.prompt || '1');
      const completion = parseFloat(m.pricing?.completion || '1');
      return price === 0 && completion === 0;
    });

    if (!freeModels.length) {
      console.log('[Moderation] No free models found on OpenRouter');
      return cachedFreeModel || 'deepseek/deepseek-v4-flash:free';
    }

    // Sort: newest first, then by context length (bigger = better)
    freeModels.sort((a, b) => {
      const createdDiff = (b.created || 0) - (a.created || 0);
      if (createdDiff !== 0) return createdDiff;
      return (b.context_length || 0) - (a.context_length || 0);
    });

    const best = freeModels[0];
    cachedFreeModel = best.id;
    cacheExpiry = Date.now() + CACHE_TTL;

    console.log(`[Moderation] Best free model: ${best.name} (${best.id}) — ${best.context_length?.toLocaleString()} ctx, released ${new Date(best.created).toISOString().split('T')[0]}`);
    console.log(`[Moderation] Other free options: ${freeModels.slice(1, 5).map(m => m.id).join(', ')}`);

    return best.id;
  } catch (err) {
    console.error('[Moderation] Failed to fetch model list:', err.message);
    return cachedFreeModel || 'deepseek/deepseek-v4-flash:free';
  }
}

// ── Collect all Gemini keys from env (handles comma-separated) ──────────────
function getGeminiKeys() {
  const keys = [];
  // Primary key — may be comma-separated
  if (process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY.split(',').forEach(k => {
      const trimmed = k.trim();
      if (trimmed) keys.push(trimmed);
    });
  }
  // Additional numbered keys
  for (let i = 2; i <= 10; i++) {
    const k = process.env[`GEMINI_KEY_${i}`];
    if (k) {
      k.split(',').forEach(v => {
        const trimmed = v.trim();
        if (trimmed) keys.push(trimmed);
      });
    }
  }
  console.log(`[Moderation] Found ${keys.length} Gemini key(s)`);
  return keys;
}

// ── Try Gemini with a specific key ──────────────────────────────────────────
async function tryGemini(apiKey, prompt) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text().trim();

  // Track usage
  const today = new Date().toISOString().split('T')[0];
  const tokens = response.usageMetadata?.totalTokenCount || 0;
  GeminiUsage.findOneAndUpdate(
    { date: today },
    { $inc: { requests: 1, tokens } },
    { upsert: true, new: true }
  ).catch(() => {});

  return text;
}

// ── Try OpenRouter with the best free model ─────────────────────────────────
async function tryOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No OpenRouter key configured');

  const modelId = await getBestFreeModel();
  console.log(`[Moderation] Calling OpenRouter (${modelId})...`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://surveyhub.app',
        'X-Title': 'SurveyHub Content Moderation',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.status === 429) {
      const body = await res.text();
      console.error(`[Moderation] OpenRouter rate limited: ${body}`);
      throw new Error('OpenRouter quota exceeded');
    }

    if (!res.ok) {
      const body = await res.text();
      console.error(`[Moderation] OpenRouter HTTP ${res.status}: ${body}`);
      throw new Error(`OpenRouter error ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();

    if (!data.choices?.[0]?.message?.content) {
      console.error('[Moderation] OpenRouter empty response:', JSON.stringify(data).slice(0, 500));
      throw new Error('OpenRouter returned empty response');
    }

    const text = data.choices[0].message.content.trim();
    console.log(`[Moderation] OpenRouter responded (${text.length} chars)`);
    return text;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.error('[Moderation] OpenRouter request timed out');
      throw new Error('OpenRouter request timed out');
    }
    throw err;
  }
}

// ── Build the moderation prompt ──────────────────────────────────────────────
function buildPrompt(policy, contentText) {
  const rulesText = policy.rules
    .map(r => `- [${r.severity.toUpperCase()}] ${r.label}: ${r.description}`)
    .join('\n');

  return `You are a content moderation AI for SurveyHub.

POLICY RULES:
${rulesText}

CUSTOM INSTRUCTIONS:
${policy.customInstructions || 'Be fair and professional.'}

CONTENT TO REVIEW:
${contentText}

ANALYSIS:
Check the content against EVERY rule. Respond in EXACTLY this JSON format (no markdown):
{
  "safe": true or false,
  "decision": "approved" or "rejected" or "pending",
  "reason": "Brief explanation (1-2 sentences)",
  "flaggedCategories": ["rule_id"] or []
}

DECISION LOGIC:
- NO high-severity violations → "approved"
- ANY high-severity violation → "rejected"
- ONLY low-severity or uncertain → "pending"`;
}

// ── Parse the AI response ───────────────────────────────────────────────────
function parseResponse(text) {
  const cleaned = text.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return {
    safe: Boolean(parsed.safe),
    decision: ['approved', 'rejected', 'pending'].includes(parsed.decision) ? parsed.decision : 'pending',
    reason: parsed.reason || 'No reason provided',
    flaggedCategories: Array.isArray(parsed.flaggedCategories) ? parsed.flaggedCategories : [],
  };
}

// ── Main moderation function ────────────────────────────────────────────────
async function moderateContent({ contentType, title, description, questions, content }) {
  // 1. Fetch active policy
  const policy = await ModerationPolicy.findOne({ contentType, enabled: true }).lean();
  if (!policy) {
    console.log(`[Moderation] No ${contentType} policy found — auto-approving`);
    return { safe: true, decision: 'approved', reason: 'No moderation policy configured', flaggedCategories: [] };
  }

  // 2. Build content text
  let contentText = '';
  if (contentType === 'survey') {
    contentText = `Title: ${title || 'Untitled'}
Description: ${description || 'No description'}
Questions:
${(questions || []).map((q, i) => `${i + 1}. [${q.type}] ${q.label}${q.options?.length ? '\n   Options: ' + q.options.join(', ') : ''}`).join('\n')}`;
  } else {
    contentText = `Title: ${title || 'Untitled'}
Content: ${content || 'No content'}`;
  }

  const prompt = buildPrompt(policy, contentText);

  // 3. Try Gemini keys in sequence
  const geminiKeys = getGeminiKeys();
  for (let i = 0; i < geminiKeys.length; i++) {
    const key = geminiKeys[i];
    try {
      console.log(`[Moderation] Trying Gemini key ${i + 1}/${geminiKeys.length} (...${key.slice(-4)})`);
      const text = await tryGemini(key, prompt);
      console.log(`[Moderation] Gemini key ${i + 1} succeeded`);
      return parseResponse(text);
    } catch (err) {
      const errStr = String(err.message || '').toLowerCase();
      if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('resource_exhausted')) {
        console.log(`[Moderation] Gemini key ${i + 1} (...${key.slice(-4)}) quota exceeded`);
        continue; // try next key
      }
      // Non-quota error — log but still try next key
      console.error(`[Moderation] Gemini key ${i + 1} error: ${err.message}`);
      continue;
    }
  }

  // 4. All Gemini keys exhausted — try OpenRouter
  try {
    const text = await tryOpenRouter(prompt);
    return parseResponse(text);
  } catch (err) {
    console.error('[Moderation] OpenRouter failed:', err.message);
  }

  // 5. All providers exhausted
  console.log('[Moderation] ALL providers exhausted — content will be saved as draft');
  return {
    safe: false,
    decision: 'pending',
    reason: '',
    flaggedCategories: [],
    allExhausted: true,
  };
}

module.exports = { moderateContent };

const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL = 'gemini-2.0-flash';
const OPENROUTER_TIMEOUT = 45000;

// ── Gemini key rotation (shared with moderation) ─────────────────────────────
function getGeminiKeys() {
  const keys = [];
  if (process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY.split(',').forEach((k) => {
      const trimmed = k.trim();
      if (trimmed) keys.push(trimmed);
    });
  }
  for (let i = 2; i <= 10; i++) {
    const k = process.env[`GEMINI_KEY_${i}`];
    if (k) {
      k.split(',').forEach((v) => {
        const trimmed = v.trim();
        if (trimmed) keys.push(trimmed);
      });
    }
  }
  return keys;
}

async function tryGemini(apiKey, prompt) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

async function tryOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No OpenRouter key configured');

  // Dynamically pick the best free model from OpenRouter
  let modelId;
  try {
    const { getBestFreeModel } = require('./moderation');
    modelId = await getBestFreeModel();
  } catch {
    modelId = 'deepseek/deepseek-v4-flash:free';
  }
  // Override from env if set
  modelId = process.env.OPENROUTER_MODEL || modelId;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://surveyhub.app',
        'X-Title': 'SurveyHub AI Insights',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenRouter returned empty response');
    return text.trim();
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('OpenRouter request timed out');
    throw err;
  }
}

async function tryOpenZen(prompt) {
  const apiKey = process.env.OPEN_ZEN_API_KEY;
  if (!apiKey) throw new Error('No OpenCode Zen key configured');

  const baseUrl = (process.env.OPEN_ZEN_BASE_URL || 'https://opencode.ai/zen/v1').replace(/\/+$/, '');
  const modelId = process.env.OPEN_ZEN_MODEL || 'deepseek/deepseek-v4-flash:free';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenCode Zen ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenCode Zen returned empty response');
    return text.trim();
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('OpenCode Zen request timed out');
    throw err;
  }
}

// ── Build the insights prompt ────────────────────────────────────────────────
function buildInsightsPrompt(survey, stats) {
  const questionContext = survey.questions
    .map((q, i) => {
      let line = `${i + 1}. [${q.type}] "${q.label}"`;
      if (q.type === 'linear_scale') {
        const min = q.options?.[0] || '1';
        const max = q.options?.[1] || '5';
        const minLabel = q.options?.[2] || 'min';
        const maxLabel = q.options?.[3] || 'max';
        line += `\n   Scale: ${min} (${minLabel}) to ${max} (${maxLabel})`;
        if (q.scaleLabels && Object.keys(q.scaleLabels).length > 0) {
          const labels = Object.entries(q.scaleLabels).map(([k, v]) => `${k}=${v}`).join(', ');
          line += `\n   Column labels: ${labels}`;
        }
        const items = q.options?.slice(4) || [];
        if (items.length > 0) {
          line += `\n   Items rated: ${items.join(', ')}`;
        }
      } else if (q.options?.length) {
        line += `\n   Options: ${q.options.join(', ')}`;
      }
      return line;
    })
    .join('\n');

  const statsContext = stats.perQuestion
    .map((pq) => {
      const q = survey.questions.find((s) => s.id === pq.questionId);
      const label = q?.label || pq.questionId;
      const breakdown = (pq.optionBreakdown || [])
        .map((ob) => `    "${ob.value}": ${ob.count} votes (${Math.round((ob.count / pq.responseCount) * 100)}%)`)
        .join('\n');
      return `Question: "${label}"\n  Total answers: ${pq.responseCount}\n${breakdown || '  No responses'}`;
    })
    .join('\n\n');

  return `You are a survey analytics expert for SurveyHub. Analyze the following survey results and generate actionable insights.

SURVEY TITLE: "${survey.title}"
DESCRIPTION: "${survey.description || 'No description provided'}"
CATEGORY: "${survey.category || 'Uncategorized'}"
TOTAL RESPONSES: ${stats.totalResponses}

QUESTIONS:
${questionContext}

RESULTS DATA:
${statsContext}

---

Generate a JSON response (no markdown, no code fences) with this EXACT structure:
{
  "summary": "A 2-3 sentence executive summary of the survey results. Highlight the overall trend or most notable finding.",
  "keyFindings": [
    "Finding 1: A specific, data-backed observation from the results (reference actual percentages)",
    "Finding 2: Another notable pattern or insight",
    "Finding 3: A surprising or noteworthy result"
  ],
  "recommendations": [
    "Actionable recommendation 1 based on the data",
    "Actionable recommendation 2",
    "Actionable recommendation 3"
  ],
  "topThemes": {
    "question_id_1": ["theme1", "theme2"],
    "question_id_2": ["theme3"]
  }
}

RULES:
- Use real numbers and percentages from the data
- Be specific, not generic — reference actual option labels
- Keep summary under 50 words
- Each key finding should be 1-2 sentences
- Each recommendation should be actionable and tied to the data
- topThemes: for each question, identify 1-3 themes/labels from the option breakdown (skip text-only questions)
- If a question has very few responses (<5), note it as limited data
- Respond in the SAME LANGUAGE as the survey title/description`;
}

// ── Parse AI response ────────────────────────────────────────────────────────
function parseInsights(text) {
  const cleaned = text.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    summary: String(parsed.summary || ''),
    keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings.map(String) : [],
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map(String) : [],
    topThemes: parsed.topThemes && typeof parsed.topThemes === 'object' ? parsed.topThemes : {},
  };
}

// ── Main function ────────────────────────────────────────────────────────────
async function generateInsights(survey, stats) {
  const prompt = buildInsightsPrompt(survey, stats);

  // Try Gemini keys in sequence
  const geminiKeys = getGeminiKeys();
  for (let i = 0; i < geminiKeys.length; i++) {
    const key = geminiKeys[i];
    try {
      console.log(`[AI Insights] Trying Gemini key ${i + 1}/${geminiKeys.length} (...${key.slice(-4)})`);
      const text = await tryGemini(key, prompt);
      console.log(`[AI Insights] Gemini key ${i + 1} succeeded`);
      return parseInsights(text);
    } catch (err) {
      const errStr = String(err.message || '').toLowerCase();
      if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('resource_exhausted')) {
        console.log(`[AI Insights] Gemini key ${i + 1} quota exceeded`);
        continue;
      }
      console.error(`[AI Insights] Gemini key ${i + 1} error: ${err.message}`);
      continue;
    }
  }

  // All Gemini keys exhausted — try OpenRouter
  try {
    console.log('[AI Insights] Trying OpenRouter...');
    const text = await tryOpenRouter(prompt);
    return parseInsights(text);
  } catch (err) {
    console.error('[AI Insights] OpenRouter failed:', err.message);
  }

  // OpenRouter failed — try OpenCode Zen
  try {
    console.log('[AI Insights] Trying OpenCode Zen...');
    const text = await tryOpenZen(prompt);
    return parseInsights(text);
  } catch (err) {
    console.error('[AI Insights] OpenCode Zen failed:', err.message);
  }

  // All providers exhausted
  console.log('[AI Insights] All providers exhausted — skipping insights generation');
  return null;
}

module.exports = { generateInsights };

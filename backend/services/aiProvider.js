const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_MODEL = 'gemini-2.0-flash';
const DEFAULT_TIMEOUT = 45000;

// ── Gemini key rotation ─────────────────────────────────────────────────────
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

async function tryGemini(apiKey, messages) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const prompt = messages.map((m) => m.content).join('\n');
  const result = await model.generateContent(prompt);
  const response = result.response;

  // Track usage (only if GeminiUsage model is available)
  try {
    const GeminiUsage = require('../models/GeminiUsage');
    const today = new Date().toISOString().split('T')[0];
    const tokens = response.usageMetadata?.totalTokenCount || 0;
    GeminiUsage.findOneAndUpdate(
      { date: today },
      { $inc: { requests: 1, tokens } },
      { upsert: true, new: true }
    ).catch(() => {});
  } catch {
    // GeminiUsage model not available — skip tracking
  }

  return response.text().trim();
}

// ── OpenRouter smart model picker (cached 1hr) ──────────────────────────────
let cachedFreeModel = null;
let cacheExpiry = 0;
const CACHE_TTL = 60 * 60 * 1000;

async function getBestFreeModel() {
  if (process.env.OPENROUTER_MODEL) return process.env.OPENROUTER_MODEL;
  if (cachedFreeModel && Date.now() < cacheExpiry) return cachedFreeModel;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return 'deepseek/deepseek-v4-flash:free';

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models?sort=newest&output_modalities=text', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return cachedFreeModel || 'deepseek/deepseek-v4-flash:free';

    const { data: models } = await res.json();
    if (!models?.length) return cachedFreeModel || 'deepseek/deepseek-v4-flash:free';

    const freeModels = models.filter((m) => {
      if (m.expiration_date) return false;
      const price = parseFloat(m.pricing?.prompt || '1');
      const completion = parseFloat(m.pricing?.completion || '1');
      return price === 0 && completion === 0;
    });

    if (!freeModels.length) return cachedFreeModel || 'deepseek/deepseek-v4-flash:free';

    freeModels.sort((a, b) => {
      const createdDiff = (b.created || 0) - (a.created || 0);
      if (createdDiff !== 0) return createdDiff;
      return (b.context_length || 0) - (a.context_length || 0);
    });

    cachedFreeModel = freeModels[0].id;
    cacheExpiry = Date.now() + CACHE_TTL;
    return cachedFreeModel;
  } catch {
    return cachedFreeModel || 'deepseek/deepseek-v4-flash:free';
  }
}

async function tryOpenRouter(messages, { title, timeout } = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No OpenRouter key configured');

  const modelId = await getBestFreeModel();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout || DEFAULT_TIMEOUT);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://surveyhub.app',
        'X-Title': title || 'SurveyHub',
      },
      body: JSON.stringify({ model: modelId, messages, temperature: 0.3 }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenRouter returned empty response');
    return text.trim();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('OpenRouter request timed out');
    throw err;
  }
}

async function tryOpenZen(messages, { timeout } = {}) {
  const apiKey = process.env.OPEN_ZEN_API_KEY;
  if (!apiKey) throw new Error('No OpenCode Zen key configured');

  const baseUrl = (process.env.OPEN_ZEN_BASE_URL || 'https://opencode.ai/zen/v1').replace(/\/+$/, '');
  const modelId = process.env.OPEN_ZEN_MODEL || 'deepseek/deepseek-v4-flash:free';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout || DEFAULT_TIMEOUT);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: modelId, messages, temperature: 0.3 }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenCode Zen ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenCode Zen returned empty response');
    return text.trim();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('OpenCode Zen request timed out');
    throw err;
  }
}

// ── Fallback chain: Gemini → OpenRouter → OpenCode Zen ──────────────────────
async function callAIProviders(messages, { title, timeout, logTag } = {}) {
  const tag = logTag || 'AI';

  // Try Gemini keys
  const geminiKeys = getGeminiKeys();
  for (let i = 0; i < geminiKeys.length; i++) {
    try {
      console.log(`[${tag}] Trying Gemini key ${i + 1}/${geminiKeys.length}`);
      return await tryGemini(geminiKeys[i], messages);
    } catch (err) {
      const errStr = String(err.message || '').toLowerCase();
      if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('resource_exhausted')) {
        console.log(`[${tag}] Gemini key ${i + 1} quota exceeded`);
        continue;
      }
      console.error(`[${tag}] Gemini key ${i + 1} failed: ${err.message}`);
      continue;
    }
  }

  // Try OpenRouter
  try {
    console.log(`[${tag}] Trying OpenRouter...`);
    return await tryOpenRouter(messages, { title, timeout });
  } catch (err) {
    console.error(`[${tag}] OpenRouter failed: ${err.message}`);
  }

  // Try OpenCode Zen
  try {
    console.log(`[${tag}] Trying OpenCode Zen...`);
    return await tryOpenZen(messages, { timeout });
  } catch (err) {
    console.error(`[${tag}] OpenCode Zen failed: ${err.message}`);
  }

  throw new Error('All AI providers exhausted');
}

module.exports = {
  getGeminiKeys,
  getBestFreeModel,
  tryGemini,
  tryOpenRouter,
  tryOpenZen,
  callAIProviders,
};

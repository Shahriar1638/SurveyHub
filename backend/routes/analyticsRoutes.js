const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const User = require('../models/User');

// ── Shared AI helpers (same pattern as aiInsights.js) ─────────────────────────
const GEMINI_MODEL = 'gemini-2.0-flash';
const PROVIDER_TIMEOUT = 45000;

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
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(messages.map(m => m.content).join('\n'));
  return result.response.text().trim();
}

async function tryOpenRouter(messages) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No OpenRouter key configured');

  let modelId;
  try {
    const { getBestFreeModel } = require('../services/moderation');
    modelId = await getBestFreeModel();
  } catch {
    modelId = 'deepseek/deepseek-v4-flash:free';
  }
  modelId = process.env.OPENROUTER_MODEL || modelId;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://surveyhub.app',
        'X-Title': 'SurveyHub AI Chat',
      },
      body: JSON.stringify({ model: modelId, messages, temperature: 0.3 }),
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

async function tryOpenZen(messages) {
  const apiKey = process.env.OPEN_ZEN_API_KEY;
  if (!apiKey) throw new Error('No OpenCode Zen key configured');

  const baseUrl = (process.env.OPEN_ZEN_BASE_URL || 'https://opencode.ai/zen/v1').replace(/\/+$/, '');
  const modelId = process.env.OPEN_ZEN_MODEL || 'deepseek/deepseek-v4-flash:free';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT);

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

async function callAIProviders(messages) {
  // Try Gemini keys
  const geminiKeys = getGeminiKeys();
  for (let i = 0; i < geminiKeys.length; i++) {
    try {
      console.log(`[AI Chat] Trying Gemini key ${i + 1}/${geminiKeys.length}`);
      return await tryGemini(geminiKeys[i], messages);
    } catch (err) {
      const errStr = String(err.message || '').toLowerCase();
      if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('resource_exhausted')) {
        console.log(`[AI Chat] Gemini key ${i + 1} quota exceeded`);
        continue;
      }
      console.error(`[AI Chat] Gemini key ${i + 1} failed: ${err.message}`);
      continue;
    }
  }

  // Try OpenRouter
  try {
    console.log('[AI Chat] Trying OpenRouter...');
    return await tryOpenRouter(messages);
  } catch (err) {
    console.error('[AI Chat] OpenRouter failed:', err.message);
  }

  // Try OpenCode Zen
  try {
    console.log('[AI Chat] Trying OpenCode Zen...');
    return await tryOpenZen(messages);
  } catch (err) {
    console.error('[AI Chat] OpenCode Zen failed:', err.message);
  }

  throw new Error('All AI providers exhausted');
}

/**
 * GET /api/analytics/ai-insights — Return all surveys with ready AI insights for the current surveyor
 */
router.get('/ai-insights', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const surveys = await Survey.find({
      surveyorId: user._id,
      'aiInsight.status': 'ready',
    })
      .sort({ 'aiInsight.generatedAt': -1 })
      .select('title category status participantCount deadline aiInsight')
      .lean();

    const insights = surveys.map((s) => ({
      _id: s._id,
      title: s.title,
      category: s.category,
      status: s.status,
      participantCount: s.participantCount,
      deadline: s.deadline,
      aiInsight: {
        summary: s.aiInsight?.summary || null,
        keyFindings: s.aiInsight?.keyFindings || [],
        recommendations: s.aiInsight?.recommendations || [],
        stats: {
          totalResponses: s.aiInsight?.stats?.totalResponses || 0,
          questionCount: s.aiInsight?.stats?.perQuestion?.length || 0,
        },
        generatedAt: s.aiInsight?.generatedAt || null,
      },
    }));

    res.json({ success: true, data: insights });
  } catch (err) {
    console.error('Error fetching AI insights:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/analytics/chat — Chat with AI about a survey's stats
 * Body: { surveyId, message }
 */
router.post('/chat', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { surveyId, message } = req.body;
    if (!surveyId || !message) {
      return res.status(400).json({ success: false, message: 'surveyId and message required' });
    }

    const survey = await Survey.findOne({
      _id: surveyId,
      surveyorId: user._id,
    }).lean();

    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });

    const stats = survey.aiInsight?.stats;
    if (!stats || stats.totalResponses === 0) {
      return res.status(400).json({
        success: false,
        message: 'No response data available for this survey. Stats are generated when the deadline expires.',
      });
    }

    // Build prompt with survey context + stats + user question
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
          if (items.length > 0) line += `\n   Items rated: ${items.join(', ')}`;
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

    const systemPrompt = `You are a survey data analyst for SurveyHub. You have access to survey results data. Answer the user's question using ONLY the data provided below.

SURVEY TITLE: "${survey.title}"
DESCRIPTION: "${survey.description || 'No description provided'}"
TOTAL RESPONSES: ${stats.totalResponses}

QUESTIONS:
${questionContext}

RESULTS DATA:
${statsContext}

---
Respond in JSON format (no markdown, no code fences) with this structure:
{
  "text": "Your natural language answer to the user's question. Be specific and reference actual numbers and percentages from the data.",
  "charts": [
    {
      "type": "bar" | "pie" | "bar_horizontal",
      "title": "Chart title",
      "labels": ["Label1", "Label2", ...],
      "values": [10, 20, ...]
    }
  ]
}

RULES:
- Only use data present in the RESULTS DATA section
- "charts" array is OPTIONAL — only include if a visualization genuinely helps answer the question
- For comparison questions (e.g., "how many X vs Y"), prefer bar charts
- For breakdown/proportion questions, prefer pie charts (max 6 slices)
- If there are too many categories for a pie chart (6+), use bar_horizontal instead
- Never make up data or reference data not in RESULTS DATA
- Respond in the SAME LANGUAGE as the user's question`;

    const response = await callAIProviders([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ]);

    // Parse the JSON response
    let parsed;
    try {
      const cleaned = response.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If AI didn't return valid JSON, wrap the raw text
      parsed = { text: response, charts: [] };
    }

    res.json({
      success: true,
      data: {
        text: parsed.text || response,
        charts: Array.isArray(parsed.charts) ? parsed.charts : [],
      },
    });
  } catch (err) {
    console.error('Error in AI chat:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = router;

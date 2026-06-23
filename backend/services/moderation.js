const ModerationPolicy = require('../models/ModerationPolicy');
const { callAIProviders } = require('./aiProvider');

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
  const messages = [{ role: 'user', content: prompt }];

  // 3. Try all providers with fallback chain
  try {
    const text = await callAIProviders(messages, { logTag: 'Moderation' });
    return parseResponse(text);
  } catch (err) {
    console.error('[Moderation] ALL providers exhausted:', err.message);
    return {
      safe: false,
      decision: 'pending',
      reason: '',
      flaggedCategories: [],
      allExhausted: true,
    };
  }
}

module.exports = { moderateContent, getBestFreeModel: require('./aiProvider').getBestFreeModel };

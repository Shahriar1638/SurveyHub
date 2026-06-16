const { GoogleGenerativeAI } = require('@google/generative-ai');
const ModerationPolicy = require('../models/ModerationPolicy');
const GeminiUsage = require('../models/GeminiUsage');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = 'gemini-2.0-flash';

/**
 * Moderates content (survey or blog) against the stored policy.
 * Returns: { safe, decision, reason, flaggedCategories }
 *   decision: 'approved' | 'rejected' | 'pending' (needs human review)
 */
async function moderateContent({ contentType, title, description, questions, content }) {
  // 1. Fetch active policy
  const policy = await ModerationPolicy.findOne({ contentType, enabled: true }).lean();
  if (!policy) {
    // No policy configured — auto-approve
    return { safe: true, decision: 'approved', reason: 'No moderation policy configured', flaggedCategories: [] };
  }

  // 2. Build rules text
  const rulesText = policy.rules
    .map(r => `- [${r.severity.toUpperCase()}] ${r.label}: ${r.description}`)
    .join('\n');

  // 3. Build content text
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

  // 4. Build prompt
  const prompt = `You are a content moderation AI for SurveyHub, a professional survey platform.

POLICY RULES (these define what is NOT allowed):
${rulesText}

CUSTOM PLATFORM INSTRUCTIONS:
${policy.customInstructions || 'Be fair and professional.'}

CONTENT TO REVIEW:
${contentText}

ANALYSIS INSTRUCTIONS:
1. Check the content against EVERY rule above.
2. Pay special attention to:
   - Offensive, profane, or discriminatory language
   - Requests for sensitive personal data (credit cards, SSN, passwords, banking info)
   - Phishing attempts or suspicious links
   - Harassment, bullying, or targeting of individuals
   - Spam, nonsensical, or purely promotional content
   - Dangerous misinformation or harmful advice
3. For EACH rule, determine if it is violated.

RESPOND IN EXACTLY THIS JSON FORMAT (no markdown, no code fences):
{
  "safe": true or false,
  "decision": "approved" or "rejected" or "pending",
  "reason": "Brief explanation of why (1-2 sentences)",
  "flaggedCategories": ["rule_id_1", "rule_id_2"] (empty array if safe)
}

DECISION LOGIC:
- If NO high-severity rules are violated → "approved"
- If ANY high-severity rule is violated → "rejected"
- If ONLY low-severity rules are violated → "pending" (needs human review)
- If you are uncertain or the content is borderline → "pending"`;

  // 5. Call Gemini
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Track usage (non-blocking)
    const today = new Date().toISOString().split('T')[0];
    const usageMetadata = response.usageMetadata;
    GeminiUsage.findOneAndUpdate(
      { date: today },
      {
        $inc: {
          requests: 1,
          tokens: usageMetadata?.totalTokenCount || 0,
        },
      },
      { upsert: true, new: true }
    ).catch(() => {}); // fire-and-forget

    // 6. Parse JSON from response
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      safe: Boolean(parsed.safe),
      decision: ['approved', 'rejected', 'pending'].includes(parsed.decision) ? parsed.decision : 'pending',
      reason: parsed.reason || 'No reason provided',
      flaggedCategories: Array.isArray(parsed.flaggedCategories) ? parsed.flaggedCategories : [],
    };
  } catch (err) {
    console.error('Gemini moderation error:', err.message);

    // Detect quota/rate limit errors (429)
    const isQuotaError = err.message?.includes('429') ||
      err.message?.includes('RESOURCE_EXHAUSTED') ||
      err.message?.includes('quota') ||
      err.message?.includes('rate limit');

    if (isQuotaError) {
      return {
        safe: false,
        decision: 'pending',
        reason: 'Our automated AI moderation is temporarily at capacity. Your content has been saved as a draft and will be reviewed shortly.',
        flaggedCategories: [],
        quotaExceeded: true,
      };
    }

    // Other API failures — default to pending so content isn't lost
    return {
      safe: false,
      decision: 'pending',
      reason: 'AI moderation is temporarily unavailable. Your content has been saved as a draft.',
      flaggedCategories: [],
    };
  }
}

module.exports = { moderateContent };

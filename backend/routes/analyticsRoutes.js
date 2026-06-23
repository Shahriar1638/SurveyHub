const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const User = require('../models/User');
const { callAIProviders } = require('../services/aiProvider');

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
    ], { logTag: 'AI Chat' });

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

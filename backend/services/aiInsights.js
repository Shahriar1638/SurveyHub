const { callAIProviders } = require('./aiProvider');

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
  const messages = [{ role: 'user', content: prompt }];

  try {
    const text = await callAIProviders(messages, { logTag: 'AI Insights' });
    return parseInsights(text);
  } catch (err) {
    console.error('[AI Insights] All providers exhausted:', err.message);
    return null;
  }
}

module.exports = { generateInsights };

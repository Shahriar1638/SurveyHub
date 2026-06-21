const Survey = require('../models/Survey');
const Response = require('../models/response');

/**
 * Aggregate response stats for a survey.
 * Returns the stats object matching Survey.aiInsight.stats schema.
 */
async function aggregateSurveyStats(surveyId) {
  const survey = await Survey.findById(surveyId).lean();
  if (!survey) throw new Error('Survey not found');

  const responses = await Response.find({ surveyId, status: 'submitted' }).lean();

  const stats = {
    totalResponses: responses.length,
    perQuestion: survey.questions
      .filter((q) => !['short_answer', 'paragraph'].includes(q.type))
      .map((q) => {
        const answers = responses
          .map((r) => r.answers.find((a) => a.questionId === q.id))
          .filter(Boolean);

        const breakdown = {};
        answers.forEach((a) => {
          if (Array.isArray(a.value)) {
            a.value.forEach((v) => {
              breakdown[v] = (breakdown[v] || 0) + 1;
            });
          } else {
            const key = String(a.value);
            breakdown[key] = (breakdown[key] || 0) + 1;
          }
        });

        return {
          questionId: q.id,
          responseCount: answers.length,
          optionBreakdown: Object.entries(breakdown).map(([value, count]) => ({
            value,
            count,
          })),
          topThemes: [],
        };
      }),
  };

  return stats;
}

module.exports = { aggregateSurveyStats };

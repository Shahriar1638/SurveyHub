const express = require('express');
const router = express.Router();
const Survey = require('../../models/Survey');
const Blog = require('../../models/Blog');
const Response = require('../../models/response');

// Add auth middleware here when integrating with the front-end (e.g., router.use(verifyToken))

router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || null;

    // Compute monthlyParticipations: submitted responses in last 30 days for this user
    let monthlyParticipations = 0;
    if (userId) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      monthlyParticipations = await Response.countDocuments({
        userId,
        status: 'submitted',
        createdAt: { $gte: thirtyDaysAgo },
      });
    }

    // If userId provided, get in-progress surveys (responses with status=draft)
    let inProgressSurveys = [];
    if (userId) {
      const draftResponses = await Response.find({ userId, status: 'draft' })
        .populate({ path: 'surveyId', select: 'title category image deadline' })
        .limit(5)
        .lean();
      inProgressSurveys = draftResponses
        .filter(r => r.surveyId)
        .map(r => r.surveyId);
    }

    // All independent queries in parallel
    const [recommendedSurveys, trendingSurveys, recentBlogs] = await Promise.all([
      Survey.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('title category image participantCount')
        .lean(),
      Survey.find({ status: 'published' })
        .sort({ participantCount: -1 })
        .limit(3)
        .select('title category image participantCount')
        .lean(),
      Blog.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(4)
        .select('title content surveyorEmail createdAt')
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        activitySummary: {
          monthlyParticipations,
          streak: 0, // TODO: requires date-by-date calculation
        },
        recommendedSurveys,
        inProgressSurveys,
        trendingSurveys,
        recentBlogs
      }
    });

  } catch (error) {
    console.error("Error fetching user homepage data:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

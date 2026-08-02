const express = require('express');
const router = express.Router();
const Survey = require('../../models/Survey');
const Blog = require('../../models/Blog');

// Add auth middleware here when integrating with the front-end (e.g., router.use(verifyToken))

router.get('/', async (req, res) => {
  try {
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
        activitySummary: { monthlyParticipations: 0, streak: 0 },
        recommendedSurveys,
        inProgressSurveys: [],
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

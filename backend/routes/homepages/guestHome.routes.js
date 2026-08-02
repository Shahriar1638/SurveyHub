const express = require('express');
const router = express.Router();
const Survey = require('../../models/Survey');
const User = require('../../models/User');
const Blog = require('../../models/Blog');

router.get('/', async (req, res) => {
  try {
    // 1. Global Stats
    const totalSurveysPublished = await Survey.countDocuments({ status: 'published' });
    
    // Aggregating participantCount to get total responses
    const surveyStats = await Survey.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, totalResponses: { $sum: "$participantCount" } } }
    ]);
    const totalResponsesCollected = surveyStats[0]?.totalResponses || 0;
    const activeUsers = await User.countDocuments({ status: 'active' });

    // 2. Featured Surveys
    const featuredSurveys = await Survey.find({ status: 'published' })
      .sort({ participantCount: -1 })
      .limit(6)
      .select('title participantCount category image');

    // 3. AI Insight Spotlight (Fetching 1 active blog)
    const aiInsightSpotlight = await Blog.findOne({ status: 'active' })
      .sort({ createdAt: -1 })
      .select('title content surveyorEmail')
      .lean();

    res.json({
      success: true,
      data: {
        stats: {
          totalSurveysPublished,
          totalResponsesCollected,
          activeUsers
        },
        featuredSurveys,
        aiInsightSpotlight
      }
    });

  } catch (error) {
    console.error("Error fetching guest homepage data:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

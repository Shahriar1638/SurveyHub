const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const Blog = require('../models/Blog');

router.get('/', async (req, res) => {
  try {
    const surveyorId = req.user?._id || req.query.surveyorId; // fallback if no auth token
    const surveyorEmail = req.user?.email || req.query.email;

    if (!surveyorId) {
       return res.status(400).json({ success: false, message: 'Surveyor ID required' });
    }

    // 1. KPI Row
    const surveys = await Survey.find({ surveyorId });
    const activeSurveys = surveys.filter(s => s.status === 'published').length;
    const totalResponses = surveys.reduce((sum, s) => sum + (s.participantCount || 0), 0);
    
    // 2. Your Active Surveys (including AI status)
    const publishedSurveys = await Survey.find({ surveyorId, status: 'published' })
      .sort({ createdAt: -1 })
      .select('title status participantCount aiInsight');
      
    // 3. Drafts
    const draftSurveys = await Survey.find({ surveyorId, status: 'draft' })
      .sort({ createdAt: -1 })
      .select('title status createdAt');

    // 4. Recent Blog Activity
    let recentBlogActivity = [];
    if (surveyorEmail) {
        const myBlogs = await Blog.find({ surveyorEmail })
          .select('title comments reactions');
        recentBlogActivity = myBlogs;
    }

    res.json({
      success: true,
      data: {
        kpis: {
          totalResponses,
          activeSurveys,
          avgCompletionRate: 0, // To be calculated based on views vs completions
          newResponses7d: 0 // Mocked metric
        },
        publishedSurveys,
        draftSurveys,
        recentBlogActivity
      }
    });

  } catch (error) {
    console.error("Error fetching surveyor homepage data:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

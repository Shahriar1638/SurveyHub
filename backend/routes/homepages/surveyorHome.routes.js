const express = require('express');
const router = express.Router();
const Survey = require('../../models/Survey');
const Response = require('../../models/response');
const Blog = require('../../models/Blog');
const User = require('../../models/User');

router.get('/', async (req, res) => {
  try {
    const surveyorEmail = req.user?.email || req.query.email;
    if (!surveyorEmail) {
       return res.status(400).json({ success: false, message: 'Surveyor email or ID required' });
    }

    // Round 1: Get user (must be first — need surveyorId)
    const userObj = await User.findOne({ email: surveyorEmail }).lean();
    if (!userObj) {
       return res.status(404).json({ success: false, message: 'Surveyor not found' });
    }

    const surveyorId = userObj._id;

    // Round 2: All independent queries in parallel
    const [allSurveys, publishedSurveys, draftSurveys, rejectedSurveys, rejectedBlogs, myBlogs] = await Promise.all([
      // All surveys for KPI computation
      Survey.find({ surveyorId }).select('status participantCount').lean(),
      // Published surveys (top 3 by engagement)
      Survey.find({ surveyorId, status: 'published' })
        .sort({ participantCount: -1, createdAt: -1 })
        .limit(3)
        .select('title description image participantCount category')
        .lean(),
      // Drafts
      Survey.find({ surveyorId, status: 'draft' })
        .sort({ createdAt: -1 })
        .select('title status createdAt questions')
        .lean(),
      // Rejected / Pending Review surveys
      Survey.find({ surveyorId, status: { $in: ['rejected', 'pending_review'] } })
        .sort({ updatedAt: -1 })
        .select('title status moderation createdAt updatedAt')
        .lean(),
      // Rejected / Pending Review blogs
      Blog.find({ surveyorEmail, status: { $in: ['rejected', 'pending_review'] } })
        .sort({ updatedAt: -1 })
        .select('title status moderation createdAt updatedAt')
        .lean(),
      // All blogs for activity feed
      Blog.find({ surveyorEmail }).select('title comments createdAt').lean(),
    ]);

    // Compute KPIs from allSurveys
    const activeSurveys = allSurveys.filter(s => s.status === 'published').length;
    const totalResponses = allSurveys.reduce((sum, s) => sum + (s.participantCount || 0), 0);
    const surveyIds = allSurveys.map(s => s._id);

    // Round 3: Response counts in parallel (needs surveyIds from Round 2)
    let avgCompletionRate = 0;
    let newResponses7d = 0;
    if (surveyIds.length > 0) {
      const [submittedCount, draftCount, recentCount] = await Promise.all([
        Response.countDocuments({ surveyId: { $in: surveyIds }, status: 'submitted' }),
        Response.countDocuments({ surveyId: { $in: surveyIds }, status: 'draft' }),
        Response.countDocuments({
          surveyId: { $in: surveyIds },
          status: 'submitted',
          submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
      ]);
      const total = submittedCount + draftCount;
      avgCompletionRate = total > 0 ? Math.round((submittedCount / total) * 100) : 0;
      newResponses7d = recentCount;
    }

    // Flatten blog comments into activity items (in-memory, small dataset)
    let recentBlogActivity = [];
    for (const blog of myBlogs) {
      for (const comment of blog.comments || []) {
        recentBlogActivity.push({
          _id: comment._id,
          blogTitle: blog.title,
          comment: comment.text,
          userEmail: comment.userEmail,
          createdAt: comment.createdAt,
        });
      }
    }
    recentBlogActivity = recentBlogActivity
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        kpis: {
          totalResponses,
          activeSurveys,
          avgCompletionRate,
          newResponsesLast7Days: newResponses7d,
        },
        publishedSurveys,
        draftSurveys,
        rejectedSurveys,
        rejectedBlogs,
        recentBlogActivity
      }
    });

  } catch (error) {
    console.error("Error fetching surveyor homepage data:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

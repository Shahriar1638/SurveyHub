const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const Response = require('../models/response');
const Blog = require('../models/Blog');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const surveyorEmail = req.user?.email || req.query.email;
    if (!surveyorEmail) {
       return res.status(400).json({ success: false, message: 'Surveyor email or ID required' });
    }

    const userObj = await User.findOne({ email: surveyorEmail }).lean();
    if (!userObj) {
       return res.status(404).json({ success: false, message: 'Surveyor not found' });
    }

    const surveyorId = userObj._id;

    // 1. KPI Row
    const surveys = await Survey.find({ surveyorId });
    const activeSurveys = surveys.filter(s => s.status === 'published').length;
    const totalResponses = surveys.reduce((sum, s) => sum + (s.participantCount || 0), 0);

    // Completion rate: submitted / (draft + submitted) across all surveys
    const surveyIds = surveys.map(s => s._id);
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
    
    // 2. Your Active Surveys — top 3 by engagement
    const publishedSurveys = await Survey.find({ surveyorId, status: 'published' })
      .sort({ participantCount: -1, createdAt: -1 })
      .limit(3)
      .select('title description image participantCount category');
      
    // 3. Drafts
    const draftSurveys = await Survey.find({ surveyorId, status: 'draft' })
      .sort({ createdAt: -1 })
      .select('title status createdAt questions');

    // 3b. Rejected / Pending Review
    const rejectedSurveys = await Survey.find({
      surveyorId,
      status: { $in: ['rejected', 'pending_review'] },
    })
      .sort({ updatedAt: -1 })
      .select('title status moderation createdAt updatedAt');

    // 3c. Rejected / Pending Review Blogs
    const rejectedBlogs = await Blog.find({
      surveyorEmail,
      status: { $in: ['rejected', 'pending_review'] },
    })
      .sort({ updatedAt: -1 })
      .select('title status moderation createdAt updatedAt');

    // 4. Recent Blog Activity — flatten comments from all surveyor's blogs
    let recentBlogActivity = [];
    if (surveyorEmail) {
        const myBlogs = await Blog.find({ surveyorEmail })
          .select('title comments createdAt');
        
        // Flatten all comments across blogs into activity items
        const activity = [];
        for (const blog of myBlogs) {
          for (const comment of blog.comments || []) {
            activity.push({
              _id: comment._id,
              blogTitle: blog.title,
              comment: comment.text,
              userEmail: comment.userEmail,
              createdAt: comment.createdAt,
            });
          }
        }
        // Sort by newest first, take latest 5
        recentBlogActivity = activity
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
    }

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

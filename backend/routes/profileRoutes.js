const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Survey = require('../models/Survey');
const Response = require('../models/response');
const Blog = require('../models/Blog');

// ── GET /api/profile/me ───────────────────────────────────────────────────────
// Returns the authenticated user's full profile
router.get('/me', async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PATCH /api/profile/me ─────────────────────────────────────────────────────
// Update the authenticated user's profile fields
router.patch('/me', async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Whitelist of fields that can be updated
    const allowed = ['name', 'avatar', 'coverPhoto', 'bio', 'location', 'occupation', 'socialLinks', 'preferences', 'autoAIInsight'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await User.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/profile/stats ────────────────────────────────────────────────────
// Returns role-specific stats for the authenticated user
router.get('/stats', async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const userId = user._id;
    let stats = {};

    if (user.role === 'user') {
      // Count surveys the user has responded to
      const surveysCompleted = await Response.countDocuments({ userId });

      // Count total questions answered
      const responses = await Response.find({ userId }).lean();
      const questionsAnswered = responses.reduce((sum, r) => sum + (r.answers?.length || 0), 0);

      // Count unique surveys that were expired where user responded (insights influenced)
      const surveyIds = responses.map(r => r.surveyId);
      const insightsInfluenced = await Survey.countDocuments({
        _id: { $in: surveyIds },
        status: 'expired',
      });

      // Recent participation: last 5 surveys with details
      const recentResponses = await Response.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      const recentSurveyIds = recentResponses.map(r => r.surveyId);
      const recentSurveys = await Survey.find(
        { _id: { $in: recentSurveyIds } },
        { title: 1, status: 1, category: 1, deadline: 1 }
      ).lean();

      stats = { surveysCompleted, questionsAnswered, insightsInfluenced, recentSurveys };
    }

    else if (user.role === 'surveyor') {
      // Total responses across all their surveys
      const surveys = await Survey.find({ createdBy: userId }, { _id: 1 }).lean();
      const surveyIds = surveys.map(s => s._id);
      const totalResponses = await Response.countDocuments({ surveyId: { $in: surveyIds } });

      // Blogs published
      const blogsPublished = await Blog.countDocuments({ author: userId, status: 'active' });

      // Active surveys
      const activeSurveys = await Survey.find(
        { createdBy: userId, status: 'published' },
        { title: 1, participantCount: 1, deadline: 1, category: 1, image: 1 }
      ).sort({ createdAt: -1 }).limit(6).lean();

      stats = { totalResponses, blogsPublished, activeSurveys };
    }

    else if (user.role === 'admin') {
      // Use the denormalized moderationStats stored on the user document
      stats = { moderationStats: user.moderationStats };
    }

    res.json({ success: true, data: stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/profile/recent-actions ──────────────────────────────────────────
// Returns the last 10 admin actions (placeholder — to be expanded)
router.get('/recent-actions', async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findOne({ email }).lean();
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // This will be expanded when an AuditLog model is created.
    // For now, returns a placeholder.
    res.json({ success: true, data: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Report = require('../models/report');
const AuditLog = require('../models/AuditLog');
const Survey = require('../models/Survey');
const User = require('../models/User');

// ── GET /api/dashboard/admin/reports — Paginated reports with survey info ────
router.get('/admin/reports', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Report.countDocuments(filter),
    ]);

    // Populate survey titles
    const surveyIds = [...new Set(reports.map(r => r.surveyId?.toString()).filter(Boolean))];
    const surveys = await Survey.find({ _id: { $in: surveyIds } })
      .select('title surveyorId')
      .lean();
    const surveyMap = {};
    surveys.forEach(s => { surveyMap[s._id.toString()] = s; });

    const enrichedReports = reports.map(r => ({
      ...r,
      survey: surveyMap[r.surveyId?.toString()] || null,
    }));

    res.json({
      success: true,
      data: enrichedReports,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PATCH /api/dashboard/admin/reports/:id — Update report status ────────────
router.patch('/admin/reports/:id', async (req, res) => {
  try {
    const { status, adminResponse, actionTaken } = req.body;
    const adminEmail = req.user?.email;

    const updates = {};
    if (status) updates.status = status;
    if (adminResponse || actionTaken) {
      updates.adminResponse = {
        adminEmail,
        message: adminResponse || '',
        actionTaken: actionTaken || 'None',
        respondedAt: new Date(),
      };
    }

    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Increment admin moderation stats
    if (adminEmail && (status === 'resolved' || status === 'dismissed')) {
      const statInc = { 'moderationStats.totalActions': 1 };
      if (status === 'resolved') statInc['moderationStats.reportsResolved'] = 1;
      await User.updateOne({ email: adminEmail }, { $inc: statInc });
    }

    // Log audit event
    try {
      await AuditLog.create({
        actor: { email: adminEmail, role: 'admin' },
        action: 'report.update',
        resource: 'Report',
        resourceId: req.params.id,
        detail: { status, actionTaken },
      });
    } catch (e) {
      console.error('Audit log error:', e.message);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/dashboard/admin/audit-logs — Paginated audit logs ───────────────
router.get('/admin/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 30, action } = req.query;
    const filter = {};
    if (action) filter.action = { $regex: action, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/dashboard/admin/broadcast — Issue a platform announcement ──────
router.post('/admin/broadcast', async (req, res) => {
  try {
    const { title, message, severity = 'info' } = req.body;
    const adminEmail = req.user?.email;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    // Log as audit event for now (a dedicated Broadcast model can be added later)
    const log = await AuditLog.create({
      actor: { email: adminEmail, role: 'admin' },
      action: 'broadcast.create',
      resource: 'Broadcast',
      detail: { title: title.trim(), message: message.trim(), severity },
    });

    // Increment admin total actions
    if (adminEmail) {
      await User.updateOne({ email: adminEmail }, { $inc: { 'moderationStats.totalActions': 1 } });
    }

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    console.error('Error creating broadcast:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/dashboard/user/overview ──────────────────────────────────────────
router.get('/user/overview', async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userId = user._id;

    // Count surveys taken (submitted responses)
    const totalSurveysTaken = await Response.countDocuments({ userId, status: 'submitted' });

    // Fetch submitted responses to compute rewards
    const userResponses = await Response.find({ userId, status: 'submitted' }).select('surveyId').lean();
    const surveyIds = userResponses.map(r => r.surveyId);

    // Fetch survey questions lengths
    const surveys = await Survey.find({ _id: { $in: surveyIds } }).select('questions').lean();
    let totalRewardsEarned = 0;
    surveys.forEach(survey => {
      totalRewardsEarned += (survey.questions?.length || 0) * 10; // 10 points per question
    });

    // Count pending support tickets
    const SiteFeedback = require('../models/siteFeedback');
    const pendingSupportTickets = await SiteFeedback.countDocuments({ userEmail, status: 'open' });

    // Count resolved reports
    const resolvedReports = await Report.countDocuments({ reporterEmail: userEmail, status: 'resolved' });

    res.json({
      success: true,
      data: {
        totalSurveysTaken,
        totalRewardsEarned,
        pendingSupportTickets,
        resolvedReports,
      }
    });
  } catch (error) {
    console.error('Error fetching user dashboard overview:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/dashboard/user/participation ──────────────────────────────────────
router.get('/user/participation', async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userId = user._id;

    // Fetch user responses
    const Response = require('../models/response');
    const responses = await Response.find({ userId, status: 'submitted' })
      .sort({ submittedAt: -1 })
      .lean();

    const surveyIds = responses.map(r => r.surveyId);
    const surveys = await Survey.find({ _id: { $in: surveyIds } })
      .select('title category questions')
      .lean();

    const surveyMap = {};
    surveys.forEach(s => { surveyMap[s._id.toString()] = s; });

    const ledger = responses.map(r => {
      const survey = surveyMap[r.surveyId.toString()];
      return {
        responseId: r._id,
        surveyId: r.surveyId,
        surveyTitle: survey?.title || 'Unknown Survey',
        surveyCategory: survey?.category || 'General',
        submittedAt: r.submittedAt,
        questionsCount: survey?.questions?.length || 0,
        rewardPoints: (survey?.questions?.length || 0) * 10, // 10 points per question
      };
    });

    res.json({
      success: true,
      data: ledger,
    });
  } catch (error) {
    console.error('Error fetching user participation ledger:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/dashboard/user/reports ────────────────────────────────────────────
router.get('/user/reports', async (req, res) => {
  try {
    const userEmail = req.user.email;

    const reports = await Report.find({ reporterEmail: userEmail })
      .sort({ createdAt: -1 })
      .lean();

    const surveyIds = reports.map(r => r.surveyId);
    const surveys = await Survey.find({ _id: { $in: surveyIds } })
      .select('title')
      .lean();

    const surveyMap = {};
    surveys.forEach(s => { surveyMap[s._id.toString()] = s; });

    const enrichedReports = reports.map(r => ({
      ...r,
      surveyTitle: surveyMap[r.surveyId?.toString()]?.title || 'Unknown Survey',
    }));

    res.json({
      success: true,
      data: enrichedReports,
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/dashboard/user/support ────────────────────────────────────────────
router.get('/user/support', async (req, res) => {
  try {
    const userEmail = req.user.email;

    const SiteFeedback = require('../models/siteFeedback');
    const tickets = await SiteFeedback.find({ userEmail })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error('Error fetching user support tickets:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;


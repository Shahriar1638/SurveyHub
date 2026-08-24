const express = require('express');
const router = express.Router();
const Report = require('../../models/report');
const Response = require('../../models/response');
const AuditLog = require('../../models/AuditLog');
const Survey = require('../../models/Survey');
const Blog = require('../../models/Blog');
const User = require('../../models/User');
const { verifyToken, verifyAdmin } = require('../../middlewares/authMiddleware')();
const validate = require('../../validations/validate');
const { reportUpdateSchema, broadcastSchema } = require('../../validations/schemas');
const escapeRegex = require('../../lib/escapeRegex');

// ── GET /api/dashboard/admin/reports — All reports with search/sort/filter ──
router.get('/admin/reports', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, type, search, sort = 'newest', page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;

    // Filter by content type
    if (type === 'survey') filter.surveyId = { $exists: true, $ne: null };
    else if (type === 'blog') filter.blogId = { $exists: true, $ne: null, commentId: { $exists: false } };
    else if (type === 'comment') filter.commentId = { $exists: true, $ne: null, replyId: { $exists: false } };
    else if (type === 'reply') filter.replyId = { $exists: true, $ne: null };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'reason') sortObj = { reportReason: 1 };

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Report.countDocuments(filter),
    ]);

    // Populate survey titles
    const surveyIds = [...new Set(reports.map(r => r.surveyId?.toString()).filter(Boolean))];
    const surveys = surveyIds.length > 0 ? await Survey.find({ _id: { $in: surveyIds } })
      .select('title surveyorId')
      .populate('surveyorId', 'name email')
      .lean() : [];
    const surveyMap = {};
    surveys.forEach(s => { surveyMap[s._id.toString()] = s; });

    // Populate blog titles
    const blogIds = [...new Set(reports.map(r => r.blogId?.toString()).filter(Boolean))];
    const blogs = blogIds.length > 0 ? await Blog.find({ _id: { $in: blogIds } })
      .select('title surveyorEmail')
      .lean() : [];
    const blogMap = {};
    blogs.forEach(b => { blogMap[b._id.toString()] = b; });

    // Populate reporter names
    const reporterEmails = [...new Set(reports.map(r => r.reporterEmail).filter(Boolean))];
    const reporters = reporterEmails.length > 0 ? await User.find({ email: { $in: reporterEmails } })
      .select('email name')
      .lean() : [];
    const reporterMap = {};
    reporters.forEach(u => { reporterMap[u.email] = u.name; });

    // Search filter (applied after populate for text search)
    let enrichedReports = reports.map(r => ({
      ...r,
      survey: r.surveyId ? surveyMap[r.surveyId.toString()] || null : null,
      blog: r.blogId ? blogMap[r.blogId.toString()] || null : null,
      reporterName: reporterMap[r.reporterEmail] || null,
    }));

    if (search) {
      const q = search.toLowerCase();
      enrichedReports = enrichedReports.filter(r =>
        r.survey?.title?.toLowerCase().includes(q) ||
        r.blog?.title?.toLowerCase().includes(q) ||
        r.reporterEmail?.toLowerCase().includes(q) ||
        r.reporterName?.toLowerCase().includes(q) ||
        r.reportReason?.toLowerCase().includes(q)
      );
    }

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
router.patch('/admin/reports/:id', verifyToken, verifyAdmin, validate(reportUpdateSchema), async (req, res) => {
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
router.get('/admin/audit-logs', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 30, action } = req.query;
    const filter = {};
    if (action) filter.action = { $regex: escapeRegex(action), $options: 'i' };

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
router.post('/admin/broadcast', verifyToken, verifyAdmin, validate(broadcastSchema), async (req, res) => {
  try {
    const { title, message, severity = 'info' } = req.body;
    const adminEmail = req.user?.email;

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
    let userId = req.user._id;
    if (!userId) {
      const userObj = await User.findOne({ email: userEmail }).select('_id').lean();
      userId = userObj?._id;
    }

    // Count surveys taken (submitted responses)
    const totalSurveysTaken = userId ? await Response.countDocuments({ userId, status: 'submitted' }) : 0;

    // Fetch submitted responses to compute rewards
    const userResponses = userId ? await Response.find({ userId, status: 'submitted' }).select('surveyId').lean() : [];
    const surveyIds = userResponses.map(r => r.surveyId);

    // Fetch survey questions lengths
    const surveys = surveyIds.length > 0 ? await Survey.find({ _id: { $in: surveyIds } }).select('questions').lean() : [];
    let totalRewardsEarned = 0;
    surveys.forEach(survey => {
      totalRewardsEarned += (survey.questions?.length || 0) * 10; // 10 points per question
    });

    // Count pending support tickets
    const SiteFeedback = require('../../models/siteFeedback');
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
    let userId = req.user._id;
    if (!userId) {
      const userObj = await User.findOne({ email: userEmail }).select('_id').lean();
      userId = userObj?._id;
    }

    // Fetch user responses
    const responses = userId ? await Response.find({ userId, status: 'submitted' })
      .sort({ submittedAt: -1 })
      .lean() : [];

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

    // Collect unique IDs for enrichment
    const surveyIds = [...new Set(reports.filter(r => r.surveyId).map(r => r.surveyId.toString()))];
    const blogIds = [...new Set(reports.filter(r => r.blogId).map(r => r.blogId.toString()))];

    const [surveys, blogs] = await Promise.all([
      surveyIds.length > 0
        ? Survey.find({ _id: { $in: surveyIds } }).select('title').lean()
        : [],
      blogIds.length > 0
        ? Blog.find({ _id: { $in: blogIds } }).select('title').lean()
        : [],
    ]);

    const surveyMap = {};
    surveys.forEach(s => { surveyMap[s._id.toString()] = s.title; });

    const blogMap = {};
    blogs.forEach(b => { blogMap[b._id.toString()] = b.title; });

    const enrichedReports = reports.map(r => {
      let targetType = 'survey';
      let targetTitle = 'Unknown Survey';

      if (r.surveyId) {
        targetType = 'survey';
        targetTitle = surveyMap[r.surveyId.toString()] || 'Unknown Survey';
      } else if (r.blogId && r.commentId && r.replyId) {
        targetType = 'reply';
        targetTitle = blogMap[r.blogId.toString()] || 'Unknown Blog';
      } else if (r.blogId && r.commentId) {
        targetType = 'comment';
        targetTitle = blogMap[r.blogId.toString()] || 'Unknown Blog';
      } else if (r.blogId) {
        targetType = 'blog';
        targetTitle = blogMap[r.blogId.toString()] || 'Unknown Blog';
      }

      return {
        ...r,
        targetType,
        targetTitle,
      };
    });

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

    const SiteFeedback = require('../../models/siteFeedback');
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

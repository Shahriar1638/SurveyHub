const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Survey = require('../../models/Survey');
const Report = require('../../models/report');
const Subscription = require('../../models/Subscription');
const { verifyToken } = require('../../middlewares/authMiddleware')();

router.get('/', verifyToken, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // All independent queries in parallel
    const [
      totalUsers,
      totalSurveyors,
      surveysPublishedThisMonth,
      revenueAgg,
      monthlyRevenue,
      pendingReports,
      pendingSurveys,
      recentRegistrations,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'surveyor' }),
      Survey.countDocuments({ status: 'published', publishedAt: { $gte: startOfMonth } }),
      Subscription.aggregate([
        { $unwind: '$billingHistory' },
        { $match: { 'billingHistory.occurredAt': { $gte: startOfMonth }, 'billingHistory.eventType': 'purchase' } },
        { $group: { _id: null, total: { $sum: '$billingHistory.amount' } } }
      ]).catch(() => []),
      Subscription.aggregate([
        { $unwind: '$billingHistory' },
        { $match: { 'billingHistory.occurredAt': { $gte: sixMonthsAgo }, 'billingHistory.eventType': 'purchase' } },
        { $group: { _id: { year: { $year: '$billingHistory.occurredAt' }, month: { $month: '$billingHistory.occurredAt' } }, revenue: { $sum: '$billingHistory.amount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]).catch(() => []),
      Report.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(10).lean(),
      Survey.find({ status: 'pending_review' }).sort({ createdAt: -1 }).limit(10).select('title surveyorId createdAt category').lean(),
      User.find({}).sort({ createdAt: -1 }).limit(10).select('name email role avatar createdAt').lean(),
    ]);

    const activeRevenue = revenueAgg[0]?.total || 0;

    // Build revenue chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueMap = {};
    monthlyRevenue.forEach((r) => {
      revenueMap[`${r._id.year}-${r._id.month}`] = r.revenue;
    });
    const revenueByMonth = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      revenueByMonth.push({ month: monthNames[d.getMonth()], revenue: revenueMap[key] || 0 });
    }

    // Enrich reports with survey titles (parallel)
    const reportSurveyIds = pendingReports.map(r => r.surveyId).filter(Boolean);
    const [reportSurveys, queueSurveyors] = await Promise.all([
      reportSurveyIds.length > 0 ? Survey.find({ _id: { $in: reportSurveyIds } }).select('title').lean() : [],
      pendingSurveys.length > 0 ? User.find({ _id: { $in: pendingSurveys.map(s => s.surveyorId).filter(Boolean) } }).select('name email').lean() : [],
    ]);

    const surveyMap = {};
    reportSurveys.forEach(s => { surveyMap[s._id.toString()] = s.title; });
    const surveyorMap = {};
    queueSurveyors.forEach(s => { surveyorMap[s._id.toString()] = s.name || s.email; });

    const moderationFeed = pendingReports.map(r => ({
      _id: r._id, surveyId: r.surveyId, surveyTitle: surveyMap[r.surveyId?.toString()] || null,
      reporterEmail: r.reporterEmail, reportReason: r.reportReason, details: r.details,
      priority: r.reportReason === 'Hate Speech' || r.reportReason === 'Inappropriate Content' ? 'high' : 'medium',
      createdAt: r.createdAt,
    }));

    const approvalQueue = pendingSurveys.map(s => ({
      _id: s._id, title: s.title, category: s.category,
      surveyorName: surveyorMap[s.surveyorId?.toString()] || 'Unknown', createdAt: s.createdAt,
    }));

    res.json({
      success: true,
      data: {
        platformHealth: { totalUsers, totalSurveyors, surveysPublishedThisMonth, activeRevenue },
        revenueByMonth, moderationFeed, approvalQueue, recentRegistrations, systemNotices: []
      }
    });

  } catch (error) {
    console.error("Error fetching admin homepage data:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

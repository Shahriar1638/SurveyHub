const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Survey = require('../models/Survey');
const Report = require('../models/report');
const Subscription = require('../models/Subscription');
const { verifyToken } = require('../middlewares/authMiddleware')();

router.get('/', verifyToken, async (req, res) => {
  try {
    // 1. Platform Health Row
    const totalUsers = await User.countDocuments();
    const totalSurveyors = await User.countDocuments({ role: 'surveyor' });
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const surveysPublishedThisMonth = await Survey.countDocuments({
      status: 'published',
      publishedAt: { $gte: startOfMonth }
    });

    // Revenue MTD — aggregate from billing history
    let activeRevenue = 0;
    try {
      const revenueAgg = await Subscription.aggregate([
        { $unwind: '$billingHistory' },
        { $match: { 'billingHistory.occurredAt': { $gte: startOfMonth }, 'billingHistory.eventType': 'purchase' } },
        { $group: { _id: null, total: { $sum: '$billingHistory.amount' } } }
      ]);
      activeRevenue = revenueAgg[0]?.total || 0;
    } catch (e) {
      console.error('Revenue aggregation error:', e.message);
    }

    // Revenue last 6 months (for chart)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    let revenueByMonth = [];
    try {
      const monthlyRevenue = await Subscription.aggregate([
        { $unwind: '$billingHistory' },
        {
          $match: {
            'billingHistory.occurredAt': { $gte: sixMonthsAgo },
            'billingHistory.eventType': 'purchase',
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$billingHistory.occurredAt' },
              month: { $month: '$billingHistory.occurredAt' },
            },
            revenue: { $sum: '$billingHistory.amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const revenueMap = {};
      monthlyRevenue.forEach((r) => {
        const key = `${r._id.year}-${r._id.month}`;
        revenueMap[key] = r.revenue;
      });

      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const key = `${year}-${month}`;
        revenueByMonth.push({
          month: monthNames[month - 1],
          revenue: revenueMap[key] || 0,
        });
      }
    } catch (e) {
      console.error('Monthly revenue aggregation error:', e.message);
    }

    // 2. Pending reports (for moderation feed)
    const pendingReports = await Report.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Enrich reports with survey titles
    const surveyIds = pendingReports.map(r => r.surveyId).filter(Boolean);
    const surveys = surveyIds.length > 0
      ? await Survey.find({ _id: { $in: surveyIds } }).select('title').lean()
      : [];
    const surveyMap = {};
    surveys.forEach(s => { surveyMap[s._id.toString()] = s.title; });

    const moderationFeed = pendingReports.map(r => ({
      _id: r._id,
      surveyId: r.surveyId,
      surveyTitle: surveyMap[r.surveyId?.toString()] || null,
      reporterEmail: r.reporterEmail,
      reportReason: r.reportReason,
      details: r.details,
      priority: r.reportReason === 'Hate Speech' || r.reportReason === 'Inappropriate Content' ? 'high' : 'medium',
      createdAt: r.createdAt,
    }));

    // 3. Approval Queue — surveys pending_review
    const pendingSurveys = await Survey.find({ status: 'pending_review' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title surveyorId createdAt category')
      .lean();

    // Get surveyor names
    const surveyorIds = pendingSurveys.map(s => s.surveyorId).filter(Boolean);
    const surveyors = surveyorIds.length > 0
      ? await User.find({ _id: { $in: surveyorIds } }).select('name email').lean()
      : [];
    const surveyorMap = {};
    surveyors.forEach(s => { surveyorMap[s._id.toString()] = s.name || s.email; });

    const approvalQueue = pendingSurveys.map(s => ({
      _id: s._id,
      title: s.title,
      category: s.category,
      surveyorName: surveyorMap[s.surveyorId?.toString()] || 'Unknown',
      createdAt: s.createdAt,
    }));

    // 4. Latest Registered Users
    const recentRegistrations = await User.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role avatar createdAt')
      .lean();

    res.json({
      success: true,
      data: {
        platformHealth: {
          totalUsers,
          totalSurveyors,
          surveysPublishedThisMonth,
          activeRevenue
        },
        revenueByMonth,
        moderationFeed,
        approvalQueue,
        recentRegistrations,
        systemNotices: []
      }
    });

  } catch (error) {
    console.error("Error fetching admin homepage data:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Survey = require('../models/Survey');
const Report = require('../models/report');
const Subscription = require('../models/Subscription');

router.get('/', async (req, res) => {
  try {
    // 1. Platform Health Row
    const totalUsers = await User.countDocuments();
    const activeSurveyors = await User.countDocuments({ role: 'surveyor', status: 'active' });
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const surveysPublishedThisMonth = await Survey.countDocuments({
      status: 'published',
      publishedAt: { $gte: startOfMonth }
    });

    // Revenue MTD — aggregate from billing history
    let revenueMTD = 0;
    try {
      const revenueAgg = await Subscription.aggregate([
        { $unwind: '$billingHistory' },
        { $match: { 'billingHistory.occurredAt': { $gte: startOfMonth }, 'billingHistory.eventType': 'purchase' } },
        { $group: { _id: null, total: { $sum: '$billingHistory.amount' } } }
      ]);
      revenueMTD = revenueAgg[0]?.total || 0;
    } catch (e) {
      console.error('Revenue aggregation error:', e.message);
    }

    // 2. Pending reports count
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const investigatingReports = await Report.countDocuments({ status: 'investigating' });

    // 3. Admin moderation stats (from the requesting admin user)
    const adminEmail = req.user?.email;
    let moderationStats = { reportsResolved: 0, surveysReviewed: 0, usersModerated: 0, totalActions: 0 };
    if (adminEmail) {
      const adminUser = await User.findOne({ email: adminEmail }).select('moderationStats').lean();
      if (adminUser?.moderationStats) {
        moderationStats = adminUser.moderationStats;
      }
    }

    // 4. New Registrations Today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const newRegistrationsToday = await User.find({
      createdAt: { $gte: startOfDay }
    }).select('name email role createdAt');

    res.json({
      success: true,
      data: {
        health: {
          totalUsers,
          activeSurveyors,
          surveysPublishedThisMonth,
          revenueMTD
        },
        pendingReports,
        investigatingReports,
        moderationStats,
        newRegistrationsToday,
        urgentActions: [],
        moderationFeed: [],
        systemNotices: []
      }
    });

  } catch (error) {
    console.error("Error fetching admin homepage data:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

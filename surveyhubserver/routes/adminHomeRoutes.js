const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Survey = require('../models/Survey');

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

    // 2. New Registrations Today
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
          revenueMTD: 0 // Mocked, needs integration with payments
        },
        urgentActions: [], // Mocked
        moderationFeed: [], // Mocked
        newRegistrationsToday,
        systemNotices: [] // Mocked
      }
    });

  } catch (error) {
    console.error("Error fetching admin homepage data:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

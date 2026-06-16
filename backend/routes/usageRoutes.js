const express = require('express');
const router = express.Router();
const GeminiUsage = require('../models/GeminiUsage');
const { verifyToken } = require('../middlewares/authMiddleware')();

/**
 * GET /api/usage/gemini — returns today's tracked Gemini API usage
 */
router.get('/gemini', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const usage = await GeminiUsage.findOne({ date: today }).lean();

    res.json({
      success: true,
      data: {
        requests: usage?.requests || 0,
        tokens: usage?.tokens || 0,
        date: today,
      },
    });
  } catch (err) {
    console.error('Error fetching Gemini usage:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

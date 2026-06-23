const express = require('express');
const router = express.Router();
const GeminiUsage = require('../models/GeminiUsage');
const { verifyToken } = require('../middlewares/authMiddleware')();

/**
 * GET /api/usage/gemini — returns today's tracked AI usage
 */
router.get('/gemini', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const usage = await GeminiUsage.findOne({ date: today }).lean();

    // Count configured Gemini keys
    let keyCount = 0;
    if (process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY.split(',').forEach(k => {
        if (k.trim()) keyCount++;
      });
    }
    for (let i = 2; i <= 10; i++) {
      if (process.env[`GEMINI_KEY_${i}`]) keyCount++;
    }
    const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
    const hasOpenZen = !!process.env.OPEN_ZEN_API_KEY;

    res.json({
      success: true,
      data: {
        requests: usage?.requests || 0,
        tokens: usage?.tokens || 0,
        date: today,
        providers: {
          geminiKeys: keyCount,
          openRouter: hasOpenRouter,
          openRouterModel: process.env.OPENROUTER_MODEL || 'auto (best free)',
          openZen: hasOpenZen,
        },
      },
    });
  } catch (err) {
    console.error('Error fetching AI usage:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

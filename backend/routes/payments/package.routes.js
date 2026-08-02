const express = require('express');
const router = express.Router();
const PricingPackage = require('../../models/PricingPackage');

// ── GET /api/packages ────────────────────────────────────────────────────────
// Returns all active pricing packages, sorted by price
router.get('/', async (req, res) => {
  try {
    const packages = await PricingPackage.find({ active: true }).sort({ price: 1 }).lean();
    res.json({ success: true, data: packages });
  } catch (err) {
    console.error('Fetch packages error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/packages/:id ───────────────────────────────────────────────────
// Returns a single package by its id field (e.g. "starter")
router.get('/:id', async (req, res) => {
  try {
    const pkg = await PricingPackage.findOne({ id: req.params.id, active: true }).lean();
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, data: pkg });
  } catch (err) {
    console.error('Fetch package error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

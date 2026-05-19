const express = require('express');
const router = express.Router();
const SiteFeedback = require('../models/siteFeedback');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware')();

// POST /api/feedback — Submit site feedback (public route, no auth required)
router.post('/', async (req, res) => {
  try {
    const { userEmail, feedbackType, affectedPage, comment, attachments } = req.body;

    // Validate required fields
    if (!feedbackType || !comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'feedbackType and comment are required',
      });
    }

    const feedback = new SiteFeedback({
      userEmail: userEmail?.trim() || undefined,
      feedbackType,
      affectedPage: affectedPage?.trim() || undefined,
      comment: comment.trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { id: feedback._id },
    });
  } catch (error) {
    console.error('Error submitting site feedback:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/feedback — Admin: list all feedback (add verifyToken + verifyAdmin when ready)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, feedbackType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (feedbackType) filter.feedbackType = feedbackType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      SiteFeedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      SiteFeedback.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    console.error('Error fetching site feedback:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/feedback/:id — Admin: update feedback status or add a response
router.patch('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (adminResponse) {
      updates.adminResponse = {
        ...adminResponse,
        respondedAt: new Date(),
      };
    }

    const updated = await SiteFeedback.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ success: false, message: 'Feedback not found' });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating site feedback:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

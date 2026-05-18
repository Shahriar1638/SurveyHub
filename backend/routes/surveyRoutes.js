const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

/**
 * GET /api/surveys
 * Query params:
 *   - sort: 'newest' (default) | 'oldest' | 'title_asc' | 'title_desc'
 *   - category: string (filter by category)
 *   - search: string (title search)
 *   - length: 'short' (<10) | 'medium' (10-15) | 'long' (15+)
 *   - statusFilter: 'published' | 'expired' | 'deadline_soon'
 *   - dateFrom: ISO date string
 *   - dateTo: ISO date string
 */
router.get('/', async (req, res) => {
  try {
    const { sort, category, search, length, statusFilter, dateFrom, dateTo } = req.query;

    // Base query: only show published or expired surveys
    const query = { status: { $in: ['published', 'expired'] } };

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Title search (case-insensitive)
    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    // Date range filter (on createdAt)
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        query.createdAt.$lte = to;
      }
    }

    // Status filter
    const today = new Date();
    const soonDate = new Date();
    soonDate.setDate(today.getDate() + 4); // within 4 days

    if (statusFilter === 'published') {
      query.status = 'published';
    } else if (statusFilter === 'expired') {
      query.status = 'expired';
    } else if (statusFilter === 'deadline_soon') {
      query.status = 'published';
      query.deadline = {
        $gte: today.toISOString().split('T')[0],
        $lte: soonDate.toISOString().split('T')[0],
      };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'title_asc') sortOption = { title: 1 };
    if (sort === 'title_desc') sortOption = { title: -1 };

    // Fetch all matching surveys (filtering by question length is done post-query)
    let surveys = await Survey.find(query).sort(sortOption).lean();

    // Question length filter (post-query since it's on array length)
    if (length === 'short') {
      surveys = surveys.filter(s => s.questions.length < 10);
    } else if (length === 'medium') {
      surveys = surveys.filter(s => s.questions.length >= 10 && s.questions.length <= 15);
    } else if (length === 'long') {
      surveys = surveys.filter(s => s.questions.length > 15);
    }

    // Get unique categories for filter options
    const categories = await Survey.distinct('category', { status: { $in: ['published', 'expired'] } });

    res.json({
      success: true,
      total: surveys.length,
      categories: categories.filter(Boolean).sort(),
      data: surveys,
    });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

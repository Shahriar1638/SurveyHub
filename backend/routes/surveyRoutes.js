const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const Response = require('../models/response');
const Feedback = require('../models/feedback');
const User = require('../models/User');
const validate = require('../validations/validate');
const {
  createSurveySchema,
  updateSurveySchema,
  surveyResponseSchema,
  surveyFeedbackSchema,
} = require('../validations/schemas');
const { verifyToken, verifySurveyor } = require('../middlewares/authMiddleware')();

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
    const { sort, category, search, length, statusFilter, dateFrom, dateTo, userId } = req.query;

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

    // If userId provided, attach participation flags
    if (userId) {
      const surveyIds = surveys.map(s => s._id);
      const participations = await Response.find(
        { surveyId: { $in: surveyIds }, userId, status: 'submitted' },
        { surveyId: 1, _id: 0 }
      ).lean();
      const participatedIds = new Set(participations.map(p => p.surveyId.toString()));
      surveys = surveys.map(s => ({
        ...s,
        hasParticipated: participatedIds.has(s._id.toString()),
      }));
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


/**
 * GET /api/surveys/:id
 * Returns a single survey by ID (published or expired only).
 */
router.get('/:id', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id).lean();
    if (!survey || !['published', 'expired'].includes(survey.status)) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    res.json({ success: true, data: survey });
  } catch (err) {
    console.error('Error fetching survey:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/surveys/:id/respond
 * Body: { userId, answers: [{ questionId, label, value }], isDraft: boolean }
 * Upserts a response (draft or final). One response per user per survey.
 */
router.post('/:id/respond', verifyToken, validate(surveyResponseSchema), async (req, res) => {
  try {
    const { userId, answers, isDraft = false } = req.body;

    const survey = await Survey.findById(req.params.id);
    if (!survey || !['published', 'expired'].includes(survey.status)) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const status = isDraft ? 'draft' : 'submitted';

    // Upsert: one response per user per survey
    const response = await Response.findOneAndUpdate(
      { surveyId: req.params.id, userId },
      { $set: { surveyId: req.params.id, userId, answers, status } },
      { upsert: true, new: true }
    );

    // Keep participantCount in sync on final submit
    if (!isDraft) {
      const count = await Response.countDocuments({ surveyId: req.params.id, status: 'submitted' });
      await Survey.findByIdAndUpdate(req.params.id, { participantCount: count });
    }

    res.json({ success: true, data: response, isDraft });
  } catch (err) {
    console.error('Error submitting response:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/surveys — Create a new survey (draft or published)
 * Body: { title, description, useCase, category, deadline, image, questions, status }
 */
router.post('/', verifyToken, verifySurveyor, validate(createSurveySchema), async (req, res) => {
  try {
    const { title, description, useCase, category, deadline, image, questions, status } = req.body;

    // Look up surveyor by email
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const validStatuses = ['draft', 'published'];
    const surveyStatus = validStatuses.includes(status) ? status : 'draft';

    const survey = await Survey.create({
      surveyorId: user._id,
      title: title.trim(),
      description: description?.trim() || undefined,
      useCase: useCase?.trim() || undefined,
      category: category?.trim() || undefined,
      deadline: deadline.trim(),
      image: image?.trim() || undefined,
      questions,
      status: surveyStatus,
      publishedAt: surveyStatus === 'published' ? new Date() : undefined,
    });

    res.status(201).json({ success: true, data: survey });
  } catch (err) {
    console.error('Error creating survey:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PUT /api/surveys/:id — Update a survey (owner only)
 */
router.put('/:id', verifyToken, verifySurveyor, validate(updateSurveySchema), async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    // Verify ownership
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user || survey.surveyorId.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, useCase, category, deadline, image, questions, status } = req.body;

    if (title !== undefined) survey.title = title.trim();
    if (description !== undefined) survey.description = description?.trim() || undefined;
    if (useCase !== undefined) survey.useCase = useCase?.trim() || undefined;
    if (category !== undefined) survey.category = category?.trim() || undefined;
    if (deadline !== undefined) survey.deadline = deadline.trim();
    if (image !== undefined) survey.image = image?.trim() || undefined;
    if (questions !== undefined) survey.questions = questions;
    if (status !== undefined && ['draft', 'published'].includes(status)) {
      survey.status = status;
      if (status === 'published' && !survey.publishedAt) {
        survey.publishedAt = new Date();
      }
    }

    await survey.save();
    res.json({ success: true, data: survey });
  } catch (err) {
    console.error('Error updating survey:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * DELETE /api/surveys/:id — Delete a survey (owner only)
 */
router.delete('/:id', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    // Verify ownership
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user || survey.surveyorId.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Survey.findByIdAndDelete(req.params.id);
    // Also delete associated responses
    await Response.deleteMany({ surveyId: req.params.id });

    res.json({ success: true, message: 'Survey deleted' });
  } catch (err) {
    console.error('Error deleting survey:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/surveys/:id/my-response?userId=xxx
 * Returns the existing draft or submitted response for a user.
 */
router.get('/:id/my-response', verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    const response = await Response.findOne({ surveyId: req.params.id, userId }).lean();
    res.json({ success: true, data: response || null });
  } catch (err) {
    console.error('Error fetching response:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/surveys/:id/feedback
 * Submit feedback for a specific survey. Requires authentication.
 */
router.post('/:id/feedback', verifyToken, validate(surveyFeedbackSchema), async (req, res) => {
  try {
    const { rating, comment, suggestions } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const feedback = new Feedback({
      surveyId: req.params.id,
      userEmail,
      rating,
      comment: comment.trim(),
      suggestions: suggestions?.trim() || undefined
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (err) {
    console.error('Error submitting survey feedback:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

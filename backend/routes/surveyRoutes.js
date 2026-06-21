const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Survey = require('../models/Survey');
const Response = require('../models/response');
const Feedback = require('../models/surveyFeedBack');
const Report = require('../models/report');
const User = require('../models/User');
const { moderateContent } = require('../services/moderation');
const validate = require('../validations/validate');
const {
  createSurveySchema,
  updateSurveySchema,
  surveyResponseSchema,
  surveyFeedbackSchema,
  surveyReportSchema,
} = require('../validations/schemas');
const { verifyToken, verifySurveyor } = require('../middlewares/authMiddleware')();
const { CREDIT_COSTS, deductCredits } = require('../lib/creditConfig');
const { scheduleExpiry, removeExpiryJob } = require('../jobs/surveyExpiry');

// Escape regex special characters to prevent ReDoS
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
      query.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
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
 * GET /api/surveys/mine — Get all surveys for the logged-in surveyor
 * Query params: status, search, sort, order
 */
router.get('/mine', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { status, search, sort = 'createdAt', order = 'desc' } = req.query;

    const filter = { surveyorId: user._id, deleted: { $ne: true } };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Text search on title and description
    if (search?.trim()) {
      const regex = { $regex: escapeRegex(search.trim()), $options: 'i' };
      filter.$or = [
        { title: regex },
        { description: regex },
      ];
    }

    // Allowed sort fields
    const sortFields = {
      createdAt: 'createdAt',
      deadline: 'deadline',
      responses: 'participantCount',
      title: 'title',
    };
    const sortField = sortFields[sort] || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const surveys = await Survey.find(filter)
      .sort({ [sortField]: sortOrder, createdAt: -1 })
      .select('title description category status participantCount deadline aiInsight createdAt updatedAt')
      .lean();

    res.json({ success: true, data: surveys });
  } catch (err) {
    console.error('Error fetching my surveys:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/surveys/moderation/queue — Get pending moderation items (admin only)
 */
router.get('/moderation/queue', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const pending = await Survey.find({ status: 'pending_review' })
      .select('title description category questions status moderation surveyorId createdAt')
      .populate('surveyorId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: pending });
  } catch (err) {
    console.error('Error fetching moderation queue:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/surveys/admin/all — Admin: list all surveys with filter/search/sort
 */
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { status, search, sort = 'newest', page = 1, limit = 20 } = req.query;

    const filter = { deleted: { $ne: true } };
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: escapeRegex(search), $options: 'i' } },
        { description: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'title') sortObj = { title: 1 };
    else if (sort === 'responses') sortObj = { participantCount: -1 };
    else if (sort === 'deadline') sortObj = { deadline: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [surveys, total] = await Promise.all([
      Survey.find(filter)
        .select('title description category status participantCount deadline moderation surveyorId createdAt publishedAt')
        .populate('surveyorId', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Survey.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: surveys,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Error fetching admin surveys:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/surveys/recycle-bin — Get all soft-deleted surveys for the logged-in surveyor
 */
router.get('/recycle-bin', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const surveys = await Survey.find({ surveyorId: user._id, deleted: true })
      .sort({ deletedAt: -1 })
      .select('title description category status participantCount deadline deletedAt createdAt')
      .lean();

    res.json({ success: true, data: surveys });
  } catch (err) {
    console.error('Error fetching recycle bin:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/surveys/:id/edit-data
 * Returns a single survey for editing (owner only, any status except expired/deleted).
 */
router.get('/:id/edit-data', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const survey = await Survey.findOne({
      _id: req.params.id,
      surveyorId: user._id,
      deleted: { $ne: true },
      status: { $nin: ['expired'] },
    }).lean();

    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    res.json({ success: true, data: survey });
  } catch (err) {
    console.error('Error fetching survey for edit:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/surveys/:id
 * Returns a single survey by ID.
 * - Admins: can view any survey regardless of status
 * - Public: published or expired only
 */
router.get('/:id', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id).lean();
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    // Check if requester is admin
    let isAdmin = false;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findOne({ email: decoded.email }).lean();
        isAdmin = user?.role === 'admin';
      } catch { /* not authenticated, treat as public */ }
    }

    if (!isAdmin && !['published', 'expired'].includes(survey.status)) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    res.json({ success: true, data: survey });
  } catch (err) {
    console.error('Error fetching survey:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/surveys/:id/results — Aggregated results with access control ────
router.get('/:id/results', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id).lean();
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    // Access control
    let userId = null;
    let isOwner = false;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findOne({ email: decoded.email }).lean();
        if (user) {
          userId = user._id.toString();
          isOwner = user._id.toString() === survey.surveyorId.toString();
        }
      } catch { /* not authenticated */ }
    }

    const isAdmin = isOwner; // owner check done below via surveyorId
    let adminCheck = false;
    if (req.headers.authorization && !isOwner) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findOne({ email: decoded.email }).lean();
        adminCheck = user?.role === 'admin';
      } catch { /* not admin */ }
    }

    const access = survey.resultAccess || 'only_me';

    // Determine if requester can view results
    let canView = false;
    if (adminCheck || isOwner) {
      canView = true;
    } else if (access === 'everyone') {
      canView = true;
    } else if (access === 'participants' && userId) {
      const hasResponded = await Response.findOne({
        surveyId: survey._id,
        userId: userId,
        status: 'submitted',
      }).lean();
      canView = !!hasResponded;
    }

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: access === 'only_me'
          ? 'Results are private. Only the survey creator can view them.'
          : 'You must participate in this survey to view results.',
      });
    }

    // Use pre-computed aiInsight.stats when available, otherwise aggregate from responses
    const hasStats = survey.aiInsight?.stats?.totalResponses > 0;

    let totalResponses;
    let questionResults;

    if (hasStats) {
      const stats = survey.aiInsight.stats;
      totalResponses = stats.totalResponses;

      // Build questionResults from pre-computed stats + survey question metadata
      const statsMap = new Map(stats.perQuestion.map((pq) => [pq.questionId, pq]));

      questionResults = survey.questions
        .filter((q) => q.type !== 'short_answer' && q.type !== 'paragraph')
        .map((q) => {
          const pq = statsMap.get(q.id);
          const optionBreakdown = pq?.optionBreakdown || [];

          // Convert optionBreakdown array to breakdown object for frontend
          const breakdown = {};
          optionBreakdown.forEach(({ value, count }) => {
            breakdown[value] = count;
          });

          return {
            questionId: q.id,
            label: q.label,
            type: q.type,
            options: q.type === 'linear_scale'
              ? Array.from({ length: (parseInt(q.options?.[1]) || 10) - (parseInt(q.options?.[0]) || 1) + 1 }, (_, i) => String((parseInt(q.options?.[0]) || 1) + i))
              : q.options || [],
            scaleLabels: q.type === 'linear_scale' ? (q.scaleLabels || {}) : undefined,
            breakdown,
            responseCount: pq?.responseCount || 0,
          };
        });
    } else {
      // Fallback: aggregate from responses (for surveys created before stats were introduced)
      const responses = await Response.find({
        surveyId: survey._id,
        status: 'submitted',
      }).lean();

      totalResponses = responses.length;

      questionResults = survey.questions
        .filter((q) => q.type !== 'short_answer' && q.type !== 'paragraph')
        .map((q) => {
          const breakdown = {};

          responses.forEach((r) => {
            const answer = r.answers?.find((a) => a.questionId === q.id);
            if (!answer) return;

            if (q.type === 'multiple_choice' || q.type === 'linear_scale') {
              const val = String(answer.value);
              breakdown[val] = (breakdown[val] || 0) + 1;
            } else if (q.type === 'checkbox') {
              const vals = Array.isArray(answer.value) ? answer.value : [answer.value];
              vals.forEach((v) => {
                const key = String(v);
                breakdown[key] = (breakdown[key] || 0) + 1;
              });
            }
          });

          return {
            questionId: q.id,
            label: q.label,
            type: q.type,
            options: q.type === 'linear_scale'
              ? Array.from({ length: (parseInt(q.options?.[1]) || 10) - (parseInt(q.options?.[0]) || 1) + 1 }, (_, i) => String((parseInt(q.options?.[0]) || 1) + i))
              : q.options || [],
            scaleLabels: q.type === 'linear_scale' ? (q.scaleLabels || {}) : undefined,
            breakdown,
            responseCount: responses.filter((r) =>
              r.answers?.some((a) => a.questionId === q.id && a.value !== undefined && a.value !== '')
            ).length,
          };
        });
    }

    res.json({
      success: true,
      data: {
        survey: {
          _id: survey._id,
          title: survey.title,
          description: survey.description,
          category: survey.category,
          resultAccess: survey.resultAccess,
          status: survey.status,
          deadline: survey.deadline,
          participantCount: survey.participantCount,
        },
        totalResponses,
        questionResults,
        aiInsight: survey.aiInsight?.status === 'ready' ? survey.aiInsight : null,
      },
    });
  } catch (err) {
    console.error('Error fetching survey results:', err);
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
    const { answers, isDraft = false } = req.body;

    // Extract userId from JWT — never trust client-supplied userId
    const authUser = await User.findOne({ email: req.decoded.email }).lean();
    if (!authUser) return res.status(404).json({ success: false, message: 'User not found' });
    const userId = authUser._id.toString();

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
 * PATCH /api/surveys/:id/ai-insight — Toggle AI insight enabled for a survey
 * Body: { enabled: boolean }
 */
router.patch('/:id/ai-insight', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });

    if (survey.surveyorId.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ success: false, message: 'enabled must be a boolean' });
    }

    survey.aiInsight.enabled = enabled;
    await survey.save();

    res.json({ success: true, data: { aiInsight: survey.aiInsight } });
  } catch (err) {
    console.error('Error toggling AI insight:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/surveys — Create a new survey (draft or published)
 * Body: { title, description, useCase, category, deadline, image, questions, status }
 */
router.post('/', verifyToken, verifySurveyor, validate(createSurveySchema), async (req, res) => {
  try {
    const { title, description, useCase, category, resultAccess, deadline, image, questions, status } = req.body;

    // Look up surveyor by email
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const validStatuses = ['draft', 'published'];
    let surveyStatus = validStatuses.includes(status) ? status : 'draft';
    let moderationResult = null;

    // If creating directly as published, check credits + run moderation
    if (surveyStatus === 'published') {
      // Fail fast: check balance before doing expensive AI moderation
      const Subscription = require('../models/Subscription');
      const sub = await Subscription.findOne({ userId: user._id }).lean();
      if (!sub || sub.balance < CREDIT_COSTS.SURVEY_CREATION) {
        return res.status(402).json({
          success: false,
          message: `Insufficient credits. Survey creation costs ${CREDIT_COSTS.SURVEY_CREATION} credits. Your balance: ${sub?.balance || 0}.`,
          balance: sub?.balance || 0,
          required: CREDIT_COSTS.SURVEY_CREATION,
        });
      }

      moderationResult = await moderateContent({
        contentType: 'survey',
        title: title.trim(),
        description: description?.trim(),
        questions,
      });

      // All providers exhausted — save as draft, return 429
      if (moderationResult.allExhausted) {
        surveyStatus = 'draft';
        const survey = await Survey.create({
          surveyorId: user._id,
          title: title.trim(),
          description: description?.trim() || undefined,
          useCase: useCase?.trim() || undefined,
          category: category?.trim() || undefined,
          resultAccess: resultAccess || 'only_me',
          deadline: deadline.trim(),
          image: image?.trim() || undefined,
          questions,
          status: 'draft',
        });
        return res.status(429).json({
          success: false,
          message: 'AI review limit reached. Survey saved as draft. Try again later.',
          data: survey,
        });
      }

      if (moderationResult.decision === 'rejected') {
        surveyStatus = 'rejected';
      } else if (moderationResult.decision === 'pending') {
        surveyStatus = 'pending_review';
      }
    }

    const survey = await Survey.create({
      surveyorId: user._id,
      title: title.trim(),
      description: description?.trim() || undefined,
      useCase: useCase?.trim() || undefined,
      category: category?.trim() || undefined,
      resultAccess: resultAccess || 'only_me',
      deadline: deadline.trim(),
      image: image?.trim() || undefined,
      questions,
      status: surveyStatus,
      publishedAt: surveyStatus === 'published' ? new Date() : undefined,
      moderation: moderationResult ? {
        decision: moderationResult.decision,
        reason: moderationResult.reason,
        flaggedCategories: moderationResult.flaggedCategories,
        reviewedAt: new Date(),
      } : undefined,
    });

    // Deduct credits if survey was published
    if (surveyStatus === 'published') {
      const deductResult = await deductCredits(
        user._id,
        CREDIT_COSTS.SURVEY_CREATION,
        'survey_creation',
        `Created survey "${title.trim()}"`,
        survey._id
      );
      if (!deductResult.success) {
        // Rollback: delete the survey since payment failed
        await Survey.findByIdAndDelete(survey._id);
        return res.status(402).json({
          success: false,
          message: deductResult.error,
          balance: deductResult.balance,
          required: CREDIT_COSTS.SURVEY_CREATION,
        });
      }

      // Schedule expiry job
      await scheduleExpiry(survey._id, survey.deadline);
    }

    const response = { success: true, data: survey };

    if (moderationResult?.decision === 'rejected') {
      response.moderation = {
        decision: 'rejected',
        message: 'Your survey was flagged by AI moderation and saved as rejected. You can edit and try publishing again.',
        reason: moderationResult.reason,
        flaggedCategories: moderationResult.flaggedCategories,
      };
    } else if (moderationResult?.decision === 'pending') {
      response.moderation = {
        decision: 'pending',
        message: 'Your survey has been submitted for admin review before publishing.',
      };
    }

    res.status(201).json(response);
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

    const { title, description, useCase, category, resultAccess, deadline, image, questions, status } = req.body;

    if (title !== undefined) survey.title = title.trim();
    if (description !== undefined) survey.description = description?.trim() || undefined;
    if (useCase !== undefined) survey.useCase = useCase?.trim() || undefined;
    if (category !== undefined) survey.category = category?.trim() || undefined;
    if (resultAccess !== undefined) survey.resultAccess = resultAccess;
    if (deadline !== undefined) {
      const newDeadline = deadline.trim();
      const deadlineChanged = newDeadline !== survey.deadline;
      survey.deadline = newDeadline;

      // If already published and deadline changed, reschedule expiry
      if (deadlineChanged && survey.status === 'published') {
        await scheduleExpiry(survey._id, newDeadline);
      }
    }
    if (image !== undefined) survey.image = image?.trim() || undefined;
    if (questions !== undefined) survey.questions = questions;
    if (status !== undefined && ['draft', 'published'].includes(status)) {
      // If publishing, check credits + run content moderation first
      if (status === 'published' && survey.status !== 'published') {
        // Fail fast: check balance before doing expensive AI moderation
        const Subscription = require('../models/Subscription');
        const sub = await Subscription.findOne({ userId: user._id }).lean();
        if (!sub || sub.balance < CREDIT_COSTS.SURVEY_CREATION) {
          return res.status(402).json({
            success: false,
            message: `Insufficient credits. Survey publish costs ${CREDIT_COSTS.SURVEY_CREATION} credits. Your balance: ${sub?.balance || 0}.`,
            balance: sub?.balance || 0,
            required: CREDIT_COSTS.SURVEY_CREATION,
          });
        }

        const modResult = await moderateContent({
          contentType: 'survey',
          title: survey.title,
          description: survey.description,
          questions: survey.questions,
        });

        // All providers exhausted — save as draft, return 429
        if (modResult.allExhausted) {
          survey.status = 'draft';
          await survey.save();
          return res.status(429).json({
            success: false,
            message: 'AI review limit reached. Survey saved as draft. Try again later.',
            data: survey,
          });
        }

        if (modResult.decision === 'rejected') {
          survey.status = 'rejected';
          survey.moderation = {
            decision: 'rejected',
            reason: modResult.reason,
            flaggedCategories: modResult.flaggedCategories,
            reviewedAt: new Date(),
          };
          await survey.save();
          return res.json({
            success: true,
            data: survey,
            moderation: {
              decision: 'rejected',
              message: 'Your survey was flagged by AI moderation and saved as rejected. You can edit and try publishing again.',
              reason: modResult.reason,
              flaggedCategories: modResult.flaggedCategories,
            },
          });
        }

        if (modResult.decision === 'pending') {
          survey.status = 'pending_review';
          survey.moderation = {
            decision: 'pending',
            reason: modResult.reason,
            flaggedCategories: modResult.flaggedCategories,
            reviewedAt: new Date(),
          };
          await survey.save();
          return res.json({
            success: true,
            data: survey,
            moderation: {
              decision: 'pending',
              message: 'Your survey has been submitted for admin review before publishing.',
            },
          });
        }
      }

      survey.status = status;
      if (status === 'published' && !survey.publishedAt) {
        survey.publishedAt = new Date();
      }
      survey.moderation = {
        decision: 'approved',
        reason: 'Passed automated moderation',
        reviewedAt: new Date(),
      };

      // Deduct credits on publish
      const deductResult = await deductCredits(
        user._id,
        CREDIT_COSTS.SURVEY_CREATION,
        'survey_creation',
        `Published survey "${survey.title}"`,
        survey._id
      );
      if (!deductResult.success) {
        return res.status(402).json({
          success: false,
          message: deductResult.error,
          balance: deductResult.balance,
          required: CREDIT_COSTS.SURVEY_CREATION,
        });
      }

      // Schedule expiry job
      await scheduleExpiry(survey._id, survey.deadline);
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

    // If already soft-deleted, permanently delete
    if (survey.deleted) {
      // Block permanent delete for expired surveys
      if (survey.status === 'expired') {
        return res.status(400).json({
          success: false,
          message: 'Expired surveys cannot be permanently deleted.',
        });
      }

      // Block permanent delete for published surveys with 5+ responses
      if (survey.status === 'published' && (survey.participantCount || 0) >= 5) {
        return res.status(400).json({
          success: false,
          message: `This survey has ${survey.participantCount} responses and cannot be permanently deleted.`,
        });
      }

      await Survey.findByIdAndDelete(req.params.id);
      await Response.deleteMany({ surveyId: req.params.id });
      return res.json({ success: true, message: 'Survey permanently deleted' });
    }

    // Otherwise, soft delete
    survey.deleted = true;
    survey.deletedAt = new Date();
    await survey.save();

    // Remove expiry job
    await removeExpiryJob(survey._id);

    res.json({ success: true, message: 'Survey moved to recycle bin' });
  } catch (err) {
    console.error('Error deleting survey:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/surveys/:id/restore — Restore a soft-deleted survey
 */
router.post('/:id/restore', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user || survey.surveyorId.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!survey.deleted) {
      return res.status(400).json({ success: false, message: 'Survey is not in recycle bin' });
    }

    survey.deleted = false;
    survey.deletedAt = undefined;
    await survey.save();

    // Re-schedule expiry if published with future deadline
    if (survey.status === 'published' && survey.deadline) {
      const delay = new Date(survey.deadline).getTime() - Date.now();
      if (delay > 0) {
        await scheduleExpiry(survey._id, survey.deadline);
      }
    }

    res.json({ success: true, data: survey, message: 'Survey restored' });
  } catch (err) {
    console.error('Error restoring survey:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/surveys/:id/my-response
 * Returns the existing draft or submitted response for the authenticated user.
 */
router.get('/:id/my-response', verifyToken, async (req, res) => {
  try {
    const authUser = await User.findOne({ email: req.decoded.email }).lean();
    if (!authUser) return res.status(404).json({ success: false, message: 'User not found' });

    const response = await Response.findOne({ surveyId: req.params.id, userId: authUser._id }).lean();
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

/**
 * GET /api/surveys/:id/feedback
 * Get all feedback for a survey. Only the survey owner can access this.
 */
router.get('/:id/feedback', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id).lean();
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user || survey.surveyorId.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const feedbacks = await Feedback.find({ surveyId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    const avgRating = feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
      : null;

    res.json({
      success: true,
      data: {
        feedbacks,
        total: feedbacks.length,
        avgRating: avgRating ? parseFloat(avgRating) : null,
      },
    });
  } catch (err) {
    console.error('Error fetching survey feedback:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/surveys/:id/report
 * Submit a report for a specific survey. Requires authentication.
 */
router.post('/:id/report', verifyToken, validate(surveyReportSchema), async (req, res) => {
  try {
    const { reportReason, details } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    // Prevent self-reporting
    const reporter = await User.findOne({ email: userEmail }).lean();
    if (reporter && survey.surveyorId.toString() === reporter._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot report your own survey' });
    }

    // Check for duplicate report
    const existing = await Report.findOne({ surveyId: req.params.id, reporterEmail: userEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reported this survey' });
    }

    const report = new Report({
      surveyId: req.params.id,
      reporterEmail: userEmail,
      reportReason,
      details: details?.trim() || undefined,
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review it.',
      data: report,
    });
  } catch (err) {
    console.error('Error submitting survey report:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/surveys/:id/appeal — Appeal a rejected survey
 * Body: { message }
 */
router.post('/:id/appeal', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user || survey.surveyorId.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (survey.moderation?.decision !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Only rejected content can be appealed' });
    }

    if (survey.moderation?.appeal) {
      return res.status(400).json({ success: false, message: 'An appeal has already been submitted' });
    }

    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Appeal message is required' });
    }

    survey.moderation.appeal = {
      message: message.trim(),
      submittedAt: new Date(),
    };
    survey.status = 'pending_review';
    await survey.save();

    res.json({ success: true, message: 'Appeal submitted. An admin will review your content.' });
  } catch (err) {
    console.error('Error submitting appeal:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PATCH /api/surveys/:id/moderate — Admin approve/reject a survey
 * Body: { decision: 'approved' | 'rejected', reason (required) }
 */
router.patch('/:id/moderate', verifyToken, async (req, res) => {
  try {
    const admin = await User.findOne({ email: req.decoded.email }).lean();
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const { decision, reason } = req.body;
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be approved or rejected' });
    }

    if (!reason?.trim()) {
      return res.status(400).json({ success: false, message: 'Admin note is required' });
    }

    survey.moderation.decision = decision;
    survey.moderation.reason = reason.trim();
    survey.moderation.reviewedBy = admin._id;
    survey.moderation.reviewedAt = new Date();
    delete survey.moderation.appeal;

    if (decision === 'approved') {
      survey.status = 'published';
      if (!survey.publishedAt) survey.publishedAt = new Date();

      // Deduct credits when admin approves a pending survey
      const surveyOwner = await User.findById(survey.surveyorId).lean();
      if (surveyOwner) {
        const deductResult = await deductCredits(
          surveyOwner._id,
          CREDIT_COSTS.SURVEY_CREATION,
          'survey_creation',
          `Admin approved survey "${survey.title}"`,
          survey._id
        );
        if (!deductResult.success) {
          console.warn(`Credit deduction failed for survey ${survey._id}: ${deductResult.error}`);
        }
      }

      // Schedule expiry job
      if (survey.deadline) {
        await scheduleExpiry(survey._id, survey.deadline);
      }
    } else {
      survey.status = 'rejected';
    }

    await survey.save();
    res.json({ success: true, data: survey });
  } catch (err) {
    console.error('Error moderating survey:', err.message, err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Blog = require('../../models/Blog');
const Report = require('../../models/report');
const User = require('../../models/User');
const { moderateContent } = require('../../services/moderation');
const validate = require('../../validations/validate');
const {
  createBlogSchema,
  updateBlogSchema,
  blogReactionSchema,
  blogCommentSchema,
  surveyReportSchema,
  appealSchema,
  moderateSchema,
} = require('../../validations/schemas');
const { verifyToken, verifySurveyor } = require('../../middlewares/authMiddleware')();
const { CREDIT_COSTS, deductCredits } = require('../../lib/creditConfig');
const escapeRegex = require('../../lib/escapeRegex');

// ── helper: attach role badge info to a list of emails ─────────────────────
async function enrichWithRoles(emails) {
  const unique = [...new Set(emails.filter(Boolean))];
  if (!unique.length) return {};
  const users = await User.find({ email: { $in: unique } }, 'email role name avatar photoURL').lean();
  return Object.fromEntries(users.map(u => [u.email, u]));
}

// ── GET /api/blogs?page=1&limit=5 — paginated feed ─────────────────────────
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 5);
    const skip  = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find({ status: 'active', deletedAt: null })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments({ status: 'active', deletedAt: null }),
    ]);

    // enrich surveyor info
    const surveyorEmails = blogs.map(b => b.surveyorEmail);
    const roleMap = await enrichWithRoles(surveyorEmails);

    const enriched = blogs.map(b => {
      const { comments, ...rest } = b;
      return {
        ...rest,
        commentCount: comments?.length || 0,
        surveyor: roleMap[b.surveyorEmail] || { email: b.surveyorEmail },
        reactionCounts: {
          like:        b.reactions.like.length,
          insightful:  b.reactions.insightful.length,
          disagree:    b.reactions.disagree.length,
          interesting: b.reactions.interesting.length,
          funny:       b.reactions.funny.length,
        },
      };
    });

    res.json({
      success: true,
      data: enriched,
      pagination: { page, limit, total, hasMore: skip + limit < total },
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/blogs/mine — surveyor's own blogs (active + draft) ──────────────
router.get('/mine', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const { sort, search, status } = req.query;
    const query = { surveyorEmail: req.decoded.email, deletedAt: null };

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Title search
    if (search && search.trim()) {
      query.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'title_asc') sortOption = { title: 1 };
    if (sort === 'title_desc') sortOption = { title: -1 };
    if (sort === 'updated') sortOption = { updatedAt: -1 };

    const blogs = await Blog.find(query).sort(sortOption).lean();

    // Enrich with surveyor info
    const roleMap = await enrichWithRoles([req.decoded.email]);
    const enriched = blogs.map(b => ({
      ...b,
      surveyor: roleMap[b.surveyorEmail] || { email: b.surveyorEmail },
      reactionCounts: {
        like: b.reactions?.like?.length || 0,
        insightful: b.reactions?.insightful?.length || 0,
        disagree: b.reactions?.disagree?.length || 0,
        interesting: b.reactions?.interesting?.length || 0,
        funny: b.reactions?.funny?.length || 0,
      },
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Error fetching own blogs:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/blogs/recycle-bin — surveyor's soft-deleted blogs ────────────────
router.get('/recycle-bin', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const blogs = await Blog.find({ surveyorEmail: req.decoded.email, deletedAt: { $ne: null } })
      .sort({ deletedAt: -1 })
      .select('title content status deletedAt createdAt')
      .lean();

    res.json({ success: true, data: blogs });
  } catch (err) {
    console.error('Error fetching blog recycle bin:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/blogs/:id/restore — restore a soft-deleted blog ────────────────
router.post('/:id/restore', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, surveyorEmail: req.decoded.email, deletedAt: { $ne: null } });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found in recycle bin' });
    }

    blog.deletedAt = null;
    await blog.save();
    res.json({ success: true, message: 'Blog restored' });
  } catch (err) {
    console.error('Error restoring blog:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/blogs — Create a new blog post ────────────────────────────────
router.post('/', verifyToken, verifySurveyor, validate(createBlogSchema), async (req, res) => {
  try {
    const { title, content, surveyId, status } = req.body;

    let moderationResult = null;

    // If creating directly as active, check credits + run moderation
    if (status === 'active') {
      // Fail fast: check balance before doing expensive AI moderation
      const blogUser = req.user;
      if (!blogUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const Subscription = require('../../models/Subscription');
      const sub = await Subscription.findOne({ userId: blogUser._id }).lean();
      if (!sub || sub.balance < CREDIT_COSTS.BLOG_CREATION) {
        return res.status(402).json({
          success: false,
          message: `Insufficient credits. Blog creation costs ${CREDIT_COSTS.BLOG_CREATION} credits. Your balance: ${sub?.balance || 0}.`,
          balance: sub?.balance || 0,
          required: CREDIT_COSTS.BLOG_CREATION,
        });
      }

      moderationResult = await moderateContent({
        contentType: 'blog',
        title: title.trim(),
        content: content.trim(),
      });

      // All providers exhausted — save as draft, return 429
      if (moderationResult.allExhausted) {
        const blog = await Blog.create({
          surveyorEmail: req.decoded.email,
          title: title.trim(),
          content: content.trim(),
          surveyId: surveyId || undefined,
          status: 'draft',
        });
        return res.status(429).json({
          success: false,
          message: 'AI review limit reached. Blog saved as draft. Try again later.',
          data: blog,
        });
      }

      if (moderationResult.decision === 'rejected') {
        const blog = await Blog.create({
          surveyorEmail: req.decoded.email,
          title: title.trim(),
          content: content.trim(),
          surveyId: surveyId || undefined,
          status: 'rejected',
          moderation: {
            decision: 'rejected',
            reason: moderationResult.reason,
            flaggedCategories: moderationResult.flaggedCategories,
            reviewedAt: new Date(),
          },
        });
        return res.status(200).json({
          success: true,
          data: blog,
          moderation: {
            decision: 'rejected',
            message: 'Your blog was flagged by AI moderation and saved as rejected. You can edit and try publishing again.',
            reason: moderationResult.reason,
            flaggedCategories: moderationResult.flaggedCategories,
          },
        });
      }
    }

    // Determine final status
    // Blog: if confused/pending → just set active (community self-polices)
    let finalStatus = 'draft';
    if (moderationResult?.decision === 'approved') {
      finalStatus = 'active';
    } else if (moderationResult?.decision === 'pending') {
      finalStatus = 'active'; // blogs auto-activate on confusion
    } else if (!moderationResult) {
      finalStatus = status === 'active' ? 'draft' : 'draft'; // no moderation = draft
    }

    const blog = await Blog.create({
      surveyorEmail: req.decoded.email,
      title: title.trim(),
      content: content.trim(),
      surveyId: surveyId || undefined,
      status: finalStatus,
      moderation: moderationResult ? {
        decision: moderationResult.decision,
        reason: moderationResult.reason,
        flaggedCategories: moderationResult.flaggedCategories,
        reviewedAt: new Date(),
      } : undefined,
    });

    // Deduct credits if blog was published (active)
    if (finalStatus === 'active') {
      const blogUser = req.user;
      const deductResult = await deductCredits(
        blogUser._id,
        CREDIT_COSTS.BLOG_CREATION,
        'survey_creation', // reuse ledger type for content creation
        `Created blog "${title.trim()}"`,
        blog._id
      );
      if (!deductResult.success) {
        // Rollback: delete the blog since payment failed
        await Blog.findByIdAndDelete(blog._id);
        return res.status(402).json({
          success: false,
          message: deductResult.error,
          balance: deductResult.balance,
          required: CREDIT_COSTS.BLOG_CREATION,
        });
      }
    }

    const response = { success: true, data: blog };
    if (moderationResult?.decision === 'pending') {
      response.moderation = {
        decision: 'pending',
        message: 'Your blog has been submitted for admin review before publishing.',
      };
    }

    res.status(201).json(response);
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/blogs/:id — Update a blog post (owner only) ────────────────────
router.put('/:id', verifyToken, verifySurveyor, validate(updateBlogSchema), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    if (blog.surveyorEmail !== req.decoded.email) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, content, surveyId, status } = req.body;

    // Track content edits
    if (content !== undefined && content.trim() !== blog.content) {
      blog.editHistory.push({ content: blog.content, editedAt: new Date() });
      blog.edited = true;
    }

    if (title !== undefined) blog.title = title.trim();
    if (content !== undefined) blog.content = content.trim();
    if (surveyId !== undefined) blog.surveyId = surveyId || undefined;
    if (status !== undefined && ['draft', 'active'].includes(status)) {
      // If publishing (activating), check credits + run content moderation first
      if (status === 'active' && blog.status !== 'active') {
        // Fail fast: check balance before doing expensive AI moderation
        const blogUser = req.user;
        if (!blogUser) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        const Subscription = require('../../models/Subscription');
        const sub = await Subscription.findOne({ userId: blogUser._id }).lean();
        if (!sub || sub.balance < CREDIT_COSTS.BLOG_CREATION) {
          return res.status(402).json({
            success: false,
            message: `Insufficient credits. Blog publish costs ${CREDIT_COSTS.BLOG_CREATION} credits. Your balance: ${sub?.balance || 0}.`,
            balance: sub?.balance || 0,
            required: CREDIT_COSTS.BLOG_CREATION,
          });
        }

        const modResult = await moderateContent({
          contentType: 'blog',
          title: blog.title,
          content: blog.content,
        });

        // All providers exhausted — save as draft, return 429
        if (modResult.allExhausted) {
          blog.status = 'draft';
          await blog.save();
          return res.status(429).json({
            success: false,
            message: 'AI review limit reached. Blog saved as draft. Try again later.',
            data: blog,
          });
        }

        if (modResult.decision === 'rejected') {
          blog.status = 'rejected';
          blog.moderation = {
            decision: 'rejected',
            reason: modResult.reason,
            flaggedCategories: modResult.flaggedCategories,
            reviewedAt: new Date(),
          };
          await blog.save();
          return res.json({
            success: true,
            data: blog,
            moderation: {
              decision: 'rejected',
              message: 'Your blog was flagged by AI moderation and saved as rejected. You can edit and try publishing again.',
              reason: modResult.reason,
              flaggedCategories: modResult.flaggedCategories,
            },
          });
        }

        // Blog: if confused/pending → just set active (community self-polices)
        if (modResult.decision === 'pending') {
          blog.status = 'active';
          blog.moderation = {
            decision: 'pending',
            reason: modResult.reason,
            flaggedCategories: modResult.flaggedCategories,
            reviewedAt: new Date(),
          };

          // Deduct credits for pending-activation
          const pendingUser = req.user;
          const deductResult = await deductCredits(
            pendingUser._id,
            CREDIT_COSTS.BLOG_CREATION,
            'survey_creation',
            `Published blog "${blog.title}"`,
            blog._id
          );
          if (!deductResult.success) {
            return res.status(402).json({
              success: false,
              message: deductResult.error,
              balance: deductResult.balance,
              required: CREDIT_COSTS.BLOG_CREATION,
            });
          }

          await blog.save();
          return res.json({ success: true, data: blog });
        }
      }

      blog.status = status;
      blog.moderation = {
        decision: 'approved',
        reason: 'Passed automated moderation',
        reviewedAt: new Date(),
      };

      // Deduct credits on publish
      const blogOwner = req.user;
      const deductResult = await deductCredits(
        blogOwner._id,
        CREDIT_COSTS.BLOG_CREATION,
        'survey_creation',
        `Published blog "${blog.title}"`,
        blog._id
      );
      if (!deductResult.success) {
        return res.status(402).json({
          success: false,
          message: deductResult.error,
          balance: deductResult.balance,
          required: CREDIT_COSTS.BLOG_CREATION,
        });
      }
    }

    await blog.save();
    res.json({ success: true, data: blog });
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── DELETE /api/blogs/:id — Delete a blog post (owner only) ─────────────────
router.delete('/:id', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    if (blog.surveyorEmail !== req.decoded.email) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Soft delete
    blog.deletedAt = new Date();
    await blog.save();
    res.json({ success: true, message: 'Blog moved to recycle bin' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/blogs/:id/report — Report a blog post ────────────────────────
router.post('/:id/report', verifyToken, validate(surveyReportSchema), async (req, res) => {
  try {
    const { reportReason, details } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Prevent self-reporting
    if (blog.surveyorEmail === userEmail) {
      return res.status(400).json({ success: false, message: 'You cannot report your own blog' });
    }

    // Check for duplicate report
    const existing = await Report.findOne({ blogId: req.params.id, reporterEmail: userEmail, commentId: { $exists: false } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reported this blog' });
    }

    const report = new Report({
      blogId: req.params.id,
      reporterEmail: userEmail,
      reportReason,
      details: details?.trim() || undefined,
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review it.',
    });
  } catch (err) {
    console.error('Error reporting blog:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/blogs/:id/comments/:commentId/report — Report a comment ──────
router.post('/:id/comments/:commentId/report', verifyToken, validate(surveyReportSchema), async (req, res) => {
  try {
    const { reportReason, details } = req.body;
    const userEmail = req.user?.email;
    const { id, commentId } = req.params;

    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Find the comment
    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Prevent self-reporting
    if (comment.userEmail === userEmail) {
      return res.status(400).json({ success: false, message: 'You cannot report your own comment' });
    }

    // Check for duplicate report
    const existing = await Report.findOne({ blogId: id, commentId, reporterEmail: userEmail, replyId: { $exists: false } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reported this comment' });
    }

    const report = new Report({
      blogId: id,
      commentId,
      reporterEmail: userEmail,
      reportReason,
      details: details?.trim() || undefined,
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review it.',
    });
  } catch (err) {
    console.error('Error reporting comment:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/blogs/:id/comments/:commentId/replies/:replyId/report — Report a reply ──
router.post('/:id/comments/:commentId/replies/:replyId/report', verifyToken, validate(surveyReportSchema), async (req, res) => {
  try {
    const { reportReason, details } = req.body;
    const userEmail = req.user?.email;
    const { id, commentId, replyId } = req.params;

    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    // Prevent self-reporting
    if (reply.userEmail === userEmail) {
      return res.status(400).json({ success: false, message: 'You cannot report your own reply' });
    }

    // Check for duplicate report
    const existing = await Report.findOne({ blogId: id, commentId, replyId, reporterEmail: userEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reported this reply' });
    }

    const report = new Report({
      blogId: id,
      commentId,
      replyId,
      reporterEmail: userEmail,
      reportReason,
      details: details?.trim() || undefined,
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review it.',
    });
  } catch (err) {
    console.error('Error reporting reply:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/blogs/moderation/queue — Get pending moderation items (admin) ──
router.get('/moderation/queue', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const pending = await Blog.find({ status: 'pending_review', deletedAt: null })
      .select('title content status moderation surveyorEmail createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: pending });
  } catch (err) {
    console.error('Error fetching blog moderation queue:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/blogs/admin/all — Admin: list all blogs with filter/search/sort ──
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { status, search, sort = 'newest', page = 1, limit = 20 } = req.query;

    const filter = { deletedAt: null };
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: escapeRegex(search), $options: 'i' } },
        { content: { $regex: escapeRegex(search), $options: 'i' } },
        { surveyorEmail: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'title') sortObj = { title: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select('title content status moderation surveyorEmail edited createdAt')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Blog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Error fetching admin blogs:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/blogs/:id/edit-data — owner-only for editing ──────────────────
router.get('/:id/edit-data', verifyToken, verifySurveyor, async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      surveyorEmail: req.decoded.email,
      status: { $nin: ['banned'] },
    }).lean();

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, data: blog });
  } catch (err) {
    console.error('Error fetching blog for edit:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/blogs/:id — single blog with comments/replies ─────────────────
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog || blog.status === 'banned' || blog.deletedAt) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Collect all unique emails to enrich
    const allEmails = [
      blog.surveyorEmail,
      ...blog.comments.map(c => c.userEmail),
      ...blog.comments.flatMap(c => c.replies.map(r => r.userEmail)),
    ];
    const roleMap = await enrichWithRoles(allEmails);

    const enrichedComments = blog.comments.map(c => ({
      ...c,
      author: roleMap[c.userEmail] || { email: c.userEmail },
      replies: c.replies.map(r => ({
        ...r,
        author: roleMap[r.userEmail] || { email: r.userEmail },
      })),
    }));

    res.json({
      success: true,
      data: {
        ...blog,
        surveyor: roleMap[blog.surveyorEmail] || { email: blog.surveyorEmail },
        comments: enrichedComments,
        reactionCounts: {
          like:        blog.reactions.like.length,
          insightful:  blog.reactions.insightful.length,
          disagree:    blog.reactions.disagree.length,
          interesting: blog.reactions.interesting.length,
          funny:       blog.reactions.funny.length,
        },
      },
    });
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/blogs/:id/react — toggle a reaction (auth required) ───────────
router.post('/:id/react', verifyToken, validate(blogReactionSchema), async (req, res) => {
  try {
    const { reactionType } = req.body;
    const userEmail = req.decoded.email;

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Not found' });

    const reactionTypes = ['like', 'insightful', 'disagree', 'interesting', 'funny'];
    const arr = blog.reactions[reactionType];
    const idx = arr.indexOf(userEmail);

    // Remove from all reaction types first (one reaction per user)
    for (const type of reactionTypes) {
      const i = blog.reactions[type].indexOf(userEmail);
      if (i !== -1) blog.reactions[type].splice(i, 1);
    }

    // Toggle: if wasn't already this type, add it
    if (idx === -1) blog.reactions[reactionType].push(userEmail);

    await blog.save();

    res.json({
      success: true,
      data: {
        like:        blog.reactions.like.length,
        insightful:  blog.reactions.insightful.length,
        disagree:    blog.reactions.disagree.length,
        interesting: blog.reactions.interesting.length,
        funny:       blog.reactions.funny.length,
        userReaction: idx === -1 ? reactionType : null,
      },
    });
  } catch (err) {
    console.error('Error reacting:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/blogs/:id/comments — add a comment (auth required) ────────────
router.post('/:id/comments', verifyToken, validate(blogCommentSchema), async (req, res) => {
  try {
    const { text } = req.body;
    const userEmail = req.decoded.email;

    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.status === 'banned') {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.comments.push({ userEmail, text: text.trim() });
    await blog.save();

    const newComment = blog.comments[blog.comments.length - 1];
    const users = await User.find({ email: userEmail }, 'email role name avatar photoURL').lean();
    const author = users[0] || { email: userEmail };

    res.status(201).json({
      success: true,
      data: { ...newComment.toObject(), author },
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/blogs/:id/comments/:commentId/replies — add a reply ───────────
router.post('/:id/comments/:commentId/replies', verifyToken, validate(blogCommentSchema), async (req, res) => {
  try {
    const { text } = req.body;
    const userEmail = req.decoded.email;

    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.status === 'banned') {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.replies.push({ userEmail, text: text.trim() });
    await blog.save();

    const newReply = comment.replies[comment.replies.length - 1];
    const users = await User.find({ email: userEmail }, 'email role name avatar photoURL').lean();
    const author = users[0] || { email: userEmail };

    res.status(201).json({
      success: true,
      data: { ...newReply.toObject(), author },
    });
  } catch (err) {
    console.error('Error adding reply:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/blogs/:id/appeal — Appeal a rejected blog ─────────────────────
router.post('/:id/appeal', verifyToken, verifySurveyor, validate(appealSchema), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (blog.surveyorEmail !== req.decoded.email) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (blog.moderation?.decision !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Only rejected content can be appealed' });
    }

    if (blog.moderation?.appeal) {
      return res.status(400).json({ success: false, message: 'An appeal has already been submitted' });
    }

    const { message } = req.body;

    blog.moderation.appeal = {
      message: message.trim(),
      submittedAt: new Date(),
    };
    blog.status = 'pending_review';
    await blog.save();

    res.json({ success: true, message: 'Appeal submitted. An admin will review your content.' });
  } catch (err) {
    console.error('Error submitting blog appeal:', err.message, err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// ── PATCH /api/blogs/:id/moderate — Admin approve/reject a blog ─────────────
router.patch('/:id/moderate', verifyToken, validate(moderateSchema), async (req, res) => {
  try {
    const admin = req.user;
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const { decision, reason } = req.body;

    blog.moderation.decision = decision;
    blog.moderation.reason = reason.trim();
    blog.moderation.reviewedBy = admin._id;
    blog.moderation.reviewedAt = new Date();
    delete blog.moderation.appeal;

    if (decision === 'approved') {
      blog.status = 'active';

      // Deduct credits when admin approves a pending blog
      const blogOwner = await User.findOne({ email: blog.surveyorEmail }).lean();
      if (blogOwner) {
        const deductResult = await deductCredits(
          blogOwner._id,
          CREDIT_COSTS.BLOG_CREATION,
          'survey_creation',
          `Admin approved blog "${blog.title}"`,
          blog._id
        );
        if (!deductResult.success) {
          console.warn(`Credit deduction failed for blog ${blog._id}: ${deductResult.error}`);
        }
      }
    } else {
      blog.status = 'rejected';
    }

    await blog.save();
    res.json({ success: true, data: blog });
  } catch (err) {
    console.error('Error moderating blog:', err.message, err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = router;

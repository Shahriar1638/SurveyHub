const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const User = require('../models/User');
const { moderateContent } = require('../services/moderation');
const validate = require('../validations/validate');
const {
  createBlogSchema,
  updateBlogSchema,
  blogReactionSchema,
  blogCommentSchema,
} = require('../validations/schemas');
const { verifyToken, verifySurveyor } = require('../middlewares/authMiddleware')();

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
      Blog.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments({ status: 'active' }),
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
    const query = { surveyorEmail: req.decoded.email };

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Title search
    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
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

// ── POST /api/blogs — Create a new blog post ────────────────────────────────
router.post('/', verifyToken, verifySurveyor, validate(createBlogSchema), async (req, res) => {
  try {
    const { title, content, surveyId, status } = req.body;

    const blogStatus = status === 'active' ? 'draft' : 'draft'; // Always start as draft
    let moderationResult = null;

    // If creating directly as active, run moderation
    if (status === 'active') {
      moderationResult = await moderateContent({
        contentType: 'blog',
        title: title.trim(),
        content: content.trim(),
      });

      if (moderationResult.decision === 'rejected') {
        return res.status(422).json({
          success: false,
          message: 'Content rejected by moderation',
          moderation: {
            decision: moderationResult.decision,
            reason: moderationResult.reason,
            flaggedCategories: moderationResult.flaggedCategories,
          },
        });
      }
    }

    // Quota exceeded — save as draft; otherwise pending_review
    let finalStatus = 'draft';
    if (moderationResult?.decision === 'pending') {
      finalStatus = moderationResult.quotaExceeded ? 'draft' : 'pending_review';
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

    const response = { success: true, data: blog };
    if (moderationResult?.quotaExceeded) {
      response.message = moderationResult.reason;
    }
    if (moderationResult?.decision === 'pending' && !moderationResult?.quotaExceeded) {
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
      // If publishing (activating), run content moderation first
      if (status === 'active' && blog.status !== 'active') {
        const modResult = await moderateContent({
          contentType: 'blog',
          title: blog.title,
          content: blog.content,
        });

        if (modResult.decision === 'rejected') {
          return res.status(422).json({
            success: false,
            message: 'Content rejected by moderation',
            moderation: {
              decision: modResult.decision,
              reason: modResult.reason,
              flaggedCategories: modResult.flaggedCategories,
            },
          });
        }

        if (modResult.decision === 'pending') {
          // Quota exceeded — save as draft instead of pending_review
          if (modResult.quotaExceeded) {
            blog.status = 'draft';
            blog.moderation = {
              decision: 'pending',
              reason: modResult.reason,
              flaggedCategories: modResult.flaggedCategories,
              reviewedAt: new Date(),
            };
            await blog.save();
            return res.json({
              success: true,
              data: blog,
              message: modResult.reason,
            });
          } else {
            blog.status = 'pending_review';
            blog.moderation = {
              decision: 'pending',
              reason: modResult.reason,
              flaggedCategories: modResult.flaggedCategories,
              reviewedAt: new Date(),
            };
            await blog.save();
            return res.json({
              success: true,
              data: blog,
              moderation: {
                decision: 'pending',
                message: 'Your blog has been submitted for admin review before publishing.',
              },
            });
          }
        }
      }

      blog.status = status;
      blog.moderation = {
        decision: 'approved',
        reason: 'Passed automated moderation',
        reviewedAt: new Date(),
      };
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

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/blogs/moderation/queue — Get pending moderation items (admin) ──
router.get('/moderation/queue', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.decoded.email }).lean();
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const pending = await Blog.find({ status: 'pending_review' })
      .select('title content status moderation surveyorEmail createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: pending });
  } catch (err) {
    console.error('Error fetching blog moderation queue:', err);
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
    if (!blog || blog.status === 'banned') {
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
    const { userEmail, reactionType } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Not found' });

    const arr = blog.reactions[reactionType];
    const idx = arr.indexOf(userEmail);

    // Remove from all reaction types first (one reaction per user)
    for (const type of valid) {
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
    const { userEmail, text } = req.body;

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
    const { userEmail, text } = req.body;

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
router.post('/:id/appeal', verifyToken, verifySurveyor, async (req, res) => {
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
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Appeal message is required' });
    }

    blog.moderation.appeal = {
      message: message.trim(),
      submittedAt: new Date(),
    };
    blog.status = 'pending_review';
    await blog.save();

    res.json({ success: true, message: 'Appeal submitted. An admin will review your content.' });
  } catch (err) {
    console.error('Error submitting blog appeal:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PATCH /api/blogs/:id/moderate — Admin approve/reject a blog ─────────────
router.patch('/:id/moderate', verifyToken, async (req, res) => {
  try {
    const admin = await User.findOne({ email: req.decoded.email }).lean();
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const { decision, reason } = req.body;
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be approved or rejected' });
    }

    blog.moderation = {
      ...blog.moderation,
      decision,
      reason: reason || (decision === 'approved' ? 'Approved by admin' : 'Rejected by admin'),
      reviewedBy: admin._id,
      reviewedAt: new Date(),
    };

    if (decision === 'approved') {
      blog.status = 'active';
    } else {
      blog.status = 'rejected';
    }

    await blog.save();
    res.json({ success: true, data: blog });
  } catch (err) {
    console.error('Error moderating blog:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

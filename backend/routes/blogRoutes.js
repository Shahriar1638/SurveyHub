const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const User = require('../models/User');
const { verifyToken } = require('../middlewares/authMiddleware')();

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
router.post('/:id/react', verifyToken, async (req, res) => {
  try {
    const { userEmail, reactionType } = req.body;
    const valid = ['like', 'insightful', 'disagree', 'interesting', 'funny'];
    if (!userEmail || !valid.includes(reactionType)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction' });
    }

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
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { userEmail, text } = req.body;
    if (!userEmail || !text?.trim()) {
      return res.status(400).json({ success: false, message: 'userEmail and text are required' });
    }

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
router.post('/:id/comments/:commentId/replies', verifyToken, async (req, res) => {
  try {
    const { userEmail, text } = req.body;
    if (!userEmail || !text?.trim()) {
      return res.status(400).json({ success: false, message: 'userEmail and text are required' });
    }

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

module.exports = router;

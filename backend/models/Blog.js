const mongoose = require('mongoose');

// Schema for replies to a comment
const replySchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Schema for top-level comments
const commentSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  text: { type: String, required: true },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Main Blog Schema
const blogSchema = new mongoose.Schema({
  surveyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Survey' 
    // optional: surveyor may attach a survey to this blog
  },
  surveyorEmail: { type: String, required: true },
  status: {
    type: String,
    enum: ['draft', 'active', 'banned', 'pending_review', 'rejected'],
    default: 'draft',
  },
  title: { type: String, required: true },
  content: { type: String, required: true }, // Markdown or HTML content

  // Edit tracking
  edited: { type: Boolean, default: false },
  editHistory: [{
    content: { type: String, required: true },
    editedAt: { type: Date, default: Date.now },
  }],

  moderation: {
    decision: { type: String, enum: ['approved', 'rejected', 'pending'], default: undefined },
    reason: String,
    flaggedCategories: [String],
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    appeal: {
      message: String,
      submittedAt: Date,
    },
  },
  
  // Exactly 5 reaction types. We store the userEmail of the people who reacted.
  // This makes it easy to check if a user has already reacted.
  reactions: {
    like: [{ type: String }],
    insightful: [{ type: String }],
    disagree: [{ type: String }],
    interesting: [{ type: String }],
    funny: [{ type: String }]
  },

  comments: [commentSchema]

}, { timestamps: true });

// Indexes for faster queries
blogSchema.index({ surveyorEmail: 1 });
blogSchema.index({ surveyId: 1 });
blogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);

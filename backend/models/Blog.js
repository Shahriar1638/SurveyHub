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

  // Soft delete
  deletedAt: { type: Date, default: null },

  // Edit tracking (capped to prevent unbounded growth)
  edited: { type: Boolean, default: false },
  editHistory: {
    type: [{
      content: { type: String, required: true },
      editedAt: { type: Date, default: Date.now },
    }],
    default: [],
    validate: {
      validator: function (v) {
        return v.length <= 50;
      },
      message: 'editHistory exceeds max of 50 entries',
    },
  },

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
  // This makes it easy to check if a user has already reacted. Capped per type.
  reactions: {
    like: { type: [{ type: String }], default: [], validate: { validator: function(v) { return v.length <= 500; }, message: 'reactions.like exceeds 500' } },
    insightful: { type: [{ type: String }], default: [], validate: { validator: function(v) { return v.length <= 500; }, message: 'reactions.insightful exceeds 500' } },
    disagree: { type: [{ type: String }], default: [], validate: { validator: function(v) { return v.length <= 500; }, message: 'reactions.disagree exceeds 500' } },
    interesting: { type: [{ type: String }], default: [], validate: { validator: function(v) { return v.length <= 500; }, message: 'reactions.interesting exceeds 500' } },
    funny: { type: [{ type: String }], default: [], validate: { validator: function(v) { return v.length <= 500; }, message: 'reactions.funny exceeds 500' } },
  },

  comments: [commentSchema]

}, { timestamps: true });

// Pre-save hook: trim unbounded arrays to cap size
blogSchema.pre('save', function (next) {
  if (this.editHistory.length > 50) {
    this.editHistory = this.editHistory.slice(-50);
  }
  if (this.comments.length > 200) {
    this.comments = this.comments.slice(-200);
  }
  // Cap each reaction type
  for (const key of ['like', 'insightful', 'disagree', 'interesting', 'funny']) {
    if (this.reactions[key]?.length > 500) {
      this.reactions[key] = this.reactions[key].slice(-500);
    }
  }
  next();
});

// Indexes for faster queries
blogSchema.index({ surveyorEmail: 1 });
blogSchema.index({ surveyId: 1 });
blogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);

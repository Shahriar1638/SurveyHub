const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Content reference — one of these will be set
  surveyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Survey', 
  },
  blogId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Blog', 
  },
  commentId: { type: String }, // comment _id within a blog
  replyId: { type: String },   // reply _id within a comment

  reporterEmail: { type: String, required: true },
  reportReason: { 
    type: String, 
    enum: ['Spam', 'Hate Speech', 'Inappropriate Content', 'Other'], 
    required: true 
  },
  details: String,
  
  // --- ADMIN RESPONSE HANDLING ---
  status: { 
    type: String, 
    enum: ['pending', 'investigating', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  adminResponse: {
    adminEmail: String,
    message: String,
    actionTaken: { 
        type: String, 
        enum: ['None', 'Content Deleted', 'User Warned', 'User Banned'] 
    },
    respondedAt: Date
  }
}, { timestamps: true });

// Indexes for faster queries
reportSchema.index({ status: 1 });
reportSchema.index({ surveyId: 1 });
reportSchema.index({ blogId: 1 });
reportSchema.index({ reporterEmail: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);

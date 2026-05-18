const mongoose = require('mongoose');

const siteFeedbackSchema = new mongoose.Schema({
  userEmail: { type: String }, // Allow anonymous feedback
  feedbackType: { 
    type: String, 
    enum: ['bug', 'feature_request', 'general', 'complaint'],
    default: 'general'
  },
  affectedPage: String, // e.g., "landing-page", "dashboard", "survey-builder"
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String, required: true },
  attachments: [String], // URLs for screenshots, etc.
  status: { 
    type: String, 
    enum: ['open', 'reviewing', 'resolved', 'dismissed'],
    default: 'open'
  },
  adminResponse: {
    adminEmail: String,
    message: String,
    respondedAt: Date
  }
}, { timestamps: true });

// Indexes for faster queries
siteFeedbackSchema.index({ status: 1 });
siteFeedbackSchema.index({ feedbackType: 1 });
siteFeedbackSchema.index({ createdAt: -1 });
siteFeedbackSchema.index({ userEmail: 1 });

module.exports = mongoose.model('SiteFeedback', siteFeedbackSchema);

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true, index: true },
  userEmail: { type: String }, // Optional: allows anonymous feedback
  rating: { type: Number, min: 1, max: 5 }, // e.g. "How clear was this survey?"
  comment: { type: String, required: true },
  suggestions: String 
}, { timestamps: true });

// Indexes for faster queries
feedbackSchema.index({ userEmail: 1 });
feedbackSchema.index({ rating: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
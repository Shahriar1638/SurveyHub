const mongoose = require('mongoose');

const pendingSurveySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['pending', 'published', 'rejected'],
      default: 'pending',
    },
    deadline: {
      type: String,
      required: true,
      trim: true,
    },
    adminFeedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'pendingSurveys',
  }
);

module.exports = mongoose.models.PendingSurvey || mongoose.model('PendingSurvey', pendingSurveySchema);

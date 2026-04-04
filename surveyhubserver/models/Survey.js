const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const surveySchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    likes: {
      type: [String],
      default: [],
    },
    dislikes: {
      type: [String],
      default: [],
    },
    userReview: {
      type: [reviewSchema],
      default: [],
    },
    votedPeopleMails: {
      type: [String],
      default: [],
    },
    reports: {
      type: [reportSchema],
      default: [],
    },
    adminFeedback: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'allsurveys',
  }
);

module.exports = mongoose.models.Survey || mongoose.model('Survey', surveySchema);

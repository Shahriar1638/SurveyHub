const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'surveyor'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxLength: 500,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    occupation: {
      type: String,
      trim: true,
      default: '',
    },
    socialLinks: {
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    subscription: {
      plan: { type: String, default: 'free' },
      status: { type: String, enum: ['active', 'past_due', 'canceled', 'trialing', 'inactive'], default: 'inactive' },
      autoRenew: { type: Boolean, default: false },
      provider: { type: String, default: '' },
      providerCustomerId: { type: String, default: '' },
      providerSubscriptionId: { type: String, default: '' },
      currentPeriodEnd: { type: Date },
    },
    preferences: {
      type: [String], // Array of preferred survey categories
      default: [],
    },
    autoAIInsight: {
      type: Boolean,
      default: false,
    },
    moderationStats: {
      reportsResolved: { type: Number, default: 0 },
      surveysReviewed: { type: Number, default: 0 },
      usersModerated: { type: Number, default: 0 },
      totalActions: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
userSchema.index({ role: 1 });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

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
    preferences: {
      type: [String], // Array of preferred survey categories
      default: [],
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
userSchema.index({ role: 1 });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

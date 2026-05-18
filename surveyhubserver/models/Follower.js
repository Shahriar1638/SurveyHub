const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema(
  {
    // The user who is doing the following
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The user (usually a surveyor) being followed
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate follows: a user can follow another user only once
followerSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index for performance: finding followers of a specific user
followerSchema.index({ following: 1 });

// Index for performance: finding who a specific user is following
followerSchema.index({ follower: 1 });

module.exports = mongoose.models.Follower || mongoose.model('Follower', followerSchema);

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, enum: ['login','view','respond','comment','react','reply','payment'], required: true },
  resource: { type: String, default: '' },
  resourceId: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  meta: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

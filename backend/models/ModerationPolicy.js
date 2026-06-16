const mongoose = require('mongoose');

const moderationRuleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['high', 'low'], required: true },
}, { _id: false });

const moderationPolicySchema = new mongoose.Schema({
  contentType: { type: String, enum: ['survey', 'blog'], required: true, unique: true },
  rules: [moderationRuleSchema],
  customInstructions: { type: String, default: '' },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ModerationPolicy', moderationPolicySchema);

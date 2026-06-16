const mongoose = require('mongoose');

const geminiUsageSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  requests: { type: Number, default: 0 },
  tokens: { type: Number, default: 0 },
}, { timestamps: true });

geminiUsageSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('GeminiUsage', geminiUsageSchema);

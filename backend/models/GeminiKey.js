const mongoose = require('mongoose');

const geminiKeySchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, default: 'default' },
  dailyRequests: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Reset daily counters at midnight Pacific
geminiKeySchema.methods.resetIfNeeded = function() {
  const now = new Date();
  const last = new Date(this.lastReset);
  // Reset if different day (Pacific time)
  const pacificNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const pacificLast = new Date(last.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  if (pacificNow.getDate() !== pacificLast.getDate() ||
      pacificNow.getMonth() !== pacificLast.getMonth()) {
    this.dailyRequests = 0;
    this.lastReset = now;
  }
};

module.exports = mongoose.model('GeminiKey', geminiKeySchema);

const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  actor: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    email: { type: String, default: null },
    role: { type: String, default: null }
  },
  action: { type: String, required: true }, // e.g. 'survey.create', 'user.ban'
  resource: { type: String, default: '' },
  resourceId: { type: mongoose.Schema.Types.Mixed, default: null },
  timestamp: { type: Date, default: Date.now, index: true },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  detail: { type: mongoose.Schema.Types.Mixed, default: null },
  requestId: { type: String, default: null }
}, { strict: false });

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditSchema);

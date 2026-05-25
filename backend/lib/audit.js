const AuditLog = require('../models/AuditLog');

async function audit(req, { action, resource, resourceId, before = null, after = null, meta = null }) {
  try {
    const entry = {
      actor: req.user ? { userId: req.user._id, email: req.user.email, role: req.user.role } : null,
      action,
      resource,
      resourceId,
      ip: req.ip || (req.headers && (req.headers['x-forwarded-for'] || req.connection?.remoteAddress)) || '',
      userAgent: (req.headers && req.headers['user-agent']) || '',
      detail: { before, after, meta },
      requestId: req.id || req.headers['x-request-id'] || null
    };
    await AuditLog.create(entry);
  } catch (err) {
    // Never throw from audit; log and continue
    console.error('audit helper error', err);
  }
}

module.exports = audit;

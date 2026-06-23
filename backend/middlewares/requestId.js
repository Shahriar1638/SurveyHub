const crypto = require('crypto');

// Simple middleware to ensure each request has a request id (for traceability)
module.exports = function requestIdMiddleware(req, res, next) {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
};

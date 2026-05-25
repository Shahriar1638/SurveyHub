const { v4: uuidv4 } = require('uuid');

// Simple middleware to ensure each request has a request id (for traceability)
module.exports = function requestIdMiddleware(req, res, next) {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('x-request-id', req.id);
  next();
};

// ── Domain routers ───────────────────────────────────────────────────────────
// Each export is a router. Middleware is applied in the main index.js, not here.
module.exports = {
  auth:        require('./auth'),
  users:       require('./users'),       // includes user.routes.js + profile.routes.js
  profile:     require('./users/profile.routes'), // profile only — avoids /:email shadowing /me, /stats
  surveys:     require('./surveys'),     // survey.routes.js only
  analytics:   require('./analytics'),   // analytics.routes.js (separate — needs verifyToken)
  homepages:   require('./homepages'),   // exports { guest, user, surveyor, admin }
  feedback:    require('./feedback'),
  blogs:       require('./blogs'),
  payments:    require('./payments'),     // includes payment.routes.js + package.routes.js
  packages:    require('./payments'),     // alias: same barrel as payments
  dashboard:   require('./admin'),
  admin:       require('./admin'),        // alias: same as dashboard
  usage:       require('./usage'),
};

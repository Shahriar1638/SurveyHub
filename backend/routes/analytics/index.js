const router = require('express').Router();
router.use('/', require('./analytics.routes'));
module.exports = router;

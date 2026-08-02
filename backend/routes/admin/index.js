const router = require('express').Router();
router.use('/', require('./dashboard.routes'));
module.exports = router;

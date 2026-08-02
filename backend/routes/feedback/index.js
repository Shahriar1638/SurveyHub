const router = require('express').Router();
router.use('/', require('./feedback.routes'));
module.exports = router;

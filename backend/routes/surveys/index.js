const router = require('express').Router();
router.use('/', require('./survey.routes'));
module.exports = router;

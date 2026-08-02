const router = require('express').Router();
router.use('/', require('./user.routes'));
router.use('/', require('./profile.routes'));
module.exports = router;

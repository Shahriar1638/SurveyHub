const router = require('express').Router();
router.use('/', require('./payment.routes'));
router.use('/', require('./package.routes'));
module.exports = router;

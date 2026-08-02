const router = require('express').Router();
router.use('/', require('./blog.routes'));
module.exports = router;

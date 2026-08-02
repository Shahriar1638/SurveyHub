// Individual homepage routers — mounted separately in routes/index.js with different middleware
module.exports = {
  guest: require('./guestHome.routes'),
  user: require('./userHome.routes'),
  surveyor: require('./surveyorHome.routes'),
  admin: require('./adminHome.routes'),
};

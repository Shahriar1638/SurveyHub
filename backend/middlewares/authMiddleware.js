const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = () => {
  const verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).send({ message: 'Unauthorized request' })
    }
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'Unauthorized request' })
      }
      req.decoded = decoded;
      req.user = decoded; // Added so routes using req.user (like profileRoutes) work
      next();
    });
  }

  const verifyAdmin = async (req, res, next) => {
    try {
      const email = req.decoded.email;
      const user = await User.findOne({ email }).lean();
      if (user?.status === 'banned') {
        return res.status(403).send({ message: 'User is banned' });
      }
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'Unauthorized request' });
      }
      next();
    } catch (error) {
      return res.status(500).send({ message: 'Failed to verify user role' });
    }
  }

  const verifySurveyor = async (req, res, next) => {
    try {
      const email = req.decoded.email;
      const user = await User.findOne({ email }).lean();
      if (user?.status === 'banned') {
        return res.status(403).send({ message: 'User is banned' });
      }
      const isSurveyor = user?.role === 'surveyor';
      if (!isSurveyor) {
        return res.status(403).send({ message: 'Unauthorized request' });
      }
      next();
    } catch (error) {
      return res.status(500).send({ message: 'Failed to verify user role' });
    }
  }

  const verifyUser = async (req, res, next) => {
    try {
      const email = req.decoded.email;
      const user = await User.findOne({ email }).lean();
      if (user?.status === 'banned') {
        return res.status(403).send({ message: 'User is banned' });
      }
      const isUser = user?.role === 'user';
      if (!isUser) {
        return res.status(403).send({ message: 'Unauthorized request' });
      }
      next();
    } catch (error) {
      return res.status(500).send({ message: 'Failed to verify user role' });
    }
  }

  return { verifyToken, verifyAdmin, verifySurveyor, verifyUser };
};

const jwt = require('jsonwebtoken');

module.exports = (userCollection) => {
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
      next();
    });
  }

  const verifyAdmin = async (req, res, next) => {
    const email = req.decoded.email;
    const query = { email: email };
    const user = await userCollection.findOne(query);
    const isAdmin = user?.role === 'admin';
    if (!isAdmin) {
      return res.status(403).send({ message: 'Unauthorized request' });
    }
    next();
  }

  const verifySurveyor = async (req, res, next) => {
    const email = req.decoded.email;
    const query = { email: email };
    const user = await userCollection.findOne(query);
    const isSurveyor = user?.role === 'surveyor';
    if (!isSurveyor) {
      return res.status(403).send({ message: 'Unauthorized request' });
    }
    next();
  }

  return { verifyToken, verifyAdmin, verifySurveyor };
};

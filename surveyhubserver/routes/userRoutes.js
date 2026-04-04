const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

module.exports = (verifyToken, verifyAdmin, verifySurveyor) => {
    
    // Get all users (Admin only)
    router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const result = await User.find().lean();
      res.send(result);
    });

    // Get specific user by email
    router.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const result = await User.findOne({ email }).lean();
      res.send(result);
    });

    // Create user (SignUp)
    router.post('/users', async (req, res) => {
      const user = req.body;
      const existingUser = await User.findOne({ email: user.email }).lean();
      if (existingUser) {
        return res.send({ message: 'User already exists', insertedId: null })
      }
      const createdUser = await User.create(user);
      res.send({ acknowledged: true, insertedId: createdUser._id });
    });
    
    // Check if user is admin
    router.get('/user/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'Unauthorized request' })
      }
      const result = await User.findOne({ email }).lean();
      const admin = result?.role === 'admin';
      res.send({ admin });
    });

    // Check if user is surveyor
    router.get('/user/surveyor/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'Unauthorized request' })
      }
      const result = await User.findOne({ email }).lean();
      const surveyor = result?.role === 'surveyor';
      res.send({ surveyor });
    });

    // Upgrade user to prouser removed


    // Make user admin
    router.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({ message: 'Invalid user id' });
      }
      const result = await User.updateOne({ _id: id }, {
        $set: {
          role: 'admin'
        }
      });
      res.send(result);
    })

    // Make user surveyor
    router.patch('/user/surveyor/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({ message: 'Invalid user id' });
      }
      const result = await User.updateOne({ _id: id }, {
        $set: {
          role: 'surveyor'
        }
      });
      res.send(result);
    })

    return router;
};

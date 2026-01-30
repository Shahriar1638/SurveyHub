const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

module.exports = (userCollection, verifyToken, verifyAdmin, verifySurveyor) => {
    
    // Get all users (Admin only)
    router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // Get specific user by email
    router.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // Create user (SignUp)
    router.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'User already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    
    // Check if user is admin
    router.get('/user/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'Unauthorized request' })
      }
      const query = { email: email };
      const result = await userCollection.findOne(query);
      let admin = false;
      if (result.role === 'admin') {
        admin = true;
      }
      res.send({ admin });
    });

    // Check if user is surveyor
    router.get('/user/surveyor/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'Unauthorized request' })
      }
      const query = { email: email };
      const result = await userCollection.findOne(query);
      let surveyor = false;
      if (result.role === 'surveyor') {
        surveyor = true;
      }
      res.send({ surveyor });
    });

    // Upgrade user to prouser
     router.patch('/users/upgrade/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updatedDoc = {
        $set: {
          role: 'prouser'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    // Make user admin
    router.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    // Make user surveyor
    router.patch('/user/surveyor/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'surveyor'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    return router;
};

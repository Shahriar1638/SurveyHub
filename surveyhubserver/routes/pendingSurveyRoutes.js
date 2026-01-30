const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

module.exports = (pendingCollection, verifyToken, verifyAdmin, verifySurveyor) => {

    // Get all pending surveys (Admin only)
    router.get('/pending-surveys', verifyToken, verifyAdmin, async (req, res) => {
      const result = await pendingCollection.find().toArray();
      res.send(result);
    });

    // Create a new pending survey (Surveyor only)
    router.post('/pending-surveys', verifyToken, verifySurveyor, async (req, res) => {
      const survey = req.body;
      const result = await pendingCollection.insertOne(survey);
      res.send(result);
    });

    // Update survey status (Admin only)
    router.patch('/pending-surveys/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const status = req.body.status;
      const updatedDoc = {
        $set: {
          status: status
        }
      }
      const result = await pendingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Reject survey with feedback (Admin only)
    router.patch('/pending-surveys/reject/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const status = req.body.status;
      const adminFeedback = req.body.adminFeedback;
      console.log(adminFeedback)
      const updatedDoc = {
        $set: {
          status: status,
          adminFeedback: adminFeedback
        }
      }
      const result = await pendingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Get pending surveys by email (Surveyor only)
    router.get('/pending-surveys/:email', verifyToken, verifySurveyor, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await pendingCollection.find(query).toArray();
      res.send(result);
    });

    // Delete a pending survey (Surveyor only)
    router.delete('/pending-surveys/:id', verifyToken, verifySurveyor, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await pendingCollection.deleteOne(filter);
      res.send(result);
    });

    return router;
};

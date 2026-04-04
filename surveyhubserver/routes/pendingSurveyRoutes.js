const express = require('express');
const mongoose = require('mongoose');
const PendingSurvey = require('../models/PendingSurvey');
const router = express.Router();

module.exports = (verifyToken, verifyAdmin, verifySurveyor) => {

    // Get all pending surveys (Admin only)
    router.get('/pending-surveys', verifyToken, verifyAdmin, async (req, res) => {
      const result = await PendingSurvey.find().lean();
      res.send(result);
    });

    // Create a new pending survey (Surveyor only)
    router.post('/pending-surveys', verifyToken, verifySurveyor, async (req, res) => {
      const survey = req.body;
      const createdSurvey = await PendingSurvey.create(survey);
      res.send({ acknowledged: true, insertedId: createdSurvey._id });
    });

    // Update survey status (Admin only)
    router.patch('/pending-surveys/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({ message: 'Invalid survey id' });
      }
      const status = req.body.status;
      const result = await PendingSurvey.updateOne({ _id: id }, {
        $set: {
          status: status
        }
      });
      res.send(result);
    });

    // Reject survey with feedback (Admin only)
    router.patch('/pending-surveys/reject/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({ message: 'Invalid survey id' });
      }
      const status = req.body.status;
      const adminFeedback = req.body.adminFeedback;
      const result = await PendingSurvey.updateOne({ _id: id }, {
        $set: {
          status: status,
          adminFeedback: adminFeedback
        }
      });
      res.send(result);
    });

    // Get pending surveys by email (Surveyor only)
    router.get('/pending-surveys/:email', verifyToken, verifySurveyor, async (req, res) => {
      const email = req.params.email;
      const result = await PendingSurvey.find({ email }).lean();
      res.send(result);
    });

    // Delete a pending survey (Surveyor only)
    router.delete('/pending-surveys/:id', verifyToken, verifySurveyor, async (req, res) => {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({ message: 'Invalid survey id' });
      }
      const result = await PendingSurvey.deleteOne({ _id: id });
      res.send(result);
    });

    return router;
};

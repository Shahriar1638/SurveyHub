const express = require('express');
const mongoose = require('mongoose');
const Survey = require('../models/Survey');
const router = express.Router();

module.exports = (verifyToken, verifyAdmin) => {

    // Get all surveys
    router.get('/surveys', async (req, res) => {
      const result = await Survey.find().lean();
      res.send(result);
    })

    // Create a new survey (Admin only)
    router.post('/surveys', verifyToken, verifyAdmin, async (req, res) => {
      const survey = req.body;
      const createdSurvey = await Survey.create(survey);
      res.send({ acknowledged: true, insertedId: createdSurvey._id });
    });

    // Get specific survey by ID
    router.get('/surveys/:id', async (req, res) => {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({ message: 'Invalid survey id' });
      }
      const result = await Survey.findById(id).lean();
      res.send(result);
    })

    // Get filtered surveys by email
    router.get('/surveys/filtered/:email', async (req, res) => {
      const email = req.params.email;
      const result = await Survey.find({ email }).lean();
      res.send(result);
    });

    // Report a survey
    router.patch('/surveys/report/:id', async (req, res) => {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({ message: 'Invalid survey id' });
      }
      const report = req.body.reportText;
      const user = req.body.email;
      const newReport = { user: user, comment: report };
      const result = await Survey.updateOne({ _id: id }, { $push: { reports: newReport } });
      res.send(result);
    });

    // Add a comment to a survey
    router.patch('/surveys/comment/:id', async (req, res) => {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({ message: 'Invalid survey id' });
      }
      const comment = req.body.comment;
      const username = req.body.username;
      const newComment = { username: username, comment: comment };
      const updateDoc = {
          $push: { userReview: newComment }
      };
      const result = await Survey.updateOne({ _id: id }, updateDoc);
      res.send(result);
    });
    
    // Dislike a survey
    router.patch('/surveys/dislike/:id', async (req, res) => {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({ message: 'Invalid survey id' });
      }
      const userEmail = req.body.email;
      const survey = await Survey.findById(id).lean();
      if (!survey) {
        return res.status(404).send({ message: 'Survey not found' });
      }
      const likes = survey.likes || [];
      if (likes.includes(userEmail)) {
          const updateDoc = {
              $pull: { likes: userEmail },
              $addToSet: { dislikes: userEmail }
          };
          const result = await Survey.updateOne({ _id: id }, updateDoc);
          res.send(result);
      } else {
          const updateDoc = {
              $addToSet: { dislikes: userEmail }
          };
          const result = await Survey.updateOne({ _id: id }, updateDoc);
          res.send(result);
      }
    });

    // Like a survey
    router.patch('/surveys/like/:id', async (req, res) => {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({ message: 'Invalid survey id' });
      }
      const userEmail = req.body.email;
      const survey = await Survey.findById(id).lean();
      if (!survey) {
        return res.status(404).send({ message: 'Survey not found' });
      }
      const dislikes = survey.dislikes || [];
      if (dislikes.includes(userEmail)) {
          const updateDoc = {
              $pull: { dislikes: userEmail },
              $addToSet: { likes: userEmail }
          };
          const result = await Survey.updateOne({ _id: id }, updateDoc);
          res.send(result);
      } else {
          const updateDoc = {
              $addToSet: { likes: userEmail }
          };
          const result = await Survey.updateOne({ _id: id }, updateDoc);
          res.send(result);
      }
    });

    // Vote on a survey
    router.patch('/surveys/vote/:id', async (req, res) => {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({ message: 'Invalid survey id' });
      }
      const option = req.body.option;
      const userEmail = req.body.email;
      const survey = await Survey.findById(id).lean();
      if (!survey) {
        return res.status(404).send({ message: 'Survey not found' });
      }
      const votedPeopleMails = survey.votedPeopleMails || [];
      const options = survey.options || {};

      if (!Object.prototype.hasOwnProperty.call(options, option)) {
          return res.status(400).send({ error: 'Invalid survey option' });
      }

      if (votedPeopleMails.includes(userEmail)) {
          res.status(400).send({ error: 'User has already voted' });
      } else {
          const updateDoc = {
              $inc: { [`options.${option}`]: 1 }, 
              $addToSet: { votedPeopleMails: userEmail } 
          };
          const result = await Survey.updateOne({ _id: id }, updateDoc);
          res.send(result);
      }
    });

    return router;
};

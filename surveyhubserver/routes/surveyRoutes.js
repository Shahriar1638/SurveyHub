const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

module.exports = (surveyCollection, verifyToken, verifyAdmin) => {

    // Get all surveys
    router.get('/surveys', async (req, res) => {
      const result = await surveyCollection.find().toArray();
      res.send(result);
    })

    // Create a new survey (Admin only)
    router.post('/surveys', verifyToken, verifyAdmin, async (req, res) => {
      const survey = req.body;
      const result = await surveyCollection.insertOne(survey);
      res.send(result);
    });

    // Get specific survey by ID
    router.get('/surveys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await surveyCollection.findOne(query);
      res.send(result);
    })

    // Get filtered surveys by email
    router.get('/surveys/filtered/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await surveyCollection.find(query).toArray();
      res.send(result);
    });

    // Report a survey
    router.patch('/surveys/report/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const report = req.body.reportText;
      const user = req.body.email;
      const newReport = { user: user, comment: report };
      const survey = await surveyCollection.findOne(filter);
      if (survey && survey.reports) {
        const update = {
          $push: { reports: newReport }
        };
        const result = await surveyCollection.updateOne(filter, update);
        res.send(result);
      } else {
        const update = {
          $set: { reports: [newReport] }
        };
        const result = await surveyCollection.updateOne(filter, update, { upsert: true });
        res.send(result);
      }
    });

    // Add a comment to a survey
    router.patch('/surveys/comment/:id', async (req, res) => {
      const id = req.params.id;
      const comment = req.body.comment;
      const username = req.body.username;
      const filter = { _id: new ObjectId(id) };
      const newComment = { username: username, comment: comment };
      const updateDoc = {
          $push: { userReview: newComment }
      };
      const result = await surveyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    
    // Dislike a survey
    router.patch('/surveys/dislike/:id', async (req, res) => {
      const id = req.params.id;
      const userEmail = req.body.email;
      const filter = { _id: new ObjectId(id) };
      const survey = await surveyCollection.findOne(filter);
      if (survey.likes.includes(userEmail)) {
          const updateDoc = {
              $pull: { likes: userEmail },
              $addToSet: { dislikes: userEmail }
          };
          const result = await surveyCollection.updateOne(filter, updateDoc);
          res.send(result);
      } else {
          const updateDoc = {
              $addToSet: { dislikes: userEmail }
          };
          const result = await surveyCollection.updateOne(filter, updateDoc);
          res.send(result);
      }
    });

    // Like a survey
    router.patch('/surveys/like/:id', async (req, res) => {
      const id = req.params.id;
      const userEmail = req.body.email;
      const filter = { _id: new ObjectId(id) };
      const survey = await surveyCollection.findOne(filter);
      if (survey.dislikes.includes(userEmail)) {
          const updateDoc = {
              $pull: { dislikes: userEmail },
              $addToSet: { likes: userEmail }
          };
          const result = await surveyCollection.updateOne(filter, updateDoc);
          res.send(result);
      } else {
          const updateDoc = {
              $addToSet: { likes: userEmail }
          };
          const result = await surveyCollection.updateOne(filter, updateDoc);
          res.send(result);
      }
    });

    // Vote on a survey
    router.patch('/surveys/vote/:id', async (req, res) => {
      const id = req.params.id;
      const option = req.body.option;
      const userEmail = req.body.email;
      const filter = { _id: new ObjectId(id) };
      const survey = await surveyCollection.findOne(filter);
      if (survey.votedPeopleMails.includes(userEmail)) {
          res.status(400).send({ error: 'User has already voted' });
      } else {
          const updateDoc = {
              $inc: { [`options.${option}`]: 1 }, 
              $addToSet: { votedPeopleMails: userEmail } 
          };
          const result = await surveyCollection.updateOne(filter, updateDoc);
          res.send(result);
      }
    });

    return router;
};

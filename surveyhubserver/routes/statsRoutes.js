const express = require('express');
const Survey = require('../models/Survey');
const User = require('../models/User');
const router = express.Router();

module.exports = (verifyToken, verifyAdmin) => {

    // Get admin statistics
    router.get('/admin-statistics', async (req, res) => {
      const totalSurveys = await Survey.estimatedDocumentCount();
      const totalUsers = await User.estimatedDocumentCount();
      const participationResult = await Survey.aggregate([
        { $unwind: "$votedPeopleMails" },
        {
          $group: {
            _id: null,
            totalParticipation: { $sum: 1 }
          }
        }
      ]);
      const avgParticipation = totalSurveys ? +((participationResult[0]?.totalParticipation / totalSurveys).toFixed(2)) : 0;
      const statistics = {
        totalSurveys,
        totalUsers,
        avgParticipation: avgParticipation
      }
      res.send(statistics);
    });

    return router;
};

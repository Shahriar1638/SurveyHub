const express = require('express');
const router = express.Router();

module.exports = (surveyCollection, userCollection, paymentCollection, verifyToken, verifyAdmin) => {

    // Get admin statistics
    router.get('/admin-statistics', async (req, res) => {
      const result = await surveyCollection.estimatedDocumentCount();
      const users = await userCollection.estimatedDocumentCount();
      const participationResult = await surveyCollection.aggregate([
        { $unwind: "$votedPeopleMails" },
        {
          $group: {
            _id: null,
            totalParticipation: { $sum: 1 }
          }
        }
      ]).toArray();
      const avgParticipation = result ? +((participationResult[0]?.totalParticipation / result).toFixed(2)) : 0;
      const revenueResult = await paymentCollection.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$price" }
          }
        }
      ]).toArray();
      const totalRevenue = revenueResult[0]?.totalRevenue || 0;
      const statistics = {
        totalSurveys: result,
        totalUsers: users,
        totalRevenue: totalRevenue,
        avgParticipation: avgParticipation
      }
      res.send(statistics);
    });

    return router;
};

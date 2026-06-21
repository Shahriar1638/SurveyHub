/**
 * Seed a fake response for user 6a057e985e1ef28d44f1a345 on survey 2 (participants access).
 * Run: node scripts/seed-fake-response.js
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const Response = require('../models/response');

const MONGODB_URI = process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwwtyq1.mongodb.net/?retryWrites=true&w=majority`;

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const userId = new mongoose.Types.ObjectId('6a057e985e1ef28d44f1a345');
  const surveyId = new mongoose.Types.ObjectId('6a34cac2053a3174b26524d6'); // Survey 2 (participants)

  const response = await Response.create({
    surveyId,
    userId,
    status: 'submitted',
    startedAt: new Date(Date.now() - 300000),
    submittedAt: new Date(),
    answers: [
      { questionId: 'q1', label: 'How often do you use the new dashboard feature?', value: 'Weekly' },
      { questionId: 'q2', label: 'Rate the new dashboard on this matrix:', value: 4 },
      { questionId: 'q3', label: 'Which new features do you use?', value: ['Dark Mode', 'Real-time Charts'] },
      { questionId: 'q4', label: 'How would you rate the overall product quality?', value: 7 },
      { questionId: 'q5', label: 'Any suggestions for improvement?', value: 'Would love better mobile support.' },
    ],
  });

  console.log(`✓ Response created: ${response._id}`);
  console.log(`  User: ${userId}`);
  console.log(`  Survey: ${surveyId}`);
  console.log(`  Status: submitted`);

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

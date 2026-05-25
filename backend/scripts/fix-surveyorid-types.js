// Run with: node scripts/fix-surveyorid-types.js
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const envPath = fs.existsSync(path.resolve(__dirname, '..', '.env.local'))
  ? path.resolve(__dirname, '..', '.env.local')
  : path.resolve(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

const getMongoUri = () => {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  if (process.env.DB_USER && process.env.DB_PASS)
    return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwwtyq1.mongodb.net/?retryWrites=true&w=majority`;
  throw new Error('Missing MongoDB connection config.');
};

async function fix() {
  await mongoose.connect(getMongoUri());
  const db = mongoose.connection.db;

  const result = await db.collection('surveys').updateMany(
    { surveyorId: { $type: 'string' } },
    [{ $set: { surveyorId: { $toObjectId: '$surveyorId' } } }]
  );

  console.log(`Fixed ${result.modifiedCount} surveys (converted string surveyorId to ObjectId)`);

  // Also check for any remaining issues
  const remaining = await db.collection('surveys').countDocuments({ surveyorId: { $type: 'string' } });
  console.log(`Remaining string surveyorIds: ${remaining}`);

  await mongoose.disconnect();
}

fix().catch(console.error);

/**
 * Adds publishedAt dates to all surveys that don't have one.
 * Run with: node scripts/fix-publishedAt.js
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Survey = require('../models/Survey');

const envPath = fs.existsSync(path.resolve(__dirname, '../.env.local'))
  ? path.resolve(__dirname, '../.env.local')
  : path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

async function fix() {
  const uri = process.env.MONGODB_URI || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwwtyq1.mongodb.net/?retryWrites=true&w=majority`;

  await mongoose.connect(uri, { dbName: 'surveyDB' });
  console.log('Connected to MongoDB');

  // Find all surveys missing publishedAt
  const surveys = await Survey.find({ publishedAt: { $exists: false } }).lean();
  console.log(`Found ${surveys.length} surveys without publishedAt`);

  if (surveys.length === 0) {
    console.log('Nothing to fix.');
    await mongoose.disconnect();
    return;
  }

  let updated = 0;
  for (const s of surveys) {
    // Random date between 30 days ago and today
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    await Survey.findByIdAndUpdate(s._id, { $set: { publishedAt: date } });
    updated++;
    console.log(`  ✓ ${s.title?.slice(0, 40)} → ${date.toISOString()}`);
  }

  console.log(`\nDone. Updated ${updated} surveys.`);
  await mongoose.disconnect();
}

fix().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});

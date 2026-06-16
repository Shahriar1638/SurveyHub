/**
 * Seeds moderation_policies collection from moderation-policies.json
 * Run with: node scripts/seed-moderation-policies.js
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const ModerationPolicy = require('../models/ModerationPolicy');

const envPath = fs.existsSync(path.resolve(__dirname, '../.env.local'))
  ? path.resolve(__dirname, '../.env.local')
  : path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

async function seed() {
  const uri = process.env.MONGODB_URI || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwwtyq1.mongodb.net/?retryWrites=true&w=majority`;
  
  await mongoose.connect(uri, { dbName: 'surveyDB' });
  console.log('Connected to MongoDB');

  const policies = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../data/moderation-policies.json'), 'utf-8')
  );

  for (const policy of policies) {
    const result = await ModerationPolicy.findOneAndUpdate(
      { contentType: policy.contentType },
      { $set: policy },
      { upsert: true, new: true }
    );
    console.log(`✓ ${result.contentType} policy upserted (${result.rules.length} rules)`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

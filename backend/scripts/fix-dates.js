/**
 * Adds createdAt dates to all surveys missing them.
 * Uses raw MongoDB collection to bypass Mongoose timestamps.
 * Run with: node scripts/fix-dates.js
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = fs.existsSync(path.resolve(__dirname, '../.env.local'))
  ? path.resolve(__dirname, '../.env.local')
  : path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

function randomDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d;
}

async function fix() {
  const uri = process.env.MONGODB_URI || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwwtyq1.mongodb.net/?retryWrites=true&w=majority`;
  await mongoose.connect(uri, { dbName: 'surveyDB' });
  console.log('Connected');

  const col = mongoose.connection.collection('surveys');

  // Fix missing createdAt — raw update bypasses Mongoose timestamps
  const noCreatedAt = await col.find({ createdAt: { $exists: false } }).toArray();
  console.log(`\n${noCreatedAt.length} surveys missing createdAt`);

  for (const s of noCreatedAt) {
    const date = randomDate(60);
    await col.updateOne({ _id: s._id }, { $set: { createdAt: date } });
    console.log(`  ✓ ${s.title?.slice(0, 40)} createdAt → ${date.toISOString()}`);
  }

  // Fix missing publishedAt on published surveys
  const noPublished = await col.find({ status: 'published', publishedAt: { $exists: false } }).toArray();
  console.log(`\n${noPublished.length} published surveys missing publishedAt`);

  for (const s of noPublished) {
    const date = randomDate(30);
    await col.updateOne({ _id: s._id }, { $set: { publishedAt: date } });
    console.log(`  ✓ ${s.title?.slice(0, 40)} publishedAt → ${date.toISOString()}`);
  }

  // Verify
  const stillNoCreatedAt = await col.countDocuments({ createdAt: { $exists: false } });
  const stillNoPublished = await col.countDocuments({ status: 'published', publishedAt: { $exists: false } });
  console.log(`\nVerification: ${stillNoCreatedAt} still missing createdAt, ${stillNoPublished} still missing publishedAt`);

  await mongoose.disconnect();
}

fix().catch(err => { console.error(err); process.exit(1); });

/**
 * Ensures all pricing packages have active: true
 * Run with: node scripts/fix-packages.js
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = fs.existsSync(path.resolve(__dirname, '../.env.local'))
  ? path.resolve(__dirname, '../.env.local')
  : path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

async function fix() {
  const uri = process.env.MONGODB_URI || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwwtyq1.mongodb.net/?retryWrites=true&w=majority`;
  await mongoose.connect(uri, { dbName: 'surveyDB' });
  console.log('Connected');

  const col = mongoose.connection.collection('pricing_packages');

  const count = await col.countDocuments({});
  console.log(`Found ${count} packages`);

  // Set active: true on all packages missing it
  const result = await col.updateMany(
    { active: { $exists: false } },
    { $set: { active: true } }
  );
  console.log(`Updated ${result.modifiedCount} packages (added active: true)`);

  // Verify
  const all = await col.find({}).toArray();
  for (const p of all) {
    console.log(`  ${p.id}: active=${p.active}`);
  }

  await mongoose.disconnect();
}

fix().catch(err => { console.error(err); process.exit(1); });

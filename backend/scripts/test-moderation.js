/**
 * Quick test: verify moderation rejects offensive content.
 * Run: node scripts/test-moderation.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function test() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const { moderateContent } = require('../services/moderation');

  // ── OFFENSIVE content (should reject) ───────────────────────────────────
  const offensive = await moderateContent({
    contentType: 'survey',
    title: 'Test Survey',
    description: 'This is a test survey',
    questions: [
      { id: 'q1', label: 'I hate all immigrants and they should be deported immediately. Women belong in the kitchen and should not have jobs. Kill all [slur] people.', type: 'text' },
      { id: 'q2', label: 'Rate this genocide: 1-5', type: 'rating' },
    ],
  });

  console.log('=== OFFENSIVE CONTENT ===');
  console.log(JSON.stringify(offensive, null, 2));
  console.log(`Decision: ${offensive.decision} (expected: rejected)`);
  console.log(`Safe: ${offensive.safe} (expected: false)\n`);

  // ── CLEAN content (should approve) ──────────────────────────────────────
  const clean = await moderateContent({
    contentType: 'survey',
    title: 'Customer Satisfaction Survey',
    description: 'Help us improve our services',
    questions: [
      { id: 'q1', label: 'How satisfied are you with our product?', type: 'rating' },
      { id: 'q2', label: 'What features would you like us to add?', type: 'text' },
    ],
  });

  console.log('=== CLEAN CONTENT ===');
  console.log(JSON.stringify(clean, null, 2));
  console.log(`Decision: ${clean.decision} (expected: approved)`);
  console.log(`Safe: ${clean.safe} (expected: true)\n`);

  // ── BORDERLINE content (should pending or approve) ───────────────────────
  const borderline = await moderateContent({
    contentType: 'blog',
    title: 'My opinion on politics',
    content: 'I think the government is terrible and the opposition is full of idiots. Both sides are corrupted and nobody cares about ordinary people.',
  });

  console.log('=== BORDERLINE CONTENT ===');
  console.log(JSON.stringify(borderline, null, 2));

  await mongoose.disconnect();
  console.log('\nDone.');
}

test().catch(err => { console.error(err); process.exit(1); });

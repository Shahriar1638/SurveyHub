/**
 * Seed script: Creates a test survey with enhanced linear_scale + 20 fake responses
 * Run: node scripts/seed-test-survey.js
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = fs.existsSync(path.resolve(__dirname, '../.env.local'))
  ? path.resolve(__dirname, '../.env.local')
  : path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const Survey = require('../models/Survey');
const Response = require('../models/response');

const SURVEYOR_ID = '6a057f325e1ef28d44f1a372';
const OLD_SURVEY_ID = '6a37823d2ce4f28ed56c13dc';

const deadline = new Date(Date.now() + 3.5 * 60 * 60 * 1000);

const surveyData = {
  surveyorId: SURVEYOR_ID,
  title: 'Customer Satisfaction Q3 2026',
  description: 'Help us understand how we can improve our product and service quality. Your feedback directly shapes our roadmap.',
  useCase: 'Product improvement and customer retention analysis',
  category: 'Customer Feedback',
  resultAccess: 'everyone',
  deadline: deadline.toISOString().split('T')[0],
  status: 'published',
  publishedAt: new Date(),
  participantCount: 0,
  moderation: {
    decision: 'approved',
    reason: 'Passed automated moderation',
    reviewedAt: new Date(),
  },
  questions: [
    {
      id: 'q1',
      label: 'How satisfied are you with our product overall?',
      type: 'multiple_choice',
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
      required: true,
    },
    {
      id: 'q2',
      label: 'Which features do you use the most?',
      type: 'checkbox',
      options: ['Dashboard', 'Analytics', 'Survey Builder', 'Reporting', 'Integrations', 'API Access'],
      required: true,
    },
    {
      id: 'q3',
      label: 'How likely are you to recommend us to a colleague?',
      type: 'linear_scale',
      options: ['0', '10', 'Not likely', 'Extremely likely'],
      required: true,
    },
    {
      id: 'q4',
      label: 'What is the primary reason you chose our product?',
      type: 'multiple_choice',
      options: ['Ease of use', 'Pricing', 'Features', 'Customer support', 'Brand reputation'],
      required: true,
    },
    {
      id: 'q5',
      label: 'How would you rate our customer support?',
      type: 'multiple_choice',
      options: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'],
      required: false,
    },
    {
      id: 'q6',
      label: 'Rate the following aspects of our product:',
      type: 'linear_scale',
      options: ['1', '4', 'Poor', 'Excellent', 'Product Quality', 'Ease of Use', 'Documentation', 'Value for Money'],
      scaleLabels: { '1': 'Poor', '2': 'Average', '3': 'Good', '4': 'Excellent' },
      required: true,
    },
    {
      id: 'q7',
      label: 'Any additional thoughts or suggestions?',
      type: 'short_answer',
      options: [],
      required: false,
    },
  ],
};

function randomAnswer(question) {
  const r = Math.random();
  switch (question.id) {
    case 'q1':
      if (r < 0.35) return 'Very Satisfied';
      if (r < 0.65) return 'Satisfied';
      if (r < 0.82) return 'Neutral';
      if (r < 0.93) return 'Dissatisfied';
      return 'Very Dissatisfied';
    case 'q2': {
      const picks = [];
      const shuffled = [...question.options].sort(() => Math.random() - 0.5);
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) picks.push(shuffled[i]);
      return picks;
    }
    case 'q3':
      if (r < 0.1) return Math.floor(Math.random() * 4);
      if (r < 0.25) return 4 + Math.floor(Math.random() * 3);
      if (r < 0.6) return 7 + Math.floor(Math.random() * 2);
      if (r < 0.85) return 9;
      return 10;
    case 'q4':
      if (r < 0.3) return 'Ease of use';
      if (r < 0.5) return 'Pricing';
      if (r < 0.75) return 'Features';
      if (r < 0.9) return 'Customer support';
      return 'Brand reputation';
    case 'q5':
      if (r < 0.25) return 'Excellent';
      if (r < 0.55) return 'Good';
      if (r < 0.78) return 'Average';
      if (r < 0.92) return 'Poor';
      return 'Very Poor';
    case 'q6': {
      // Linear scale with items — value is object { itemIndex: rating }
      const items = question.options.slice(4); // ['Product Quality', 'Ease of Use', ...]
      const result = {};
      items.forEach((item, idx) => {
        const r2 = Math.random();
        if (r2 < 0.15) result[idx] = 1;
        else if (r2 < 0.40) result[idx] = 2;
        else if (r2 < 0.75) result[idx] = 3;
        else result[idx] = 4;
      });
      return result;
    }
    case 'q7': {
      const suggestions = [
        'Love the analytics dashboard, keep it up!',
        'Would be great to have dark mode.',
        'Pricing could be more competitive for small teams.',
        'The onboarding experience was smooth.',
        'Mobile app would be a game changer.',
        'Integration with Slack would be helpful.',
        'Reporting features need more customization.',
        'Customer support response time has improved a lot.',
        'Would like to see more template options.',
        'The API documentation could be better.',
        '',
        '',
      ];
      return suggestions[Math.floor(Math.random() * suggestions.length)];
    }
    default:
      return 'N/A';
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'surveyDB' });
    console.log('Connected to MongoDB');

    // Delete old test survey + responses
    await Survey.findByIdAndDelete(OLD_SURVEY_ID);
    await Response.deleteMany({ surveyId: OLD_SURVEY_ID });
    console.log('Old survey cleaned up');

    // Create survey
    const survey = await Survey.create(surveyData);
    console.log(`Survey created: ${survey._id}`);
    console.log(`Deadline: ${deadline.toISOString()} (${Math.round((deadline - Date.now()) / 60000)} min from now)`);

    // Create 20 responses
    const fakeUserIds = Array.from({ length: 20 }, (_, i) =>
      new mongoose.Types.ObjectId(`6000000000000000000000${String(i + 1).padStart(2, '0')}`)
    );

    let created = 0;
    for (let i = 0; i < 20; i++) {
      const startedAt = new Date(Date.now() - Math.random() * 3600000);
      const submittedAt = new Date(startedAt.getTime() + 30000 + Math.random() * 120000);

      const answers = survey.questions.map((q) => ({
        questionId: q.id,
        label: q.label,
        value: randomAnswer(q),
      }));

      await Response.create({
        surveyId: survey._id,
        userId: fakeUserIds[i],
        answers,
        status: 'submitted',
        startedAt,
        submittedAt,
        durationSeconds: Math.round((submittedAt - startedAt) / 1000),
      });
      created++;
    }

    await Survey.findByIdAndUpdate(survey._id, { participantCount: created });

    console.log(`${created} responses created`);
    console.log(`\nSurvey ID: ${survey._id}`);
    console.log(`Results: /surveys/${survey._id}/results`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();

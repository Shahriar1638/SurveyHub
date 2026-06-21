/**
 * Seed 3 test surveys with different resultAccess, expired status, and AI insights.
 * Run: node scripts/seed-test-surveys.js
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const Survey = require('../models/Survey');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwwtyqq.mongodb.net/?retryWrites=true&w=majority`;

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find a surveyor to own these surveys
  const surveyor = await User.findOne({ role: 'surveyor' }).lean();
  if (!surveyor) {
    console.error('No surveyor user found. Create one first.');
    process.exit(1);
  }
  console.log(`Using surveyor: ${surveyor.email} (${surveyor._id})`);

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  // ── Survey 1: only_me ──────────────────────────────────────────────
  const survey1 = await Survey.create({
    surveyorId: surveyor._id,
    title: 'Employee Satisfaction Survey 2025',
    description: 'Annual employee satisfaction and workplace culture survey.',
    useCase: 'Measure employee engagement and identify areas for improvement.',
    category: 'Employee Engagement',
    resultAccess: 'only_me',
    deadline: lastWeek.toISOString().split('T')[0],
    status: 'expired',
    publishedAt: lastWeek,
    participantCount: 47,
    questions: [
      {
        id: 'q1',
        label: 'How satisfied are you with your current role?',
        type: 'linear_scale',
        options: ['1', '5', 'Very Dissatisfied', 'Very Satisfied'],
        required: true,
      },
      {
        id: 'q2',
        label: 'Which benefits do you value most?',
        type: 'checkbox',
        options: ['Health Insurance', 'Remote Work', 'Gym Membership', 'Stock Options', 'Paid Time Off'],
        required: true,
      },
      {
        id: 'q3',
        label: 'How likely are you to recommend this company as a workplace?',
        type: 'multiple_choice',
        options: ['Very Likely', 'Likely', 'Neutral', 'Unlikely', 'Very Unlikely'],
        required: true,
      },
      {
        id: 'q4',
        label: 'What do you enjoy most about working here?',
        type: 'paragraph',
        options: [],
        required: false,
      },
      {
        id: 'q5',
        label: 'Rate the management communication on this matrix:',
        type: 'linear_scale',
        options: ['1', '10', 'Poor', 'Excellent'],
        required: true,
      },
    ],
    moderation: {
      decision: 'approved',
      reason: 'Passed automated moderation',
      reviewedAt: lastWeek,
    },
    aiInsight: {
      enabled: true,
      autoGenerate: true,
      status: 'ready',
      generatedAt: yesterday,
      updatedAt: yesterday,
      stats: {
        totalResponses: 47,
        perQuestion: [
          {
            questionId: 'q1',
            responseCount: 47,
            optionBreakdown: [
              { value: '1', count: 2 },
              { value: '2', count: 5 },
              { value: '3', count: 12 },
              { value: '4', count: 18 },
              { value: '5', count: 10 },
            ],
            topThemes: ['Work-Life Balance', 'Career Growth'],
          },
          {
            questionId: 'q2',
            responseCount: 47,
            optionBreakdown: [
              { value: 'Health Insurance', count: 38 },
              { value: 'Remote Work', count: 42 },
              { value: 'Gym Membership', count: 15 },
              { value: 'Stock Options', count: 28 },
              { value: 'Paid Time Off', count: 40 },
            ],
            topThemes: ['Flexibility', 'Wellness'],
          },
          {
            questionId: 'q3',
            responseCount: 47,
            optionBreakdown: [
              { value: 'Very Likely', count: 14 },
              { value: 'Likely', count: 18 },
              { value: 'Neutral', count: 9 },
              { value: 'Unlikely', count: 4 },
              { value: 'Very Unlikely', count: 2 },
            ],
            topThemes: ['Recommendation', 'NPS'],
          },
          {
            questionId: 'q5',
            responseCount: 45,
            optionBreakdown: [
              { value: '1', count: 0 },
              { value: '2', count: 1 },
              { value: '3', count: 3 },
              { value: '4', count: 5 },
              { value: '5', count: 8 },
              { value: '6', count: 7 },
              { value: '7', count: 10 },
              { value: '8', count: 6 },
              { value: '9', count: 3 },
              { value: '10', count: 2 },
            ],
            topThemes: ['Leadership', 'Transparency'],
          },
        ],
      },
      summary: 'Overall satisfaction is moderate-high. Employees value remote work and PTO the most. Management communication scores are mixed, with most ratings集中在 5-7 range.',
      keyFindings: [
        '74% of employees are satisfied or very satisfied with their role',
        'Remote Work and Paid Time Off are the most valued benefits',
        'NPS score is positive: 68% would recommend the company',
        'Management communication needs improvement — average score 6.2/10',
      ],
      recommendations: [
        'Expand remote work policies to retain top talent',
        'Invest in leadership communication training',
        'Consider enhancing stock option programs for mid-level employees',
        'Address concerns from the 13% who rated satisfaction 3 or below',
      ],
      modelInfo: { modelName: 'gemini-2.0-flash', promptVersion: 'v1.0' },
    },
  });
  console.log(`✓ Survey 1 (only_me): ${survey1._id}`);

  // ── Survey 2: participants ─────────────────────────────────────────
  const survey2 = await Survey.create({
    surveyorId: surveyor._id,
    title: 'Customer Product Feedback Q4',
    description: 'Gather feedback on our latest product features and user experience.',
    useCase: 'Understand customer satisfaction with new features.',
    category: 'Product Feedback',
    resultAccess: 'participants',
    deadline: yesterday.toISOString().split('T')[0],
    status: 'expired',
    publishedAt: lastWeek,
    participantCount: 83,
    questions: [
      {
        id: 'q1',
        label: 'How often do you use the new dashboard feature?',
        type: 'multiple_choice',
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'],
        required: true,
      },
      {
        id: 'q2',
        label: 'Rate the new dashboard on this matrix:',
        type: 'linear_scale',
        options: ['1', '5', 'Very Poor', 'Excellent'],
        required: true,
      },
      {
        id: 'q3',
        label: 'Which new features do you use?',
        type: 'checkbox',
        options: ['Dark Mode', 'Export CSV', 'Real-time Charts', 'Team Sharing', 'API Access'],
        required: true,
      },
      {
        id: 'q4',
        label: 'How would you rate the overall product quality?',
        type: 'linear_scale',
        options: ['1', '10', 'Terrible', 'Outstanding'],
        required: true,
      },
      {
        id: 'q5',
        label: 'Any suggestions for improvement?',
        type: 'short_answer',
        options: [],
        required: false,
      },
    ],
    moderation: {
      decision: 'approved',
      reason: 'Passed automated moderation',
      reviewedAt: lastWeek,
    },
    aiInsight: {
      enabled: true,
      autoGenerate: true,
      status: 'ready',
      generatedAt: yesterday,
      updatedAt: yesterday,
      stats: {
        totalResponses: 83,
        perQuestion: [
          {
            questionId: 'q1',
            responseCount: 83,
            optionBreakdown: [
              { value: 'Daily', count: 22 },
              { value: 'Weekly', count: 31 },
              { value: 'Monthly', count: 18 },
              { value: 'Rarely', count: 8 },
              { value: 'Never', count: 4 },
            ],
            topThemes: ['Feature Adoption', 'Usage Frequency'],
          },
          {
            questionId: 'q2',
            responseCount: 82,
            optionBreakdown: [
              { value: '1', count: 2 },
              { value: '2', count: 5 },
              { value: '3', count: 15 },
              { value: '4', count: 35 },
              { value: '5', count: 25 },
            ],
            topThemes: ['UI/UX', 'Performance'],
          },
          {
            questionId: 'q3',
            responseCount: 80,
            optionBreakdown: [
              { value: 'Dark Mode', count: 52 },
              { value: 'Export CSV', count: 41 },
              { value: 'Real-time Charts', count: 63 },
              { value: 'Team Sharing', count: 28 },
              { value: 'API Access', count: 19 },
            ],
            topThemes: ['Visualization', 'Collaboration'],
          },
          {
            questionId: 'q4',
            responseCount: 81,
            optionBreakdown: [
              { value: '1', count: 0 },
              { value: '2', count: 2 },
              { value: '3', count: 5 },
              { value: '4', count: 8 },
              { value: '5', count: 12 },
              { value: '6', count: 15 },
              { value: '7', count: 20 },
              { value: '8', count: 12 },
              { value: '9', count: 5 },
              { value: '10', count: 2 },
            ],
            topThemes: ['Quality', 'Reliability'],
          },
        ],
      },
      summary: 'Product feedback is largely positive. The new dashboard is well-received with 63% weekly or daily usage. Real-time Charts is the most popular new feature.',
      keyFindings: [
        '63% of users engage with the dashboard weekly or more',
        'Real-time Charts is the most used new feature (76%)',
        'Overall product quality averages 6.5/10',
        'Team Sharing and API Access have lower adoption rates',
      ],
      recommendations: [
        'Improve onboarding for Team Sharing and API Access features',
        'Continue investing in visualization capabilities',
        'Address performance concerns flagged by the 21% who rated quality ≤5',
        'Consider adding more export formats beyond CSV',
      ],
      modelInfo: { modelName: 'gemini-2.0-flash', promptVersion: 'v1.0' },
    },
  });
  console.log(`✓ Survey 2 (participants): ${survey2._id}`);

  // ── Survey 3: everyone ─────────────────────────────────────────────
  const survey3 = await Survey.create({
    surveyorId: surveyor._id,
    title: 'Community Technology Trends 2026',
    description: 'Public survey on emerging technology trends and adoption.',
    useCase: 'Track community sentiment on tech trends.',
    category: 'Technology',
    resultAccess: 'everyone',
    deadline: lastWeek.toISOString().split('T')[0],
    status: 'expired',
    publishedAt: new Date(lastWeek.getTime() - 7 * 86400000),
    participantCount: 126,
    questions: [
      {
        id: 'q1',
        label: 'Which technology excites you most in 2026?',
        type: 'multiple_choice',
        options: ['AI / Machine Learning', 'Blockchain', 'AR/VR', 'Quantum Computing', 'IoT'],
        required: true,
      },
      {
        id: 'q2',
        label: 'How comfortable are you with AI-assisted tools?',
        type: 'linear_scale',
        options: ['1', '5', 'Not Comfortable', 'Very Comfortable'],
        required: true,
      },
      {
        id: 'q3',
        label: 'Rate this matrix: How important are these tech skills?',
        type: 'linear_scale',
        options: ['1', '10', 'Not Important', 'Critical'],
        required: true,
      },
      {
        id: 'q4',
        label: 'Which programming languages do you use?',
        type: 'checkbox',
        options: ['JavaScript', 'Python', 'TypeScript', 'Go', 'Rust', 'Java'],
        required: true,
      },
      {
        id: 'q5',
        label: 'Describe your ideal tech stack for a new project.',
        type: 'paragraph',
        options: [],
        required: false,
      },
    ],
    moderation: {
      decision: 'approved',
      reason: 'Passed automated moderation',
      reviewedAt: new Date(lastWeek.getTime() - 7 * 86400000),
    },
    aiInsight: {
      enabled: true,
      autoGenerate: true,
      status: 'ready',
      generatedAt: yesterday,
      updatedAt: yesterday,
      stats: {
        totalResponses: 126,
        perQuestion: [
          {
            questionId: 'q1',
            responseCount: 126,
            optionBreakdown: [
              { value: 'AI / Machine Learning', count: 58 },
              { value: 'Blockchain', count: 12 },
              { value: 'AR/VR', count: 24 },
              { value: 'Quantum Computing', count: 18 },
              { value: 'IoT', count: 14 },
            ],
            topThemes: ['AI Dominance', 'Emerging Tech'],
          },
          {
            questionId: 'q2',
            responseCount: 124,
            optionBreakdown: [
              { value: '1', count: 5 },
              { value: '2', count: 10 },
              { value: '3', count: 28 },
              { value: '4', count: 45 },
              { value: '5', count: 36 },
            ],
            topThemes: ['AI Adoption', 'Comfort Level'],
          },
          {
            questionId: 'q3',
            responseCount: 122,
            optionBreakdown: [
              { value: '1', count: 0 },
              { value: '2', count: 1 },
              { value: '3', count: 3 },
              { value: '4', count: 5 },
              { value: '5', count: 8 },
              { value: '6', count: 12 },
              { value: '7', count: 22 },
              { value: '8', count: 35 },
              { value: '9', count: 25 },
              { value: '10', count: 11 },
            ],
            topThemes: ['Skill Importance', 'Career Relevance'],
          },
          {
            questionId: 'q4',
            responseCount: 125,
            optionBreakdown: [
              { value: 'JavaScript', count: 89 },
              { value: 'Python', count: 78 },
              { value: 'TypeScript', count: 62 },
              { value: 'Go', count: 28 },
              { value: 'Rust', count: 19 },
              { value: 'Java', count: 45 },
            ],
            topThemes: ['Language Popularity', 'Ecosystem'],
          },
        ],
      },
      summary: 'AI/ML dominates tech interest for 2026. 65% of respondents are comfortable or very comfortable with AI tools. JavaScript and Python remain the most used languages.',
      keyFindings: [
        '46% of respondents are most excited about AI/ML in 2026',
        '65% report comfort level of 4+ with AI-assisted tools',
        'Tech skills rated 7+ importance by 61% of respondents',
        'JavaScript (71%) and Python (62%) are the most widely used languages',
        'Rust is gaining traction — 15% adoption despite being newer',
      ],
      recommendations: [
        'Invest in AI/ML learning paths — clear community demand',
        'Bridge the comfort gap: 35% still rate AI comfort ≤3',
        'Promote Rust and Go as complementary skills for modern development',
        'TypeScript adoption is strong — consider it as a default for new projects',
      ],
      modelInfo: { modelName: 'gemini-2.0-flash', promptVersion: 'v1.0' },
    },
  });
  console.log(`✓ Survey 3 (everyone): ${survey3._id}`);

  console.log('\nDone! 3 test surveys created.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

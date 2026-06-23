/**
 * Seed script: Populates fake dashboard data for KPIs and audit logs
 * Targets: surveyor1@example.com, admin1@example.com, user1@example.com, main admin
 * Run: node scripts/seed-dashboard-data.js
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = fs.existsSync(path.resolve(__dirname, '../.env.local'))
  ? path.resolve(__dirname, '../.env.local')
  : path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const User = require('../models/User');
const Survey = require('../models/Survey');
const Report = require('../models/report');
const SiteFeedback = require('../models/siteFeedback');
const AuditLog = require('../models/AuditLog');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'surveyDB' });
    console.log('Connected to MongoDB');

    // ── Find existing users ──────────────────────────────────────────────────
    const surveyor1 = await User.findOne({ email: 'surveyor1@example.com' }).lean();
    const admin1 = await User.findOne({ email: 'admin1@example.com' }).lean();
    const user1 = await User.findOne({ email: 'user1@example.com' }).lean();
    const mainAdmin = await User.findOne({ role: 'admin', email: { $ne: 'admin1@example.com' } }).lean();

    if (!surveyor1 || !admin1 || !user1) {
      console.error('Missing required users. Make sure surveyor1, admin1, user1@example.com exist.');
      process.exit(1);
    }

    const adminEmail = mainAdmin?.email || admin1.email;
    const adminId = mainAdmin?._id || admin1._id;

    console.log(`Surveyor: ${surveyor1.email} (${surveyor1._id})`);
    console.log(`Admin1:   ${admin1.email} (${admin1._id})`);
    console.log(`User1:    ${user1.email} (${user1._id})`);
    console.log(`MainAdmin: ${adminEmail} (${adminId})`);

    // ── 1. Create surveys with different statuses ────────────────────────────
    const surveyData = [
      {
        surveyorId: surveyor1._id,
        title: 'Employee Engagement Survey 2026',
        description: 'Annual employee engagement and satisfaction survey.',
        category: 'HR & Workplace',
        status: 'draft',
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        questions: [
          { id: 'q1', label: 'How satisfied are you with your role?', type: 'multiple_choice', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'], required: true },
          { id: 'q2', label: 'What could we improve?', type: 'short_answer', options: [], required: false },
        ],
        resultAccess: 'only_me',
        aiInsight: { autoGenerate: true },
      },
      {
        surveyorId: surveyor1._id,
        title: 'Product Feature Prioritization',
        description: 'Help us decide which features to build next.',
        category: 'Product Feedback',
        status: 'pending_review',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        questions: [
          { id: 'q1', label: 'Which feature matters most?', type: 'multiple_choice', options: ['Dark Mode', 'Mobile App', 'API Access', 'Integrations'], required: true },
          { id: 'q2', label: 'Rate the current UX', type: 'linear_scale', options: ['1', '5', 'Poor', 'Excellent'], required: true },
        ],
        resultAccess: 'everyone',
        moderation: {
          decision: 'pending',
          reason: 'Awaiting admin review',
          reviewedAt: null,
        },
        aiInsight: { autoGenerate: false },
      },
      {
        surveyorId: surveyor1._id,
        title: 'Controversial Poll: Remote vs Office',
        description: 'Should companies mandate return-to-office?',
        category: 'Workplace Culture',
        status: 'rejected',
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        questions: [
          { id: 'q1', label: 'Where do you prefer to work?', type: 'multiple_choice', options: ['Remote', 'Office', 'Hybrid'], required: true },
        ],
        resultAccess: 'everyone',
        moderation: {
          decision: 'rejected',
          reason: 'Survey could be used to harass employees who prefer office work. Rephrase to be inclusive.',
          reviewedBy: adminId,
          reviewedAt: new Date(Date.now() - 2 * 86400000),
          appeal: {
            message: 'I rephrased the title and description to remove any bias. The survey now focuses on workplace preferences without targeting individuals.',
            submittedAt: new Date(Date.now() - 86400000),
          },
        },
        aiInsight: { autoGenerate: false },
      },
      {
        surveyorId: surveyor1._id,
        title: 'Customer Onboarding Experience',
        description: 'Rate your first 30 days with our platform.',
        category: 'Customer Feedback',
        status: 'draft',
        deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
        questions: [
          { id: 'q1', label: 'How easy was onboarding?', type: 'linear_scale', options: ['1', '5', 'Very Hard', 'Very Easy'], required: true },
          { id: 'q2', label: 'What was confusing?', type: 'paragraph', options: [], required: false },
        ],
        resultAccess: 'only_me',
        aiInsight: { autoGenerate: true },
      },
    ];

    const createdSurveys = [];
    for (const s of surveyData) {
      const existing = await Survey.findOne({ title: s.title, surveyorId: s.surveyorId }).lean();
      if (!existing) {
        const created = await Survey.create(s);
        createdSurveys.push(created);
        console.log(`  Created survey: "${s.title}" [${s.status}]`);
      } else {
        createdSurveys.push(existing);
        console.log(`  Survey exists: "${s.title}" [${existing.status}]`);
      }
    }

    // ── 2. Create reports with different statuses ────────────────────────────
    const reportData = [
      {
        surveyId: createdSurveys[2]?._id, // the rejected survey
        reporterEmail: user1.email,
        reportReason: 'Inappropriate Content',
        details: 'This survey seems designed to shame remote workers. The title is biased.',
        status: 'resolved',
        adminResponse: {
          adminEmail: adminEmail,
          message: 'Survey rejected and surveyor notified. Title was changed to be more inclusive.',
          actionTaken: 'User Warned',
          respondedAt: new Date(Date.now() - 3 * 86400000),
        },
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        surveyId: createdSurveys[0]?._id,
        reporterEmail: 'user2@example.com',
        reportReason: 'Spam',
        details: 'This looks like an internal HR survey that should not be public.',
        status: 'investigating',
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        surveyId: createdSurveys[1]?._id,
        reporterEmail: user1.email,
        reportReason: 'Other',
        details: 'The survey asks for personal opinions that could be used against employees.',
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        surveyId: createdSurveys[2]?._id,
        reporterEmail: 'user3@example.com',
        reportReason: 'Hate Speech',
        details: 'The original title was offensive to remote workers.',
        status: 'dismissed',
        adminResponse: {
          adminEmail: adminEmail,
          message: 'Report dismissed. The surveyor has already revised the survey to address the concern.',
          actionTaken: 'None',
          respondedAt: new Date(Date.now() - 86400000),
        },
        createdAt: new Date(Date.now() - 4 * 86400000),
      },
    ];

    for (const r of reportData) {
      const existing = await Report.findOne({ reporterEmail: r.reporterEmail, surveyId: r.surveyId }).lean();
      if (!existing) {
        await Report.create(r);
        console.log(`  Created report: "${r.reportReason}" [${r.status}]`);
      } else {
        console.log(`  Report exists: ${r.reporterEmail} → [${existing.status}]`);
      }
    }

    // ── 3. Create site feedback with different statuses ──────────────────────
    const feedbackData = [
      {
        userEmail: user1.email,
        feedbackType: 'bug',
        affectedPage: 'dashboard',
        comment: 'The credit balance counter does not update after purchasing a package. I had to refresh the page to see my new credits.',
        status: 'resolved',
        adminResponse: {
          adminEmail: adminEmail,
          message: 'Fixed in v2.3.1. The dashboard now refetches wallet data after a successful payment redirect.',
          respondedAt: new Date(Date.now() - 6 * 86400000),
        },
        createdAt: new Date(Date.now() - 7 * 86400000),
      },
      {
        userEmail: surveyor1.email,
        feedbackType: 'feature_request',
        affectedPage: 'survey-builder',
        comment: 'It would be great to have a drag-and-drop reordering for questions in the survey builder.',
        status: 'reviewing',
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        userEmail: 'user2@example.com',
        feedbackType: 'complaint',
        affectedPage: 'survey-results',
        comment: 'I cannot see the results of a survey I participated in, even though the creator set it to "everyone can view".',
        status: 'open',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        userEmail: user1.email,
        feedbackType: 'general',
        affectedPage: 'landing-page',
        comment: 'Love the new landing page design! The gradient hero section looks fantastic.',
        status: 'resolved',
        adminResponse: {
          adminEmail: adminEmail,
          message: 'Thanks for the feedback! Glad you like it.',
          respondedAt: new Date(Date.now() - 5 * 86400000),
        },
        createdAt: new Date(Date.now() - 6 * 86400000),
      },
      {
        userEmail: surveyor1.email,
        feedbackType: 'bug',
        affectedPage: 'blog-editor',
        comment: 'Markdown preview breaks when inserting images with special characters in the filename.',
        status: 'dismissed',
        adminResponse: {
          adminEmail: adminEmail,
          message: 'Cannot reproduce. Please provide a screenshot of the error.',
          respondedAt: new Date(Date.now() - 2 * 86400000),
        },
        createdAt: new Date(Date.now() - 4 * 86400000),
      },
    ];

    for (const f of feedbackData) {
      const existing = await SiteFeedback.findOne({ userEmail: f.userEmail, comment: f.comment }).lean();
      if (!existing) {
        await SiteFeedback.create(f);
        console.log(`  Created feedback: "${f.feedbackType}" [${f.status}]`);
      } else {
        console.log(`  Feedback exists: ${f.userEmail} → [${existing.status}]`);
      }
    }

    // ── 4. Create audit logs ─────────────────────────────────────────────────
    const auditData = [
      {
        actor: { userId: adminId, email: adminEmail, role: 'admin' },
        action: 'survey.reject',
        resource: 'survey',
        resourceId: createdSurveys[2]?._id,
        detail: { reason: 'Could be used to harass remote workers', title: createdSurveys[2]?.title },
        timestamp: new Date(Date.now() - 3 * 86400000),
        ip: '192.168.1.100',
      },
      {
        actor: { userId: adminId, email: adminEmail, role: 'admin' },
        action: 'report.resolve',
        resource: 'report',
        detail: { actionTaken: 'User Warned', reporterEmail: user1.email },
        timestamp: new Date(Date.now() - 3 * 86400000),
        ip: '192.168.1.100',
      },
      {
        actor: { userId: surveyor1._id, email: surveyor1.email, role: 'surveyor' },
        action: 'survey.create',
        resource: 'survey',
        resourceId: createdSurveys[0]?._id,
        detail: { title: createdSurveys[0]?.title, status: 'draft' },
        timestamp: new Date(Date.now() - 10 * 86400000),
        ip: '10.0.0.45',
      },
      {
        actor: { userId: surveyor1._id, email: surveyor1.email, role: 'surveyor' },
        action: 'survey.appeal',
        resource: 'survey',
        resourceId: createdSurveys[2]?._id,
        detail: { title: createdSurveys[2]?.title, appealMessage: 'I rephrased the title to remove bias.' },
        timestamp: new Date(Date.now() - 86400000),
        ip: '10.0.0.45',
      },
      {
        actor: { userId: user1._id, email: user1.email, role: 'user' },
        action: 'feedback.submit',
        resource: 'feedback',
        detail: { feedbackType: 'bug', affectedPage: 'dashboard' },
        timestamp: new Date(Date.now() - 7 * 86400000),
        ip: '172.16.0.22',
      },
      {
        actor: { userId: adminId, email: adminEmail, role: 'admin' },
        action: 'feedback.resolve',
        resource: 'feedback',
        detail: { feedbackType: 'bug', respondedTo: user1.email },
        timestamp: new Date(Date.now() - 6 * 86400000),
        ip: '192.168.1.100',
      },
      {
        actor: { userId: adminId, email: adminEmail, role: 'admin' },
        action: 'survey.approve',
        resource: 'survey',
        resourceId: createdSurveys[1]?._id,
        detail: { title: createdSurveys[1]?.title, status: 'pending_review' },
        timestamp: new Date(Date.now() - 2 * 86400000),
        ip: '192.168.1.100',
      },
      {
        actor: { userId: surveyor1._id, email: surveyor1.email, role: 'surveyor' },
        action: 'survey.create',
        resource: 'survey',
        resourceId: createdSurveys[1]?._id,
        detail: { title: createdSurveys[1]?.title, status: 'published' },
        timestamp: new Date(Date.now() - 4 * 86400000),
        ip: '10.0.0.45',
      },
      {
        actor: { userId: user1._id, email: user1.email, role: 'user' },
        action: 'report.submit',
        resource: 'report',
        detail: { reportReason: 'Inappropriate Content', surveyTitle: createdSurveys[2]?.title },
        timestamp: new Date(Date.now() - 5 * 86400000),
        ip: '172.16.0.22',
      },
      {
        actor: { userId: adminId, email: adminEmail, role: 'admin' },
        action: 'user.ban',
        resource: 'user',
        detail: { bannedUser: 'spammer@example.com', reason: 'Repeated spam surveys' },
        timestamp: new Date(Date.now() - 8 * 86400000),
        ip: '192.168.1.100',
      },
    ];

    let auditsCreated = 0;
    for (const a of auditData) {
      const existing = await AuditLog.findOne({ action: a.action, 'actor.email': a.actor.email, timestamp: a.timestamp }).lean();
      if (!existing) {
        await AuditLog.create(a);
        auditsCreated++;
      }
    }
    console.log(`  Created ${auditsCreated} audit logs`);

    // ── 5. Update admin moderation stats ─────────────────────────────────────
    const resolvedReports = await Report.countDocuments({ 'adminResponse.adminEmail': adminEmail, status: 'resolved' });
    const dismissedReports = await Report.countDocuments({ 'adminResponse.adminEmail': adminEmail, status: 'dismissed' });
    const resolvedFeedback = await SiteFeedback.countDocuments({ 'adminResponse.adminEmail': adminEmail, status: 'resolved' });

    await User.findByIdAndUpdate(adminId, {
      $set: {
        'moderationStats.reportsResolved': resolvedReports + dismissedReports,
        'moderationStats.surveysReviewed': await Survey.countDocuments({ 'moderation.reviewedBy': adminId }),
        'moderationStats.totalActions': resolvedReports + dismissedReports + resolvedFeedback,
      },
    });
    console.log(`  Updated admin moderation stats: ${resolvedReports + dismissedReports} reports resolved`);

    // ── 6. Update surveyor surveysReviewed ───────────────────────────────────
    const surveyorSurveys = await Survey.countDocuments({ surveyorId: surveyor1._id });
    const surveyorResponses = await Survey.countDocuments({ surveyorId: surveyor1._id, participantCount: { $gt: 0 } });
    console.log(`  Surveyor1 has ${surveyorSurveys} surveys, ${surveyorResponses} with responses`);

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();

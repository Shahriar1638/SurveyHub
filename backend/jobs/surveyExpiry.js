const { Queue, Worker } = require('bullmq');
const redis = require('../lib/redis');
const Survey = require('../models/Survey');
const { aggregateSurveyStats } = require('./aggregateStats');
const { generateInsights } = require('../services/aiInsights');

// ── Queue ────────────────────────────────────────────────────────────────────
const expiryQueue = new Queue('survey-expiry', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: { age: 86400 },   // keep completed jobs for 24h
    removeOnFail: { age: 604800 },      // keep failed jobs for 7 days
  },
});

// ── Worker ───────────────────────────────────────────────────────────────────
let worker = null;

function startExpiryWorker() {
  if (worker) return; // prevent double-start

  worker = new Worker(
    'survey-expiry',
    async (job) => {
      const { surveyId } = job.data;
      console.log(`[ExpiryWorker] Processing survey: ${surveyId}`);

      const survey = await Survey.findById(surveyId);
      if (!survey) {
        console.log(`[ExpiryWorker] Survey ${surveyId} not found, skipping`);
        return { skipped: true, reason: 'not_found' };
      }

      // Idempotent: skip if already expired or not published
      if (survey.status !== 'published') {
        console.log(`[ExpiryWorker] Survey ${surveyId} status="${survey.status}", skipping`);
        return { skipped: true, reason: `status_${survey.status}` };
      }

      // Soft-deleted: skip
      if (survey.deleted) {
        console.log(`[ExpiryWorker] Survey ${surveyId} is deleted, skipping`);
        return { skipped: true, reason: 'deleted' };
      }

      // 1. Transition to expired
      survey.status = 'expired';

      // 2. Aggregate stats
      try {
        const stats = await aggregateSurveyStats(surveyId);
        survey.aiInsight = survey.aiInsight || {};
        survey.aiInsight.stats = stats;
        console.log(`[ExpiryWorker] Stats aggregated: ${stats.totalResponses} responses, ${stats.perQuestion.length} questions`);

        // 3. Generate AI insights
        if (stats.totalResponses > 0) {
          try {
            const insights = await generateInsights(survey, stats);
            if (insights) {
              survey.aiInsight.summary = insights.summary;
              survey.aiInsight.keyFindings = insights.keyFindings;
              survey.aiInsight.recommendations = insights.recommendations;
              // Merge topThemes into perQuestion stats
              if (insights.topThemes) {
                stats.perQuestion.forEach((pq) => {
                  if (insights.topThemes[pq.questionId]) {
                    pq.topThemes = insights.topThemes[pq.questionId];
                  }
                });
              }
              survey.aiInsight.generatedAt = new Date();
              console.log(`[ExpiryWorker] AI insights generated: ${insights.keyFindings.length} findings, ${insights.recommendations.length} recommendations`);
            }
          } catch (err) {
            console.error(`[ExpiryWorker] AI insights generation failed:`, err.message);
          }
        }

        survey.aiInsight.status = 'ready';
        survey.aiInsight.updatedAt = new Date();
      } catch (err) {
        console.error(`[ExpiryWorker] Stats aggregation failed for ${surveyId}:`, err.message);
        survey.aiInsight = survey.aiInsight || {};
        survey.aiInsight.status = 'failed';
      }

      await survey.save();
      console.log(`[ExpiryWorker] Survey ${surveyId} expired successfully`);
      return { expired: true, surveyId };
    },
    {
      connection: redis,
      concurrency: 5,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[ExpiryWorker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('completed', (job, result) => {
    if (result?.skipped) {
      console.log(`[ExpiryWorker] Job ${job.id} skipped: ${result.reason}`);
    }
  });

  console.log('[ExpiryWorker] Started');
}

// ── Helper: schedule expiry for a survey ─────────────────────────────────────
async function scheduleExpiry(surveyId, deadline) {
  const delay = new Date(deadline).getTime() - Date.now();
  if (delay <= 0) {
    console.log(`[ExpiryQueue] Deadline already passed for ${surveyId}, not scheduling`);
    return null;
  }

  const jobId = `survey:${surveyId}`;

  // Remove any existing job for this survey first
  try {
    const existingJob = await expiryQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
      console.log(`[ExpiryQueue] Removed existing job for ${surveyId}`);
    }
  } catch {
    // job may not exist, ignore
  }

  const job = await expiryQueue.add('expire-survey', { surveyId }, { delay, jobId });
  console.log(`[ExpiryQueue] Scheduled expiry for ${surveyId} in ${Math.round(delay / 1000)}s`);
  return job;
}

// ── Helper: remove expiry job ────────────────────────────────────────────────
async function removeExpiryJob(surveyId) {
  const jobId = `survey:${surveyId}`;
  try {
    const existingJob = await expiryQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
      console.log(`[ExpiryQueue] Removed job for ${surveyId}`);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

// ── Helper: re-schedule all published surveys on server boot ─────────────────
async function reScheduleAll() {
  const surveys = await Survey.find({
    status: 'published',
    deleted: { $ne: true },
  }).select('_id deadline').lean();

  let scheduled = 0;
  for (const s of surveys) {
    if (s.deadline) {
      const delay = new Date(s.deadline).getTime() - Date.now();
      if (delay > 0) {
        await scheduleExpiry(s._id, s.deadline);
        scheduled++;
      } else {
        // Deadline already passed — expire immediately via a zero-delay job
        await expiryQueue.add('expire-survey', { surveyId: s._id }, {
          delay: 0,
          jobId: `survey:${s._id}`,
        });
        scheduled++;
      }
    }
  }
  console.log(`[ExpiryQueue] Re-scheduled ${scheduled} survey expiry jobs`);
}

// ── Graceful shutdown ────────────────────────────────────────────────────────
async function closeExpiryWorker() {
  if (worker) {
    await worker.close();
    worker = null;
    console.log('[ExpiryWorker] Closed');
  }
  await expiryQueue.close();
  console.log('[ExpiryQueue] Closed');
}

module.exports = {
  expiryQueue,
  startExpiryWorker,
  scheduleExpiry,
  removeExpiryJob,
  reScheduleAll,
  closeExpiryWorker,
};

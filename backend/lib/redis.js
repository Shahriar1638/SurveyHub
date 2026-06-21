const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null, // Required by BullMQ
  retryStrategy(times) {
    if (times > 5) {
      console.warn('[Redis] Could not connect after 5 retries — expiry pipeline disabled');
      return null; // stop retrying
    }
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true, // don't block server startup
});

redis.on('error', (err) => {
  // Only log first few errors to avoid flooding
  if (redis.retryAttempts <= 3) {
    console.error('Redis connection error:', err.message);
  }
});

redis.connect().catch(() => {
  console.warn('[Redis] Not available — expiry pipeline will not run');
});

module.exports = redis;

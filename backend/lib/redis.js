const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    if (times > 10) {
      console.warn('[Redis] Could not connect after 10 retries — expiry pipeline disabled');
      return null;
    }
    return Math.min(times * 300, 3000);
  },
});

redis.on('error', (err) => {
  console.error('[Redis] Error:', err.message);
});

// Helper: wait for Redis to become ready (up to timeout ms)
function waitForReady(timeout = 5000) {
  return new Promise((resolve) => {
    if (redis.status === 'ready') return resolve(true);
    if (redis.status === 'close' || redis.status === 'end') {
      console.warn('[Redis] Status is', redis.status, '— not available');
      return resolve(false);
    }
    console.log('[Redis] Waiting for connection (status:', redis.status, ')...');
    const timer = setTimeout(() => {
      console.warn('[Redis] Timed out after', timeout, 'ms (status:', redis.status, ')');
      resolve(redis.status === 'ready');
    }, timeout);
    redis.once('ready', () => { clearTimeout(timer); resolve(true); });
  });
}

module.exports = redis;
module.exports.waitForReady = waitForReady;

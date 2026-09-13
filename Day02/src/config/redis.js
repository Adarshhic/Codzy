const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL;

const redisOptions = redisUrl
  ? {
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('⚠️ Redis unreachable. Disabling auto-reconnect.');
            return false;
          }
          return Math.min(retries * 1000, 3000);
        }
      }
    }
  : {
      socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            return false;
          }
          return Math.min(retries * 1000, 3000);
        }
      }
    };

const redisClient = createClient(redisOptions);

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

let lastLoggedError = 0;
redisClient.on('error', (err) => {
  const now = Date.now();
  // Throttle error logs to once every 10 seconds to prevent console flooding
  if (now - lastLoggedError > 10000) {
    console.warn('⚠️ Redis Client Warning (non-fatal):', err.message || err);
    lastLoggedError = now;
  }
});

module.exports = redisClient;
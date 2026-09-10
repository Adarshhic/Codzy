const { createClient } = require('redis');

const redisOptions = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD || 'yzmMpO3JK5ikEdx2y302kZbjPai8BuZr',
      socket: {
        host: process.env.REDIS_HOST || 'redis-10468.c100.us-east-1-4.ec2.cloud.redislabs.com',
        port: parseInt(process.env.REDIS_PORT, 10) || 10468
      }
    };

const redisClient = createClient(redisOptions);

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('⚠️ Redis Client Error:', err.message || err);
});

module.exports = redisClient;
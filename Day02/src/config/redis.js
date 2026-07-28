const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
   password: 'yzmMpO3JK5ikEdx2y302kZbjPai8BuZr',
    socket: {
        host: 'redis-10468.c100.us-east-1-4.ec2.cloud.redislabs.com',
        port: 10468
    }
});
module.exports = redisClient
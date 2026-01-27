const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: 'zWaN06A1st0TsjQZlNL9PHDHBqVgktnq',
    socket: {
        host: 'redis-15241.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 15241
    }
});
module.exports = redisClient
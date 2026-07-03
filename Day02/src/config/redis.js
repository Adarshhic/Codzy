const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: 'Tsuy5uS4njZ8JtoTUVKX4boNGMMFkEeL',
    socket: {
        host: 'redis-19188.c245.us-east-1-3.ec2.cloud.redislabs.com',
        port: 19188
    }
});
module.exports = redisClient
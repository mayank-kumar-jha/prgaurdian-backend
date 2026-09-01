require('dotenv').config();
const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

const prReviewQueue = new Queue('pr-review', { connection });

module.exports = { prReviewQueue, connection };
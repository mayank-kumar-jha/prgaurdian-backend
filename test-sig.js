const crypto = require('crypto');

const secret = 'process.env.GITHUB_WEBHOOK_SECRET';
const body = '{"action": "opened"}';

const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');

console.log(signature);
const crypto = require('crypto');

const API_KEY = process.env.SPARKDESK_API_KEY;
const API_SECRET = process.env.SPARKDESK_API_SECRET;
const DOMAIN = 'https://spark-api.xf-yun.com/v1.1/chat';

function getWebsocketUrl() {
    const host = DOMAIN.replace('http://', '').replace('https://', '');
    const date = new Date().toUTCString();
    const signString = `host: ${host}\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
    
    const hmac = crypto.createHmac('sha256', API_SECRET);
    hmac.update(signString);
    const signature = hmac.digest('base64');
    
    const authorizationOrigin = `api_key="${API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin).toString('base64');
    
    return `${DOMAIN}?authorization=${authorization}&date=${encodeURI(date)}&host=${host}`;
}

module.exports = {
    getWebsocketUrl
}; 
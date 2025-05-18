const WebSocket = require('ws');
const crypto = require('crypto');

class SparkDeskAPI {
    constructor(appId, apiKey, apiSecret) {
        this.appId = appId;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.url = 'wss://spark-api.xf-yun.com/v3.1/chat';
    }

    // 生成鉴权URL
    createAuthUrl() {
        const host = 'spark-api.xf-yun.com';
        const path = '/v3.1/chat';
        const date = new Date().toUTCString();
        const algorithm = 'hmac-sha256';
        const headers = 'host date request-line';
        const requestLine = `GET ${path} HTTP/1.1`;
        
        const signatureOrigin = `host: ${host}\ndate: ${date}\n${requestLine}`;
        const signatureSha = crypto.createHmac('sha256', this.apiSecret)
            .update(signatureOrigin)
            .digest('base64');

        const authorizationOrigin = `api_key="${this.apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signatureSha}"`;
        const authorization = Buffer.from(authorizationOrigin).toString('base64');

        return `${this.url}?authorization=${authorization}&date=${encodeURI(date)}&host=${host}`;
    }

    // 创建消息格式
    createMessage(text, uid) {
        return {
            header: {
                app_id: this.appId,
                uid: uid || crypto.randomUUID()
            },
            parameter: {
                chat: {
                    domain: "general",
                    temperature: 0.7,
                    max_tokens: 2048
                }
            },
            payload: {
                message: {
                    text: text
                }
            }
        };
    }

    // 建立WebSocket连接
    connect(onMessage, onError, onClose) {
        const url = this.createAuthUrl();
        const ws = new WebSocket(url);

        ws.on('open', () => {
            console.log('Connected to SparkDesk API');
        });

        ws.on('message', (data) => {
            try {
                const response = JSON.parse(data);
                if (onMessage) {
                    onMessage(response);
                }
            } catch (error) {
                console.error('Failed to parse message:', error);
            }
        });

        ws.on('error', (error) => {
            console.error('SparkDesk API error:', error);
            if (onError) {
                onError(error);
            }
        });

        ws.on('close', () => {
            console.log('SparkDesk API connection closed');
            if (onClose) {
                onClose();
            }
        });

        return ws;
    }
}

module.exports = SparkDeskAPI; 
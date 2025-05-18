const axios = require('axios');
const crypto = require('crypto');

class SparkdeskApi {
    constructor(appid, apiKey, apiSecret) {
        this.appid = appid;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.url = 'https://spark-api.xf-yun.com/v3.1/chat';
    }

    // 生成RFC1123格式的时间戳
    _getDate() {
        let date = new Date();
        let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return days[date.getUTCDay()] + ", " + 
               date.getUTCDate().toString().padStart(2, '0') + " " + 
               months[date.getUTCMonth()] + " " + 
               date.getUTCFullYear() + " " +
               date.getUTCHours().toString().padStart(2, '0') + ":" +
               date.getUTCMinutes().toString().padStart(2, '0') + ":" +
               date.getUTCSeconds().toString().padStart(2, '0') + " GMT";
    }

    // 生成鉴权签名
    _generateSignature(date) {
        let host = new URL(this.url).host;
        let signature_origin = `host: ${host}\ndate: ${date}\nPOST /v3.1/chat HTTP/1.1`;
        let signature_sha = crypto.createHmac('sha256', this.apiSecret)
            .update(signature_origin)
            .digest('base64');
        let authorization_origin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature_sha}"`;
        return crypto.createHmac('sha256', this.apiSecret)
            .update(authorization_origin)
            .digest('base64');
    }

    // 发送请求到星火API
    async chat(messages) {
        const date = this._getDate();
        const authorization = this._generateSignature(date);
        const host = new URL(this.url).host;

        try {
            const response = await axios.post(this.url, {
                header: {
                    app_id: this.appid
                },
                parameter: {
                    chat: {
                        domain: "generalv3",
                        temperature: 0.5,
                        max_tokens: 2048
                    }
                },
                payload: {
                    message: {
                        text: messages
                    }
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Host': host,
                    'Date': date,
                    'Authorization': authorization
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error calling Sparkdesk API:', error);
            throw error;
        }
    }
}

module.exports = SparkdeskApi; 
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const router = express.Router();

// 讯飞星火API配置
const SPARK_API_HOST = 'https://spark-api.xf-yun.com/v2.1/chat';
const APP_ID = 'YOUR_APP_ID';
const API_KEY = 'YOUR_API_KEY';
const API_SECRET = 'YOUR_API_SECRET';

// 生成鉴权URL
function getAuthUrl() {
    const host = new URL(SPARK_API_HOST).host;
    const path = new URL(SPARK_API_HOST).pathname;
    const date = new Date().toUTCString();
    const algorithm = 'hmac-sha256';
    const headers = 'host date request-line';
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
    const signatureSha = crypto.createHmac('sha256', API_SECRET)
        .update(signatureOrigin)
        .digest('base64');
    const authorization = `api_key="${API_KEY}", algorithm="${algorithm}", headers="${headers}", signature="${signatureSha}"`;
    
    return {
        url: SPARK_API_HOST,
        headers: {
            'Authorization': authorization,
            'Date': date,
            'Host': host
        }
    };
}

// 处理聊天请求
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const auth = getAuthUrl();
        
        const response = await axios.post(auth.url, {
            header: {
                app_id: APP_ID
            },
            parameter: {
                chat: {
                    domain: "general",
                    temperature: 0.5,
                    max_tokens: 2048
                }
            },
            payload: {
                message: {
                    text: [{ role: "user", content: message }]
                }
            }
        }, {
            headers: auth.headers
        });

        res.json({
            success: true,
            response: response.data.payload.choices.text[0].content
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: '请求处理失败'
        });
    }
});

module.exports = router; 
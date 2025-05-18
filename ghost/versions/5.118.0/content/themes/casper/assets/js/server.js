const express = require('express');
const cors = require('cors');
const SparkdeskApi = require('./sparkdeskApi');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置星火API凭证
const APP_ID = '19b4e8b3';
const API_KEY = '5046ec6bb599e093c5cd3697c7e25668';
const API_SECRET = 'MWZjNWMyZWQwOGQzZTlhNGQ0YjY3YWEx';

// 创建SparkdeskApi实例
const sparkApi = new SparkdeskApi(APP_ID, API_KEY, API_SECRET);

// 中间件
app.use(cors());
app.use(express.json());

// 聊天路由
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // 构造消息格式
        const messages = [{
            role: "user",
            content: message
        }];

        // 调用星火API
        const response = await sparkApi.chat(messages);
        
        // 提取回复内容
        const reply = response.payload.choices.text[0].content;
        
        res.json({
            success: true,
            response: reply
        });
    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({
            success: false,
            error: '请求处理失败'
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
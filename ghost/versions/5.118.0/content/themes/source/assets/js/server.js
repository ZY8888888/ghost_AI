const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// CORS配置
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

let server;
// 判断是否使用HTTPS
if (process.env.NODE_ENV === 'production') {
    // 生产环境使用HTTPS
    const sslOptions = {
        key: fs.readFileSync('/etc/letsencrypt/live/young8889.online/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/young8889.online/fullchain.pem')
    };
    server = https.createServer(sslOptions, app);
} else {
    // 开发环境使用HTTP
    server = require('http').createServer(app);
}

// WebSocket服务器
const wss = new WebSocket.Server({ server });

// 存储所有连接的客户端
const clients = new Set();

// WebSocket连接处理
wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`New client connected from ${ip}`);
    clients.add(ws);

    // 心跳检测
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    // 消息处理
    ws.on('message', (message) => {
        try {
            console.log(`Received message from ${ip}:`, message.toString());
            ws.send(JSON.stringify({
                type: 'ack',
                message: 'Message received'
            }));
        } catch (error) {
            console.error(`Error processing message from ${ip}:`, error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Error processing message'
            }));
        }
    });

    // 错误处理
    ws.on('error', (error) => {
        console.error(`WebSocket error from ${ip}:`, error);
        clients.delete(ws);
    });

    // 连接关闭
    ws.on('close', () => {
        console.log(`Client disconnected from ${ip}`);
        clients.delete(ws);
    });
});

// 心跳检测间隔
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            clients.delete(ws);
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

// 启动服务器
server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at ${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://0.0.0.0:${port}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
});

// 优雅关闭
process.on('SIGTERM', () => {
    clearInterval(interval);
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
}); 
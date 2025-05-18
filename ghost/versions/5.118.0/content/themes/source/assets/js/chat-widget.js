class ChatWidget {
    constructor() {
        this.config = {
            appId: '19b4e8b3',
            apiKey: '5046ec6bb599e093c5cd3697c7e25668',
            apiSecret: 'MWZjNWMyZWQwOGQzZTlhNGQ0YjY3YWEx',
            sparkUrl: 'wss://spark-api.xf-yun.com/v1/x1'
        };
        this.messages = [];
        this.currentThinkingId = null;
        this.init();
    }

    init() {
        this.createStyles();
        this.createWidget();
        this.bindEvents();
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 350px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
                z-index: 1000;
                display: none;
                font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
            }
            .chat-widget.open {
                display: block;
            }
            .chat-header {
                background: #15171A;
                color: white;
                padding: 15px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .chat-messages {
                height: 300px;
                overflow-y: auto;
                padding: 15px;
                background: #f8f9fa;
            }
            .chat-input-container {
                padding: 15px;
                border-top: 1px solid #eee;
                background: white;
            }
            .chat-input {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-bottom: 8px;
                resize: none;
                font-family: inherit;
                font-size: 14px;
            }
            .chat-input::placeholder {
                color: #999;
            }
            .chat-send {
                background: #15171A;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                float: right;
                font-family: inherit;
                font-size: 14px;
            }
            .chat-send:hover {
                background: #3d4145;
            }
            .chat-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: #15171A;
                border-radius: 50%;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
                transition: transform 0.3s ease;
            }
            .chat-toggle:hover {
                background: #3d4145;
                transform: scale(1.1);
            }
            .message {
                margin: 10px 0;
                padding: 10px;
                border-radius: 4px;
                max-width: 80%;
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.6;
            }
            .user-message {
                background: #e3f2fd;
                margin-left: auto;
            }
            .ai-message {
                background: white;
                margin-right: auto;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .thinking {
                color: #666;
                font-style: italic;
            }
            .close-button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 20px;
                padding: 0;
                line-height: 1;
            }
            .close-button:hover {
                opacity: 0.8;
            }
            .welcome-message {
                text-align: center;
                color: #666;
                margin: 20px 0;
                font-size: 14px;
                line-height: 1.6;
            }
            .error-message {
                color: #dc3545;
                background: #f8d7da;
                padding: 10px;
                border-radius: 4px;
                margin: 10px 0;
                font-size: 14px;
                line-height: 1.6;
            }
        `;
        document.head.appendChild(style);
    }

    createWidget() {
        // 创建切换按钮
        const toggleButton = document.createElement('div');
        toggleButton.className = 'chat-toggle';
        toggleButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
        document.body.appendChild(toggleButton);

        // 创建聊天窗口
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <div class="chat-header">
                智能助手
                <button class="close-button">×</button>
            </div>
            <div class="chat-messages">
                <div class="welcome-message">
                    您好！我是您的智能助手，请问有什么可以帮您？<br>
                    我可以：<br>
                    • 回答您的问题<br>
                    • 提供建议和帮助<br>
                    • 与您进行友好交流
                </div>
            </div>
            <div class="chat-input-container">
                <textarea class="chat-input" placeholder="请输入您想说的..." rows="2"></textarea>
                <button class="chat-send">发送</button>
            </div>
        `;
        document.body.appendChild(widget);

        this.widget = widget;
        this.messagesContainer = widget.querySelector('.chat-messages');
        this.input = widget.querySelector('.chat-input');
        this.sendButton = widget.querySelector('.chat-send');
        this.toggleButton = toggleButton;
    }

    bindEvents() {
        // 切换聊天窗口
        this.toggleButton.addEventListener('click', () => {
            this.widget.classList.toggle('open');
            if (this.widget.classList.contains('open')) {
                this.input.focus();
            }
        });

        // 关闭按钮
        this.widget.querySelector('.close-button').addEventListener('click', () => {
            this.widget.classList.remove('open');
        });

        // 发送消息
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    // 生成鉴权URL
    createAuthUrl() {
        const host = 'spark-api.xf-yun.com';
        const path = '/v1/x1';
        const date = new Date().toUTCString();
        const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
        const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.config.apiSecret);
        const signature = CryptoJS.enc.Base64.stringify(signatureSha);
        const authorizationOrigin = `api_key="${this.config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
        const authorization = btoa(authorizationOrigin);

        return `${this.config.sparkUrl}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${host}`;
    }

    async sendMessage() {
        const text = this.input.value.trim();
        if (!text) return;

        // 显示用户消息
        this.addMessage(text, 'user');
        this.input.value = '';

        // 显示思考中状态
        const thinkingDiv = this.addThinkingMessage();
        let fullResponse = '';

        try {
            const url = this.createAuthUrl();
            console.log('正在连接服务器...');
            
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('WebSocket连接已建立');
                const message = {
                    header: {
                        app_id: this.config.appId,
                        uid: "12345"
                    },
                    parameter: {
                        chat: {
                            domain: "x1",
                            temperature: 0.5,
                            max_tokens: 2048
                        }
                    },
                    payload: {
                        message: {
                            text: [{
                                role: "user",
                                content: text
                            }]
                        }
                    }
                };
                console.log('正在发送消息:', message);
                ws.send(JSON.stringify(message));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('收到回复:', data);

                    if (data.header.code !== 0) {
                        console.error('服务器错误:', data);
                        this.showErrorMessage(`很抱歉，服务出现异常 (错误代码: ${data.header.code})：${data.header.message || '未知错误'}`);
                        thinkingDiv.remove();
                        ws.close();
                        return;
                    }

                    const choices = data.payload.choices;
                    const status = choices.status;
                    const text = choices.text[0];

                    if (text && text.content) {
                        fullResponse += text.content;
                    }

                    if (status === 2) {
                        // 当收到完整响应时，移除思考中消息并显示完整回答
                        if (fullResponse) {
                            this.addMessage(fullResponse, 'ai');
                        } else {
                            this.showErrorMessage('很抱歉，我没有生成有效的回答，请重试。');
                        }
                        thinkingDiv.remove();
                        ws.close();
                    }
                } catch (error) {
                    console.error('解析响应时出错:', error);
                    this.showErrorMessage('很抱歉，处理回复时出现错误，请重试。');
                    thinkingDiv.remove();
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket错误:', error);
                this.showErrorMessage('很抱歉，连接服务器时出现错误，请稍后重试。');
                thinkingDiv.remove();
            };

            ws.onclose = () => {
                console.log('WebSocket连接已关闭');
                if (!fullResponse) {
                    this.showErrorMessage('很抱歉，连接已断开，请重新发送消息。');
                    thinkingDiv.remove();
                }
            };
        } catch (error) {
            console.error('发生错误:', error);
            this.showErrorMessage('很抱歉，系统出现错误，请稍后重试。');
            thinkingDiv.remove();
        }
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = text;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        return messageDiv;
    }

    addThinkingMessage() {
        return this.addMessage('正在思考中...', 'ai');
    }

    showErrorMessage(text) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error-message';
        errorDiv.textContent = text;
        this.messagesContainer.appendChild(errorDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// 添加CryptoJS库
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';
script.onload = () => {
    // 初始化聊天组件
    window.addEventListener('DOMContentLoaded', () => {
        new ChatWidget();
    });
};
document.head.appendChild(script); 
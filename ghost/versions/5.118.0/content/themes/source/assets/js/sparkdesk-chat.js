const SparkDeskAPI = require('./sparkdesk-api');

class SparkDeskChat {
    constructor(config) {
        this.config = config;
        this.sparkAPI = new SparkDeskAPI(
            config.appId,
            config.apiKey,
            config.apiSecret
        );
        this.ws = null;
        this.currentConnection = null;
    }

    // 初始化聊天界面
    initialize(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }

        // 创建聊天界面
        this.container.innerHTML = `
            <div class="chat-messages" id="chatMessages"></div>
            <div class="chat-input">
                <textarea id="userInput" placeholder="请输入您的问题..."></textarea>
                <button id="sendButton">发送</button>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .chat-messages {
                height: 400px;
                overflow-y: auto;
                padding: 10px;
                border: 1px solid #ccc;
                margin-bottom: 10px;
            }
            .chat-input {
                display: flex;
                gap: 10px;
            }
            .chat-input textarea {
                flex: 1;
                height: 60px;
                padding: 5px;
                resize: none;
            }
            .chat-input button {
                padding: 0 20px;
                background: #0066cc;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .chat-input button:hover {
                background: #0052a3;
            }
            .message {
                margin: 10px 0;
                padding: 10px;
                border-radius: 4px;
                max-width: 80%;
            }
            .user-message {
                background: #e3f2fd;
                margin-left: auto;
            }
            .ai-message {
                background: #f5f5f5;
                margin-right: auto;
            }
            .thinking {
                color: #666;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);

        // 绑定事件
        this.bindEvents();
    }

    // 绑定事件处理
    bindEvents() {
        const sendButton = document.getElementById('sendButton');
        const userInput = document.getElementById('userInput');
        const chatMessages = document.getElementById('chatMessages');

        sendButton.addEventListener('click', () => this.sendMessage());
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    // 发送消息
    async sendMessage() {
        const userInput = document.getElementById('userInput');
        const text = userInput.value.trim();
        if (!text) return;

        // 显示用户消息
        this.addMessage(text, 'user');
        userInput.value = '';

        // 显示思考中状态
        const thinkingId = this.addThinkingMessage();

        try {
            // 连接到星火API
            if (this.currentConnection) {
                this.currentConnection.close();
            }

            let response = '';
            this.currentConnection = this.sparkAPI.connect(
                // 消息处理
                (data) => {
                    if (data.header.code === 0) {
                        const text = data.payload.choices.text[0];
                        if (text.content) {
                            response += text.content;
                            this.updateAIMessage(thinkingId, response);
                        }
                    } else {
                        console.error('API Error:', data);
                        this.updateAIMessage(thinkingId, '抱歉，处理您的请求时出现错误。');
                    }
                },
                // 错误处理
                (error) => {
                    console.error('Connection Error:', error);
                    this.updateAIMessage(thinkingId, '抱歉，连接出现错误。');
                },
                // 连接关闭处理
                () => {
                    if (!response) {
                        this.updateAIMessage(thinkingId, '抱歉，连接已关闭。');
                    }
                }
            );

            // 发送消息
            const message = this.sparkAPI.createMessage(text);
            this.currentConnection.send(JSON.stringify(message));
        } catch (error) {
            console.error('Error:', error);
            this.updateAIMessage(thinkingId, '抱歉，发生了错误。');
        }
    }

    // 添加消息到界面
    addMessage(text, type) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv.id;
    }

    // 添加思考中消息
    addThinkingMessage() {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message thinking';
        messageDiv.textContent = '思考中...';
        messageDiv.id = 'thinking-' + Date.now();
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv.id;
    }

    // 更新AI消息
    updateAIMessage(messageId, text) {
        const messageDiv = document.getElementById(messageId);
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = 'message ai-message';
        }
    }
}

// 导出聊天类
module.exports = SparkDeskChat; 
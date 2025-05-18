document.addEventListener('DOMContentLoaded', function() {
    // 创建聊天界面
    const chatContainer = document.createElement('div');
    chatContainer.id = 'sparkdesk-chat-container';
    chatContainer.innerHTML = `
        <div class="chat-header">
            <span>智能助手</span>
            <button class="minimize-btn">-</button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input">
            <textarea placeholder="请输入您的问题..."></textarea>
            <button class="send-btn">发送</button>
        </div>
    `;
    document.body.appendChild(chatContainer);

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        #sparkdesk-chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            height: 400px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            z-index: 1000;
        }
        .chat-header {
            padding: 10px;
            background: #1a73e8;
            color: white;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .minimize-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 20px;
        }
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
        }
        .chat-input {
            padding: 10px;
            border-top: 1px solid #eee;
            display: flex;
        }
        .chat-input textarea {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 8px;
            margin-right: 8px;
            resize: none;
        }
        .send-btn {
            padding: 8px 16px;
            background: #1a73e8;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .message {
            margin: 8px 0;
            padding: 8px;
            border-radius: 4px;
            max-width: 80%;
        }
        .user-message {
            background: #e3f2fd;
            margin-left: auto;
        }
        .bot-message {
            background: #f5f5f5;
            margin-right: auto;
        }
        @media (max-width: 768px) {
            #sparkdesk-chat-container {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                border-radius: 0;
            }
            .chat-header {
                border-radius: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // 获取元素
    const minimizeBtn = chatContainer.querySelector('.minimize-btn');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendBtn = chatContainer.querySelector('.send-btn');
    let isMinimized = false;

    // 最小化/最大化功能
    minimizeBtn.addEventListener('click', () => {
        if (isMinimized) {
            chatContainer.style.height = '400px';
            minimizeBtn.textContent = '-';
        } else {
            chatContainer.style.height = '40px';
            minimizeBtn.textContent = '+';
        }
        isMinimized = !isMinimized;
    });

    // WebSocket连接
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('Connected to server');
        addMessage('系统', '已连接到智能助手');
    };

    ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.error) {
            addMessage('系统', '错误：' + response.error);
        } else {
            addMessage('助手', response.content);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        addMessage('系统', '连接错误');
    };

    // 发送消息
    function sendMessage() {
        const message = textarea.value.trim();
        if (message && ws.readyState === WebSocket.OPEN) {
            const data = {
                message: message,
                timestamp: new Date().getTime()
            };
            ws.send(JSON.stringify(data));
            addMessage('用户', message);
            textarea.value = '';
        }
    }

    // 添加消息到界面
    function addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender === '用户' ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = content;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 事件监听
    sendBtn.addEventListener('click', sendMessage);
    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}); 
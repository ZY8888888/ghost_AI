// 创建聊天框样式
const style = document.createElement('style');
style.textContent = `
.chat-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    z-index: 1000;
}

.chat-header {
    padding: 10px;
    background: #1a1a1a;
    color: white;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-header h3 {
    margin: 0;
    font-size: 16px;
}

.chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    background: #f5f5f5;
}

.chat-input {
    padding: 10px;
    border-top: 1px solid #eee;
    display: flex;
}

.chat-input input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 8px;
}

.chat-input button {
    padding: 8px 15px;
    background: #1a1a1a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.message {
    margin-bottom: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    max-width: 80%;
}

.user-message {
    background: #007bff;
    color: white;
    margin-left: auto;
}

.bot-message {
    background: white;
    color: black;
}

.minimize-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 20px;
    padding: 0 5px;
}

.chat-container.minimized {
    height: 50px;
}

.chat-container.minimized .chat-body,
.chat-container.minimized .chat-input {
    display: none;
}
`;

document.head.appendChild(style);

// 创建聊天框HTML结构
const chatHTML = `
<div class="chat-container">
    <div class="chat-header">
        <h3>星火大模型助手</h3>
        <button class="minimize-btn">−</button>
    </div>
    <div class="chat-body"></div>
    <div class="chat-input">
        <input type="text" placeholder="输入您的问题...">
        <button>发送</button>
    </div>
</div>
`;

// 添加聊天框到页面
document.body.insertAdjacentHTML('beforeend', chatHTML);

// 获取DOM元素
const chatContainer = document.querySelector('.chat-container');
const chatBody = document.querySelector('.chat-body');
const input = document.querySelector('.chat-input input');
const sendButton = document.querySelector('.chat-input button');
const minimizeBtn = document.querySelector('.minimize-btn');

// 最小化功能
minimizeBtn.addEventListener('click', () => {
    chatContainer.classList.toggle('minimized');
    minimizeBtn.textContent = chatContainer.classList.contains('minimized') ? '+' : '−';
});

// 添加消息到聊天框
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// 发送消息处理
async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    // 添加用户消息
    addMessage(message, true);
    input.value = '';

    try {
        // 调用后端API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        if (data.success) {
            addMessage(data.response);
        } else {
            throw new Error(data.error || '请求失败');
        }
    } catch (error) {
        console.error('Chat error:', error);
        addMessage('抱歉，出现了一些问题，请稍后再试。');
    }
}

// 绑定发送事件
sendButton.addEventListener('click', sendMessage);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
}); 
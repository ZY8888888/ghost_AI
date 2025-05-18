class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.isConnected = false;
        this.messageCallbacks = new Set();
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('Connected to server');
                this.isConnected = true;
                resolve();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.messageCallbacks.forEach(callback => callback(data));
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('Disconnected from server');
                this.isConnected = false;
                // 尝试重新连接
                setTimeout(() => this.connect(), 5000);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            };
        });
    }

    send(message) {
        if (!this.isConnected) {
            throw new Error('Not connected to server');
        }
        this.ws.send(JSON.stringify(message));
    }

    onMessage(callback) {
        this.messageCallbacks.add(callback);
    }

    removeMessageCallback(callback) {
        this.messageCallbacks.delete(callback);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// 导出客户端类
module.exports = WebSocketClient; 
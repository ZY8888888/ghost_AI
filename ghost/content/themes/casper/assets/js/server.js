const WebSocket = require('ws');
const { getWebsocketUrl } = require('./sparkdeskApi');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log('Client connected');
    
    let sparkWs = null;
    
    ws.on('message', async function incoming(message) {
        try {
            const data = JSON.parse(message);
            
            if (!sparkWs || sparkWs.readyState !== WebSocket.OPEN) {
                const url = getWebsocketUrl();
                sparkWs = new WebSocket(url);
                
                sparkWs.on('open', () => {
                    console.log('Connected to SparkDesk');
                    sparkWs.send(JSON.stringify(data));
                });
                
                sparkWs.on('message', (response) => {
                    ws.send(response);
                });
                
                sparkWs.on('error', (error) => {
                    console.error('SparkDesk error:', error);
                    ws.send(JSON.stringify({ error: 'SparkDesk connection error' }));
                });
            } else {
                sparkWs.send(JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
            ws.send(JSON.stringify({ error: 'Internal server error' }));
        }
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
        if (sparkWs) {
            sparkWs.close();
        }
    });
});

console.log('WebSocket server is running on port 8080'); 
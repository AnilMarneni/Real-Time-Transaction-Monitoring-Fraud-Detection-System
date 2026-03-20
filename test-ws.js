const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:4000');

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');
});

ws.on('message', (data) => {
  console.log('📩 Received Event:', JSON.parse(data.toString()));
});

ws.on('close', () => {
  console.log('❌ Disconnected from WebSocket server');
});

ws.on('error', (err) => {
  console.error('❌ WebSocket error:', err.message);
});

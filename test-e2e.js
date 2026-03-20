const WebSocket = require('ws');
const http = require('http');

const ws = new WebSocket('ws://localhost:4000');

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');
  
  // Send a normal transaction
  sendTransaction({
    userId: 'user-123',
    amount: 100, // low amount
    merchant: 'Amazon',
    location: 'NY'
  });

  // Send a high-risk transaction to trigger fraud alert (if threshold is simple, or just a large amount)
  setTimeout(() => {
    sendTransaction({
      userId: 'user-456',
      amount: 15000, // high amount
      merchant: 'Shady Electronics',
      location: 'Unknown'
    });
  }, 2000);
});

ws.on('message', (data) => {
  console.log('\n📩 Received WS Event:', JSON.stringify(JSON.parse(data.toString()), null, 2));
});

ws.on('close', () => {
  console.log('❌ Disconnected from WebSocket server');
});

ws.on('error', (err) => {
  console.error('❌ WebSocket error:', err.message);
});

function sendTransaction(payload) {
  const data = JSON.stringify(payload);
  const req = http.request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/transactions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(`\n📤 Transaction Sent [${res.statusCode}]: ${body}`));
  });

  req.on('error', e => console.error(`Problem with request: ${e.message}`));
  req.write(data);
  req.end();
}

// Exit after 5 seconds
setTimeout(() => {
  ws.close();
  process.exit(0);
}, 5000);

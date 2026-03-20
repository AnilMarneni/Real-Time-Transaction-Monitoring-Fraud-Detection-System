const WebSocket = require('ws');
const http = require('http');

const ws = new WebSocket('ws://localhost:4000');

ws.on('open', () => {
  // Send a high-risk transaction to trigger fraud alert
  sendTransaction({
    userId: 'user-alert-test',
    amount: 999999, // very high amount to ensure fraud model flags it
    merchant: 'Hackers LLC',
    location: 'Unknown'
  });
});

ws.on('message', (data) => {
  const parsed = JSON.parse(data.toString());
  if (parsed.type === 'alert:fraud') {
    console.log('FRAUD_ALERT_RECEIVED');
    ws.close();
    process.exit(0);
  }
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
  }, (res) => { res.on('data', () => {}); });
  req.write(data);
  req.end();
}

// Exit failure if we don't get the alert in 5 seconds
setTimeout(() => {
  console.log('FRAUD_ALERT_TIMEOUT');
  process.exit(1);
}, 5000);

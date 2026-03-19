import { WebSocketServer } from 'ws';

let wss: WebSocketServer;

export const initWebSocket = (server: any) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('🔌 Client connected');

    ws.on('close', () => {
      console.log('❌ Client disconnected');
    });
  });
};

export const broadcast = (data: any) => {
  if (!wss) return;

  const message = JSON.stringify(data);

  wss.clients.forEach((client: any) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
};
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

interface TransactionEvent {
  type: 'transaction:new' | 'alert:fraud';
  data: {
    id: string;
    amount: number;
    status: string;
    riskScore: number;
    transactionId?: string;
    message?: string;
  };
}

interface Transaction {
  id: string;
  amount: number;
  status: string;
  riskScore: number;
  timestamp: string;
}

interface FraudAlert {
  id: string;
  transactionId?: string;
  message: string;
  severity: string;
  timestamp: string;
  riskScore?: number;
}

export function useWebSocket(url?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<TransactionEvent | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | undefined>(undefined);
  const { token } = useAuthStore();

  const connect = useCallback(() => {
    if (!token) return;

    const wsUrl = url || 'ws://localhost:4000';
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as TransactionEvent;
        setLastMessage(data);

        if (data.type === 'transaction:new') {
          setTransactions(prev => [data.data as Transaction, ...prev].slice(0, 100)); // Keep last 100
        } else if (data.type === 'alert:fraud') {
          setAlerts(prev => [{
            id: data.data.id,
            transactionId: data.data.transactionId,
            message: data.data.message || 'Fraud detected',
            severity: 'high',
            timestamp: new Date().toISOString()
          }, ...prev].slice(0, 50)); // Keep last 50
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeout.current = setTimeout(() => {
        if (token) {
          const wsUrl = url || 'ws://localhost:4000';
          ws.current = new WebSocket(wsUrl);
          // Re-setup event handlers...
          ws.current.onopen = () => {
            console.log('WebSocket reconnected');
            setIsConnected(true);
          };
          ws.current.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data) as TransactionEvent;
              setLastMessage(data);
              if (data.type === 'transaction:new') {
                setTransactions(prev => [data.data as Transaction, ...prev].slice(0, 100));
              } else if (data.type === 'alert:fraud') {
                setAlerts(prev => [{
                  id: data.data.id,
                  transactionId: data.data.transactionId,
                  message: data.data.message || 'Fraud detected',
                  severity: 'high',
                  timestamp: new Date().toISOString()
                }, ...prev].slice(0, 50));
              }
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error);
            }
          };
          ws.current.onclose = () => {
            console.log('WebSocket disconnected again');
            setIsConnected(false);
          };
        }
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [token, url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
  }, []);

  // Auto-connect effect
  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    transactions,
    alerts,
    connect,
    disconnect,
  };
}

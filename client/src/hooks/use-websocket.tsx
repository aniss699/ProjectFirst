
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './use-auth';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export function useWebSocket(url?: string): UseWebSocketReturn {
  const { user, token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const wsUrl = url || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

  const connect = useCallback(() => {
    if (!user || !token) {
      console.log('🔌 WebSocket: No user or token, skipping connection');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔌 WebSocket: Already connected');
      return;
    }

    try {
      setConnectionStatus('connecting');
      console.log('🔌 WebSocket: Attempting to connect...');
      
      const ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket: Connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 WebSocket: Message received:', message.type);
          setLastMessage(message);
        } catch (error) {
          console.error('❌ WebSocket: Error parsing message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('📴 WebSocket: Connection closed', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        wsRef.current = null;

        // Reconnexion automatique
        if (reconnectAttempts.current < maxReconnectAttempts && user) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Backoff exponentiel
          console.log(`🔄 WebSocket: Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.log('❌ WebSocket: Max reconnection attempts reached');
          setConnectionStatus('error');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket: Connection error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('❌ WebSocket: Failed to create connection:', error);
      setConnectionStatus('error');
    }
  }, [user, token, wsUrl]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log('📤 WebSocket: Message sent:', message.type);
    } else {
      console.warn('⚠️ WebSocket: Cannot send message, not connected');
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    sendMessage,
    lastMessage,
    connectionStatus
  };
}

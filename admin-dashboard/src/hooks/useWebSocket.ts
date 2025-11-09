/**
 * WebSocket Hook for Real-Time Updates
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  namespace?: string;
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: string;
}

export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
): {
  socket: Socket | null;
  connected: boolean;
  sendMessage: (type: string, data: any) => void;
  subscribe: (event: string, callback: (data: any) => void) => () => void;
  error: Error | null;
} {
  const { namespace = '/', enabled = true, onConnect, onDisconnect, onError } = options;
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    
    const socket = io(`${url}${namespace}`, {
      auth: {
        token: token || undefined,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
      onConnect?.();
    });

    socket.on('disconnect', () => {
      setConnected(false);
      onDisconnect?.();
    });

    socket.on('connect_error', (err) => {
      setError(err);
      onError?.(err);
    });

    // Subscribe to all registered callbacks
    callbacksRef.current.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        socket.on(event, callback);
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, namespace, enabled, onConnect, onDisconnect, onError]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(type, data);
    }
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (!callbacksRef.current.has(event)) {
      callbacksRef.current.set(event, new Set());
    }
    callbacksRef.current.get(event)?.add(callback);

    // If socket is already connected, subscribe immediately
    if (socketRef.current?.connected) {
      socketRef.current.on(event, callback);
    }

    // Return unsubscribe function
    return () => {
      callbacksRef.current.get(event)?.delete(callback);
      socketRef.current?.off(event, callback);
    };
  }, []);

  return {
    socket: socketRef.current,
    connected,
    sendMessage,
    subscribe,
    error,
  };
}

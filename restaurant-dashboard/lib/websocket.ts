/**
 * WebSocket client for Restaurant Dashboard
 * Handles real-time order updates and notifications
 */

import io, { Socket } from 'socket.io-client';

export type OrderEventType = 
  | 'order_created' 
  | 'order_status_changed' 
  | 'delivery_assigned' 
  | 'delivery_picked_up' 
  | 'delivery_delivered'
  | 'order_cancelled';

export interface OrderEvent {
  type: OrderEventType;
  orderId: string;
  order: any;
  status?: string;
  timestamp: string;
}

class RestaurantWebSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  constructor(private orderServiceUrl: string, private token: string) {}

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.socket = io(this.orderServiceUrl, {
        auth: {
          token: this.token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      // Join restaurant-specific room
      this.socket?.emit('join_restaurant', { token: this.token });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnecting = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.handleReconnect();
    });

    // Order events
    this.socket.on('newOrder', (order: any) => {
      this.emit('order_created', {
        type: 'order_created',
        orderId: order.id,
        order,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('order_update', (data: any) => {
      this.emit('order_status_changed', {
        type: 'order_status_changed',
        orderId: data.orderId || data.id,
        order: data.order || data,
        status: data.status,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('delivery_assigned', (data: any) => {
      this.emit('delivery_assigned', {
        type: 'delivery_assigned',
        orderId: data.orderId,
        order: data.order,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('delivery_picked_up', (data: any) => {
      this.emit('delivery_picked_up', {
        type: 'delivery_picked_up',
        orderId: data.orderId,
        order: data.order,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('delivery_delivered', (data: any) => {
      this.emit('delivery_delivered', {
        type: 'delivery_delivered',
        orderId: data.orderId,
        order: data.order,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Reconnect to WebSocket
   */
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      this.disconnect();
      this.connect();
    }, 1000 * this.reconnectAttempts);
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnect();
    }
  }

  /**
   * Subscribe to order events
   */
  on(eventType: OrderEventType, callback: (event: OrderEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  /**
   * Emit event to listeners
   */
  private emit(eventType: OrderEventType, data: OrderEvent): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.listeners.clear();
  }

  /**
   * Update authentication token
   */
  updateToken(newToken: string): void {
    this.token = newToken;
    if (this.socket?.connected) {
      this.disconnect();
      this.connect();
    }
  }
}

// Singleton instance
let wsClientInstance: RestaurantWebSocketClient | null = null;

/**
 * Initialize WebSocket client
 */
export function initWebSocket(orderServiceUrl: string, token: string): RestaurantWebSocketClient {
  if (wsClientInstance) {
    wsClientInstance.disconnect();
  }
  
  wsClientInstance = new RestaurantWebSocketClient(orderServiceUrl, token);
  wsClientInstance.connect();
  
  return wsClientInstance;
}

/**
 * Get WebSocket client instance
 */
export function getWebSocketClient(): RestaurantWebSocketClient | null {
  return wsClientInstance;
}

/**
 * Disconnect WebSocket client
 */
export function disconnectWebSocket(): void {
  if (wsClientInstance) {
    wsClientInstance.disconnect();
    wsClientInstance = null;
  }
}


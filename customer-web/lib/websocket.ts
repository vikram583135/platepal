/**
 * WebSocket client for Customer Web App
 * Handles real-time order updates and tracking
 */

import io, { Socket } from 'socket.io-client';

export type OrderEventType = 
  | 'order_created' 
  | 'order_status_changed'
  | 'delivery_assigned'
  | 'delivery_picked_up'
  | 'order_delivered'
  | 'order_cancelled';

export interface OrderEvent {
  type: OrderEventType;
  orderId: string | number;
  order?: any;
  status?: string;
  deliveryPartnerId?: string;
  timestamp: string;
}

class CustomerWebSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private customerId: string | null = null;

  constructor(private orderServiceUrl: string, private token: string) {}

  /**
   * Connect to WebSocket server
   */
  connect(customerId?: string): void {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.customerId = customerId || null;

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
      
      // Join customer-specific room
      if (this.customerId) {
        this.socket?.emit('join_customer', { 
          token: this.token,
          customerId: this.customerId,
        });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnecting = false;
      
      if (reason === 'io server disconnect') {
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.handleReconnect();
    });

    // Order events
    this.socket.on('order_created', (order: any) => {
      this.emit('order_created', {
        type: 'order_created',
        orderId: order.id,
        order,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('order_status_changed', (data: any) => {
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
        deliveryPartnerId: data.deliveryPartnerId,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('delivery_picked_up', (data: any) => {
      this.emit('delivery_picked_up', {
        type: 'delivery_picked_up',
        orderId: data.orderId,
        deliveryPartnerId: data.deliveryPartnerId,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('order_delivered', (data: any) => {
      this.emit('order_delivered', {
        type: 'order_delivered',
        orderId: data.orderId,
        deliveryPartnerId: data.deliveryPartnerId,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('order_cancelled', (data: any) => {
      this.emit('order_cancelled', {
        type: 'order_cancelled',
        orderId: data.orderId,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Subscribe to specific order updates
   */
  subscribeToOrder(orderId: string | number): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_order', { orderId });
    }
  }

  /**
   * Unsubscribe from order updates
   */
  unsubscribeFromOrder(orderId: string | number): void {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_order', { orderId });
    }
  }

  /**
   * Register event listener
   */
  on(event: OrderEventType, callback: (event: OrderEvent) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  /**
   * Remove event listener
   */
  off(event: OrderEventType, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: OrderEventType, data: OrderEvent): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Reconnect logic
   */
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.socket?.connected) {
        this.connect(this.customerId || undefined);
      }
    }, delay);
  }

  private handleReconnect(): void {
    if (this.socket?.connected) {
      return;
    }
    this.reconnect();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.isConnecting = false;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Update token
   */
  updateToken(newToken: string, customerId?: string): void {
    this.token = newToken;
    this.customerId = customerId || this.customerId;
    
    if (this.socket?.connected) {
      this.disconnect();
      this.connect(this.customerId || undefined);
    }
  }
}

// Singleton instance
let wsClientInstance: CustomerWebSocketClient | null = null;

/**
 * Initialize WebSocket client
 */
export function initWebSocket(orderServiceUrl: string, token: string, customerId?: string): CustomerWebSocketClient {
  if (wsClientInstance) {
    wsClientInstance.disconnect();
  }
  
  wsClientInstance = new CustomerWebSocketClient(orderServiceUrl, token);
  wsClientInstance.connect(customerId);
  
  return wsClientInstance;
}

/**
 * Get WebSocket client instance
 */
export function getWebSocketClient(): CustomerWebSocketClient | null {
  return wsClientInstance;
}

/**
 * Disconnect WebSocket
 */
export function disconnectWebSocket(): void {
  if (wsClientInstance) {
    wsClientInstance.disconnect();
    wsClientInstance = null;
  }
}


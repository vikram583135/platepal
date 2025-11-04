/**
 * WebSocket client for Delivery Web App
 * Handles real-time order assignments and updates
 */

import io, { Socket } from 'socket.io-client';

export type DeliveryEventType = 
  | 'delivery_assigned'
  | 'delivery_picked_up'
  | 'delivery_delivered'
  | 'order_update'
  | 'order_cancelled';

export interface DeliveryEvent {
  type: DeliveryEventType;
  orderId: string | number;
  order?: any;
  status?: string;
  deliveryPartnerId?: string;
  timestamp: string;
}

class DeliveryWebSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private deliveryPartnerId: string | null = null;

  constructor(private orderServiceUrl: string, private token: string) {}

  /**
   * Connect to WebSocket server
   */
  connect(deliveryPartnerId?: string): void {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.deliveryPartnerId = deliveryPartnerId || null;

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
      
      // Join delivery partner-specific room
      if (this.deliveryPartnerId) {
        this.socket?.emit('join_delivery', { 
          token: this.token,
          deliveryPartnerId: this.deliveryPartnerId,
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

    // Delivery events
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

    this.socket.on('delivery_delivered', (data: any) => {
      this.emit('delivery_delivered', {
        type: 'delivery_delivered',
        orderId: data.orderId,
        deliveryPartnerId: data.deliveryPartnerId,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('order_update', (data: any) => {
      this.emit('order_update', {
        type: 'order_update',
        orderId: data.orderId || data.id,
        order: data.order || data,
        status: data.status,
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
  on(event: DeliveryEventType, callback: (event: DeliveryEvent) => void): () => void {
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
  off(event: DeliveryEventType, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: DeliveryEventType, data: DeliveryEvent): void {
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
        this.connect(this.deliveryPartnerId || undefined);
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
  updateToken(newToken: string, deliveryPartnerId?: string): void {
    this.token = newToken;
    this.deliveryPartnerId = deliveryPartnerId || this.deliveryPartnerId;
    
    if (this.socket?.connected) {
      this.disconnect();
      this.connect(this.deliveryPartnerId || undefined);
    }
  }
}

// Singleton instance
let wsClientInstance: DeliveryWebSocketClient | null = null;

/**
 * Initialize WebSocket client
 */
export function initWebSocket(orderServiceUrl: string, token: string, deliveryPartnerId?: string): DeliveryWebSocketClient {
  if (wsClientInstance) {
    wsClientInstance.disconnect();
  }
  
  wsClientInstance = new DeliveryWebSocketClient(orderServiceUrl, token);
  wsClientInstance.connect(deliveryPartnerId);
  
  return wsClientInstance;
}

/**
 * Get WebSocket client instance
 */
export function getWebSocketClient(): DeliveryWebSocketClient | null {
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


import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Order } from './order.entity';

// User type for room management
type UserType = 'customer' | 'restaurant' | 'delivery' | 'admin';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userType?: UserType;
  restaurantId?: string;
}

// We configure the gateway to allow connections from any origin for development.
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, AuthenticatedSocket>();

  /**
   * Handle client connection with authentication
   */
  async handleConnection(client: AuthenticatedSocket) {
    console.log(`Client attempting connection: ${client.id}`);
    
    // Extract token from auth or handshake
    const token = client.handshake.auth?.token || 
                  client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      console.warn(`Client ${client.id} connected without token`);
      // Allow connection but mark as unauthenticated
      this.connectedClients.set(client.id, client);
      return;
    }

    // In production: Verify token with user-service
    // For now, we'll extract user info from token if available
    try {
      // TODO: Implement JWT verification with user-service
      // const decoded = await this.verifyToken(token);
      // client.userId = decoded.userId;
      // client.userType = decoded.userType;
      
      console.log(`Client connected: ${client.id}`);
      this.connectedClients.set(client.id, client);
    } catch (error) {
      console.error(`Authentication failed for client ${client.id}:`, error);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  /**
   * Join restaurant-specific room
   */
  @SubscribeMessage('join_restaurant')
  handleJoinRestaurant(client: AuthenticatedSocket, @MessageBody() data: { token: string; restaurantId?: string }) {
    const restaurantId = data.restaurantId || client.restaurantId;
    if (restaurantId) {
      const room = `restaurant:${restaurantId}`;
      client.join(room);
      client.restaurantId = restaurantId;
      client.userType = 'restaurant';
      console.log(`Client ${client.id} joined room: ${room}`);
      client.emit('joined_room', { room, type: 'restaurant' });
    }
  }

  /**
   * Join customer-specific room
   */
  @SubscribeMessage('join_customer')
  handleJoinCustomer(client: AuthenticatedSocket, @MessageBody() data: { token: string; customerId?: string }) {
    const customerId = data.customerId || client.userId;
    if (customerId) {
      const room = `customer:${customerId}`;
      client.join(room);
      client.userId = customerId;
      client.userType = 'customer';
      console.log(`Client ${client.id} joined room: ${room}`);
      client.emit('joined_room', { room, type: 'customer' });
    }
  }

  /**
   * Join delivery partner room
   */
  @SubscribeMessage('join_delivery')
  handleJoinDelivery(client: AuthenticatedSocket, @MessageBody() data: { token: string; deliveryPartnerId?: string }) {
    const deliveryPartnerId = data.deliveryPartnerId || client.userId;
    if (deliveryPartnerId) {
      const room = `delivery:${deliveryPartnerId}`;
      client.join(room);
      client.userId = deliveryPartnerId;
      client.userType = 'delivery';
      console.log(`Client ${client.id} joined room: ${room}`);
      client.emit('joined_room', { room, type: 'delivery' });
    }
  }

  /**
   * Join admin room
   */
  @SubscribeMessage('join_admin')
  handleJoinAdmin(client: AuthenticatedSocket, @MessageBody() data: { token: string }) {
    client.join('admin:all');
    client.userType = 'admin';
    console.log(`Client ${client.id} joined admin room`);
    client.emit('joined_room', { room: 'admin:all', type: 'admin' });
  }

  /**
   * Subscribe to specific order updates
   */
  @SubscribeMessage('subscribe_order')
  handleSubscribeOrder(client: AuthenticatedSocket, @MessageBody() data: { orderId: string }) {
    const room = `order:${data.orderId}`;
    client.join(room);
    console.log(`Client ${client.id} subscribed to order: ${data.orderId}`);
  }

  /**
   * Unsubscribe from order updates
   */
  @SubscribeMessage('unsubscribe_order')
  handleUnsubscribeOrder(client: AuthenticatedSocket, @MessageBody() data: { orderId: string }) {
    const room = `order:${data.orderId}`;
    client.leave(room);
    console.log(`Client ${client.id} unsubscribed from order: ${data.orderId}`);
  }

  /**
   * Send new order notification
   * - Broadcasts to restaurant room
   * - Broadcasts to admin room
   * - Sends to customer room
   */
  sendNewOrder(order: Order) {
    const orderData = {
      id: order.id,
      restaurantId: order.restaurantId,
      customerId: order.customerId,
      status: order.status,
      totalPrice: order.totalPrice,
      items: order.items,
      createdAt: order.createdAt,
    };

    // Notify restaurant
    this.server.to(`restaurant:${order.restaurantId}`).emit('newOrder', orderData);
    
    // Notify customer
    this.server.to(`customer:${order.customerId}`).emit('order_created', orderData);
    
    // Notify admin
    this.server.to('admin:all').emit('order_created', orderData);
    
    // Notify order-specific room
    this.server.to(`order:${order.id}`).emit('order_update', orderData);

    console.log(`New order ${order.id} broadcasted`);
  }

  /**
   * Send order status update
   */
  sendOrderStatusUpdate(orderId: number, restaurantId: number, customerId: number, status: string, order?: Partial<Order>) {
    const updateData = {
      orderId,
      status,
      order,
      timestamp: new Date().toISOString(),
    };

    // Notify restaurant
    this.server.to(`restaurant:${restaurantId}`).emit('order_update', updateData);
    
    // Notify customer
    this.server.to(`customer:${customerId}`).emit('order_status_changed', updateData);
    
    // Notify admin
    this.server.to('admin:all').emit('order_status_changed', updateData);
    
    // Notify order-specific room
    this.server.to(`order:${orderId}`).emit('order_update', updateData);

    console.log(`Order ${orderId} status updated to ${status}`);
  }

  /**
   * Send delivery assignment notification
   */
  sendDeliveryAssigned(orderId: number, restaurantId: number, customerId: number, deliveryPartnerId: string, order?: Partial<Order>) {
    const assignmentData = {
      orderId,
      deliveryPartnerId,
      order,
      timestamp: new Date().toISOString(),
    };

    // Notify restaurant
    this.server.to(`restaurant:${restaurantId}`).emit('delivery_assigned', assignmentData);
    
    // Notify customer
    this.server.to(`customer:${customerId}`).emit('delivery_assigned', assignmentData);
    
    // Notify delivery partner
    this.server.to(`delivery:${deliveryPartnerId}`).emit('delivery_assigned', assignmentData);
    
    // Notify admin
    this.server.to('admin:all').emit('delivery_assigned', assignmentData);
    
    // Notify order-specific room
    this.server.to(`order:${orderId}`).emit('delivery_assigned', assignmentData);

    console.log(`Delivery partner ${deliveryPartnerId} assigned to order ${orderId}`);
  }

  /**
   * Send delivery picked up notification
   */
  sendDeliveryPickedUp(orderId: number, restaurantId: number, customerId: number, deliveryPartnerId: string) {
    const pickupData = {
      orderId,
      deliveryPartnerId,
      timestamp: new Date().toISOString(),
    };

    // Notify restaurant
    this.server.to(`restaurant:${restaurantId}`).emit('delivery_picked_up', pickupData);
    
    // Notify customer
    this.server.to(`customer:${customerId}`).emit('delivery_picked_up', pickupData);
    
    // Notify delivery partner
    this.server.to(`delivery:${deliveryPartnerId}`).emit('delivery_picked_up', pickupData);
    
    // Notify admin
    this.server.to('admin:all').emit('delivery_picked_up', pickupData);
    
    // Notify order-specific room
    this.server.to(`order:${orderId}`).emit('delivery_picked_up', pickupData);

    console.log(`Order ${orderId} picked up by ${deliveryPartnerId}`);
  }

  /**
   * Send delivery completed notification
   */
  sendDeliveryDelivered(orderId: number, restaurantId: number, customerId: number, deliveryPartnerId: string) {
    const deliveredData = {
      orderId,
      deliveryPartnerId,
      timestamp: new Date().toISOString(),
    };

    // Notify restaurant
    this.server.to(`restaurant:${restaurantId}`).emit('delivery_delivered', deliveredData);
    
    // Notify customer
    this.server.to(`customer:${customerId}`).emit('order_delivered', deliveredData);
    
    // Notify delivery partner
    this.server.to(`delivery:${deliveryPartnerId}`).emit('delivery_delivered', deliveredData);
    
    // Notify admin
    this.server.to('admin:all').emit('order_delivered', deliveredData);
    
    // Notify order-specific room
    this.server.to(`order:${orderId}`).emit('order_delivered', deliveredData);

    console.log(`Order ${orderId} delivered by ${deliveryPartnerId}`);
  }

  /**
   * Send order cancellation notification
   */
  sendOrderCancelled(orderId: number, restaurantId: number, customerId: number, reason?: string) {
    const cancelData = {
      orderId,
      reason,
      timestamp: new Date().toISOString(),
    };

    // Notify restaurant
    this.server.to(`restaurant:${restaurantId}`).emit('order_cancelled', cancelData);
    
    // Notify customer
    this.server.to(`customer:${customerId}`).emit('order_cancelled', cancelData);
    
    // Notify admin
    this.server.to('admin:all').emit('order_cancelled', cancelData);
    
    // Notify order-specific room
    this.server.to(`order:${orderId}`).emit('order_cancelled', cancelData);

    console.log(`Order ${orderId} cancelled`);
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get clients by user type
   */
  getClientsByType(userType: UserType): number {
    return Array.from(this.connectedClients.values()).filter(
      (client) => client.userType === userType
    ).length;
  }
}


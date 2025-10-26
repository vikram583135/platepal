import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Order } from './order.entity';

// We configure the gateway to allow connections from any origin for development.
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  /**
   * This is the new, crucial method.
   * It takes an order and broadcasts an event named 'newOrder'
   * to all connected frontend clients.
   * @param order The newly created order object.
   */
  sendNewOrder(order: Order) {
    this.server.emit('newOrder', order);
  }
}


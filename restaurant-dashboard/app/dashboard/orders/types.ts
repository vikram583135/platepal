export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  status: 'NEW' | 'PREPARING' | 'READY_FOR_PICKUP';
  createdAt: string;
}

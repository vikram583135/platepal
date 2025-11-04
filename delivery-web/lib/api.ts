import axios from 'axios';

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export interface Order {
  id: string;
  status: string;
  items: any[];
  total: number;
  customerId: string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  // Auth endpoints
  async login(email: string, password: string) {
    const response = await axios.post(`${AUTH_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  }

  // Order/Task endpoints
  async getActiveOrders(token: string): Promise<Order[]> {
    const response = await axios.get(`${API_BASE_URL}/orders/active`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getOrderById(orderId: string, token: string): Promise<Order> {
    const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string, token: string): Promise<Order> {
    const response = await axios.patch(
      `${API_BASE_URL}/orders/${orderId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
}

export const apiService = new ApiService();


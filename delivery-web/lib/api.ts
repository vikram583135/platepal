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

  // Route Optimization endpoints
  async getAvailableBatches(
    lat: number,
    lng: number,
    maxBatchSize: number = 3,
    token: string
  ) {
    const response = await axios.get(
      `${API_BASE_URL}/route-optimization/available-batches?lat=${lat}&lng=${lng}&maxBatchSize=${maxBatchSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  async optimizeRoute(batchId: string, lat: number, lng: number, token: string) {
    const response = await axios.post(
      `${API_BASE_URL}/route-optimization/optimize-route`,
      { batchId, lat, lng },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  // Earnings Prediction endpoints
  async getEarningsPrediction(
    partnerId: string,
    hours: number = 2,
    area?: string,
    token?: string
  ) {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(
      `${API_BASE_URL}/earnings-prediction/${partnerId}?hours=${hours}${area ? `&area=${area}` : ''}`,
      { headers }
    );
    return response.data;
  }

  // Smart Notifications endpoints
  async getSmartNotifications(orderId: string, token: string) {
    const response = await axios.get(
      `${API_BASE_URL}/notifications/smart/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  async getProactiveNotifications(partnerId: string, token: string) {
    const response = await axios.get(
      `${API_BASE_URL}/notifications/proactive/${partnerId}`,
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


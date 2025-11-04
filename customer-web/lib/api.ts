import axios from 'axios';

// Use environment variables with fallback for local development
// In Docker with nginx, use relative paths; otherwise use full URLs
const USE_NGINX_PROXY = process.env.NEXT_PUBLIC_USE_NGINX_PROXY === 'true';

// Helper to get base URL - supports both Docker (nginx proxy) and direct access
function getApiBaseUrl(): string {
  if (USE_NGINX_PROXY) {
    return '/api/restaurants';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
}

function getAuthBaseUrl(): string {
  if (USE_NGINX_PROXY) {
    return '/api/auth';
  }
  return process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';
}

function getOrderBaseUrl(): string {
  if (USE_NGINX_PROXY) {
    return '/api/orders';
  }
  return process.env.NEXT_PUBLIC_ORDER_URL || 'http://localhost:3003';
}

const API_BASE_URL = getApiBaseUrl();
const AUTH_BASE_URL = getAuthBaseUrl();
const ORDER_BASE_URL = getOrderBaseUrl();

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  status: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available?: boolean;
}

export interface OrderData {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    restaurantId: string;
    restaurantName: string;
  }>;
  total: number;
  subtotal?: number;
  discount?: number;
  deliveryFee?: number;
  tax?: number;
  promoCode?: string | null;
  restaurantId: string;
  deliveryAddress?: string;
  paymentMethod?: 'card' | 'upi' | 'wallet' | 'cod';
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  status: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  discount?: number;
  deliveryFee?: number;
  tax?: number;
  promoCode?: string | null;
  restaurantId?: string;
  restaurantName?: string;
  createdAt: string;
  updatedAt: string;
  deliveryAddress?: string;
}

class ApiService {
  // Auth endpoints
  async register(name: string, email: string, password: string) {
    const url = USE_NGINX_PROXY
      ? `${AUTH_BASE_URL}/register`
      : `${AUTH_BASE_URL}/auth/register`;
    const response = await axios.post(url, {
      name,
      email,
      password,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const url = USE_NGINX_PROXY
      ? `${AUTH_BASE_URL}/login`
      : `${AUTH_BASE_URL}/auth/login`;
    const response = await axios.post(url, {
      email,
      password,
    });
    return response.data;
  }

  // Restaurant endpoints
  async getRestaurants(): Promise<Restaurant[]> {
    const url = USE_NGINX_PROXY 
      ? `${API_BASE_URL}` 
      : `${API_BASE_URL}/restaurants`;
    const response = await axios.get(url);
    return response.data;
  }

  async getRestaurantMenu(restaurantId: string): Promise<{ items: MenuItem[] }> {
    const url = USE_NGINX_PROXY
      ? `${API_BASE_URL}/${restaurantId}/menu`
      : `${API_BASE_URL}/restaurants/${restaurantId}/menu`;
    const response = await axios.get(url);
    return response.data;
  }

  // Order endpoints
  async placeOrder(orderData: OrderData, token: string): Promise<Order> {
    const url = USE_NGINX_PROXY
      ? `${ORDER_BASE_URL}`
      : `${ORDER_BASE_URL}/orders`;
    const response = await axios.post(url, orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getActiveOrders(token: string): Promise<Order[]> {
    const url = USE_NGINX_PROXY
      ? `${ORDER_BASE_URL}/active`
      : `${ORDER_BASE_URL}/orders/active`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getAllOrders(token: string): Promise<Order[]> {
    try {
      const url = USE_NGINX_PROXY
        ? `${ORDER_BASE_URL}`
        : `${ORDER_BASE_URL}/orders`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, fallback to active orders
      return this.getActiveOrders(token);
    }
  }

  async getOrderById(orderId: string, token: string): Promise<Order> {
    const url = USE_NGINX_PROXY
      ? `${ORDER_BASE_URL}/${orderId}`
      : `${ORDER_BASE_URL}/orders/${orderId}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();


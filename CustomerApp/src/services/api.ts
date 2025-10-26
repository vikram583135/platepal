const API_BASE_URL = 'http://localhost:3002'; // restaurant-service
const ORDER_API_BASE_URL = 'http://localhost:3003'; // order-service

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
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
  restaurantId: string;
}

class ApiService {
  private async makeRequest(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return this.makeRequest(`${API_BASE_URL}/restaurants`);
  }

  async getRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
    return this.makeRequest(`${API_BASE_URL}/restaurants/${restaurantId}/menu`);
  }

  async placeOrder(orderData: OrderData, token: string): Promise<any> {
    return this.makeRequest(`${ORDER_API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  }
}

export const apiService = new ApiService();

/**
 * API Client for Backend Services
 * Centralized client for communicating with all microservices
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3001';
const RESTAURANT_SERVICE_URL = process.env.NEXT_PUBLIC_RESTAURANT_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:3003';
const ADMIN_SERVICE_URL = process.env.NEXT_PUBLIC_ADMIN_SERVICE_URL || 'http://localhost:3004';

class APIClient {
  private userService: AxiosInstance;
  private restaurantService: AxiosInstance;
  private orderService: AxiosInstance;
  private adminService: AxiosInstance;

  constructor() {
    this.userService = axios.create({
      baseURL: USER_SERVICE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.restaurantService = axios.create({
      baseURL: RESTAURANT_SERVICE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.orderService = axios.create({
      baseURL: ORDER_SERVICE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.adminService = axios.create({
      baseURL: ADMIN_SERVICE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth tokens
    this.setupInterceptors();
  }

  private setupInterceptors() {
    const addAuthToken = (config: any) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    };

    [this.userService, this.restaurantService, this.orderService, this.adminService].forEach(
      (client) => {
        client.interceptors.request.use(addAuthToken);
        client.interceptors.response.use(
          (response) => response,
          (error: AxiosError) => {
            if (error.response?.status === 401) {
              // Handle unauthorized - redirect to login
              if (typeof window !== 'undefined') {
                localStorage.removeItem('admin_token');
                window.location.href = '/login';
              }
            }
            return Promise.reject(error);
          }
        );
      }
    );
  }

  // ========== Order Service Endpoints ==========

  async getOrders(filters?: {
    status?: string;
    dateRange?: { start: string; end: string };
    restaurantId?: string;
    customerId?: string;
  }) {
    try {
      const response = await this.orderService.get('/orders', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getActiveOrders() {
    try {
      const response = await this.orderService.get('/orders/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active orders:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string) {
    try {
      const response = await this.orderService.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getPlatformHealth() {
    try {
      const response = await this.orderService.get('/analytics/platform-health');
      return response.data;
    } catch (error) {
      console.error('Error fetching platform health:', error);
      // Return mock data if endpoint doesn't exist yet
      return this.getMockPlatformHealth();
    }
  }

  async getFraudAlerts() {
    try {
      const response = await this.orderService.get('/analytics/fraud-alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      return [];
    }
  }

  async getRegionalStats(region?: string) {
    try {
      const response = await this.orderService.get('/analytics/regional-stats', {
        params: { region },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching regional stats:', error);
      return [];
    }
  }

  async getSuspiciousOrders() {
    try {
      const response = await this.orderService.get('/orders/suspicious');
      return response.data;
    } catch (error) {
      console.error('Error fetching suspicious orders:', error);
      return [];
    }
  }

  async flagOrderAsFraud(orderId: string, reason: string) {
    try {
      const response = await this.orderService.post(`/orders/${orderId}/flag-fraud`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error flagging order as fraud:', error);
      throw error;
    }
  }

  async getOrderAnalytics() {
    try {
      const response = await this.orderService.get('/analytics/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching order analytics:', error);
      return {};
    }
  }

  // ========== Restaurant Service Endpoints ==========

  async getRestaurants(filters?: {
    status?: string;
    region?: string;
    ownerId?: string;
  }) {
    try {
      const response = await this.restaurantService.get('/restaurants', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  }

  async getRestaurantById(restaurantId: string) {
    try {
      const response = await this.restaurantService.get(`/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  }

  async getPendingApprovals() {
    try {
      const response = await this.restaurantService.get('/restaurants/pending-approval');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }
  }

  async approveRestaurant(restaurantId: string, notes?: string) {
    try {
      const response = await this.restaurantService.post(`/restaurants/${restaurantId}/approve`, {
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('Error approving restaurant:', error);
      throw error;
    }
  }

  async rejectRestaurant(restaurantId: string, reason: string) {
    try {
      const response = await this.restaurantService.post(`/restaurants/${restaurantId}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting restaurant:', error);
      throw error;
    }
  }

  async getAIScreenedApplications() {
    try {
      const response = await this.restaurantService.get('/restaurants/ai-screening');
      return response.data;
    } catch (error) {
      console.error('Error fetching AI screened applications:', error);
      return [];
    }
  }

  async getSignupTrends(region?: string) {
    try {
      const response = await this.restaurantService.get('/analytics/signup-trends', {
        params: { region },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching signup trends:', error);
      return [];
    }
  }

  async suspendRestaurant(restaurantId: string, reason: string) {
    try {
      const response = await this.restaurantService.post(`/restaurants/${restaurantId}/suspend`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error suspending restaurant:', error);
      throw error;
    }
  }

  // ========== User Service Endpoints ==========

  async getCustomers(filters?: {
    status?: string;
    region?: string;
    totalOrders?: number;
  }) {
    try {
      const response = await this.userService.get('/users/customers', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  }

  async getCustomerById(customerId: string) {
    try {
      const response = await this.userService.get(`/users/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  async getDeliveryPartners(filters?: {
    status?: string;
    region?: string;
  }) {
    try {
      const response = await this.userService.get('/users/delivery-partners', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
      return [];
    }
  }

  async getDeliveryPartnerById(partnerId: string) {
    try {
      const response = await this.userService.get(`/users/delivery-partners/${partnerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery partner:', error);
      throw error;
    }
  }

  async getSupportTickets(filters?: {
    category?: string;
    priority?: string;
    status?: string;
    dateRange?: { start: string; end: string };
  }) {
    try {
      const response = await this.userService.get('/support-tickets', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      return [];
    }
  }

  async getSupportTicketById(ticketId: string) {
    try {
      const response = await this.userService.get(`/support-tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching support ticket:', error);
      throw error;
    }
  }

  async categorizeTicket(ticketId: string, category: string, priority: string) {
    try {
      const response = await this.userService.post(`/support-tickets/${ticketId}/categorize`, {
        category,
        priority,
      });
      return response.data;
    } catch (error) {
      console.error('Error categorizing ticket:', error);
      throw error;
    }
  }

  async getTicketAnalytics() {
    try {
      const response = await this.userService.get('/support-tickets/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket analytics:', error);
      return {};
    }
  }

  async updateTicketStatus(ticketId: string, status: string) {
    try {
      const response = await this.userService.patch(`/support-tickets/${ticketId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  async assignTicket(ticketId: string, adminId: string) {
    try {
      const response = await this.userService.patch(`/support-tickets/${ticketId}`, { assignedTo: adminId });
      return response.data;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    }
  }

  async addTicketMessage(ticketId: string, messageData: { message: string; senderId: string; senderType: string }) {
    try {
      const response = await this.userService.post(`/support-tickets/${ticketId}/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error('Error adding ticket message:', error);
      throw error;
    }
  }

  async suspendUser(userId: string, reason: string, userType: 'customer' | 'delivery-partner') {
    try {
      const endpoint =
        userType === 'customer'
          ? `/users/customers/${userId}/suspend`
          : `/users/delivery-partners/${userId}/suspend`;
      const response = await this.userService.post(endpoint, { reason });
      return response.data;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }

  // ========== Mock Data Fallbacks ==========

  private getMockPlatformHealth() {
    return {
      orders: {
        total: 0,
        pending: 0,
        completed: 0,
        averageDeliveryTime: 0,
      },
      restaurants: {
        total: 0,
        active: 0,
        pendingApproval: 0,
        signupTrend: 0,
      },
      deliveryPartners: {
        total: 0,
        active: 0,
        onDuty: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const apiClient = new APIClient();

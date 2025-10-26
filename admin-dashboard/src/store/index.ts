import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  ownerId: string;
  ownerName: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  restaurantId: string;
  restaurantName: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  licenseNumber: string;
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  totalDeliveries: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  status: 'active' | 'inactive' | 'banned';
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeRestaurants: number;
  activeDeliveryPartners: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  topRestaurants: Array<{
    id: string;
    name: string;
    orderCount: number;
    revenue: number;
  }>;
}

// Auth slice
interface AuthState {
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  adminUser: null,
  token: null,
  loading: false,
  error: null,
};

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_user', JSON.stringify(data.user));
    return data;
  }
);

export const checkAdminAuthStatus = createAsyncThunk(
  'auth/checkAdminStatus',
  async () => {
    const token = localStorage.getItem('admin_token');
    const adminUser = localStorage.getItem('admin_user');
    
    if (token && adminUser) {
      return { token, adminUser: JSON.parse(adminUser) };
    }
    throw new Error('No stored credentials');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.adminUser = null;
      state.token = null;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.adminUser = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(checkAdminAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.adminUser = action.payload.adminUser;
        state.token = action.payload.token;
      });
  },
});

// Dashboard slice
interface DashboardState {
  stats: DashboardStats | null;
  orders: Order[];
  restaurants: Restaurant[];
  deliveryPartners: DeliveryPartner[];
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

const initialDashboardState: DashboardState = {
  stats: null,
  orders: [],
  restaurants: [],
  deliveryPartners: [],
  customers: [],
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async () => {
    // Mock data for now - in real implementation, this would fetch from API
    return {
      totalOrders: 1247,
      totalRevenue: 45678.90,
      activeRestaurants: 23,
      activeDeliveryPartners: 45,
      pendingOrders: 12,
      completedOrders: 1200,
      averageOrderValue: 36.65,
      topRestaurants: [
        { id: '1', name: 'Pizza Palace', orderCount: 156, revenue: 5678.90 },
        { id: '2', name: 'Burger King', orderCount: 134, revenue: 4567.80 },
        { id: '3', name: 'Sushi Master', orderCount: 98, revenue: 3456.70 },
      ],
    };
  }
);

export const fetchOrders = createAsyncThunk(
  'dashboard/fetchOrders',
  async () => {
    // Mock data for now
    return [
      {
        id: '1',
        customerId: 'c1',
        customerName: 'John Doe',
        restaurantId: 'r1',
        restaurantName: 'Pizza Palace',
        items: [
          { id: 'i1', name: 'Margherita Pizza', price: 15.99, quantity: 1 },
          { id: 'i2', name: 'Coca Cola', price: 2.99, quantity: 2 },
        ],
        total: 21.97,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        customerId: 'c2',
        customerName: 'Jane Smith',
        restaurantId: 'r2',
        restaurantName: 'Burger King',
        items: [
          { id: 'i3', name: 'Whopper', price: 8.99, quantity: 1 },
        ],
        total: 8.99,
        status: 'delivered' as const,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        deliveryPartnerId: 'dp1',
        deliveryPartnerName: 'Mike Johnson',
      },
    ];
  }
);

export const fetchRestaurants = createAsyncThunk(
  'dashboard/fetchRestaurants',
  async () => {
    // Mock data for now
    return [
      {
        id: 'r1',
        name: 'Pizza Palace',
        description: 'Best pizza in town',
        image: 'https://via.placeholder.com/300x200',
        rating: 4.5,
        deliveryTime: '25-35 min',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        ownerId: 'o1',
        ownerName: 'Tony Pizza',
      },
      {
        id: 'r2',
        name: 'Burger King',
        description: 'Flame-grilled burgers',
        image: 'https://via.placeholder.com/300x200',
        rating: 4.2,
        deliveryTime: '20-30 min',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        ownerId: 'o2',
        ownerName: 'Bob Burger',
      },
    ];
  }
);

export const fetchDeliveryPartners = createAsyncThunk(
  'dashboard/fetchDeliveryPartners',
  async () => {
    // Mock data for now
    return [
      {
        id: 'dp1',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1234567890',
        vehicleType: 'Motorcycle',
        licenseNumber: 'DL123456',
        status: 'active' as const,
        rating: 4.8,
        totalDeliveries: 156,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'dp2',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+1234567891',
        vehicleType: 'Car',
        licenseNumber: 'DL123457',
        status: 'active' as const,
        rating: 4.6,
        totalDeliveries: 134,
        createdAt: new Date().toISOString(),
      },
    ];
  }
);

export const fetchCustomers = createAsyncThunk(
  'dashboard/fetchCustomers',
  async () => {
    // Mock data for now
    return [
      {
        id: 'c1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567892',
        totalOrders: 23,
        totalSpent: 456.78,
        createdAt: new Date().toISOString(),
        status: 'active' as const,
      },
      {
        id: 'c2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567893',
        totalOrders: 18,
        totalSpent: 234.56,
        createdAt: new Date().toISOString(),
        status: 'active' as const,
      },
    ];
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: initialDashboardState,
  reducers: {
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const order = state.orders.find(o => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
    },
    updateRestaurantStatus: (state, action: PayloadAction<{ restaurantId: string; status: Restaurant['status'] }>) => {
      const restaurant = state.restaurants.find(r => r.id === action.payload.restaurantId);
      if (restaurant) {
        restaurant.status = action.payload.status;
      }
    },
    updateDeliveryPartnerStatus: (state, action: PayloadAction<{ partnerId: string; status: DeliveryPartner['status'] }>) => {
      const partner = state.deliveryPartners.find(dp => dp.id === action.payload.partnerId);
      if (partner) {
        partner.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stats';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.restaurants = action.payload;
      })
      .addCase(fetchDeliveryPartners.fulfilled, (state, action) => {
        state.deliveryPartners = action.payload;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export const { updateOrderStatus, updateRestaurantStatus, updateDeliveryPartnerStatus } = dashboardSlice.actions;

export { authSlice, dashboardSlice };

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface DeliveryPartner {
  id: string;
  email: string;
  name: string;
  phone: string;
  vehicleType: string;
  licenseNumber: string;
}

export interface DeliveryTask {
  id: string;
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  customerAddress: string;
  customerPhone: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered';
  createdAt: string;
  estimatedDeliveryTime: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

// Auth slice
interface AuthState {
  isAuthenticated: boolean;
  deliveryPartner: DeliveryPartner | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  deliveryPartner: null,
  token: null,
  loading: false,
  error: null,
};

// Auth async thunks
export const loginDeliveryPartner = createAsyncThunk(
  'auth/loginDeliveryPartner',
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
    await AsyncStorage.setItem('delivery_token', data.token);
    await AsyncStorage.setItem('delivery_partner', JSON.stringify(data.user));
    return data;
  }
);

export const checkDeliveryAuthStatus = createAsyncThunk(
  'auth/checkDeliveryStatus',
  async () => {
    const token = await AsyncStorage.getItem('delivery_token');
    const deliveryPartner = await AsyncStorage.getItem('delivery_partner');
    
    if (token && deliveryPartner) {
      return { token, deliveryPartner: JSON.parse(deliveryPartner) };
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
      state.deliveryPartner = null;
      state.token = null;
      AsyncStorage.removeItem('delivery_token');
      AsyncStorage.removeItem('delivery_partner');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginDeliveryPartner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginDeliveryPartner.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.deliveryPartner = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginDeliveryPartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(checkDeliveryAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.deliveryPartner = action.payload.deliveryPartner;
        state.token = action.payload.token;
      });
  },
});

// Tasks slice
interface TasksState {
  availableTasks: DeliveryTask[];
  currentTask: DeliveryTask | null;
  completedTasks: DeliveryTask[];
  loading: boolean;
  error: string | null;
}

const initialTasksState: TasksState = {
  availableTasks: [],
  currentTask: null,
  completedTasks: [],
  loading: false,
  error: null,
};

export const acceptTask = createAsyncThunk(
  'tasks/acceptTask',
  async (taskId: string, { getState }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token;
    
    const response = await fetch(`http://localhost:3003/delivery/tasks/${taskId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to accept task');
    }

    return await response.json();
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ taskId, status }: { taskId: string; status: string }, { getState }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token;
    
    const response = await fetch(`http://localhost:3003/delivery/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task status');
    }

    return await response.json();
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: initialTasksState,
  reducers: {
    addAvailableTask: (state, action: PayloadAction<DeliveryTask>) => {
      state.availableTasks.push(action.payload);
    },
    removeAvailableTask: (state, action: PayloadAction<string>) => {
      state.availableTasks = state.availableTasks.filter(task => task.id !== action.payload);
    },
    setCurrentTask: (state, action: PayloadAction<DeliveryTask>) => {
      state.currentTask = action.payload;
    },
    completeTask: (state, action: PayloadAction<string>) => {
      const task = state.currentTask;
      if (task && task.id === action.payload) {
        state.completedTasks.push({ ...task, status: 'delivered' });
        state.currentTask = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(acceptTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
        state.availableTasks = state.availableTasks.filter(task => task.id !== action.payload.id);
      })
      .addCase(acceptTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to accept task';
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        if (state.currentTask && state.currentTask.id === action.payload.id) {
          state.currentTask.status = action.payload.status;
        }
      });
  },
});

// Location slice
interface LocationState {
  currentLocation: Location | null;
  isTracking: boolean;
}

const initialLocationState: LocationState = {
  currentLocation: null,
  isTracking: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState: initialLocationState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
    },
    startTracking: (state) => {
      state.isTracking = true;
    },
    stopTracking: (state) => {
      state.isTracking = false;
    },
  },
});

export const { logout, clearError } = authSlice.actions;
export const { addAvailableTask, removeAvailableTask, setCurrentTask, completeTask } = tasksSlice.actions;
export const { setCurrentLocation, startTracking, stopTracking } = locationSlice.actions;

export { authSlice, tasksSlice, locationSlice };

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DeliveryTask {
  id: string;
  orderId: string;
  restaurantName: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  items: any[];
  total: number;
  createdAt: string;
}

interface AuthState {
  token: string | null;
  deliveryPartner: any | null;
  setAuth: (token: string, partner: any) => void;
  logout: () => void;
}

interface TaskState {
  currentTask: DeliveryTask | null;
  availableTasks: DeliveryTask[];
  setCurrentTask: (task: DeliveryTask | null) => void;
  addAvailableTask: (task: DeliveryTask) => void;
  setAvailableTasks: (tasks: DeliveryTask[] | ((prev: DeliveryTask[]) => DeliveryTask[])) => void;
  removeAvailableTask: (taskId: string) => void;
}

interface AvailabilityState {
  isAvailable: boolean;
  toggleAvailability: () => void;
  setAvailability: (available: boolean) => void;
}

interface EarningsState {
  totalEarnings: number;
  todayEarnings: number;
  completedDeliveries: number;
  updateEarnings: (earnings: { total: number; today: number; deliveries: number }) => void;
  addEarning: (amount: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      deliveryPartner: null,
      setAuth: (token, partner) => set({ token, deliveryPartner: partner }),
      logout: () => set({ token: null, deliveryPartner: null }),
    }),
    {
      name: 'delivery-auth',
    }
  )
);

export const useTaskStore = create<TaskState>()((set) => ({
  currentTask: null,
  availableTasks: [],
  setCurrentTask: (task) => set({ currentTask: task }),
  addAvailableTask: (task) =>
    set((state) => ({
      availableTasks: [task, ...state.availableTasks],
    })),
  setAvailableTasks: (tasks) => set((state) => ({
    availableTasks: typeof tasks === 'function' ? tasks(state.availableTasks) : tasks,
  })),
  removeAvailableTask: (taskId) =>
    set((state) => ({
      availableTasks: state.availableTasks.filter((t) => t.id !== taskId),
    })),
}));

export const useAvailabilityStore = create<AvailabilityState>()(
  persist(
    (set) => ({
      isAvailable: true,
      toggleAvailability: () => set((state) => ({ isAvailable: !state.isAvailable })),
      setAvailability: (available) => set({ isAvailable: available }),
    }),
    {
      name: 'delivery-availability',
    }
  )
);

export const useEarningsStore = create<EarningsState>()(
  persist(
    (set) => ({
      totalEarnings: 0,
      todayEarnings: 0,
      completedDeliveries: 0,
      updateEarnings: (earnings) => set({
        totalEarnings: earnings.total,
        todayEarnings: earnings.today,
        completedDeliveries: earnings.deliveries,
      }),
      addEarning: (amount) => set((state) => ({
        totalEarnings: state.totalEarnings + amount,
        todayEarnings: state.todayEarnings + amount,
        completedDeliveries: state.completedDeliveries + 1,
      })),
    }),
    {
      name: 'delivery-earnings',
    }
  )
);


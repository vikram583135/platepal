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

export type MissionState = 'navigate' | 'pickup' | 'delivery';

export interface SmartNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action?: string;
  timestamp: Date;
  orderId?: string;
}

export interface EarningsPrediction {
  predictedEarnings: number;
  confidence: number;
  factors: string[];
  hours: number;
  area?: string;
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

interface MissionStateStore {
  missionState: MissionState | null;
  setMissionState: (state: MissionState | null) => void;
}

interface VoiceAssistantStore {
  voiceAssistantEnabled: boolean;
  isListening: boolean;
  lastCommand: string | null;
  setVoiceAssistantEnabled: (enabled: boolean) => void;
  setIsListening: (listening: boolean) => void;
  setLastCommand: (command: string | null) => void;
}

interface MapModeStore {
  mapMode: boolean;
  setMapMode: (enabled: boolean) => void;
}

interface EarningsPredictionStore {
  earningsPrediction: EarningsPrediction | null;
  setEarningsPrediction: (prediction: EarningsPrediction | null) => void;
}

interface SmartNotificationsStore {
  smartNotifications: SmartNotification[];
  addNotification: (notification: SmartNotification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useMissionStateStore = create<MissionStateStore>()(
  persist(
    (set) => ({
      missionState: null,
      setMissionState: (state) => set({ missionState: state }),
    }),
    {
      name: 'delivery-mission-state',
    }
  )
);

export const useVoiceAssistantStore = create<VoiceAssistantStore>()(
  persist(
    (set) => ({
      voiceAssistantEnabled: false,
      isListening: false,
      lastCommand: null,
      setVoiceAssistantEnabled: (enabled) => set({ voiceAssistantEnabled: enabled }),
      setIsListening: (listening) => set({ isListening: listening }),
      setLastCommand: (command) => set({ lastCommand: command }),
    }),
    {
      name: 'delivery-voice-assistant',
    }
  )
);

export const useMapModeStore = create<MapModeStore>()(
  persist(
    (set) => ({
      mapMode: false,
      setMapMode: (enabled) => set({ mapMode: enabled }),
    }),
    {
      name: 'delivery-map-mode',
    }
  )
);

export const useEarningsPredictionStore = create<EarningsPredictionStore>()((set) => ({
  earningsPrediction: null,
  setEarningsPrediction: (prediction) => set({ earningsPrediction: prediction }),
}));

export const useSmartNotificationsStore = create<SmartNotificationsStore>()((set) => ({
  smartNotifications: [],
  addNotification: (notification) =>
    set((state) => ({
      smartNotifications: [notification, ...state.smartNotifications].slice(0, 10), // Keep last 10
    })),
  removeNotification: (id) =>
    set((state) => ({
      smartNotifications: state.smartNotifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ smartNotifications: [] }),
}));


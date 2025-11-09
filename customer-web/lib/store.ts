import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBehaviorTracker, UserPreferences } from './analytics';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image?: string;
}

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null; // Kept for backward compatibility, but no longer restricts cart
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getRestaurantIds: () => string[]; // Get all unique restaurant IDs in cart
  getItemsByRestaurant: (restaurantId: string) => CartItem[]; // Get items for a specific restaurant
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'customer-auth',
    }
  )
);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      addItem: (item) => set((state) => {
        // Allow items from multiple restaurants - no restriction
        // Check if item already exists (same id and same restaurant)
        const existingItem = state.items.find(
          i => i.id === item.id && i.restaurantId === item.restaurantId
        );
        
        if (existingItem) {
          // Update quantity if item already exists
          return {
            items: state.items.map(i =>
              i.id === item.id && i.restaurantId === item.restaurantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
            restaurantId: state.restaurantId || item.restaurantId, // Keep first or current
          };
        }
        
        // Add new item
        return {
          items: [...state.items, item],
          restaurantId: state.restaurantId || item.restaurantId, // Keep first restaurant ID for compatibility
        };
      }),
      removeItem: (itemId) => set((state) => {
        const remainingItems = state.items.filter(i => i.id !== itemId);
        const uniqueRestaurantIds = [...new Set(remainingItems.map(i => i.restaurantId))];
        return {
          items: remainingItems,
          restaurantId: uniqueRestaurantIds.length > 0 ? uniqueRestaurantIds[0] : null,
        };
      }),
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: quantity > 0
          ? state.items.map(i => i.id === itemId ? { ...i, quantity } : i)
          : state.items.filter(i => i.id !== itemId),
      })),
      clearCart: () => set({ items: [], restaurantId: null }),
      getTotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      getRestaurantIds: () => {
        const state = get();
        return [...new Set(state.items.map(item => item.restaurantId))];
      },
      getItemsByRestaurant: (restaurantId: string) => {
        const state = get();
        return state.items.filter(item => item.restaurantId === restaurantId);
      },
    }),
    {
      name: 'customer-cart',
    }
  )
);

// Favorites Store
interface FavoritesState {
  favoriteRestaurants: string[];
  toggleFavorite: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteRestaurants: [],
      toggleFavorite: (restaurantId) => set((state) => {
        const isCurrentlyFavorite = state.favoriteRestaurants.includes(restaurantId);
        return {
          favoriteRestaurants: isCurrentlyFavorite
            ? state.favoriteRestaurants.filter((id) => id !== restaurantId)
            : [...state.favoriteRestaurants, restaurantId],
        };
      }),
      isFavorite: (restaurantId) => {
        const state = get();
        return state.favoriteRestaurants.includes(restaurantId);
      },
    }),
    {
      name: 'customer-favorites',
    }
  )
);

// Behavior Store - Wrapper around analytics tracker
interface BehaviorState {
  tracker: ReturnType<typeof getBehaviorTracker>;
  preferences: UserPreferences | null;
  updatePreferences: () => void;
}

export const useBehaviorStore = create<BehaviorState>()(
  persist(
    (set, get) => ({
      tracker: getBehaviorTracker(),
      preferences: null,
      updatePreferences: () => {
        const tracker = get().tracker;
        const preferences = tracker.getPreferences();
        set({ preferences });
      },
    }),
    {
      name: 'customer-behavior',
      partialize: (state) => ({
        preferences: state.preferences,
        // Don't persist tracker, it's recreated from localStorage
      }),
    }
  )
);

// Preferences Store - User dietary and search preferences
interface PreferencesState {
  dietaryRestrictions: string[];
  allergens: string[];
  preferences: string[];
  complexRequirements: string[];
  favoriteCuisines: string[];
  priceRange: { min: number; max: number } | null;
  setDietaryRestrictions: (restrictions: string[]) => void;
  setAllergens: (allergens: string[]) => void;
  setPreferences: (prefs: string[]) => void;
  setComplexRequirements: (requirements: string[]) => void;
  setFavoriteCuisines: (cuisines: string[]) => void;
  setPriceRange: (range: { min: number; max: number } | null) => void;
  clearAll: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      dietaryRestrictions: [],
      allergens: [],
      preferences: [],
      complexRequirements: [],
      favoriteCuisines: [],
      priceRange: null,
      setDietaryRestrictions: (restrictions) => set({ dietaryRestrictions: restrictions }),
      setAllergens: (allergens) => set({ allergens }),
      setPreferences: (prefs) => set({ preferences: prefs }),
      setComplexRequirements: (requirements) => set({ complexRequirements: requirements }),
      setFavoriteCuisines: (cuisines) => set({ favoriteCuisines: cuisines }),
      setPriceRange: (range) => set({ priceRange: range }),
      clearAll: () => set({
        dietaryRestrictions: [],
        allergens: [],
        preferences: [],
        complexRequirements: [],
        favoriteCuisines: [],
        priceRange: null,
      }),
    }),
    {
      name: 'customer-preferences',
    }
  )
);

// Recommendations Store - Cached AI recommendations
interface RecommendationsState {
  recommendations: any;
  lastUpdated: number | null;
  setRecommendations: (recommendations: any) => void;
  clearRecommendations: () => void;
  isStale: () => boolean;
}

const RECOMMENDATIONS_TTL = 30 * 60 * 1000; // 30 minutes

export const useRecommendationsStore = create<RecommendationsState>()(
  (set, get) => ({
    recommendations: null,
    lastUpdated: null,
    setRecommendations: (recommendations) => set({
      recommendations,
      lastUpdated: Date.now(),
    }),
    clearRecommendations: () => set({
      recommendations: null,
      lastUpdated: null,
    }),
    isStale: () => {
      const state = get();
      if (!state.lastUpdated) return true;
      return Date.now() - state.lastUpdated > RECOMMENDATIONS_TTL;
    },
  })
);


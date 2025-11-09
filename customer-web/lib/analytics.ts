/**
 * User Behavior Tracking and Analytics
 * Tracks user interactions, preferences, and patterns for personalization
 */

export interface UserBehaviorData {
  views: Array<{
    type: 'restaurant' | 'menu_item' | 'category';
    id: string;
    name: string;
    timestamp: number;
    metadata?: any;
  }>;
  orders: Array<{
    orderId: string;
    restaurantId: string;
    restaurantName: string;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    total: number;
    timestamp: number;
  }>;
  searches: Array<{
    query: string;
    results: number;
    timestamp: number;
  }>;
  cartInteractions: Array<{
    action: 'add' | 'remove' | 'update';
    itemId: string;
    itemName: string;
    quantity: number;
    timestamp: number;
  }>;
  timePatterns: {
    [hour: number]: number; // Hour of day -> count of interactions
  };
}

export interface UserPreferences {
  favoriteCuisines: string[];
  dietaryRestrictions: string[];
  priceRange: { min: number; max: number } | null;
  preferredRestaurants: string[];
  frequentlyOrderedItems: Array<{ id: string; name: string; count: number }>;
  averageOrderValue: number;
  lastActiveTime: number;
}

class BehaviorTracker {
  private data: UserBehaviorData;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): UserBehaviorData {
    if (typeof window === 'undefined') {
      return this.getEmptyData();
    }

    try {
      const stored = localStorage.getItem('user-behavior-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old data if needed
        return {
          views: parsed.views || [],
          orders: parsed.orders || [],
          searches: parsed.searches || [],
          cartInteractions: parsed.cartInteractions || [],
          timePatterns: parsed.timePatterns || {},
        };
      }
    } catch (error) {
      console.error('Failed to load behavior data:', error);
    }

    return this.getEmptyData();
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('user-behavior-data', JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save behavior data:', error);
    }
  }

  private getEmptyData(): UserBehaviorData {
    return {
      views: [],
      orders: [],
      searches: [],
      cartInteractions: [],
      timePatterns: {},
    };
  }

  /**
   * Track a view event
   */
  trackView(
    type: 'restaurant' | 'menu_item' | 'category',
    id: string,
    name: string,
    metadata?: any
  ): void {
    const view = {
      type,
      id,
      name,
      timestamp: Date.now(),
      metadata,
    };

    this.data.views.push(view);
    
    // Track time pattern
    const hour = new Date().getHours();
    this.data.timePatterns[hour] = (this.data.timePatterns[hour] || 0) + 1;

    // Keep only last 1000 views
    if (this.data.views.length > 1000) {
      this.data.views = this.data.views.slice(-1000);
    }

    this.saveToStorage();
  }

  /**
   * Track an order
   */
  trackOrder(
    orderId: string,
    restaurantId: string,
    restaurantName: string,
    items: Array<{ id: string; name: string; price: number; quantity: number }>,
    total: number
  ): void {
    const order = {
      orderId,
      restaurantId,
      restaurantName,
      items,
      total,
      timestamp: Date.now(),
    };

    this.data.orders.push(order);

    // Keep only last 100 orders
    if (this.data.orders.length > 100) {
      this.data.orders = this.data.orders.slice(-100);
    }

    this.saveToStorage();
  }

  /**
   * Track a search query
   */
  trackSearch(query: string, results: number): void {
    const search = {
      query,
      results,
      timestamp: Date.now(),
    };

    this.data.searches.push(search);

    // Keep only last 500 searches
    if (this.data.searches.length > 500) {
      this.data.searches = this.data.searches.slice(-500);
    }

    this.saveToStorage();
  }

  /**
   * Track cart interactions
   */
  trackCartInteraction(
    action: 'add' | 'remove' | 'update',
    itemId: string,
    itemName: string,
    quantity: number
  ): void {
    const interaction = {
      action,
      itemId,
      itemName,
      quantity,
      timestamp: Date.now(),
    };

    this.data.cartInteractions.push(interaction);

    // Keep only last 500 interactions
    if (this.data.cartInteractions.length > 500) {
      this.data.cartInteractions = this.data.cartInteractions.slice(-500);
    }

    this.saveToStorage();
  }

  /**
   * Get user preferences based on tracked behavior
   */
  getPreferences(): UserPreferences {
    const preferences: UserPreferences = {
      favoriteCuisines: [],
      dietaryRestrictions: [],
      priceRange: null,
      preferredRestaurants: [],
      frequentlyOrderedItems: [],
      averageOrderValue: 0,
      lastActiveTime: Date.now(),
    };

    // Analyze orders
    if (this.data.orders.length > 0) {
      const orderTotals = this.data.orders.map(o => o.total);
      preferences.averageOrderValue = 
        orderTotals.reduce((sum, total) => sum + total, 0) / orderTotals.length;

      // Find frequently ordered items
      const itemCounts: { [key: string]: { name: string; count: number } } = {};
      this.data.orders.forEach(order => {
        order.items.forEach(item => {
          if (!itemCounts[item.id]) {
            itemCounts[item.id] = { name: item.name, count: 0 };
          }
          itemCounts[item.id].count += item.quantity;
        });
      });

      preferences.frequentlyOrderedItems = Object.entries(itemCounts)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Find preferred restaurants
      const restaurantCounts: { [key: string]: number } = {};
      this.data.orders.forEach(order => {
        restaurantCounts[order.restaurantId] = (restaurantCounts[order.restaurantId] || 0) + 1;
      });

      preferences.preferredRestaurants = Object.entries(restaurantCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);
    }

    // Analyze views
    const viewCounts: { [key: string]: number } = {};
    this.data.views.forEach(view => {
      if (view.type === 'restaurant') {
        viewCounts[view.id] = (viewCounts[view.id] || 0) + 1;
      }
    });

    // Price range from orders
    if (this.data.orders.length > 0) {
      const totals = this.data.orders.map(o => o.total);
      const min = Math.min(...totals);
      const max = Math.max(...totals);
      preferences.priceRange = { min, max };
    }

    preferences.lastActiveTime = Date.now();

    return preferences;
  }

  /**
   * Get all behavior data
   */
  getData(): UserBehaviorData {
    return { ...this.data };
  }

  /**
   * Clear all tracked data
   */
  clear(): void {
    this.data = this.getEmptyData();
    this.saveToStorage();
  }

  /**
   * Get order history for analysis
   */
  getOrderHistory(): UserBehaviorData['orders'] {
    return [...this.data.orders];
  }

  /**
   * Get most viewed items
   */
  getMostViewedItems(limit: number = 10): Array<{ id: string; name: string; count: number }> {
    const viewCounts: { [key: string]: { name: string; count: number } } = {};
    
    this.data.views.forEach(view => {
      if (view.type === 'menu_item') {
        if (!viewCounts[view.id]) {
          viewCounts[view.id] = { name: view.name, count: 0 };
        }
        viewCounts[view.id].count++;
      }
    });

    return Object.entries(viewCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get time-based activity patterns
   */
  getTimePatterns(): { [hour: number]: number } {
    return { ...this.data.timePatterns };
  }
}

// Singleton instance
let trackerInstance: BehaviorTracker | null = null;

export function getBehaviorTracker(): BehaviorTracker {
  if (!trackerInstance) {
    trackerInstance = new BehaviorTracker();
  }
  return trackerInstance;
}


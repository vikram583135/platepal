/**
 * Client-side caching utility for API responses
 * Uses localStorage for persistent caching
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class CacheManager {
  private prefix = 'platepal_cache_';

  /**
   * Set cache data with expiration
   * @param key Cache key
   * @param data Data to cache
   * @param expiresIn Expiration time in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresIn,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to set cache:', error);
    }
  }

  /**
   * Get cached data if not expired
   * @param key Cache key
   * @returns Cached data or null if expired/not found
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      const now = Date.now();
      
      // Check if expired
      if (now - cacheItem.timestamp > cacheItem.expiresIn) {
        this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to get cache:', error);
      return null;
    }
  }

  /**
   * Remove specific cache item
   * @param key Cache key
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('Failed to remove cache:', error);
    }
  }

  /**
   * Clear all cache items
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Get or fetch data with caching
   * @param key Cache key
   * @param fetchFn Function to fetch data if not cached
   * @param expiresIn Expiration time in milliseconds
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    expiresIn?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    const data = await fetchFn();
    this.set(key, data, expiresIn);
    return data;
  }
}

// Export singleton instance
export const cache = new CacheManager();

// Cache keys constants
export const CACHE_KEYS = {
  RESTAURANTS: 'restaurants',
  MENU: (restaurantId: string) => `menu_${restaurantId}`,
  ORDERS: 'user_orders',
  PROFILE: 'user_profile',
  REWARDS: 'user_rewards',
  ADDRESSES: 'user_addresses',
};

// Cache durations
export const CACHE_DURATION = {
  SHORT: 2 * 60 * 1000, // 2 minutes
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
};


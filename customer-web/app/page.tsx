'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, Restaurant } from '@/lib/api';
import { useAuthStore, useCartStore } from '@/lib/store';
import RestaurantCard from '@/components/RestaurantCard';
import MobileNav from '@/components/MobileNav';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import ForYouHub from '@/components/ForYouHub';
import ConversationalSearch from '@/components/ConversationalSearch';
import RestaurantFilters from '@/components/RestaurantFilters';
import { useBehaviorStore } from '@/lib/store';
import { LogOut, RefreshCw, Store } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, token, logout } = useAuthStore();
  const { addItem } = useCartStore();
  const { tracker } = useBehaviorStore();
  const router = useRouter();

  useEffect(() => {
    loadRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search filtering with conversational search
  const handleConversationalSearch = (query: string, parsedFilters?: any) => {
    setSearchQuery(query);
    
    // Track search
    tracker.trackSearch(query, restaurants.length);
    
    // Apply filters if provided
    let filtered = restaurants;
    
    if (parsedFilters) {
      if (parsedFilters.cuisines.length > 0) {
        // Filter by cuisine (mock - would need actual cuisine data)
        filtered = filtered.filter((r) => {
          const desc = r.description?.toLowerCase() || '';
          return parsedFilters.cuisines.some((c: string) => 
            desc.includes(c.toLowerCase())
          );
        });
      }
      
      if (parsedFilters.dietaryRestrictions.length > 0) {
        // Filter by dietary (mock - would need actual dietary data)
      }
      
      if (parsedFilters.priceRange) {
        // Filter by price (mock - would need actual price data)
      }
      
      if (parsedFilters.keywords.length > 0) {
        filtered = filtered.filter((r) =>
          parsedFilters.keywords.some((keyword: string) =>
            r.name.toLowerCase().includes(keyword.toLowerCase()) ||
            r.description?.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      }
    } else {
      // Simple text search
      filtered = restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    setFilteredRestaurants(filtered);
  };
  
  const searchedRestaurants = useMemo(() => {
    if (!searchQuery) return restaurants;
    return filteredRestaurants;
  }, [searchQuery, filteredRestaurants, restaurants]);

  const loadRestaurants = async (retries = 3) => {
    try {
      setLoading(true);
      const data = await apiService.getRestaurants();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid restaurant data received');
      }
      
      if (data.length === 0) {
        toast.info('No restaurants available at the moment');
      }
      
      setRestaurants(data);
      setFilteredRestaurants(data);
    } catch (error: any) {
      console.error('Error loading restaurants:', error);
      if (retries > 0) {
        // Retry with exponential backoff
        setTimeout(() => loadRestaurants(retries - 1), 1000 * (4 - retries));
      } else {
        toast.error(error.response?.data?.message || 'Failed to load restaurants. Please try again later.');
        setRestaurants([]);
        setFilteredRestaurants([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadRestaurants();
    setIsRefreshing(false);
    toast.success('Restaurants updated!');
  }, []);

  // Initialize filtered restaurants when searched restaurants change
  useEffect(() => {
    if (searchedRestaurants.length > 0) {
      setFilteredRestaurants(searchedRestaurants);
    }
  }, [searchedRestaurants]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleAddRecommendationToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
      image: item.image,
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-floating max-w-md w-full animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <Store size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-text-primary mb-2">Welcome to PlatePal</h1>
            <p className="text-neutral-text-secondary">Order delicious food from your favorite restaurants</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full gradient-primary text-white py-3 rounded-lg font-semibold active:scale-95 transition-transform touch-target ripple shadow-md hover-lift"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/register')}
              className="w-full border-2 border-primary text-primary py-3 rounded-lg font-semibold active:scale-95 transition-transform touch-target hover:bg-primary-light"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-background pb-20">
      {/* Header */}
      <div className="gradient-primary text-white p-4 sticky top-0 z-40 shadow-elevated">
        <div className="flex items-center justify-between mb-3 animate-slide-down">
          <div>
            <h1 className="text-2xl font-bold">PlatePal</h1>
            <p className="text-sm opacity-90">Hello, {user?.name || 'Guest'} 👋</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-full active:scale-95 transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Conversational Search */}
        <div className="animate-slide-down">
          <ConversationalSearch
            onSearch={handleConversationalSearch}
            restaurants={restaurants}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Pull to Refresh Indicator */}
        {isRefreshing && (
          <div className="flex items-center justify-center py-2 text-white/80 animate-slide-down">
            <RefreshCw size={18} className="animate-spin mr-2" />
            <span className="text-sm">Refreshing...</span>
          </div>
        )}

        {/* For You Hub - Only show when not searching */}
        {!searchQuery && !loading && (
          <ForYouHub onAddToCart={handleAddRecommendationToCart} />
        )}

        {/* Filters and Sort - Only show when not searching or when we have restaurants */}
        {!loading && searchedRestaurants.length > 0 && (
          <RestaurantFilters
            restaurants={searchedRestaurants}
            onFilterChange={setFilteredRestaurants}
            onSortChange={setFilteredRestaurants}
          />
        )}

        {/* Restaurants Section Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-neutral-text-primary">
              {searchQuery ? 'Search Results' : 'Restaurants Near You'}
            </h2>
            <p className="text-sm text-neutral-text-secondary mt-1">
              {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 text-primary hover:bg-primary-light rounded-full active:scale-95 transition-all"
            disabled={loading || isRefreshing}
            title="Refresh restaurants"
          >
            <RefreshCw size={20} className={loading || isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Restaurant List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <EmptyState
            icon={<Store size={64} />}
            title={searchQuery ? 'No restaurants found' : 'No restaurants available'}
            description={
              searchQuery
                ? `We couldn't find any restaurants matching "${searchQuery}". Try a different search.`
                : 'Check back later for available restaurants in your area.'
            }
            action={
              searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="gradient-primary text-white px-6 py-3 rounded-lg font-semibold shadow-md hover-lift"
                >
                  Clear Search
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredRestaurants.map((restaurant, index) => (
              <div key={restaurant.id} style={{ animationDelay: `${index * 50}ms` }}>
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}


'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, Restaurant } from '@/lib/api';
import { useAuthStore, useCartStore } from '@/lib/store';
import RestaurantCard from '@/components/RestaurantCard';
import MobileNav from '@/components/MobileNav';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import RecommendationsCarousel from '@/components/RecommendationsCarousel';
import RestaurantFilters from '@/components/RestaurantFilters';
import { LogOut, RefreshCw, Search, Store, X } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, token, logout } = useAuthStore();
  const { addItem } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    loadRestaurants();
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.length > 0) {
      const suggestions = restaurants
        .filter((r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .map((r) => r.name);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, restaurants]);

  // Search filtering
  const searchedRestaurants = useMemo(() => {
    if (!searchQuery) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, restaurants]);

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

        {/* Enhanced Search Bar with Autocomplete */}
        <div className="relative animate-slide-down">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80 z-10" size={20} />
          <input
            type="text"
            placeholder="Search restaurants, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-10 pr-10 py-3 rounded-md text-neutral-text-primary bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white focus:bg-white shadow-md transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-text-secondary hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
          
          {/* Autocomplete Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-elevated border border-neutral-border max-h-60 overflow-y-auto z-50 animate-slide-down">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-primary-light transition-colors border-b border-neutral-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Search size={16} className="text-neutral-text-secondary" />
                    <span className="text-neutral-text-primary">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
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

        {/* Recommendations Carousel - Only show when not searching */}
        {!searchQuery && !loading && (
          <RecommendationsCarousel onAddToCart={handleAddRecommendationToCart} />
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


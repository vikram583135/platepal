'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService, MenuItem, Restaurant } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import MenuItemCard from '@/components/MenuItemCard';
import { SkeletonMenuCard } from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import IntelligentDietaryFilter, { DietaryFilters } from '@/components/IntelligentDietaryFilter';
import { ArrowLeft, ShoppingCart, Search, Star, Clock, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { getImageUrl, getRestaurantImage } from '@/lib/images';

export default function MenuPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilters>({
    dietaryRestrictions: [],
    allergens: [],
    preferences: [],
    complexRequirements: [],
  });
  
  const { addItem, items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const loadMenu = async (retries = 3) => {
    try {
      setLoading(true);
      const [restaurants, menuData] = await Promise.all([
        apiService.getRestaurants(),
        apiService.getRestaurantMenu(restaurantId),
      ]);
      
      const currentRestaurant = restaurants.find((r) => r.id === restaurantId);
      
      if (!currentRestaurant) {
        toast.error('Restaurant not found');
        setRestaurant(null);
        return;
      }
      
      if (!menuData || !menuData.items || !Array.isArray(menuData.items)) {
        throw new Error('Invalid menu data received');
      }
      
      setRestaurant(currentRestaurant);
      setMenuItems(menuData.items);
      
      if (menuData.items.length === 0) {
        toast.info('No menu items available for this restaurant');
      }
    } catch (error: any) {
      console.error('Error loading menu:', error);
      if (retries > 0) {
        // Retry with exponential backoff
        setTimeout(() => loadMenu(retries - 1), 1000 * (4 - retries));
      } else {
        toast.error(error.response?.data?.message || 'Failed to load menu. Please try again later.');
        setMenuItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
    
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      image: item.image,
    });
  };

  const categories = ['All', ...Array.from(new Set(menuItems.map((item) => item.category)))];
  
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply dietary filters (mock - would need actual dietary data on items)
    const matchesDietary = true; // Placeholder - implement based on item dietary attributes
    
    return matchesCategory && matchesSearch && matchesDietary;
  });

  if (!loading && !restaurant) {
    return (
      <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
        <EmptyState
          icon={<UtensilsCrossed size={64} />}
          title="Restaurant not found"
          description="We couldn't find this restaurant. It may have been removed or is temporarily unavailable."
          action={
            <button
              onClick={() => router.push('/')}
              className="gradient-primary text-white px-6 py-3 rounded-md font-semibold shadow-md hover-lift"
            >
              Browse Restaurants
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-background pb-20">
      {/* Header with Restaurant Info */}
      <div className="bg-white shadow-elevated sticky top-0 z-40">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 animate-slide-down">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-primary-light rounded-full active:scale-95 transition-all"
          >
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-lg font-bold text-neutral-text-primary flex-1 text-center px-4 truncate">
            {loading ? 'Loading...' : restaurant?.name}
          </h1>
          <button
            onClick={() => router.push('/cart')}
            className="p-2 hover:bg-primary-light rounded-full relative active:scale-95 transition-all"
          >
            <ShoppingCart size={24} className="text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 gradient-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md animate-bounce-once">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Restaurant Info Banner */}
        {!loading && restaurant && (
          <div className="px-4 pb-3 animate-fade-in">
            <div className="flex gap-3 items-center">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={getImageUrl(
                    restaurant.image,
                    () => getRestaurantImage(restaurant.name, restaurant.description)
                  )}
                  alt={restaurant.name}
                  fill
                  className="object-cover rounded-md"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Star size={14} className="text-accent fill-accent" />
                  <span className="text-sm font-semibold text-neutral-text-primary">
                    {restaurant.rating ? restaurant.rating.toFixed(1) : '4.5'}
                  </span>
                  <span className="text-xs text-neutral-text-secondary">(200+ ratings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-neutral-text-secondary" />
                  <span className="text-sm text-neutral-text-secondary">
                    {restaurant.deliveryTime || '30-40 min'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {!loading && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-text-secondary" size={18} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-neutral-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all text-sm"
              />
            </div>
          </div>
        )}

        {/* Intelligent Dietary Filter */}
        {!loading && (
          <div className="px-4 pb-4">
            <IntelligentDietaryFilter onFilterChange={setDietaryFilters} />
          </div>
        )}

        {/* Categories */}
        {!loading && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all animate-slide-up ${
                  selectedCategory === category
                    ? 'gradient-primary text-white shadow-md'
                    : 'bg-secondary-light text-secondary hover:bg-secondary hover:text-white'
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-3">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonMenuCard key={i} />
            ))}
          </>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<Search size={64} />}
            title={searchQuery ? 'No items found' : 'No items in this category'}
            description={
              searchQuery
                ? `We couldn't find any items matching "${searchQuery}".`
                : 'Try selecting a different category.'
            }
            action={
              searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="gradient-primary text-white px-6 py-3 rounded-md font-semibold shadow-md hover-lift"
                >
                  Clear Search
                </button>
              ) : undefined
            }
          />
        ) : (
          filteredItems.map((item, index) => (
            <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
              <MenuItemCard
                item={item}
                restaurantId={restaurant?.id || ''}
                restaurantName={restaurant?.name || ''}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}


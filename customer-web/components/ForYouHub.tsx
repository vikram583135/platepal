'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore, useBehaviorStore, useRecommendationsStore } from '@/lib/store';
import { apiService, Restaurant, MenuItem } from '@/lib/api';
import { generatePersonalizedRecommendations } from '@/lib/ai-service';
import PersonalizedSection from './PersonalizedSection';
import RecommendationCard from './RecommendationCard';
import SkeletonCard from './SkeletonCard';
import { format } from 'date-fns';

interface RecommendedItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantName: string;
  restaurantId: string;
  reason: string;
}

interface RecommendationSection {
  title: string;
  reason: string;
  items: RecommendedItem[];
}

interface ForYouHubProps {
  onAddToCart?: (item: RecommendedItem) => void;
}

export default function ForYouHub({ onAddToCart }: ForYouHubProps) {
  const { user, token } = useAuthStore();
  const { tracker, preferences, updatePreferences } = useBehaviorStore();
  const { recommendations, setRecommendations, isStale } = useRecommendationsStore();
  
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [sections, setSections] = useState<RecommendationSection[]>([]);

  // Get time-based greeting
  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return { greeting: 'Good Morning', period: 'breakfast' };
    if (hour >= 11 && hour < 15) return { greeting: 'Good Afternoon', period: 'lunch' };
    if (hour >= 15 && hour < 21) return { greeting: 'Good Evening', period: 'dinner' };
    return { greeting: 'Late Night', period: 'late-night' };
  }, []);

  // Load data
  useEffect(() => {
    loadData();
    updatePreferences();
  }, [token, user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load restaurants
      const restaurantsData = await apiService.getRestaurants();
      setRestaurants(restaurantsData);

      // Load all menu items (for recommendations)
      const allMenuItems: MenuItem[] = [];
      for (const restaurant of restaurantsData.slice(0, 10)) {
        try {
          const menuData = await apiService.getRestaurantMenu(restaurant.id);
          if (menuData.items) {
            menuData.items.forEach((item: MenuItem) => {
              allMenuItems.push({
                ...item,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                image: item.image || '',
              } as any);
            });
          }
        } catch (error) {
          console.warn(`Failed to load menu for ${restaurant.id}:`, error);
        }
      }
      setMenuItems(allMenuItems);

      // Load order history if user is logged in
      if (token && user?.id) {
        try {
          const orders = await apiService.getAllOrders(token);
          setOrderHistory(orders);
          
          // Track orders in behavior tracker
          orders.forEach((order: any) => {
            tracker.trackOrder(
              order.id,
              order.restaurantId || '',
              order.restaurantName || '',
              order.items || [],
              order.total || 0
            );
          });
        } catch (error) {
          console.warn('Failed to load order history:', error);
        }
      }

      // Generate recommendations
      await generateRecommendations(restaurantsData, allMenuItems, orderHistory);
    } catch (error) {
      console.error('Failed to load For You Hub data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (
    restaurantsData: Restaurant[],
    items: MenuItem[],
    orders: any[]
  ) => {
    // Check cache first
    if (!isStale() && recommendations) {
      setSections(recommendations.sections || []);
      return;
    }

    try {
      const behaviorData = tracker.getData();
      const userId = user?.id || null;

      const result = await generatePersonalizedRecommendations(
        userId,
        behaviorData,
        restaurantsData,
        items,
        orders
      );

      // Transform sections for display
      const transformedSections: RecommendationSection[] = result.sections.map((section: any) => ({
        title: section.title,
        reason: section.reason,
        items: section.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image || '',
          restaurantName: item.restaurantName,
          restaurantId: item.restaurantId,
          reason: item.reason || 'Recommended for you',
        })),
      }));

      setSections(transformedSections);
      setRecommendations({ sections: transformedSections });
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      // Fallback to empty sections
      setSections([]);
    }
  };

  const handleAddToCart = (item: RecommendedItem) => {
    if (onAddToCart) {
      onAddToCart(item);
    }

    // Track cart interaction
    tracker.trackCartInteraction('add', item.id, item.name, 1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-8 bg-neutral-background rounded animate-pulse" />
            <div className="flex gap-3 overflow-x-auto">
              {[1, 2, 3, 4].map((j) => (
                <SkeletonCard key={j} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <p className="text-neutral-text-secondary">
          {timeOfDay.greeting}! We&apos;re preparing personalized recommendations for you&hellip;
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl p-4 mb-6 animate-slide-down">
        <h2 className="text-2xl font-bold text-neutral-text-primary mb-1">
          {timeOfDay.greeting}, {user?.name || 'Food Lover'}! 👋
        </h2>
        <p className="text-sm text-neutral-text-secondary">
          Discover personalized recommendations just for you
        </p>
      </div>

      {/* Recommendation Sections */}
      {sections.map((section, sectionIndex) => {
        if (section.items.length === 0) return null;

        // Determine icon based on section title
        let icon: 'sparkles' | 'trending' | 'clock' | 'heart' | 'star' = 'sparkles';
        if (section.title.toLowerCase().includes('order')) icon = 'heart';
        else if (section.title.toLowerCase().includes('trend')) icon = 'trending';
        else if (section.title.toLowerCase().includes('time') || section.title.toLowerCase().includes('breakfast') || section.title.toLowerCase().includes('lunch') || section.title.toLowerCase().includes('dinner')) icon = 'clock';
        else if (section.title.toLowerCase().includes('popular') || section.title.toLowerCase().includes('top')) icon = 'star';

        return (
          <PersonalizedSection
            key={sectionIndex}
            title={section.title}
            reason={section.reason}
            icon={icon}
          >
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {section.items.map((item, itemIndex) => (
                <RecommendationCard
                  key={`${item.id}-${itemIndex}`}
                  item={item}
                  onAddToCart={handleAddToCart}
                  index={itemIndex}
                />
              ))}
            </div>
          </PersonalizedSection>
        );
      })}
    </div>
  );
}


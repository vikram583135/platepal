'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Plus, TrendingUp, Clock, Heart } from 'lucide-react';
import { suggestCartCompletions } from '@/lib/ai-service';
import { useCartStore, useBehaviorStore } from '@/lib/store';
import { apiService, MenuItem } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { getImageUrl, getFoodImage } from '@/lib/images';
import { toast } from 'sonner';
import Image from 'next/image';

interface Suggestion {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
  restaurantName: string;
  reason: string;
  type: 'complete-meal' | 'frequently-ordered' | 'people-also-ordered' | 'you-might-like';
}

interface PredictiveCartSuggestionsProps {
  restaurantId?: string;
}

export default function PredictiveCartSuggestions({ restaurantId }: PredictiveCartSuggestionsProps) {
  const { items, addItem } = useCartStore();
  const { tracker } = useBehaviorStore();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);

      // Load menu items from restaurants in cart
      const restaurantIds = [...new Set(items.map(i => i.restaurantId))];
      const allMenuItems: MenuItem[] = [];

      for (const rid of restaurantIds) {
        try {
          const menuData = await apiService.getRestaurantMenu(rid);
          if (menuData.items) {
            menuData.items.forEach((item: MenuItem) => {
              allMenuItems.push({
                ...item,
                restaurantId: rid,
              } as any);
            });
          }
        } catch (error) {
          console.warn(`Failed to load menu for ${rid}:`, error);
        }
      }

      setMenuItems(allMenuItems);

      // Get user history
      const orderHistory = tracker.getOrderHistory();

      // Generate AI suggestions
      const aiSuggestions = await suggestCartCompletions(
        items,
        orderHistory,
        allMenuItems
      );

      // Filter out items already in cart
      const filteredSuggestions = aiSuggestions.filter(
        (s: Suggestion) => !items.some(i => i.id === s.id && i.restaurantId === s.restaurantId)
      );

      setSuggestions(filteredSuggestions.slice(0, 6));
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      setSuggestions([]);
      return;
    }

    loadSuggestions();
  }, [items, restaurantId]);

  const handleAddSuggestion = (suggestion: Suggestion) => {
    addItem({
      id: suggestion.id,
      name: suggestion.name,
      price: suggestion.price,
      quantity: 1,
      restaurantId: suggestion.restaurantId,
      restaurantName: suggestion.restaurantName,
      image: suggestion.image,
    });

    tracker.trackCartInteraction('add', suggestion.id, suggestion.name, 1);
    toast.success(`${suggestion.name} added! 🎉`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'complete-meal':
        return <Plus size={14} />;
      case 'frequently-ordered':
        return <Heart size={14} />;
      case 'people-also-ordered':
        return <TrendingUp size={14} />;
      default:
        return <Sparkles size={14} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'complete-meal':
        return 'Complete your meal';
      case 'frequently-ordered':
        return 'You ordered this';
      case 'people-also-ordered':
        return 'People also ordered';
      default:
        return 'You might like';
    }
  };

  if (items.length === 0 || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-4 mb-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-primary" />
        <h3 className="font-bold text-neutral-text-primary">Complete Your Meal</h3>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-48 h-32 bg-neutral-background rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.id}-${index}`}
              className="flex-shrink-0 w-48 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all hover-lift group cursor-pointer"
              onClick={() => handleAddSuggestion(suggestion)}
            >
              {/* Image */}
              <div className="relative h-24">
                <Image
                  src={getImageUrl(suggestion.image, () => getFoodImage(suggestion.name))}
                  alt={suggestion.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-semibold text-primary flex items-center gap-1">
                  {getTypeIcon(suggestion.type)}
                  <span className="text-[10px]">{getTypeLabel(suggestion.type)}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-2">
                <h4 className="font-semibold text-sm text-neutral-text-primary truncate mb-1">
                  {suggestion.name}
                </h4>
                <p className="text-xs text-neutral-text-secondary line-clamp-1 mb-2">
                  {suggestion.reason}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary text-sm">
                    {formatCurrency(suggestion.price)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSuggestion(suggestion);
                    }}
                    className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


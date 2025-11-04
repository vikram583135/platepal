'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Plus, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface RecommendedItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantName: string;
  restaurantId: string;
  reason: string; // "Popular", "Based on your orders", "Trending", etc.
}

interface RecommendationsCarouselProps {
  onAddToCart?: (item: RecommendedItem) => void;
}

export default function RecommendationsCarousel({ onAddToCart }: RecommendationsCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  // Mock recommendations - in real app, this would come from API
  const recommendations: RecommendedItem[] = [
    {
      id: '1',
      name: 'Margherita Pizza',
      description: 'Classic tomato, mozzarella, and basil',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      restaurantName: 'The Italian Bistro',
      restaurantId: 'rest-1',
      reason: 'Popular in your area',
    },
    {
      id: '2',
      name: 'Chicken Tikka Masala',
      description: 'Tender chicken in creamy tomato sauce',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
      restaurantName: 'Spice Palace',
      restaurantId: 'rest-2',
      reason: 'Based on your orders',
    },
    {
      id: '3',
      name: 'Sushi Platter',
      description: 'Assorted fresh sushi and sashimi',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
      restaurantName: 'Tokyo Express',
      restaurantId: 'rest-3',
      reason: 'Trending now',
    },
    {
      id: '4',
      name: 'Classic Burger',
      description: 'Juicy beef patty with cheese and bacon',
      price: 11.99,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      restaurantName: 'Burger House',
      restaurantId: 'rest-4',
      reason: 'Top rated',
    },
    {
      id: '5',
      name: 'Pad Thai',
      description: 'Stir-fried rice noodles with shrimp',
      price: 13.99,
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
      restaurantName: 'Thai Kitchen',
      restaurantId: 'rest-5',
      reason: 'Popular today',
    },
  ];

  const handleAddToCart = (item: RecommendedItem) => {
    if (onAddToCart) {
      onAddToCart(item);
    }
    toast.success(`${item.name} added to cart! 🎉`);
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('recommendations-scroll');
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-md p-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <TrendingUp size={16} className="text-neutral-text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-text-primary">Recommended for You</h2>
            <p className="text-xs text-neutral-text-secondary">Based on your preferences</p>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
            disabled={scrollPosition <= 0}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        id="recommendations-scroll"
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendations.map((item, index) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-64 bg-neutral-background rounded-md overflow-hidden hover-lift transition-all animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Image */}
            <div className="relative h-40 group">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-110 transition-all duration-500"
                unoptimized
              />
              
              {/* Reason Badge */}
              <div className="absolute top-2 left-2 bg-accent text-neutral-text-primary text-xs font-bold px-2 py-1 rounded-full shadow-md">
                {item.reason}
              </div>

              {/* Quick Add Button */}
              <button
                onClick={() => handleAddToCart(item)}
                className="absolute bottom-2 right-2 w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-lg hover-glow active:scale-90 transition-all opacity-0 group-hover:opacity-100"
              >
                <Plus size={20} className="text-white" strokeWidth={2.5} />
              </button>
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="font-bold text-neutral-text-primary mb-1 truncate">{item.name}</h3>
              <p className="text-xs text-neutral-text-secondary mb-2 line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-text-secondary truncate">{item.restaurantName}</p>
                  <p className="font-bold text-primary">{formatCurrency(item.price)}</p>
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="text-primary text-sm font-semibold hover:text-primary-hover transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


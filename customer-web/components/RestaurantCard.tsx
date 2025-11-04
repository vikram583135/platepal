'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Star, Heart, TrendingUp, Zap, Tag } from 'lucide-react';
import { Restaurant } from '@/lib/api';
import { useState } from 'react';
import { useFavoritesStore } from '@/lib/store';
import { getImageUrl, getRestaurantImage } from '@/lib/images';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { toggleFavorite, isFavorite: checkFavorite } = useFavoritesStore();
  const isFavorite = checkFavorite(restaurant.id);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Mock data for enhanced features
  const hasDiscount = Math.random() > 0.7;
  const hasFreeDelivery = Math.random() > 0.6;
  const isNew = Math.random() > 0.8;
  const isTrending = Math.random() > 0.75;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(restaurant.id);
  };

  return (
    <Link href={`/menu/${restaurant.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover-lift touch-target transition-all duration-300 animate-slide-up border border-neutral-border/50 backdrop-blur-sm">
        <div className="relative h-40 w-full group">
          {/* Placeholder blur effect */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-secondary-light animate-pulse" />
          )}
          
          <Image
            src={getImageUrl(
              restaurant.image,
              () => getRestaurantImage(restaurant.name, restaurant.description)
            )}
            alt={restaurant.name}
            fill
            className={`object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            unoptimized
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Status overlay */}
          {restaurant.status === 'closed' && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg px-4 py-2 bg-neutral-text-primary/80 rounded-full">
                Closed
              </span>
            </div>
          )}
          
          {/* Top badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {isNew && (
              <span className="bg-status-info text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Zap size={12} />
                NEW
              </span>
            )}
            {isTrending && (
              <span className="bg-accent text-neutral-text-primary text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                <TrendingUp size={12} />
                TRENDING
              </span>
            )}
            {hasDiscount && (
              <span className="bg-status-error text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Tag size={12} />
                20% OFF
              </span>
            )}
          </div>
          
          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform active:scale-95 z-10"
          >
            <Heart
              size={18}
              className={`transition-colors ${
                isFavorite ? 'fill-status-error text-status-error' : 'text-neutral-text-secondary'
              }`}
            />
          </button>
          
          {/* Free delivery badge */}
          {hasFreeDelivery && (
            <div className="absolute bottom-2 left-2 bg-status-success text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              FREE DELIVERY
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-neutral-text-primary mb-1 group-hover:text-primary transition-colors">
                {restaurant.name}
              </h3>
              <p className="text-sm text-neutral-text-secondary truncate-2 leading-relaxed">
                {restaurant.description}
              </p>
            </div>
          </div>
          
          {/* Cuisine tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="text-xs bg-secondary-light text-secondary px-2 py-1 rounded-full">
              Italian
            </span>
            <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">
              Fast Food
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-accent fill-accent" />
                <span className="font-semibold text-neutral-text-primary">
                  {restaurant.rating ? restaurant.rating.toFixed(1) : '4.5'}
                </span>
                <span className="text-neutral-text-secondary text-xs">(200+)</span>
              </div>
              
              <div className="flex items-center gap-1 text-neutral-text-secondary">
                <Clock size={16} />
                <span className="font-medium">{restaurant.deliveryTime || '30-40 min'}</span>
              </div>
            </div>
            
            {/* Estimated delivery cost */}
            <div className="text-status-success font-bold text-sm">
              ₹{Math.floor(Math.random() * 50 + 30)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


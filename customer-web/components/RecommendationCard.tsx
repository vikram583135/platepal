'use client';

import Image from 'next/image';
import { Plus, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getImageUrl, getFoodImage } from '@/lib/images';
import { toast } from 'sonner';

interface RecommendationItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantName: string;
  restaurantId: string;
  reason: string;
}

interface RecommendationCardProps {
  item: RecommendationItem;
  onAddToCart?: (item: RecommendationItem) => void;
  index?: number;
}

export default function RecommendationCard({ item, onAddToCart, index = 0 }: RecommendationCardProps) {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(item);
    }
    toast.success(`${item.name} added to cart! 🎉`, {
      position: 'bottom-center',
    });
  };

  const imageUrl = getImageUrl(item.image, () => getFoodImage(item.name));

  return (
    <div
      className="flex-shrink-0 w-64 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 animate-slide-up hover-lift group cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={handleAddToCart}
    >
      {/* Image */}
      <div className="relative h-40 group-hover:scale-105 transition-transform duration-500">
        <Image
          src={imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          unoptimized
        />
        
        {/* Reason Badge with AI sparkle icon */}
        <div className="absolute top-2 left-2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-sm">
          <Sparkles size={12} className="animate-pulse" />
          <span>{item.reason}</span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          className="absolute bottom-2 right-2 w-11 h-11 gradient-primary rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-10"
          aria-label={`Add ${item.name} to cart`}
        >
          <Plus size={20} className="text-white" strokeWidth={2.5} />
        </button>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-bold text-neutral-text-primary mb-1 truncate text-base">
          {item.name}
        </h3>
        <p className="text-xs text-neutral-text-secondary mb-2 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-text-secondary truncate mb-1">
              {item.restaurantName}
            </p>
            <p className="font-bold text-primary text-lg">
              {formatCurrency(item.price)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="px-4 py-2 bg-primary-light text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all active:scale-95 text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}


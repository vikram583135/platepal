'use client';

import Image from 'next/image';
import { Plus, Minus, Flame, Leaf } from 'lucide-react';
import { MenuItem } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import { getImageUrl, getFoodImage } from '@/lib/images';

interface MenuItemCardProps {
  item: MenuItem;
  restaurantId: string;
  restaurantName: string;
  onAddToCart: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Mock badges - in real app, these would come from the API
  const isSpicy = Math.random() > 0.7;
  const isVeg = Math.random() > 0.6;
  const isPopular = Math.random() > 0.75;

  const handleAdd = () => {
    // Add item multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      onAddToCart(item);
    }
    toast.success(`${quantity}x ${item.name} added to cart 🎉`);
    setQuantity(1); // Reset quantity
  };

  const incrementQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-neutral-border/50 overflow-hidden hover-lift transition-all hover:shadow-lg">
      <div className="flex gap-3 p-3">
        <div className="relative w-28 h-28 flex-shrink-0 group">
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-secondary-light animate-pulse rounded-lg" />
          )}
          
          <Image
            src={getImageUrl(
              item.image,
              () => getFoodImage(item.name, item.category)
            )}
            alt={item.name}
            fill
            className={`object-cover rounded-lg transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            unoptimized
          />
          
          {/* Badges */}
          <div className="absolute top-1 left-1 flex flex-col gap-1">
            {isPopular && (
              <span className="bg-accent text-neutral-text-primary text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                POPULAR
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-neutral-text-primary text-sm leading-tight">{item.name}</h3>
            <div className="flex gap-1 ml-2">
              {isVeg && (
                <div className="w-5 h-5 border-2 border-status-success rounded flex items-center justify-center flex-shrink-0">
                  <Leaf size={12} className="text-status-success fill-status-success" />
                </div>
              )}
              {isSpicy && (
                <Flame size={16} className="text-status-error flex-shrink-0" />
              )}
            </div>
          </div>
          
          <p className="text-xs text-neutral-text-secondary mb-2 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary text-lg">{formatCurrency(item.price)}</span>
              
              {/* Quantity Selector & Add Button */}
              <div className="flex items-center gap-2">
                {quantity > 1 && (
                  <div className="flex items-center gap-1 bg-secondary-light rounded-full px-2 py-1 animate-scale-in">
                    <button
                      onClick={decrementQuantity}
                      className="w-6 h-6 flex items-center justify-center text-secondary hover:bg-secondary hover:text-white rounded-full transition-all active:scale-90"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold text-secondary min-w-[16px] text-center">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="w-6 h-6 flex items-center justify-center text-secondary hover:bg-secondary hover:text-white rounded-full transition-all active:scale-90"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={handleAdd}
                  className={`gradient-primary text-white rounded-full p-2 active:scale-90 transition-all touch-target shadow-md ${
                    item.available === false ? 'opacity-50 cursor-not-allowed' : 'hover-glow'
                  }`}
                  disabled={item.available === false}
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            
            {item.available === false && (
              <p className="text-xs text-status-error mt-1 font-medium">Currently unavailable</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


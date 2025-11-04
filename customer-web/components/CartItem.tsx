'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { getImageUrl, getFoodImage } from '@/lib/images';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-3 p-3 bg-white/95 backdrop-blur-sm rounded-lg border border-neutral-border/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={getImageUrl(
            item.image,
            () => getFoodImage(item.name)
          )}
          alt={item.name}
          fill
          className="object-cover rounded-lg"
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-sm font-bold text-primary mb-2">
          {formatCurrency(item.price)}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 active:scale-95 transition-transform"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-semibold">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 active:scale-95 transition-transform"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="text-red-500 p-2 hover:bg-red-50 rounded-full active:scale-95 transition-transform"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900">
          {formatCurrency(item.price * item.quantity)}
        </p>
      </div>
    </div>
  );
}


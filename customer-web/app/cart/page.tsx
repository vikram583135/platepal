'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore, useCartStore } from '@/lib/store';
import { apiService } from '@/lib/api';
import CartItem from '@/components/CartItem';
import MobileNav from '@/components/MobileNav';
import PredictiveCartSuggestions from '@/components/PredictiveCartSuggestions';
import ConversationalCart from '@/components/ConversationalCart';
import { ArrowLeft, ShoppingBag, Tag, X, MessageCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getTotal, restaurantId, getRestaurantIds, getItemsByRestaurant } = useCartStore();
  const { token } = useAuthStore();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showConversationalCart, setShowConversationalCart] = useState(false);

  const subtotal = getTotal();
  // Delivery fee in INR - ₹30 per order
  const deliveryFee = subtotal > 0 ? 30 : 0;
  
  // Group items by restaurant for better display
  const restaurantIds = getRestaurantIds();
  const itemsByRestaurant = restaurantIds.map(rid => ({
    restaurantId: rid,
    restaurantName: items.find(i => i.restaurantId === rid)?.restaurantName || 'Restaurant',
    items: getItemsByRestaurant(rid),
  }));
  const discount = appliedPromo ? appliedPromo.discount : 0;
  const tax = (subtotal - discount) * 0.08;
  const total = Math.max(0, subtotal - discount + deliveryFee + tax);

  const handleApplyPromo = () => {
    // Mock promo codes for demo
    const promoCodes: { [key: string]: number } = {
      'SAVE10': 10,
      'WELCOME20': 20,
      'FIRST15': 15,
      'FOODIE25': 25,
    };

    const upperCode = promoCode.toUpperCase();
    if (promoCodes[upperCode]) {
      setAppliedPromo({ code: upperCode, discount: promoCodes[upperCode] });
      toast.success(`Promo code "${upperCode}" applied!`);
      setShowPromoInput(false);
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    toast.info('Promo code removed');
  };

  const handlePlaceOrder = () => {
    if (!token) {
      toast.error('Please login to place an order');
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Redirect to payment page
    router.push('/payment');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-floating max-w-md w-full text-center animate-scale-in">
          <ShoppingBag size={48} className="mx-auto text-neutral-text-secondary mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-neutral-text-primary">Login Required</h2>
          <p className="text-neutral-text-secondary mb-6">Please login to view your cart</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full gradient-primary text-white py-3 rounded-md font-semibold shadow-md hover-lift"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-background pb-32">
      {/* Header */}
      <div className="bg-white shadow-elevated sticky top-0 z-40 animate-slide-down">
        <div className="flex items-center p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-primary-light rounded-full active:scale-95 transition-all"
          >
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-lg font-bold text-neutral-text-primary flex-1 text-center">
            Your Cart
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 min-h-[60vh] animate-fade-in">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={48} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-neutral-text-primary mb-2">Your cart is empty</h2>
          <p className="text-neutral-text-secondary mb-6 text-center">Add some delicious items to get started!</p>
          <button
            onClick={() => router.push('/')}
            className="gradient-primary text-white px-6 py-3 rounded-md font-semibold shadow-md hover-lift"
          >
            Browse Restaurants
          </button>
        </div>
      ) : (
        <>
          {/* Predictive Cart Suggestions */}
          <div className="p-4">
            <PredictiveCartSuggestions />
          </div>

          {/* Conversational Cart Button */}
          <div className="px-4 mb-4">
            <button
              onClick={() => setShowConversationalCart(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl font-semibold text-primary hover:from-primary/20 hover:to-secondary/20 transition-all active:scale-95"
            >
              <MessageCircle size={20} />
              <span>Chat with Cart Assistant</span>
            </button>
          </div>

          {/* Cart Items - Grouped by Restaurant */}
          <div className="p-4 space-y-4">
            {itemsByRestaurant.map((group, groupIndex) => (
              <div key={group.restaurantId} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-text-primary mb-2 bg-secondary-light p-3 rounded-md animate-slide-up" style={{ animationDelay: `${groupIndex * 30}ms` }}>
                  <ShoppingBag size={16} className="text-secondary" />
                  {group.restaurantName}
                  {itemsByRestaurant.length > 1 && (
                    <span className="ml-auto text-xs text-neutral-text-secondary">
                      {group.items.length} item{group.items.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {group.items.map((item, index) => (
                  <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${(groupIndex * 50) + (index * 50)}ms` }}>
                    <CartItem
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-border p-4 shadow-elevated">
            <div className="max-w-md mx-auto space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-text-secondary">Subtotal</span>
                <span className="font-semibold text-neutral-text-primary">{formatCurrency(subtotal)}</span>
              </div>
              
              {/* Promo Code Section */}
              {!appliedPromo && !showPromoInput && (
                <button
                  onClick={() => setShowPromoInput(true)}
                  className="flex items-center gap-2 text-primary text-sm font-medium hover:text-primary-hover transition-colors w-full text-left"
                >
                  <Tag size={16} />
                  <span>Have a promo code?</span>
                </button>
              )}

              {showPromoInput && !appliedPromo && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setShowPromoInput(false);
                      setPromoCode('');
                    }}
                    className="p-2 text-neutral-text-secondary hover:text-primary transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {appliedPromo && (
                <div className="flex items-center justify-between bg-secondary-light p-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-secondary" />
                    <span className="text-sm font-medium text-secondary">{appliedPromo.code}</span>
                    <span className="text-xs text-neutral-text-secondary">
                      -{formatCurrency(appliedPromo.discount)}
                    </span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="p-1 hover:bg-white rounded transition-colors"
                  >
                    <X size={16} className="text-neutral-text-secondary" />
                  </button>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-status-success">Discount</span>
                  <span className="font-semibold text-status-success">-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-neutral-text-secondary">Delivery Fee</span>
                <span className="font-semibold text-neutral-text-primary">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-text-secondary">Tax</span>
                <span className="font-semibold text-neutral-text-primary">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t border-neutral-border pt-2 flex justify-between">
                <span className="font-bold text-lg text-neutral-text-primary">Total</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              className="w-full gradient-primary text-white py-4 rounded-md font-bold text-lg active:scale-95 transition-all touch-target shadow-md hover-lift ripple"
            >
              Proceed to Payment
            </button>
          </div>
        </>
      )}

      {/* Conversational Cart Modal */}
      {showConversationalCart && (
        <ConversationalCart onClose={() => setShowConversationalCart(false)} />
      )}

      <MobileNav />
    </div>
  );
}


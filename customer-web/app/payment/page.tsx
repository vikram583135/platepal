'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore, useCartStore } from '@/lib/store';
import { apiService } from '@/lib/api';
import MobileNav from '@/components/MobileNav';
import { ArrowLeft, MapPin, CreditCard, Wallet, Home, Briefcase, Check, Plus, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface Address {
  id: string;
  label: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

type PaymentMethod = 'card' | 'upi' | 'wallet' | 'cod';

export default function PaymentPage() {
  const router = useRouter();
  const { items, getTotal, clearCart, getRestaurantIds, getItemsByRestaurant } = useCartStore();
  const { token } = useAuthStore();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('upi');
  const [placing, setPlacing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Mock addresses - in real app, fetch from API
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      type: 'home',
      street: '123 MG Road, 4th Floor',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      landmark: 'Near Metro Station',
      isDefault: true,
    },
    {
      id: '2',
      label: 'Office',
      type: 'work',
      street: '456 Koramangala, Block 5',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560095',
      isDefault: false,
    },
  ]);

  const subtotal = getTotal();
  const deliveryFee = subtotal > 0 ? 30 : 0;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + deliveryFee + tax;

  const restaurantIds = getRestaurantIds();
  const itemsByRestaurant = restaurantIds.map(rid => ({
    restaurantId: rid,
    restaurantName: items.find(i => i.restaurantId === rid)?.restaurantName || 'Restaurant',
    items: getItemsByRestaurant(rid),
  }));

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      router.push('/cart');
      return;
    }
    // Set default address
    const defaultAddr = addresses.find(a => a.isDefault);
    if (defaultAddr) {
      setSelectedAddress(defaultAddr.id);
    }
  }, [token, items, router, addresses]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    const selectedAddr = addresses.find(a => a.id === selectedAddress);
    if (!selectedAddr) {
      toast.error('Invalid address selected');
      return;
    }

    setPlacing(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
        })),
        total,
        subtotal,
        discount: 0,
        promoCode: null,
        deliveryFee,
        tax,
        restaurantId: restaurantIds[0] || '',
        deliveryAddress: `${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state} ${selectedAddr.pincode}${selectedAddr.landmark ? ` (${selectedAddr.landmark})` : ''}`,
        paymentMethod: selectedPayment,
      };

      const order = await apiService.placeOrder(orderData, token!);
      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/track/${order.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return Home;
      case 'work': return Briefcase;
      default: return MapPin;
    }
  };

  if (!token || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-background pb-20">
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
            Payment
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Summary */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-4 animate-slide-up border border-neutral-border/50">
          <h2 className="font-bold text-neutral-text-primary mb-3">Order Summary</h2>
          <div className="space-y-2">
            {itemsByRestaurant.map((group) => (
              <div key={group.restaurantId} className="pb-2 border-b border-neutral-border last:border-0">
                <p className="text-sm font-semibold text-neutral-text-primary mb-1">
                  {group.restaurantName}
                </p>
                {group.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-neutral-text-secondary mb-1">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-text-secondary">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-text-secondary">Delivery Fee</span>
                <span className="font-semibold">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-text-secondary">GST (18%)</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-border">
                <span className="font-bold text-lg text-neutral-text-primary">Total</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-4 animate-slide-up border border-neutral-border/50" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-neutral-text-primary flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              Delivery Address
            </h2>
            <button
              onClick={() => router.push('/addresses')}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              <Plus size={16} />
              Add New
            </button>
          </div>
          <div className="space-y-2">
            {addresses.map((address) => {
              const Icon = getAddressIcon(address.type);
              const isSelected = selectedAddress === address.id;
              return (
                <button
                  key={address.id}
                  onClick={() => setSelectedAddress(address.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary-light'
                      : 'border-neutral-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-primary text-white' : 'bg-primary-light text-primary'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-neutral-text-primary">{address.label}</span>
                        {address.isDefault && (
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">Default</span>
                        )}
                        {isSelected && (
                          <Check size={16} className="text-primary ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-neutral-text-secondary leading-relaxed">
                        {address.street}<br />
                        {address.city}, {address.state} {address.pincode}
                        {address.landmark && <><br />Landmark: {address.landmark}</>}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {!selectedAddress && (
            <div className="mt-3 p-3 bg-status-warning/10 border border-status-warning/30 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-status-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-status-warning">Please select a delivery address</p>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-4 animate-slide-up border border-neutral-border/50" style={{ animationDelay: '100ms' }}>
          <h2 className="font-bold text-neutral-text-primary mb-3 flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            Payment Method
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedPayment('upi')}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                selectedPayment === 'upi'
                  ? 'border-primary bg-primary-light'
                  : 'border-neutral-border hover:border-primary/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedPayment === 'upi' ? 'bg-primary text-white' : 'bg-secondary-light text-secondary'
              }`}>
                <Wallet size={20} />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-neutral-text-primary">UPI</span>
                <p className="text-xs text-neutral-text-secondary">Pay via UPI apps</p>
              </div>
              {selectedPayment === 'upi' && <Check size={20} className="text-primary" />}
            </button>

            <button
              onClick={() => setSelectedPayment('card')}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                selectedPayment === 'card'
                  ? 'border-primary bg-primary-light'
                  : 'border-neutral-border hover:border-primary/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedPayment === 'card' ? 'bg-primary text-white' : 'bg-secondary-light text-secondary'
              }`}>
                <CreditCard size={20} />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-neutral-text-primary">Credit/Debit Card</span>
                <p className="text-xs text-neutral-text-secondary">Visa, Mastercard, RuPay</p>
              </div>
              {selectedPayment === 'card' && <Check size={20} className="text-primary" />}
            </button>

            <button
              onClick={() => setSelectedPayment('wallet')}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                selectedPayment === 'wallet'
                  ? 'border-primary bg-primary-light'
                  : 'border-neutral-border hover:border-primary/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedPayment === 'wallet' ? 'bg-primary text-white' : 'bg-secondary-light text-secondary'
              }`}>
                <Wallet size={20} />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-neutral-text-primary">Digital Wallet</span>
                <p className="text-xs text-neutral-text-secondary">Paytm, PhonePe, Google Pay</p>
              </div>
              {selectedPayment === 'wallet' && <Check size={20} className="text-primary" />}
            </button>

            <button
              onClick={() => setSelectedPayment('cod')}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                selectedPayment === 'cod'
                  ? 'border-primary bg-primary-light'
                  : 'border-neutral-border hover:border-primary/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedPayment === 'cod' ? 'bg-primary text-white' : 'bg-secondary-light text-secondary'
              }`}>
                <Wallet size={20} />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-neutral-text-primary">Cash on Delivery</span>
                <p className="text-xs text-neutral-text-secondary">Pay when you receive</p>
              </div>
              {selectedPayment === 'cod' && <Check size={20} className="text-primary" />}
            </button>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-border p-4 shadow-elevated">
          <button
            onClick={handlePlaceOrder}
            disabled={placing || !selectedAddress}
            className="w-full gradient-primary text-white py-4 rounded-md font-bold text-lg active:scale-95 transition-all disabled:opacity-50 touch-target shadow-md hover-lift ripple"
          >
            {placing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Placing Order...
              </span>
            ) : (
              `Place Order • ${formatCurrency(total)}`
            )}
          </button>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}


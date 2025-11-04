'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, User, Receipt } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { href: '/orders', icon: Receipt, label: 'Orders' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-border safe-area-bottom z-50 shadow-elevated">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full relative touch-target transition-all duration-200',
                isActive ? 'text-primary' : 'text-neutral-text-secondary'
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 gradient-primary rounded-full animate-scale-in" />
              )}
              
              <div className={cn('relative transition-transform', isActive && 'scale-110')}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 gradient-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md animate-bounce-once">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn('text-xs mt-1', isActive ? 'font-semibold' : 'font-medium')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


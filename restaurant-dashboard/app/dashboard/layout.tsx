'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Bell,  
  Home,  
  LineChart,
  Package,
  ShoppingCart,
  Users,
  UtensilsCrossed,
  LogOut,
  Settings,
  TrendingUp,
  Gift,
  Megaphone,
  FileText,
  ChevronLeft,
  ChevronRight,
  Store,
  UserCircle2
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import withAuth from '@/app/components/withAuth';
import { toast } from 'sonner';
import React from 'react';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Listen for new order notifications (if WebSocket is set up)
  React.useEffect(() => {
    const updateNotificationCount = () => {
      const storedCount = localStorage.getItem('restaurant_notification_count');
      if (storedCount) {
        setNotificationCount(parseInt(storedCount, 10));
      } else {
        setNotificationCount(0);
      }
    };

    // Initial load
    updateNotificationCount();

    // Listen for storage changes (from WebSocket updates)
    window.addEventListener('storage', updateNotificationCount);
    
    // Also listen for custom events
    window.addEventListener('newOrderNotification', updateNotificationCount);

    return () => {
      window.removeEventListener('storage', updateNotificationCount);
      window.removeEventListener('newOrderNotification', updateNotificationCount);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    toast.success('Signed out successfully');
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard', badge: null },
    { href: '/dashboard/orders', icon: ShoppingCart, label: 'Orders', badge: notificationCount },
    { href: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menu', badge: null },
    { href: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics', badge: null },
    { href: '/dashboard/promotions', icon: Gift, label: 'Promotions', badge: null },
    { href: '/dashboard/marketing', icon: Megaphone, label: 'Marketing', badge: null },
    { href: '/dashboard/staff', icon: Users, label: 'Staff', badge: null },
    { href: '/dashboard/reports', icon: FileText, label: 'Reports', badge: null },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings', badge: null },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col bg-surface-dark text-white transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Store className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold">PlatePal</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
                  active 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={20} className={active ? 'text-white' : 'text-white/70 group-hover:text-white'} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-accent text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/10">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center">
                <UserCircle2 size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Restaurant Owner</p>
                <p className="text-xs text-white/60">View Profile</p>
              </div>
            </div>
          ) : (
            <button className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <UserCircle2 size={24} className="mx-auto" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between shadow-sm sticky top-0 z-30">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Package className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-surface-dark text-white">
              <div className="flex items-center gap-3 h-16 px-6 border-b border-white/10">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                  <Store className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold">PlatePal</span>
              </div>
              <nav className="px-3 py-6 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                        active 
                          ? 'bg-primary text-white' 
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-accent text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Breadcrumbs (Desktop) */}
          <div className="hidden md:block">
            <p className="text-sm text-text-secondary">
              {pathname === '/dashboard' ? 'Home' : pathname.split('/').slice(1).join(' / ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-background rounded-lg transition-colors">
              <Bell size={20} className="text-text-secondary" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
              )}
            </button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 hover:bg-background rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center">
                    <UserCircle2 size={20} className="text-white" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard/profile">
                  <DropdownMenuItem>
                    <UserCircle2 className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-error">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default withAuth(DashboardLayout);

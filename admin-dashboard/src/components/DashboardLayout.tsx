'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { RootState, AppDispatch } from '@/store/store';
import { logout } from '@/store';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  BuildingStorefrontIcon, 
  TruckIcon, 
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { adminUser } = useSelector((state: RootState) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, color: 'from-blue-500 to-blue-600' },
    { name: 'Restaurant Approvals', href: '/approvals', icon: ClipboardDocumentCheckIcon, color: 'from-amber-500 to-amber-600' },
    { name: 'Orders', href: '/orders', icon: ShoppingBagIcon, color: 'from-green-500 to-green-600' },
    { name: 'Restaurants', href: '/restaurants', icon: BuildingStorefrontIcon, color: 'from-purple-500 to-purple-600' },
    { name: 'Delivery Partners', href: '/delivery-partners', icon: TruckIcon, color: 'from-orange-500 to-orange-600' },
    { name: 'Customers', href: '/customers', icon: UsersIcon, color: 'from-pink-500 to-pink-600' },
    { name: 'Support Tickets', href: '/tickets', icon: ChatBubbleLeftRightIcon, color: 'from-cyan-500 to-cyan-600' },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, color: 'from-indigo-500 to-indigo-600' },
    { name: 'Settings', href: '/settings', icon: CogIcon, color: 'from-gray-500 to-gray-600' },
  ].map(item => ({
    ...item,
    current: pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)),
  }));

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary shadow-floating">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-white">PlatePal Admin</h1>
            </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-primary-light bg-opacity-20 text-white shadow-md'
                        : 'text-primary-light hover:bg-primary-light hover:bg-opacity-10 hover:text-white'
                    } group flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 relative overflow-hidden`}
                  >
                    {item.current && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10`} />
                    )}
                    <item.icon
                      className={`${
                        item.current ? 'text-white' : 'text-primary-light group-hover:text-white'
                      } mr-4 h-6 w-6 relative z-10 transition-transform group-hover:scale-110`}
                    />
                    <span className="relative z-10">{item.name}</span>
                    {item.current && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full" />
                    )}
                  </Link>
                ))}
              </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-primary-light border-opacity-20 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {adminUser?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-white">{adminUser?.name}</p>
                <p className="text-sm font-medium text-primary-light">{adminUser?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 gradient-primary shadow-elevated">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-white">PlatePal Admin</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-primary-light bg-opacity-20 text-white shadow-md'
                        : 'text-primary-light hover:bg-primary-light hover:bg-opacity-10 hover:text-white'
                    } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden animate-slide-up`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.current && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10`} />
                    )}
                    <item.icon
                      className={`${
                        item.current ? 'text-white' : 'text-primary-light group-hover:text-white'
                      } mr-3 h-5 w-5 relative z-10 transition-transform group-hover:scale-110`}
                    />
                    <span className="relative z-10">{item.name}</span>
                    {item.current && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-primary-light border-opacity-20 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shadow-md">
                    <span className="text-sm font-medium text-white">
                      {adminUser?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">{adminUser?.name}</p>
                  <p className="text-xs font-medium text-primary-light">{adminUser?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-1 rounded-md text-primary-light hover:text-white transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

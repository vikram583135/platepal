'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import MobileNav from '@/components/MobileNav';
import { User, Mail, LogOut, Settings, HelpCircle, ShieldCheck, MapPin, Award, CreditCard, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-floating max-w-md w-full text-center animate-scale-in">
          <User size={48} className="mx-auto text-neutral-text-secondary mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-neutral-text-primary">Not Logged In</h2>
          <p className="text-neutral-text-secondary mb-6">Please login to view your profile</p>
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
    <div className="min-h-screen bg-neutral-background pb-20">
      {/* Header */}
      <div className="gradient-primary text-white p-6 animate-slide-down">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <div className="glass rounded-md p-4 flex items-center gap-4 animate-scale-in">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shadow-md">
            <User size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.name || 'User'}</h2>
            <p className="text-sm opacity-90">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-4">
        {/* Account Section */}
        <div className="bg-white rounded-md shadow-md overflow-hidden animate-slide-up">
          <button
            onClick={() => router.push('/rewards')}
            className="w-full flex items-center gap-4 p-4 hover:bg-primary-light active:bg-primary-light/70 transition-all touch-target"
          >
            <div className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center">
              <Award className="text-accent-dark" size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-neutral-text-primary">Rewards & Points</p>
              <p className="text-xs text-neutral-text-secondary">1,250 points available</p>
            </div>
            <span className="text-primary">→</span>
          </button>
          
          <button
            onClick={() => router.push('/addresses')}
            className="w-full flex items-center gap-4 p-4 hover:bg-primary-light active:bg-primary-light/70 transition-all border-t border-neutral-border touch-target"
          >
            <div className="w-10 h-10 bg-secondary-light rounded-full flex items-center justify-center">
              <MapPin className="text-secondary" size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-neutral-text-primary">Delivery Addresses</p>
              <p className="text-xs text-neutral-text-secondary">Manage saved addresses</p>
            </div>
            <span className="text-primary">→</span>
          </button>
          
          <button className="w-full flex items-center gap-4 p-4 hover:bg-primary-light active:bg-primary-light/70 transition-all border-t border-neutral-border touch-target">
            <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
              <CreditCard className="text-primary" size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-neutral-text-primary">Payment Methods</p>
              <p className="text-xs text-neutral-text-secondary">2 cards saved</p>
            </div>
            <span className="text-primary">→</span>
          </button>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-md shadow-md overflow-hidden animate-slide-up" style={{ animationDelay: '50ms' }}>
          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center gap-4 p-4 hover:bg-primary-light active:bg-primary-light/70 transition-all touch-target"
          >
            <div className="w-10 h-10 bg-secondary-light rounded-full flex items-center justify-center">
              <Settings className="text-secondary" size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-neutral-text-primary">Settings</p>
              <p className="text-xs text-neutral-text-secondary">App preferences & privacy</p>
            </div>
            <span className="text-primary">→</span>
          </button>
          
          <button className="w-full flex items-center gap-4 p-4 hover:bg-primary-light active:bg-primary-light/70 transition-all border-t border-neutral-border touch-target">
            <div className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center">
              <Bell className="text-accent-dark" size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-neutral-text-primary">Notifications</p>
              <p className="text-xs text-neutral-text-secondary">Manage notifications</p>
            </div>
            <span className="text-primary">→</span>
          </button>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-md shadow-md overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
          <button
            onClick={() => router.push('/help')}
            className="w-full flex items-center gap-4 p-4 hover:bg-primary-light active:bg-primary-light/70 transition-all touch-target"
          >
            <div className="w-10 h-10 bg-status-info/10 rounded-full flex items-center justify-center">
              <HelpCircle className="text-status-info" size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-neutral-text-primary">Help & Support</p>
              <p className="text-xs text-neutral-text-secondary">FAQ & contact us</p>
            </div>
            <span className="text-primary">→</span>
          </button>
          
          <button className="w-full flex items-center gap-4 p-4 hover:bg-primary-light active:bg-primary-light/70 transition-all border-t border-neutral-border touch-target">
            <div className="w-10 h-10 bg-status-success/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="text-status-success" size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-neutral-text-primary">Privacy Policy</p>
              <p className="text-xs text-neutral-text-secondary">Terms & conditions</p>
            </div>
            <span className="text-primary">→</span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-status-error text-white flex items-center justify-center gap-2 p-4 rounded-md font-semibold active:scale-95 transition-all shadow-md hover-lift animate-slide-up touch-target"
          style={{ animationDelay: '150ms' }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <MobileNav />
    </div>
  );
}


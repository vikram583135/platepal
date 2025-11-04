'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Globe, Moon, Shield, CreditCard, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
  });
  
  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'en',
    currency: 'USD',
  });

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    toast.success('Notification preferences updated');
  };

  const settingsSections = [
    {
      title: 'Notifications',
      icon: Bell,
      color: 'primary',
      items: [
        { 
          id: 'orderUpdates', 
          label: 'Order Updates', 
          description: 'Get notified about your order status',
          value: notifications.orderUpdates,
          toggle: true,
        },
        { 
          id: 'promotions', 
          label: 'Promotions & Offers', 
          description: 'Receive special deals and discounts',
          value: notifications.promotions,
          toggle: true,
        },
        { 
          id: 'newsletter', 
          label: 'Newsletter', 
          description: 'Weekly food recommendations',
          value: notifications.newsletter,
          toggle: true,
        },
      ],
    },
    {
      title: 'Preferences',
      icon: Globe,
      color: 'secondary',
      items: [
        { 
          id: 'language', 
          label: 'Language', 
          description: 'English',
          value: null,
          action: () => toast.info('Language selection coming soon!'),
        },
        { 
          id: 'currency', 
          label: 'Currency', 
          description: 'USD ($)',
          value: null,
          action: () => toast.info('Currency selection coming soon!'),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      color: 'status-success',
      items: [
        { 
          id: 'changePassword', 
          label: 'Change Password', 
          description: 'Update your password',
          value: null,
          action: () => toast.info('Change password coming soon!'),
        },
        { 
          id: 'twoFactor', 
          label: 'Two-Factor Authentication', 
          description: 'Add an extra layer of security',
          value: null,
          action: () => toast.info('2FA setup coming soon!'),
        },
        { 
          id: 'privacy', 
          label: 'Privacy Settings', 
          description: 'Manage your data and privacy',
          value: null,
          action: () => toast.info('Privacy settings coming soon!'),
        },
      ],
    },
    {
      title: 'Payment Methods',
      icon: CreditCard,
      color: 'accent',
      items: [
        { 
          id: 'paymentMethods', 
          label: 'Saved Payment Methods', 
          description: '2 cards saved',
          value: null,
          action: () => toast.info('Payment management coming soon!'),
        },
      ],
    },
  ];

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
          <h1 className="text-xl font-bold text-neutral-text-primary flex-1 text-center">
            Settings
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {settingsSections.map((section, sectionIndex) => {
          const SectionIcon = section.icon;
          
          return (
            <div
              key={section.title}
              className="bg-white rounded-md shadow-md overflow-hidden animate-slide-up"
              style={{ animationDelay: `${sectionIndex * 50}ms` }}
            >
              {/* Section Header */}
              <div className="p-4 border-b border-neutral-border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-${section.color}-light rounded-full flex items-center justify-center`}>
                    <SectionIcon size={20} className={`text-${section.color}`} />
                  </div>
                  <h2 className="font-bold text-neutral-text-primary">{section.title}</h2>
                </div>
              </div>

              {/* Section Items */}
              <div className="divide-y divide-neutral-border">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    onClick={'action' in item ? item.action : undefined}
                    className={`p-4 flex items-center justify-between ${
                      'action' in item ? 'cursor-pointer hover:bg-neutral-background' : ''
                    } transition-all`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="font-semibold text-neutral-text-primary mb-1">{item.label}</h3>
                      <p className="text-sm text-neutral-text-secondary">{item.description}</p>
                    </div>

                    {'toggle' in item && item.toggle !== undefined ? (
                      /* Toggle Switch */
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationToggle(item.id as keyof typeof notifications);
                        }}
                        className={`w-12 h-6 rounded-full transition-all relative ${
                          item.value ? 'bg-status-success' : 'bg-neutral-border'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                            item.value ? 'right-0.5' : 'left-0.5'
                          } shadow-md`}
                        />
                      </button>
                    ) : (
                      /* Arrow Icon */
                      <ChevronRight size={20} className="text-neutral-text-secondary flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* App Info */}
        <div className="bg-white rounded-md p-4 shadow-md text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-neutral-text-secondary">PlatePal Version 1.0.0</p>
          <p className="text-xs text-neutral-text-secondary mt-1">© 2025 PlatePal. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}


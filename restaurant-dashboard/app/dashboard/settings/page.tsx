'use client';

import { useState } from 'react';
import { Store, Clock, MapPin, Phone, Mail, DollarSign, Bell, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    restaurantName: 'My Restaurant',
    email: 'restaurant@example.com',
    phone: '+91 98765 43210',
    address: '123 Food Street, Bangalore, Karnataka 560001',
    operatingHours: '9:00 AM - 11:00 PM',
    deliveryRadius: '10',
    taxRate: '5',
    orderNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your restaurant profile and preferences</p>
      </div>

      {/* Restaurant Profile */}
      <div className="bg-surface rounded-lg shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Store className="text-white" size={20} />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Restaurant Profile</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Restaurant Name</label>
            <input
              type="text"
              value={settings.restaurantName}
              onChange={(e) => handleChange('restaurantName', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Address</label>
            <textarea
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Operating Hours</label>
            <input
              type="text"
              value={settings.operatingHours}
              onChange={(e) => handleChange('operatingHours', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Business Settings */}
      <div className="bg-surface rounded-lg shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-secondary flex items-center justify-center">
            <DollarSign className="text-white" size={20} />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Business Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Delivery Radius (km)</label>
              <input
                type="number"
                value={settings.deliveryRadius}
                onChange={(e) => handleChange('deliveryRadius', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Tax Rate (%)</label>
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) => handleChange('taxRate', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface rounded-lg shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
            <Bell className="text-white" size={20} />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
              <h3 className="font-semibold text-text-primary">Order Notifications</h3>
              <p className="text-sm text-text-secondary">Get notified for new orders</p>
            </div>
            <button
              onClick={() => handleChange('orderNotifications', !settings.orderNotifications)}
              className={`w-12 h-6 rounded-full transition-all relative ${
                settings.orderNotifications ? 'bg-success' : 'bg-border'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                  settings.orderNotifications ? 'right-0.5' : 'left-0.5'
                } shadow-md`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
              <h3 className="font-semibold text-text-primary">Email Notifications</h3>
              <p className="text-sm text-text-secondary">Receive updates via email</p>
            </div>
            <button
              onClick={() => handleChange('emailNotifications', !settings.emailNotifications)}
              className={`w-12 h-6 rounded-full transition-all relative ${
                settings.emailNotifications ? 'bg-success' : 'bg-border'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                  settings.emailNotifications ? 'right-0.5' : 'left-0.5'
                } shadow-md`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
              <h3 className="font-semibold text-text-primary">SMS Notifications</h3>
              <p className="text-sm text-text-secondary">Get SMS alerts for orders</p>
            </div>
            <button
              onClick={() => handleChange('smsNotifications', !settings.smsNotifications)}
              className={`w-12 h-6 rounded-full transition-all relative ${
                settings.smsNotifications ? 'bg-success' : 'bg-border'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                  settings.smsNotifications ? 'right-0.5' : 'left-0.5'
                } shadow-md`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-3 gradient-primary text-white rounded-lg hover-lift transition-all flex items-center gap-2 font-semibold"
        >
          <Save size={20} />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
}


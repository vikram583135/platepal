'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { checkAdminAuthStatus } from '@/store';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  CogIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  BellIcon,
  KeyIcon,
  GlobeAltIcon,
  CreditCardIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, adminUser } = useSelector((state: RootState) => state.auth);

  const [platformConfig, setPlatformConfig] = useState({
    commissionRate: 15,
    deliveryFee: 50,
    minOrderValue: 200,
    maxDeliveryRadius: 10,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(checkAdminAuthStatus());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  const settingsSections = [
    {
      id: 'platform',
      title: 'Platform Configuration',
      icon: GlobeAltIcon,
      description: 'Configure platform-wide settings',
    },
    {
      id: 'payments',
      title: 'Payment & Fees',
      icon: CreditCardIcon,
      description: 'Manage commission rates and fees',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: BellIcon,
      description: 'Configure email and notification templates',
    },
    {
      id: 'security',
      title: 'Security',
      icon: ShieldCheckIcon,
      description: 'Manage API keys and security settings',
    },
    {
      id: 'account',
      title: 'Admin Account',
      icon: KeyIcon,
      description: 'Update your admin account details',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 page-transition">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center">
            <CogIcon className="h-8 w-8 mr-3 text-primary" />
            Settings
          </h1>
          <p className="text-text-secondary mt-1">Manage platform configuration and preferences</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {settingsSections.map((section) => (
            <div
              key={section.id}
              className="bg-surface rounded-lg shadow-elevated p-6 card-hover cursor-pointer group"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center group-hover:bg-primary group-hover:bg-opacity-20 transition-colors">
                    <section.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-text-primary">{section.title}</h3>
                  <p className="text-sm text-text-secondary mt-1">{section.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform Configuration */}
        <div className="bg-surface rounded-lg shadow-elevated overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-bold text-text-primary flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 mr-2 text-primary" />
              Platform Configuration
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="commissionRate" className="block text-sm font-medium text-text-primary mb-2">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  id="commissionRate"
                  value={platformConfig.commissionRate}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, commissionRate: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-text-secondary mt-1">Percentage of order value</p>
              </div>
              <div>
                <label htmlFor="deliveryFee" className="block text-sm font-medium text-text-primary mb-2">
                  Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  id="deliveryFee"
                  value={platformConfig.deliveryFee}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, deliveryFee: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-text-secondary mt-1">Fixed delivery charge</p>
              </div>
              <div>
                <label htmlFor="minOrderValue" className="block text-sm font-medium text-text-primary mb-2">
                  Minimum Order Value (₹)
                </label>
                <input
                  type="number"
                  id="minOrderValue"
                  value={platformConfig.minOrderValue}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, minOrderValue: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-text-secondary mt-1">Minimum order amount</p>
              </div>
              <div>
                <label htmlFor="maxDeliveryRadius" className="block text-sm font-medium text-text-primary mb-2">
                  Max Delivery Radius (km)
                </label>
                <input
                  type="number"
                  id="maxDeliveryRadius"
                  value={platformConfig.maxDeliveryRadius}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, maxDeliveryRadius: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-text-secondary mt-1">Maximum delivery distance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Account Info */}
        <div className="bg-surface rounded-lg shadow-elevated overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-bold text-text-primary flex items-center">
              <KeyIcon className="h-6 w-6 mr-2 text-primary" />
              Admin Account
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-start">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {adminUser?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-6 flex-1">
                <h3 className="text-lg font-semibold text-text-primary">{adminUser?.name}</h3>
                <div className="flex items-center mt-2 text-text-secondary">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  <span>{adminUser?.email}</span>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary bg-opacity-10 text-primary">
                    {adminUser?.role?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}


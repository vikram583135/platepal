'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Briefcase, MapPin, Plus, Pencil, Trash2, Check } from 'lucide-react';
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

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Puducherry', 'Chandigarh'
];

export default function AddressesPage() {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock data - in real app, this would come from API
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
      landmark: 'Near Forum Mall',
      isDefault: false,
    },
  ]);

  const [formData, setFormData] = useState({
    label: '',
    type: 'home' as 'home' | 'work' | 'other',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const validatePincode = (pincode: string): boolean => {
    return /^\d{6}$/.test(pincode);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.label || !formData.street || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!validatePincode(formData.pincode)) {
      toast.error('Pincode must be 6 digits');
      return;
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      ...formData,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddress]);
    setFormData({
      label: '',
      type: 'home',
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
    });
    setShowAddForm(false);
    toast.success('Address added successfully!');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'home': return Home;
      case 'work': return Briefcase;
      default: return MapPin;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'home': return 'primary';
      case 'work': return 'secondary';
      default: return 'accent';
    }
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
    toast.success('Default address updated!');
  };

  const deleteAddress = (id: string) => {
    const address = addresses.find(a => a.id === id);
    if (address?.isDefault && addresses.length > 1) {
      toast.error('Cannot delete default address. Set another address as default first.');
      return;
    }
    setAddresses(addresses.filter(addr => addr.id !== id));
    toast.success('Address deleted');
  };

  return (
    <div className="min-h-screen bg-neutral-background pb-20">
      {/* Header */}
      <div className="bg-white shadow-elevated sticky top-0 z-40 animate-slide-down">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-primary-light rounded-full active:scale-95 transition-all"
            >
              <ArrowLeft size={24} className="text-primary" />
            </button>
            <h1 className="text-xl font-bold text-neutral-text-primary">Delivery Addresses</h1>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="gradient-primary text-white px-4 py-2 rounded-md font-semibold shadow-md hover-lift ripple flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Add Address Form */}
        {showAddForm && (
          <div className="bg-white rounded-md p-6 shadow-md animate-slide-down">
            <h3 className="font-bold text-neutral-text-primary mb-4">Add New Address</h3>
            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
                  Address Type
                </label>
                <div className="flex gap-2">
                  {['home', 'work', 'other'].map((type) => {
                    const Icon = getIcon(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type as 'home' | 'work' | 'other' })}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 rounded-md transition-all ${
                          formData.type === type
                            ? 'border-primary bg-primary-light'
                            : 'border-neutral-border hover:border-primary hover:bg-primary-light'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="capitalize font-medium">{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
                  Label <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Home, Office"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-neutral-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
                  Street Address <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="123 MG Road, 4th Floor"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-neutral-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
                    City <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Bangalore"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-neutral-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
                    State <span className="text-status-error">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-neutral-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                    required
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
                    Pincode <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="560001"
                    value={formData.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setFormData({ ...formData, pincode: value });
                    }}
                    maxLength={6}
                    className="w-full px-4 py-2 border-2 border-neutral-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                    required
                  />
                  {formData.pincode && !validatePincode(formData.pincode) && (
                    <p className="text-xs text-status-error mt-1">Must be 6 digits</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Near Metro Station"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-neutral-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 gradient-primary text-white py-3 rounded-md font-semibold shadow-md hover-lift ripple"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      label: '',
                      type: 'home',
                      street: '',
                      city: '',
                      state: '',
                      pincode: '',
                      landmark: '',
                    });
                  }}
                  className="px-6 border-2 border-neutral-border text-neutral-text-secondary py-3 rounded-md font-semibold hover:bg-neutral-background transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {addresses.map((address, index) => {
          const Icon = getIcon(address.type);
          const color = getColor(address.type);
          
          return (
            <div
              key={address.id}
              className="bg-white rounded-md p-4 shadow-md animate-slide-up relative overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div className="absolute top-0 right-0 gradient-primary text-white text-xs font-bold px-3 py-1 rounded-bl-md">
                  DEFAULT
                </div>
              )}

              <div className="flex gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 bg-${color}-light rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon size={24} className={`text-${color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-neutral-text-primary mb-1">{address.label}</h3>
                  <p className="text-sm text-neutral-text-secondary leading-relaxed">
                    {address.street}<br />
                    {address.city}, {address.state} {address.pincode}
                    {address.landmark && <><br />Landmark: {address.landmark}</>}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {!address.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(address.id)}
                        className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-secondary-hover transition-colors"
                      >
                        <Check size={16} />
                        Set as Default
                      </button>
                    )}
                    <button className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors ml-auto">
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAddress(address.id)}
                      className="flex items-center gap-1 text-sm font-medium text-status-error hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {addresses.length === 0 && !showAddForm && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-neutral-text-primary mb-2">No addresses yet</h3>
            <p className="text-neutral-text-secondary mb-6">
              Add your delivery addresses for faster checkout
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="gradient-primary text-white px-6 py-3 rounded-md font-semibold shadow-md hover-lift ripple"
            >
              Add Your First Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { formatINR } from '@/lib/currency';

interface Promotion {
  id: string;
  name: string;
  type: 'discount' | 'bogo' | 'freeitem';
  discountValue: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  usageCount: number;
  maxUsage: number;
  minOrderValue?: number;
  applicableItems?: string[];
}

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promotion: Omit<Promotion, 'id' | 'usageCount'>) => void;
  editingPromotion?: Promotion | null;
}

export default function CreatePromotionModal({
  isOpen,
  onClose,
  onSave,
  editingPromotion,
}: CreatePromotionModalProps) {
  const [formData, setFormData] = useState({
    name: editingPromotion?.name || '',
    type: editingPromotion?.type || 'discount',
    discountValue: editingPromotion?.discountValue || 0,
    validFrom: editingPromotion?.validFrom || new Date().toISOString().split('T')[0],
    validTo: editingPromotion?.validTo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxUsage: editingPromotion?.maxUsage || 100,
    minOrderValue: editingPromotion?.minOrderValue || 0,
    isActive: editingPromotion?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      name: '',
      type: 'discount',
      discountValue: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxUsage: 100,
      minOrderValue: 0,
      isActive: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-surface-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface rounded-lg shadow-floating p-6 max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Promotion Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Weekend Special"
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Promotion Type <span className="text-error">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="discount">Percentage Discount</option>
              <option value="bogo">Buy One Get One</option>
              <option value="freeitem">Free Item</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {formData.type === 'discount' ? 'Discount Percentage' : formData.type === 'bogo' ? 'BOGO Discount %' : 'Free Item Value'} <span className="text-error">*</span>
            </label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              min={0}
              max={formData.type === 'discount' ? 100 : undefined}
              placeholder={formData.type === 'discount' ? 'e.g. 20 for 20%' : 'e.g. 50 for 50% off'}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Valid From <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Valid To <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={formData.validTo}
                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Maximum Usage <span className="text-error">*</span>
            </label>
            <input
              type="number"
              value={formData.maxUsage}
              onChange={(e) => setFormData({ ...formData, maxUsage: Number(e.target.value) })}
              min={1}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Minimum Order Value (₹)
            </label>
            <input
              type="number"
              value={formData.minOrderValue}
              onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
              min={0}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-text-primary">
              Activate immediately
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 gradient-primary text-white rounded-lg hover-lift transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Save size={18} />
              {editingPromotion ? 'Update' : 'Create'} Promotion
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-background border border-border rounded-lg text-text-primary hover:bg-primary-light hover:bg-opacity-10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Gift, Percent, Clock, Users } from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { toast } from 'sonner';
import CreatePromotionModal from './CreatePromotionModal';
import AIPromotionSuggestions from '@/app/components/AIPromotionSuggestions';
import type { PromotionSuggestion } from '@/app/services/ai.service';

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
}

export default function PromotionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      name: 'Weekend Special',
      type: 'discount',
      discountValue: 20,
      validFrom: '2024-01-20',
      validTo: '2024-12-31',
      isActive: true,
      usageCount: 145,
      maxUsage: 500,
    },
    {
      id: '2',
      name: 'Buy 1 Get 1 Pizza',
      type: 'bogo',
      discountValue: 50,
      validFrom: '2024-01-15',
      validTo: '2024-06-30',
      isActive: true,
      usageCount: 89,
      maxUsage: 200,
    },
    {
      id: '3',
      name: 'Happy Hour',
      type: 'discount',
      discountValue: 15,
      validFrom: '2024-01-01',
      validTo: '2024-03-31',
      isActive: false,
      usageCount: 356,
      maxUsage: 500,
    },
  ]);

  const handleToggleActive = (id: string) => {
    setPromotions(prevPromotions =>
      prevPromotions.map(promo =>
        promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
      )
    );
    toast.success('Promotion status updated');
  };

  const handleDelete = (id: string) => {
    setPromotions(prevPromotions => prevPromotions.filter(promo => promo.id !== id));
    toast.success('Promotion deleted');
  };

  const handleSave = (promotion: Omit<Promotion, 'id' | 'usageCount'>) => {
    if (editingPromotion) {
      setPromotions(prevPromotions =>
        prevPromotions.map(promo =>
          promo.id === editingPromotion.id
            ? { ...promotion, id: editingPromotion.id, usageCount: editingPromotion.usageCount }
            : promo
        )
      );
      toast.success('Promotion updated');
    } else {
      const newPromotion: Promotion = {
        ...promotion,
        id: Date.now().toString(),
        usageCount: 0,
      };
      setPromotions(prevPromotions => [...prevPromotions, newPromotion]);
      toast.success('Promotion created');
    }
    setIsModalOpen(false);
    setEditingPromotion(null);
  };

  const handleAISuggestionSelect = (suggestion: PromotionSuggestion) => {
    // Convert AI suggestion to promotion format
    const promotion: Omit<Promotion, 'id' | 'usageCount'> = {
      name: suggestion.title,
      type: suggestion.type === 'combo' ? 'bogo' : suggestion.type === 'bogo' ? 'bogo' : 'discount',
      discountValue: suggestion.discountValue || 0,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: suggestion.timeRange 
        ? new Date().toISOString().split('T')[0] 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxUsage: 500,
      isActive: true,
    };
    
    setEditingPromotion(null);
    setIsModalOpen(true);
    // Pre-fill the form with AI suggestion data
    // Note: This would require modifying CreatePromotionModal to accept initial data
    toast.success('AI suggestion loaded! Fill in the details and save.');
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsModalOpen(true);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'discount':
        return 'Discount';
      case 'bogo':
        return 'BOGO';
      case 'freeitem':
        return 'Free Item';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'discount':
        return 'bg-primary/10 text-primary';
      case 'bogo':
        return 'bg-secondary/10 text-secondary';
      case 'freeitem':
        return 'bg-accent/10 text-accent-dark';
      default:
        return 'bg-background text-text-secondary';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Promotions & Offers</h1>
          <p className="text-text-secondary mt-1">Manage discounts, special offers, and campaigns</p>
        </div>
        <button
          onClick={() => {
            setEditingPromotion(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 gradient-primary text-white rounded-lg hover-lift transition-all flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          <span>Create Promotion</span>
        </button>
      </div>

      {/* AI Promotion Suggestions */}
      <AIPromotionSuggestions onSuggestionSelect={handleAISuggestionSelect} />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
              <Gift className="text-primary" size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">Active Offers</h3>
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {promotions.filter(p => p.isActive).length}
          </p>
        </div>

        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-secondary-light flex items-center justify-center">
              <Users className="text-secondary" size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">Total Usage</h3>
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
          </p>
        </div>

        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Percent className="text-accent-dark" size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">Avg Discount</h3>
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {Math.round(promotions.reduce((sum, p) => sum + p.discountValue, 0) / promotions.length)}%
          </p>
        </div>

        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Clock className="text-info" size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">Expiring Soon</h3>
          </div>
          <p className="text-3xl font-bold text-text-primary">2</p>
        </div>
      </div>

      {/* Promotions List */}
      <div className="bg-surface rounded-lg shadow-soft overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">All Promotions</h2>
        </div>

        <div className="divide-y divide-border">
          {promotions.length === 0 ? (
            <div className="p-12 text-center">
              <Gift size={64} className="text-text-secondary mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No promotions yet</h3>
              <p className="text-text-secondary">Create your first promotion to boost sales</p>
            </div>
          ) : (
            promotions.map((promo, index) => (
              <div
                key={promo.id}
                className="p-6 hover:bg-background transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">{promo.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(promo.type)}`}>
                        {getTypeLabel(promo.type)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        promo.isActive ? 'bg-success/10 text-success' : 'bg-border text-text-secondary'
                      }`}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Discount</p>
                        <p className="text-sm font-semibold text-text-primary">{promo.discountValue}% OFF</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Valid Period</p>
                        <p className="text-sm font-semibold text-text-primary">
                          {new Date(promo.validFrom).toLocaleDateString()} - {new Date(promo.validTo).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Usage</p>
                        <p className="text-sm font-semibold text-text-primary">
                          {promo.usageCount} / {promo.maxUsage}
                        </p>
                        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(promo.usageCount / promo.maxUsage) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Remaining</p>
                        <p className="text-sm font-semibold text-text-primary">{promo.maxUsage - promo.usageCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(promo.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        promo.isActive 
                          ? 'bg-border text-text-secondary hover:bg-error/10 hover:text-error' 
                          : 'gradient-secondary text-white hover-lift'
                      }`}
                    >
                      {promo.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(promo)}
                      className="p-2 hover:bg-primary-light rounded-lg transition-colors"
                    >
                      <Edit size={18} className="text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-error" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <CreatePromotionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPromotion(null);
        }}
        onSave={handleSave}
        editingPromotion={editingPromotion}
      />
    </div>
  );
}


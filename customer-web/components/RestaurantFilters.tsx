'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Restaurant } from '@/lib/api';

export interface FilterOptions {
  cuisine: string[];
  rating: number | null;
  deliveryTime: number | null; // in minutes
  priceRange: { min: number; max: number } | null;
  dietaryRestrictions: string[];
}

export interface SortOption {
  value: string;
  label: string;
}

interface RestaurantFiltersProps {
  restaurants: Restaurant[];
  onFilterChange: (filtered: Restaurant[]) => void;
  onSortChange: (sorted: Restaurant[]) => void;
}

const CUISINES = ['All', 'Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'American', 'Thai', 'Mediterranean', 'Fast Food', 'Vegetarian', 'Vegan'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher'];
const SORT_OPTIONS: SortOption[] = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'deliveryTime', label: 'Fastest Delivery' },
  { value: 'price', label: 'Lowest Price' },
  { value: 'name', label: 'Name (A-Z)' },
];

export default function RestaurantFilters({ restaurants, onFilterChange, onSortChange }: RestaurantFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    cuisine: [],
    rating: null,
    deliveryTime: null,
    priceRange: null,
    dietaryRestrictions: [],
  });
  const [sortBy, setSortBy] = useState<string>('popularity');

  const applySorting = useCallback((list: Restaurant[]): Restaurant[] => {
    const sorted = [...list];
    
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'deliveryTime':
        return sorted.sort((a, b) => {
          const timeA = parseInt(a.deliveryTime?.replace(/\D/g, '') || '30');
          const timeB = parseInt(b.deliveryTime?.replace(/\D/g, '') || '30');
          return timeA - timeB;
        });
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'popularity':
      default:
        // Mock popularity based on rating * some factor
        return sorted.sort((a, b) => {
          const popA = (a.rating || 0) * 10;
          const popB = (b.rating || 0) * 10;
          return popB - popA;
        });
    }
  }, [sortBy]);

  const applyFilters = useCallback(() => {
    let filtered = [...restaurants];

    // Cuisine filter
    if (filters.cuisine.length > 0 && !filters.cuisine.includes('All')) {
      // Mock cuisine matching - in real app, this would come from restaurant data
      // For now, randomly assign some restaurants to match filters
      const cuisineMap: { [key: string]: string[] } = {
        'Italian': ['Italian'],
        'Chinese': ['Chinese'],
        'Indian': ['Indian'],
        'Mexican': ['Mexican'],
        'Japanese': ['Japanese'],
        'American': ['American'],
        'Thai': ['Thai'],
      };
      
      filtered = filtered.filter((r, index) => {
        // Simple mock: use index to simulate cuisine distribution
        const mockCuisine = Object.keys(cuisineMap)[index % Object.keys(cuisineMap).length];
        return filters.cuisine.includes(mockCuisine);
      });
    }

    // Rating filter
    if (filters.rating !== null) {
      filtered = filtered.filter((r) => (r.rating || 0) >= filters.rating!);
    }

    // Delivery time filter
    if (filters.deliveryTime !== null) {
      filtered = filtered.filter((r) => {
        const time = parseInt(r.deliveryTime?.replace(/\D/g, '') || '30');
        return time <= filters.deliveryTime!;
      });
    }

    // Price range filter (mock - would need restaurant average price data)
    if (filters.priceRange) {
      // This is a placeholder - would need actual price data
    }

    // Dietary restrictions filter (mock - would need restaurant data)
    if (filters.dietaryRestrictions.length > 0) {
      // Placeholder for dietary restrictions filtering
    }

    // Apply sorting
    const sorted = applySorting(filtered);
    
    onFilterChange(sorted);
    onSortChange(sorted);
  }, [filters, restaurants, applySorting, onFilterChange, onSortChange]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      
      if (key === 'cuisine' || key === 'dietaryRestrictions') {
        const arr = newFilters[key] as string[];
        const index = arr.indexOf(value);
        if (index > -1) {
          arr.splice(index, 1);
        } else {
          arr.push(value);
        }
        newFilters[key] = arr;
      } else {
        newFilters[key] = value === newFilters[key] ? null : value;
      }
      
      return newFilters;
    });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const sorted = applySorting(restaurants);
    onSortChange(sorted);
  };

  const clearFilters = () => {
    setFilters({
      cuisine: [],
      rating: null,
      deliveryTime: null,
      priceRange: null,
      dietaryRestrictions: [],
    });
    setSortBy('popularity');
    const sorted = applySorting(restaurants);
    onFilterChange(restaurants);
    onSortChange(sorted);
  };

  const activeFilterCount = 
    filters.cuisine.length + 
    (filters.rating ? 1 : 0) + 
    (filters.deliveryTime ? 1 : 0) + 
    (filters.priceRange ? 1 : 0) + 
    filters.dietaryRestrictions.length;

  // Auto-apply filters when they change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, restaurants]);

  return (
    <div className="mb-4 space-y-3">
      {/* Filter Toggle & Sort */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            showFilters
              ? 'bg-primary text-white'
              : 'bg-white text-neutral-text-primary border border-neutral-border hover:bg-primary-light'
          } ${activeFilterCount > 0 ? 'ring-2 ring-primary' : ''}`}
        >
          <Filter size={18} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="relative flex-1 min-w-[200px]">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-neutral-border rounded-lg text-neutral-text-primary focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-text-secondary pointer-events-none" />
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-neutral-text-secondary hover:text-primary transition-colors"
          >
            <X size={16} />
            <span className="text-sm">Clear</span>
          </button>
        )}
      </div>

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg p-4 shadow-md animate-slide-down border border-neutral-border">
          {/* Cuisine Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Cuisine</label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => handleFilterChange('cuisine', cuisine)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filters.cuisine.includes(cuisine)
                      ? 'bg-primary text-white'
                      : 'bg-neutral-background text-neutral-text-primary hover:bg-primary-light'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Minimum Rating</label>
            <div className="flex gap-2">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFilterChange('rating', rating)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.rating === rating
                      ? 'bg-primary text-white'
                      : 'bg-neutral-background text-neutral-text-primary hover:bg-primary-light border border-neutral-border'
                  }`}
                >
                  {rating}+ ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Time Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Max Delivery Time</label>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((time) => (
                <button
                  key={time}
                  onClick={() => handleFilterChange('deliveryTime', time)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.deliveryTime === time
                      ? 'bg-primary text-white'
                      : 'bg-neutral-background text-neutral-text-primary hover:bg-primary-light border border-neutral-border'
                  }`}
                >
                  ≤ {time} min
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Dietary Options</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => handleFilterChange('dietaryRestrictions', option)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filters.dietaryRestrictions.includes(option)
                      ? 'bg-secondary text-white'
                      : 'bg-neutral-background text-neutral-text-primary hover:bg-secondary-light border border-neutral-border'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


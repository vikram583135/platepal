'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X, Filter } from 'lucide-react';
import { parseDietaryRequirements } from '@/lib/ai-service';
import { usePreferencesStore } from '@/lib/store';
import { toast } from 'sonner';

interface IntelligentDietaryFilterProps {
  onFilterChange: (filters: DietaryFilters) => void;
}

export interface DietaryFilters {
  dietaryRestrictions: string[];
  allergens: string[];
  preferences: string[];
  complexRequirements: string[];
}

export default function IntelligentDietaryFilter({ onFilterChange }: IntelligentDietaryFilterProps) {
  const [query, setQuery] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [activeFilters, setActiveFilters] = useState<DietaryFilters>({
    dietaryRestrictions: [],
    allergens: [],
    preferences: [],
    complexRequirements: [],
  });
  const { 
    dietaryRestrictions, 
    allergens, 
    preferences, 
    complexRequirements,
    setDietaryRestrictions,
    setAllergens,
    setPreferences,
    setComplexRequirements,
  } = usePreferencesStore();

  useEffect(() => {
    // Load saved preferences
    setActiveFilters({
      dietaryRestrictions,
      allergens,
      preferences,
      complexRequirements,
    });
  }, []);

  useEffect(() => {
    // Notify parent of filter changes
    onFilterChange(activeFilters);
  }, [activeFilters]);

  const handleParse = async () => {
    if (!query.trim()) return;

    setIsParsing(true);
    try {
      const parsed = await parseDietaryRequirements(query);
      
      setActiveFilters((prev) => ({
        dietaryRestrictions: [...new Set([...prev.dietaryRestrictions, ...parsed.dietaryRestrictions])],
        allergens: [...new Set([...prev.allergens, ...parsed.allergens])],
        preferences: [...new Set([...prev.preferences, ...parsed.preferences])],
        complexRequirements: [...new Set([...prev.complexRequirements, ...parsed.complexRequirements])],
      }));

      // Save to preferences store
      setDietaryRestrictions([...new Set([...dietaryRestrictions, ...parsed.dietaryRestrictions])]);
      setAllergens([...new Set([...allergens, ...parsed.allergens])]);
      setPreferences([...new Set([...preferences, ...parsed.preferences])]);
      setComplexRequirements([...new Set([...complexRequirements, ...parsed.complexRequirements])]);

      setQuery('');
      toast.success('Dietary preferences updated!');
    } catch (error) {
      console.error('Failed to parse dietary requirements:', error);
      toast.error('Failed to parse dietary requirements. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const removeFilter = (category: keyof DietaryFilters, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((v) => v !== value),
    }));

    // Update preferences store
    switch (category) {
      case 'dietaryRestrictions':
        setDietaryRestrictions(dietaryRestrictions.filter((v) => v !== value));
        break;
      case 'allergens':
        setAllergens(allergens.filter((v) => v !== value));
        break;
      case 'preferences':
        setPreferences(preferences.filter((v) => v !== value));
        break;
      case 'complexRequirements':
        setComplexRequirements(complexRequirements.filter((v) => v !== value));
        break;
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({
      dietaryRestrictions: [],
      allergens: [],
      preferences: [],
      complexRequirements: [],
    });
    // Clear preferences store
    usePreferencesStore.getState().clearAll();
    toast.success('All filters cleared');
  };

  const exampleQueries = [
    'gluten-free and low-fodmap',
    'no nuts, dairy-free, vegan',
    'keto-friendly with no added sugar',
    'vegetarian, no onions',
  ];

  const totalFilters = 
    activeFilters.dietaryRestrictions.length +
    activeFilters.allergens.length +
    activeFilters.preferences.length +
    activeFilters.complexRequirements.length;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <h3 className="font-bold text-neutral-text-primary">Intelligent Dietary Filters</h3>
        {totalFilters > 0 && (
          <span className="ml-auto px-2 py-1 bg-primary text-white text-xs font-bold rounded-full">
            {totalFilters} active
          </span>
        )}
      </div>

      {/* Input */}
      <div className="relative mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleParse()}
          placeholder="Try: 'gluten-free and low-fodmap' or 'no nuts, dairy-free'"
          className="w-full px-4 py-2 pl-10 pr-10 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isParsing}
        />
        <Sparkles size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
        {query && (
          <button
            onClick={handleParse}
            disabled={isParsing}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50"
          >
            {isParsing ? 'Parsing...' : 'Apply'}
          </button>
        )}
      </div>

      {/* Example Queries */}
      <div className="mb-3">
        <p className="text-xs text-neutral-text-secondary mb-2">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(example);
                setTimeout(handleParse, 100);
              }}
              className="px-2 py-1 text-xs bg-neutral-background text-neutral-text-primary rounded-lg hover:bg-primary-light transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {totalFilters > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-text-primary">Active Filters</span>
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary hover:text-primary-hover font-semibold"
            >
              Clear All
            </button>
          </div>

          {/* Dietary Restrictions */}
          {activeFilters.dietaryRestrictions.length > 0 && (
            <div>
              <p className="text-xs text-neutral-text-secondary mb-1">Dietary Restrictions</p>
              <div className="flex flex-wrap gap-2">
                {activeFilters.dietaryRestrictions.map((filter) => (
                  <span
                    key={filter}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold"
                  >
                    🌱 {filter}
                    <button
                      onClick={() => removeFilter('dietaryRestrictions', filter)}
                      className="hover:bg-green-200 rounded-full p-0.5"
                      aria-label={`Remove ${filter}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens */}
          {activeFilters.allergens.length > 0 && (
            <div>
              <p className="text-xs text-neutral-text-secondary mb-1">Allergens</p>
              <div className="flex flex-wrap gap-2">
                {activeFilters.allergens.map((filter) => (
                  <span
                    key={filter}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold"
                  >
                    ⚠️ No {filter}
                    <button
                      onClick={() => removeFilter('allergens', filter)}
                      className="hover:bg-red-200 rounded-full p-0.5"
                      aria-label={`Remove ${filter}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeFilters.preferences.length > 0 && (
            <div>
              <p className="text-xs text-neutral-text-secondary mb-1">Preferences</p>
              <div className="flex flex-wrap gap-2">
                {activeFilters.preferences.map((filter) => (
                  <span
                    key={filter}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"
                  >
                    {filter}
                    <button
                      onClick={() => removeFilter('preferences', filter)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                      aria-label={`Remove ${filter}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Complex Requirements */}
          {activeFilters.complexRequirements.length > 0 && (
            <div>
              <p className="text-xs text-neutral-text-secondary mb-1">Special Requirements</p>
              <div className="flex flex-wrap gap-2">
                {activeFilters.complexRequirements.map((filter) => (
                  <span
                    key={filter}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold"
                  >
                    ✨ {filter}
                    <button
                      onClick={() => removeFilter('complexRequirements', filter)}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                      aria-label={`Remove ${filter}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


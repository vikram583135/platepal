'use client';

import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterGroup {
  label: string;
  key: string;
  options: FilterOption[];
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (groupKey: string, values: string[]) => void;
  onClearAll?: () => void;
}

export default function FilterSidebar({
  isOpen,
  onClose,
  filters,
  selectedFilters,
  onFilterChange,
  onClearAll,
}: FilterSidebarProps) {
  const selectedCount = Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0);

  if (!isOpen) return null;

  const handleToggle = (groupKey: string, value: string) => {
    const current = selectedFilters[groupKey] || [];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange(groupKey, newValues);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-80 bg-surface shadow-floating z-50 overflow-y-auto animate-slide-down">
        <div className="sticky top-0 bg-surface border-b border-border px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
            {selectedCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                {selectedCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {filters.map((group) => (
            <div key={group.key}>
              <h4 className="text-sm font-semibold text-text-primary mb-3">{group.label}</h4>
              <div className="space-y-2">
                {group.options.map((option) => {
                  const isSelected = selectedFilters[group.key]?.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggle(group.key, option.value)}
                          className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                        />
                        <span className="ml-3 text-sm text-text-primary">{option.label}</span>
                      </div>
                      {option.count !== undefined && (
                        <span className="text-xs text-text-secondary">({option.count})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {onClearAll && selectedCount > 0 && (
          <div className="sticky bottom-0 bg-surface border-t border-border p-4">
            <button
              onClick={onClearAll}
              className="w-full px-4 py-2 text-sm font-medium text-text-primary bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}


'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (start: string | null, end: string | null) => void;
  className?: string;
  label?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className = '',
  label,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState<string>(startDate || '');
  const [tempEnd, setTempEnd] = useState<string>(endDate || '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const displayText = startDate && endDate 
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : 'Select date range';

  const applyDates = () => {
    onChange(tempStart || null, tempEnd || null);
    setIsOpen(false);
  };

  const clearDates = () => {
    setTempStart('');
    setTempEnd('');
    onChange(null, null);
    setIsOpen(false);
  };

  const quickRanges = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
  ];

  const setQuickRange = (days: number) => {
    const end = new Date();
    const start = days === 0 ? end : new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setTempStart(start.toISOString().split('T')[0]);
    setTempEnd(end.toISOString().split('T')[0]);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 border border-border rounded-lg bg-surface text-text-primary hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-text-secondary mr-2" />
          {displayText}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-surface border border-border rounded-lg shadow-floating p-4 animate-scale-in">
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Start Date</label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">End Date</label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs font-medium text-text-secondary mb-2">Quick Ranges</p>
            <div className="grid grid-cols-2 gap-2">
              {quickRanges.map((range) => (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => setQuickRange(range.days)}
                  className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg text-text-primary transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between space-x-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={clearDates}
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={applyDates}
              className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Sparkles, Mic, Loader2 } from 'lucide-react';
import { parseNaturalLanguageQuery } from '@/lib/ai-service';
import { useBehaviorStore } from '@/lib/store';
import { toast } from 'sonner';

interface ParsedQuery {
  cuisines: string[];
  dietaryRestrictions: string[];
  priceRange: { min: number; max: number } | null;
  location: string | null;
  keywords: string[];
}

interface ConversationalSearchProps {
  onSearch: (query: string, parsedFilters?: ParsedQuery) => void;
  placeholder?: string;
  restaurants?: any[];
}

export default function ConversationalSearch({
  onSearch,
  placeholder = "Ask me anything... 'Find me a spicy vegan curry under ₹500'",
  restaurants = [],
}: ConversationalSearchProps) {
  const [query, setQuery] = useState('');
  const [parsedFilters, setParsedFilters] = useState<ParsedQuery | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tracker } = useBehaviorStore();

  // Example queries for suggestions
  const exampleQueries = [
    "Find me a spicy vegan curry near me under ₹500",
    "Show vegetarian restaurants with fast delivery",
    "I want gluten-free pizza",
    "Best Chinese food for dinner",
    "Show me restaurants with keto options",
  ];

  // Debounced parsing
  useEffect(() => {
    if (!query.trim()) {
      setParsedFilters(null);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsParsing(true);
      try {
        const parsed = await parseNaturalLanguageQuery(query);
        setParsedFilters(parsed);
        
        // Track search
        tracker.trackSearch(query, restaurants.length);
        
        // Generate suggestions based on parsed query
        if (parsed.keywords.length > 0) {
          const filtered = restaurants.filter((r: any) =>
            r.name.toLowerCase().includes(parsed.keywords[0]?.toLowerCase() || '') ||
            r.description?.toLowerCase().includes(parsed.keywords[0]?.toLowerCase() || '')
          ).slice(0, 5).map((r: any) => r.name);
          setSuggestions(filtered);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Failed to parse query:', error);
      } finally {
        setIsParsing(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, restaurants]);

  const handleSearch = () => {
    if (!query.trim()) return;
    
    onSearch(query, parsedFilters || undefined);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setShowSuggestions(false);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // Filter chips display
  const filterChips = useMemo(() => {
    const chips: string[] = [];
    if (parsedFilters) {
      if (parsedFilters.cuisines.length > 0) {
        chips.push(...parsedFilters.cuisines.map(c => `🍽️ ${c}`));
      }
      if (parsedFilters.dietaryRestrictions.length > 0) {
        chips.push(...parsedFilters.dietaryRestrictions.map(d => `🌱 ${d}`));
      }
      if (parsedFilters.priceRange) {
        chips.push(`💰 Under ₹${parsedFilters.priceRange.max}`);
      }
    }
    return chips;
  }, [parsedFilters]);

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {isParsing ? (
            <Loader2 size={20} className="text-primary animate-spin" />
          ) : (
            <Sparkles size={20} className="text-primary" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 rounded-xl text-neutral-text-primary bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white shadow-md transition-all border border-neutral-border"
        />
        
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setParsedFilters(null);
              setShowSuggestions(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-text-secondary hover:text-neutral-text-primary transition-colors"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Parsed Filters Display */}
      {parsedFilters && filterChips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 animate-slide-down">
          {filterChips.map((chip, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary-light text-primary text-xs font-semibold rounded-full"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-elevated border border-neutral-border max-h-96 overflow-y-auto z-50 animate-slide-down">
          {/* Example Queries */}
          {!query && (
            <div className="p-4 border-b border-neutral-border">
              <p className="text-xs font-semibold text-neutral-text-secondary mb-2 uppercase tracking-wide">
                Try asking...
              </p>
              <div className="space-y-2">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="w-full text-left px-3 py-2 text-sm text-neutral-text-primary hover:bg-primary-light rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={14} className="text-primary flex-shrink-0" />
                    <span className="truncate">{example}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {query && suggestions.length > 0 && (
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearch();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-primary-light transition-colors border-b border-neutral-border last:border-0 flex items-center gap-2"
                >
                  <Search size={16} className="text-neutral-text-secondary flex-shrink-0" />
                  <span className="text-neutral-text-primary">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query && suggestions.length === 0 && !isParsing && (
            <div className="p-4 text-center text-sm text-neutral-text-secondary">
              Press Enter to search for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}


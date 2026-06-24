'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, MapPin, X } from 'lucide-react';
import { useGeocode } from '@/lib/hooks/useGeocode';
import type { GeocodedPlace } from '@/lib/types';

interface SearchBarProps {
  onPlaceSelect: (place: GeocodedPlace) => void;
  initialValue?: string;
}

export function SearchBar({ onPlaceSelect, initialValue = '' }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce input → query (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 350);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Fetch geocode results
  const { data: results = [], isLoading, isFetching } = useGeocode(
    debouncedQuery,
    debouncedQuery.length >= 2
  );

  // Open dropdown when results arrive
  useEffect(() => {
    if (results.length > 0 && debouncedQuery.length >= 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(-1);
    }
  }, [results, debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (place: GeocodedPlace) => {
      // Use a shortened display name (first 2-3 parts)
      const shortName = place.displayName.split(',').slice(0, 3).join(',').trim();
      setInputValue(shortName);
      setIsOpen(false);
      setDebouncedQuery('');
      onPlaceSelect(place);
    },
    [onPlaceSelect]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && inputValue.length >= 2) {
        setDebouncedQuery(inputValue);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleClear = () => {
    setInputValue('');
    setDebouncedQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Allow parent to set input value (for example chips)
  useEffect(() => {
    if (initialValue && initialValue !== inputValue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputValue(initialValue);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDebouncedQuery(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  const showLoading = isLoading || isFetching;

  return (
    <div className="relative w-full">
      <div className="group relative flex min-h-[72px] items-center gap-4 border border-[var(--line)] bg-[rgba(7,7,6,0.78)] px-6 py-4 transition-colors focus-within:border-[var(--civic-amber)] focus-within:bg-[rgba(7,7,6,0.92)]">
        {showLoading ? (
          <Loader2 className="h-6 w-6 shrink-0 animate-spin text-[var(--civic-amber)]" />
        ) : (
          <Search className="h-6 w-6 shrink-0 text-[var(--paper-muted)] transition-colors group-focus-within:text-[var(--civic-amber)]" />
        )}

        <input
          ref={inputRef}
          type="text"
          placeholder="Search a city or neighborhood..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0 && debouncedQuery.length >= 2) {
              setIsOpen(true);
            }
          }}
          className="peer min-w-0 flex-1 bg-transparent text-xl font-medium tracking-tight text-[var(--paper)] placeholder:text-[rgba(244,239,229,0.38)] outline-none"
          id="search-input"
          autoComplete="off"
          spellCheck={false}
        />

        {inputValue && (
          <button
            onClick={handleClear}
            className="focus-editorial shrink-0 p-2 text-[var(--paper-muted)] transition-colors hover:text-[var(--paper)]"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <kbd className="hidden items-center gap-1 border border-[var(--line)] bg-[rgba(244,239,229,0.05)] px-2 py-0.5 text-[10px] font-medium text-[var(--paper-muted)] sm:inline-flex">
          ↵
        </kbd>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden border border-[var(--line)] bg-[var(--panel-solid)] shadow-2xl shadow-black/40 animate-scale-in"
        >
          <div className="p-1">
            {results.map((place, index) => {
              const parts = place.displayName.split(',');
              const primary = parts.slice(0, 2).join(',').trim();
              const secondary = parts.slice(2).join(',').trim();

              return (
                <button
                  key={`${place.lat}-${place.lon}-${index}`}
                  onClick={() => handleSelect(place)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-[var(--civic-amber-soft)] text-[var(--paper)]'
                      : 'text-[var(--paper-muted)] hover:bg-[rgba(244,239,229,0.05)]'
                  }`}
                  id={`geocode-result-${index}`}
                >
                  <MapPin
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      index === selectedIndex
                        ? 'text-[var(--civic-amber)]'
                        : 'text-[var(--paper-muted)]'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate text-[var(--foreground)]">
                      {primary}
                    </div>
                    {secondary && (
                      <div className="text-xs truncate text-[var(--muted-foreground)]">
                        {secondary}
                      </div>
                    )}
                  </div>
                  <span className="mt-0.5 shrink-0 border border-[var(--line)] bg-[rgba(244,239,229,0.04)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--paper-muted)]">
                    {place.type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {isOpen && debouncedQuery.length >= 2 && !showLoading && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 border border-[var(--line)] bg-[var(--panel-solid)] p-4 text-center text-sm text-[var(--paper-muted)] shadow-2xl shadow-black/40 animate-scale-in">
          No places found for &ldquo;{debouncedQuery}&rdquo;
        </div>
      )}
    </div>
  );
}

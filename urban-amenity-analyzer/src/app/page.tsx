'use client';

import { useState, useCallback, useMemo } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { MapView } from '@/components/MapView';
import { ScorePanel } from '@/components/ScorePanel';
import { RadiusSelector } from '@/components/RadiusSelector';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useAmenities } from '@/lib/hooks/useAmenities';
import { computeOverallScore, generateSummary } from '@/lib/scoring';
import type { GeocodedPlace } from '@/lib/types';
import Image from 'next/image';
import { ArrowLeft, MapPinned, MoveUpRight } from 'lucide-react';

const EXAMPLE_CITIES = [
  { name: 'Manhattan', query: 'Manhattan, New York' },
  { name: 'Shibuya', query: 'Shibuya, Tokyo' },
  { name: 'Kreuzberg', query: 'Kreuzberg, Berlin' },
  { name: 'Bandra', query: 'Bandra, Mumbai' },
];

const METHOD_NOTES = [
  { label: 'Source', value: 'OpenStreetMap' },
  { label: 'Default radius', value: '15 min walk' },
  { label: 'Categories', value: '6 civic essentials' },
];

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState<GeocodedPlace | null>(null);
  const [searchInitialValue, setSearchInitialValue] = useState('');
  const [radius, setRadius] = useState(1200);

  // Fetch amenities when a place is selected
  const {
    data: amenities,
    isLoading: amenitiesLoading,
    error: amenitiesError,
  } = useAmenities(
    selectedPlace?.lat ?? null,
    selectedPlace?.lon ?? null,
    radius,
    !!selectedPlace
  );

  // Compute score
  const scoreResult = useMemo(() => {
    if (!selectedPlace || !amenities) return null;
    return computeOverallScore(
      { lat: selectedPlace.lat, lon: selectedPlace.lon },
      amenities
    );
  }, [selectedPlace, amenities]);

  // Generate summary
  const summary = useMemo(() => {
    if (!selectedPlace || !scoreResult) return '';
    return generateSummary(selectedPlace.displayName, scoreResult);
  }, [selectedPlace, scoreResult]);

  const handlePlaceSelect = useCallback((place: GeocodedPlace) => {
    setSelectedPlace(place);
  }, []);

  const handleChipClick = (query: string) => {
    setSearchInitialValue(query);
  };

  const handleBack = () => {
    setSelectedPlace(null);
    setSearchInitialValue('');
  };

  // ─── Landing View (no place selected) ───
  if (!selectedPlace) {
    return (
      <main className="min-h-screen overflow-hidden bg-[var(--ink)] text-[var(--paper)]">
        <section className="relative min-h-[100svh]">
          <Image
            src="/images/urban-editorial-hero.png"
            alt="Dense walkable city street with transit, sidewalks, shops, and neighborhood activity"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="hero-photo-overlay absolute inset-0" />
          <div className="fine-noise absolute inset-0 opacity-60" />

          <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
            <a
              href="#top"
              className="focus-editorial text-xs font-semibold uppercase tracking-[0.28em] text-[var(--paper)]"
            >
              Urban Amenity
            </a>
            <nav aria-label="Landing navigation" className="hidden items-center gap-8 text-xs uppercase tracking-[0.22em] text-[var(--paper-muted)] sm:flex">
              <a className="focus-editorial transition-colors hover:text-[var(--paper)]" href="#method">Method</a>
              <a className="focus-editorial transition-colors hover:text-[var(--paper)]" href="#search">Analyze</a>
            </nav>
          </header>

          <div id="top" className="relative z-10 grid min-h-[calc(100svh-76px)] content-between px-5 pb-8 sm:px-8 lg:px-12">
            <div className="grid gap-8 pt-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end lg:gap-16 lg:pt-20">
              <div className="max-w-5xl">
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--civic-amber)]">
                  Neighborhood access report
                </p>
                <h1 className="font-[family-name:var(--font-heading)] text-[clamp(3rem,10vw,8.5rem)] font-semibold uppercase leading-[0.86] tracking-normal text-[var(--paper)]">
                  Read the city by what is within reach.
                </h1>
              </div>

              <aside className="editorial-panel max-w-xl p-5 sm:p-6 lg:mb-2">
                <p className="text-sm leading-6 text-[var(--paper-muted)]">
                  Search any neighborhood and generate a walkability report for schools, healthcare, transit, groceries, parks, and pharmacies.
                </p>
                <div id="search" className="mt-5">
                  <SearchBar
                    onPlaceSelect={handlePlaceSelect}
                    initialValue={searchInitialValue}
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--concrete)]">
                    Try
                  </span>
                  {EXAMPLE_CITIES.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleChipClick(city.query)}
                      className="focus-editorial inline-flex items-center gap-1 border border-[var(--line)] bg-[rgba(244,239,229,0.04)] px-3 py-1.5 text-xs font-medium text-[var(--paper-muted)] transition-colors hover:border-[var(--civic-amber)] hover:text-[var(--paper)]"
                      id={`chip-${city.name.toLowerCase()}`}
                    >
                      {city.name}
                      <MoveUpRight className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </aside>
            </div>

            <div id="method" className="mt-10 grid border-t border-[var(--line)] pt-5 sm:grid-cols-3">
              {METHOD_NOTES.map((note) => (
                <div key={note.label} className="border-[var(--line)] py-3 sm:border-r sm:px-5 first:sm:pl-0 last:sm:border-r-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--concrete)]">
                    {note.label}
                  </p>
                  <p className="mt-1 text-sm text-[var(--paper)]">{note.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8 border-t border-[var(--line)] bg-[var(--paper)] px-5 py-10 text-[var(--ink)] sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--concrete)]">
              Civic scan
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-semibold uppercase leading-none sm:text-5xl">
              A field report for everyday access.
            </h2>
          </div>
          <div className="grid gap-4 text-sm leading-6 text-[#3b3933] sm:grid-cols-3">
            <p>Estimate proximity to daily needs with a 15-minute city lens.</p>
            <p>See gaps where essential services are beyond a practical walk.</p>
            <p>Use map evidence and category scores to compare neighborhood conditions.</p>
          </div>
        </section>
      </main>
    );
  }

  // ─── Analysis View (place selected) ───
  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-[var(--ink)] text-[var(--paper)]">
      <div className="relative min-w-0 flex-1 p-3 sm:p-4">
        <MapView
          center={{ lat: selectedPlace.lat, lon: selectedPlace.lon }}
          amenities={amenities ?? null}
          radius={radius}
        />

        <LoadingOverlay isVisible={amenitiesLoading} />

        <div className="absolute left-5 right-5 top-5 z-10 flex items-start gap-3 sm:left-6 sm:right-6 sm:top-6">
          <button
            onClick={handleBack}
            className="focus-editorial flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--line)] bg-[rgba(7,7,6,0.86)] text-[var(--paper)] transition-colors hover:border-[var(--civic-amber)] hover:text-[var(--civic-amber)]"
            id="back-button"
            aria-label="Back to search"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <SearchBar
              onPlaceSelect={handlePlaceSelect}
              initialValue={selectedPlace.displayName
                .split(',')
                .slice(0, 3)
                .join(',')
                .trim()}
            />
          </div>

          <div className="hidden shrink-0 sm:block">
            <RadiusSelector radius={radius} onChange={setRadius} />
          </div>
        </div>

        <div className="absolute bottom-5 left-5 z-10 sm:hidden">
          <RadiusSelector radius={radius} onChange={setRadius} />
        </div>
      </div>

      <aside className="hidden w-[400px] shrink-0 overflow-y-auto border-l border-[var(--line)] bg-[var(--ink-soft)] p-4 lg:flex lg:flex-col">
        <ScorePanel
          result={scoreResult}
          summary={summary}
          placeName={selectedPlace.displayName}
          isLoading={amenitiesLoading}
          error={amenitiesError ? (amenitiesError as Error).message : null}
        />
      </aside>

      <div className="absolute bottom-0 left-0 right-0 z-20 max-h-[64vh] overflow-y-auto border-t border-[var(--line)] bg-[var(--ink-soft)] p-4 shadow-2xl shadow-black/50 lg:hidden">
        <div className="mb-3 flex justify-center">
          <div className="h-1 w-10 bg-[var(--line)]" />
        </div>
        <ScorePanel
          result={scoreResult}
          summary={summary}
          placeName={selectedPlace.displayName}
          isLoading={amenitiesLoading}
          error={amenitiesError ? (amenitiesError as Error).message : null}
        />
      </div>
    </main>
  );
}

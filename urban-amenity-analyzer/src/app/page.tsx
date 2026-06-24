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
      <main className="relative bg-[var(--ink)] text-[var(--paper)] selection:bg-[var(--civic-amber)] selection:text-[var(--ink)]">
        <div className="fine-noise absolute inset-0 opacity-40 pointer-events-none" />
        
        {/* HERO SECTION */}
        <section className="relative flex min-h-[100svh] flex-col justify-between p-5 sm:p-8 lg:px-12 lg:py-8">
          
          {/* HEADER */}
          <header className="grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-start w-full gap-8">
            <div className="font-editorial text-xl font-bold tracking-tighter text-[var(--paper)] leading-none">
              URBAN<br/>AMENITY
            </div>
            
            <div className="hidden lg:flex flex-col items-center gap-6">
              <nav aria-label="Landing navigation" className="flex items-center gap-8 text-[11px] font-semibold tracking-wide text-[var(--paper)]">
                <a className="focus-editorial transition-colors hover:text-[var(--paper-muted)]" href="#search">Search</a>
                <a className="focus-editorial transition-colors hover:text-[var(--paper-muted)]" href="#method">Method</a>
                <a className="focus-editorial transition-colors hover:text-[var(--paper-muted)]" href="#">About</a>
              </nav>
              
              <div className="max-w-md text-center text-xs font-medium leading-relaxed text-[var(--paper)] opacity-80">
                We build spatial analysis tools that finally match the complexity of the cities behind them.
                <br/><br/>
                For established neighborhoods whose walkability hasn&apos;t been measured by what they&apos;ve built.
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#search" className="focus-editorial flex items-center gap-2 border border-[var(--line)] bg-[rgba(244,239,229,0.05)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--paper)] transition-colors hover:bg-[var(--paper)] hover:text-[var(--ink)]">
                Start Search <MoveUpRight className="h-3 w-3" />
              </a>
            </div>
          </header>

          {/* MASSIVE SVG TEXT */}
          <div className="flex-1 flex items-center justify-center my-12 w-full overflow-hidden">
            <svg viewBox="0 0 1200 400" className="w-full h-auto text-[var(--paper)] fill-current" preserveAspectRatio="xMidYMid meet">
              <defs>
                <mask id="text-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <path d="M-100,200 C100,350 300,350 500,200 C700,50 900,50 1100,200 C1300,350 1500,350 1700,200 L1700,400 L-100,400 Z" fill="black" opacity="0.6" />
                </mask>
              </defs>
              <text x="50%" y="170" textAnchor="middle" className="font-[family-name:var(--font-heading)] font-bold tracking-tighter" style={{ fontSize: '180px' }}>
                URBAN
              </text>
              <text x="50%" y="340" textAnchor="middle" className="font-[family-name:var(--font-heading)] font-bold tracking-tighter" style={{ fontSize: '180px' }} mask="url(#text-mask)">
                AMENITY
              </text>
              <path d="M-100,200 C100,350 300,350 500,200 C700,50 900,50 1100,200 C1300,350 1500,350 1700,200" fill="none" stroke="var(--civic-amber)" strokeWidth="6" className="opacity-80" />
            </svg>
          </div>

          {/* FOOTER OF HERO */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_2fr]">
            <div className="flex flex-col justify-end">
              <div className="mb-1 text-3xl font-semibold text-[var(--paper)] tabular-nums">15+</div>
              <p className="text-xs text-[var(--paper-muted)] leading-relaxed max-w-xs">
                Minute city framework parameters from disruptive urban models to neighborhood access standards.
              </p>
            </div>
            <div className="flex items-end sm:justify-end">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-[40px] font-medium leading-[1.1] text-[var(--paper)] max-w-3xl sm:text-right">
                Great neighborhoods <span className="text-[var(--paper-muted)]">changing the world deserve</span> a metric <span className="text-[var(--paper-muted)]">as powerful as what they&apos;ve built.</span> Most cities we analyze have <span className="text-[var(--paper-muted)]">hidden walkability potential.</span>
              </h2>
            </div>
          </div>
        </section>

        {/* SCROLL TO SEARCH SECTION */}
        <section id="search" className="relative flex min-h-[100svh] flex-col justify-center border-t border-[var(--line)] bg-[var(--background)] p-5 sm:p-8 lg:p-12">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-[var(--civic-amber)]" />
                <span className="font-editorial text-xs font-semibold uppercase tracking-[0.2em] text-[var(--civic-amber)]">
                  Spatial Analysis
                </span>
                <div className="h-px w-8 bg-[var(--civic-amber)]" />
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-semibold text-[var(--paper)] mb-4 tracking-tight">
                Analyze a Location
              </h2>
              <p className="text-sm text-[var(--paper-muted)] max-w-2xl mx-auto leading-relaxed">
                Search any neighborhood and generate a walkability report for schools, healthcare, transit, groceries, parks, and pharmacies. Adjust the radius to see how accessibility shifts.
              </p>
            </div>

            <div className="editorial-panel p-6 sm:p-10 mb-8 max-w-2xl mx-auto shadow-2xl">
              <SearchBar
                onPlaceSelect={handlePlaceSelect}
                initialValue={searchInitialValue}
              />
              <div className="mt-8 flex flex-col items-center justify-center gap-4">
                <span className="text-xs font-medium uppercase tracking-widest text-[var(--paper-muted)]">
                  Analysis Radius
                </span>
                <RadiusSelector radius={radius} onChange={setRadius} />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--concrete)] mr-2">
                Try Examples:
              </span>
              {EXAMPLE_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleChipClick(city.query)}
                  className="focus-editorial inline-flex items-center gap-1.5 border border-[var(--line)] bg-[rgba(244,239,229,0.04)] px-4 py-2 text-xs font-medium text-[var(--paper-muted)] transition-colors hover:border-[var(--civic-amber)] hover:text-[var(--paper)]"
                  id={`chip-${city.name.toLowerCase()}`}
                >
                  {city.name}
                  <MoveUpRight className="h-3 w-3 opacity-70" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="method" className="border-t border-[var(--line)] bg-[var(--ink)] py-8 px-5 sm:px-8 lg:px-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--paper-muted)] mb-4">
            Methodology & Sources
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {METHOD_NOTES.map((note) => (
              <div key={note.label} className="text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--civic-amber)]">
                  {note.label}
                </span>
                <span className="mt-1 block text-sm text-[var(--paper)]">
                  {note.value}
                </span>
              </div>
            ))}
          </div>
        </footer>
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

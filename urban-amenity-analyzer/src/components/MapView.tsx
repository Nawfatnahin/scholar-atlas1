'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Map, {
  Marker,
  Popup,
  Source,
  Layer,
  NavigationControl,
} from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';
import { AMENITIES } from '@/lib/amenities';
import { createCircleGeoJSON, amenitiesToGeoJSON } from '@/lib/geo-utils';
import type { GroupedAmenities, AmenityPoint } from '@/lib/types';

interface MapViewProps {
  center: { lat: number; lon: number } | null;
  amenities: GroupedAmenities | null;
  radius: number;
}

export function MapView({ center, amenities, radius }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<AmenityPoint | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 13.405,
    latitude: 52.52,
    zoom: 12,
  });

  // Fly to center when it changes
  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.flyTo({
        center: [center.lon, center.lat],
        zoom: 14,
        duration: 1800,
        essential: true,
      });
    }
  }, [center]);

  // Build GeoJSON data for layers
  const circleGeoJSON = center
    ? createCircleGeoJSON(center, radius)
    : null;

  const amenityGeoJSON = amenities
    ? amenitiesToGeoJSON(amenities)
    : null;

  // Get all amenity points as flat array for markers
  const allPoints: AmenityPoint[] = amenities
    ? Object.values(amenities).flat()
    : [];

  // Get category info for a point
  const getCategoryInfo = useCallback((categoryId: string) => {
    return AMENITIES.find((c) => c.id === categoryId);
  }, []);

  const handleMarkerClick = useCallback((point: AmenityPoint) => {
    setPopupInfo(point);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-none border-l border-[var(--line)] bg-[var(--background)]">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
        attributionControl={true}
        reuseMaps
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {/* Radius circle overlay */}
        {circleGeoJSON && (
          <Source id="radius-circle" type="geojson" data={circleGeoJSON}>
            <Layer
              id="radius-circle-fill"
              type="fill"
              paint={{
                'fill-color': '#c9942f',
                'fill-opacity': 0.05,
              }}
            />
            <Layer
              id="radius-circle-stroke"
              type="line"
              paint={{
                'line-color': '#c9942f',
                'line-width': 1,
                'line-opacity': 0.5,
                'line-dasharray': [4, 4],
              }}
            />
          </Source>
        )}

        {/* Heatmap layer */}
        {amenityGeoJSON && amenityGeoJSON.features.length > 0 && (
          <Source id="amenity-heatmap" type="geojson" data={amenityGeoJSON}>
            <Layer
              id="heatmap-layer"
              type="heatmap"
              paint={{
                'heatmap-intensity': 0.8,
                'heatmap-radius': 35,
                'heatmap-opacity': 0.6,
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(0, 0, 0, 0)',
                  0.2, 'rgba(201, 148, 47, 0.1)',
                  0.4, 'rgba(201, 148, 47, 0.3)',
                  0.6, 'rgba(201, 148, 47, 0.5)',
                  0.8, 'rgba(244, 239, 229, 0.5)',
                  1.0, 'rgba(244, 239, 229, 0.8)',
                ],
              }}
            />
          </Source>
        )}

        {/* Center pin */}
        {center && (
          <Marker
            longitude={center.lon}
            latitude={center.lat}
            anchor="bottom"
          >
            <div className="relative animate-bounce-in">
              <div className="absolute -inset-3 rounded-full bg-[var(--civic-amber)] opacity-20 animate-ping" />
              <div className="relative flex h-8 w-8 items-center justify-center border-2 border-[var(--ink)] bg-[var(--civic-amber)] shadow-lg shadow-[var(--civic-amber)]/30">
                <MapPin className="h-4 w-4 text-[var(--ink)]" />
              </div>
              <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-[var(--ink)] bg-[var(--civic-amber)]" />
            </div>
          </Marker>
        )}

        {/* Amenity markers */}
        {allPoints.slice(0, 300).map((point) => {
          const cat = getCategoryInfo(point.category);
          if (!cat) return null;

          return (
            <Marker
              key={`${point.category}-${point.id}`}
              longitude={point.lon}
              latitude={point.lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(point);
              }}
            >
              <div
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 text-[10px] transition-transform hover:scale-125"
                style={{
                  backgroundColor: `${cat.color}20`,
                  borderColor: `${cat.color}80`,
                }}
                title={point.name}
              >
                <span>{cat.emoji}</span>
              </div>
            </Marker>
          );
        })}

        {/* Popup */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.lon}
            latitude={popupInfo.lat}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeButton={false}
            closeOnClick={false}
            offset={12}
            className="editorial-popup"
          >
            <div className="editorial-panel rounded-none border border-[var(--line)] px-3 py-2 shadow-xl">
              <div className="font-editorial text-sm font-semibold tracking-wide text-[var(--paper)]">
                {getCategoryInfo(popupInfo.category)?.emoji}{' '}
                {popupInfo.name}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[var(--paper-muted)]">
                {getCategoryInfo(popupInfo.category)?.label}
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

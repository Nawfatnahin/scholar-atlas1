# Urban Amenity Editorial Redesign Design

Date: 2026-06-24
Project: `urban-amenity-analyzer`
Approved direction: Approach A, Monolog-inspired editorial analyzer

## Goal

Redesign the Urban Amenity Analyzer UI so it feels like an editorial urban research studio inspired by `https://bymonolog.com/`, while preserving the existing analyzer workflow.

The first screen should no longer feel like a neon SaaS dashboard. It should open with strong editorial pacing, urban photography, oversized typography, sparse navigation, and a clear search action. After a user selects a place, the app should become a refined analysis workspace with the map and score report presented as serious civic research tools.

## Reference Qualities

The redesign should borrow the following qualities from the reference site:

- Cinematic first impression with image-led composition.
- High-contrast monochrome base.
- Oversized confident typography.
- Sparse navigation and thin-line interface details.
- Strong vertical rhythm and intentional whitespace.
- Editorial rather than promotional tone.

The redesign should not copy brand names, text, exact layouts, or proprietary assets from the reference site.

## Visual Direction

Use generated or project-local urban photography as the main visual layer. The preferred imagery is real-looking city photography: dense mixed-use streets, sidewalks, transit, parks, storefronts, civic services, and walkable neighborhoods.

The theme should replace the current dark glass, neon glow, floating-orb, and grid-pattern style with:

- Near-black and warm off-white foundations.
- Concrete gray and muted ink secondary tones.
- One restrained civic accent: muted amber for calls to action, active controls, and important report highlights.
- Thin borders and hard editorial surfaces instead of heavy glassmorphism.
- Subtle image grain, tonal overlays, and disciplined contrast.

The visual system should feel premium, grounded, and urban. It should not become a generic marketing landing page, a glowing tech dashboard, or a one-color theme.

## Landing Experience

The landing view should become an editorial first screen with:

- A sparse top navigation/header.
- A hero section using urban photography as the main viewport signal.
- A large title focused on the analyzer's purpose.
- Short supporting copy about neighborhood access and 15-minute city analysis.
- The existing search flow as the primary interaction.
- Example city links as secondary actions.
- Small methodology/data hints, such as OpenStreetMap, radius, and amenity categories.
- A first viewport that hints at the next section on common desktop and mobile sizes.

The search interaction remains the functional center. The user should still be able to search immediately without reading through a long marketing page.

## Analysis Workspace

After a place is selected, preserve the existing state and data flow:

- `selectedPlace`
- `searchInitialValue`
- `radius`
- `useAmenities`
- `computeOverallScore`
- `generateSummary`

The analysis view should be redesigned as a refined report workspace:

- Map remains the dominant canvas.
- Search and radius controls remain quickly accessible.
- Score panel becomes more like an editorial field report than a rounded dashboard card.
- Category breakdown becomes scan-friendly and less glowing.
- Gap warnings remain clear and high-priority.
- Loading and error states match the new theme.
- Mobile keeps a bottom-sheet pattern, but with sharper editorial styling and stable spacing.

The current analyzer functionality should remain intact.

## Component Scope

Expected implementation files:

- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/SearchBar.tsx`
- `src/components/ScorePanel.tsx`
- `src/components/ScoreGauge.tsx`
- `src/components/CategoryRow.tsx`
- `src/components/RadiusSelector.tsx`
- `src/components/MapView.tsx`
- `src/components/LoadingOverlay.tsx`
- `public/` for generated urban photography assets

The existing API routes, scoring logic, geocoding hooks, amenity fetching hooks, and data types are not part of this redesign unless a UI integration issue requires a small supporting change.

## Data Flow

The redesign does not change the data architecture.

Landing search:

1. User enters or selects a location in `SearchBar`.
2. `useGeocode` fetches matching places.
3. `handlePlaceSelect` stores the selected place.
4. The app switches from landing view to analysis view.

Analysis:

1. `useAmenities` fetches grouped amenities using selected latitude, longitude, and radius.
2. `computeOverallScore` calculates the score result.
3. `generateSummary` produces the report summary.
4. `MapView`, `ScorePanel`, `ScoreGauge`, `CategoryRow`, and `RadiusSelector` render the analysis.

## Accessibility And Responsiveness

The redesign should keep accessible basics intact:

- Preserve a unique and descriptive `h1`.
- Keep buttons keyboard accessible.
- Maintain visible focus states.
- Ensure sufficient color contrast on image backgrounds with overlays.
- Provide meaningful alt text for generated photography if rendered with `next/image`.
- Avoid text overlap at mobile and desktop breakpoints.
- Respect reduced-motion preferences for decorative animation.

Responsive expectations:

- Desktop: editorial landing with large typography and visible image composition.
- Tablet: search remains prominent, text scales down without viewport-based font sizing.
- Mobile: hero content remains readable, search fits cleanly, and analysis uses a stable bottom sheet.

## Error Handling And Loading States

Existing error and loading behavior should remain:

- Geocode loading inside search.
- Amenity loading overlay while the report is being generated.
- Score panel error state for amenity failures.
- Empty state when no result exists.

The styling should be changed to fit the editorial theme, but the user-facing clarity of these states should not be reduced.

## Testing And Verification

Implementation should be verified with:

- `npm run lint`
- `npm run build`
- Manual local browser check of the landing page and analysis view.

The manual check should include:

- Desktop landing layout.
- Mobile landing layout.
- Search autocomplete.
- Selecting an example or searched city.
- Analysis map visibility.
- Score panel readability.
- Radius control behavior.
- Loading and error styling where practical.

## Out Of Scope

This design does not include:

- Rewriting scoring formulas.
- Changing OpenStreetMap or MapLibre data sources.
- Adding authentication.
- Adding saved reports.
- Adding a multi-page marketing site.
- Copying Monolog branding, copy, or proprietary imagery.

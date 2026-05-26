# BeenThere — Competitive Research & Roadmap

Single-page summary of how BeenThere stacks up against open-source and commercial travel-map apps, with a prioritized feature roadmap. Current BeenThere state (May 2026): React + Vite + Leaflet, ~2k LOC, localStorage only, click-to-mark visited/wishlist, stats dashboard, KML export to Google Drive, PWA shell.

## 1. Comparable projects

| Name | URL | Popularity | Killer feature BeenThere lacks |
|---|---|---|---|
| ad3m3r5/scratch-map | https://github.com/ad3m3r5/scratch-map | ~393 stars, AGPL | Subdivisions for 14+ countries (US states, Canada provinces, Japan, etc.) + per-location dates and photo album URLs |
| tomi5/visited-countries-map | https://github.com/tomi5/visited-countries-map | ~14 stars | Dark mode, native-name search, per-continent stat breakdown with table view |
| Shalev-Aviv/WorldView | https://github.com/Shalev-Aviv/WorldView | ~4 stars | "Visit count" per country (returning travelers), Postgres-backed accounts |
| misc0110/TravelMap | https://github.com/misc0110/TravelMap | small, MIT | City pins with "when/why" notes, year-filter "look back" timeline |
| chrisgrabinski/travel-map | https://github.com/chrisgrabinski/travel-map | small | Clean GeoJSON+React baseline |
| been.travel (commercial) | https://been.travel | iOS top-100 travel | Cities + regions + US-state + Euro-region levels, cloud sync, share/compare maps with friends, customizable disputed-territory borders |
| Visited (app store) | https://apps.apple.com/us/app/visited-travel-map-with-lists/id846983349 | 100k+ ratings | Lists ("UNESCO sites", "wonders"), travel-buddy comparison, badges |
| Polarsteps | https://polarsteps.com | millions of users | Auto-GPS trip tracking, photo timelines, printed travel books |
| MapChart.net | https://mapchart.net | popular generator | High-res PNG/SVG download with legend; subdivision maps; colorblind palettes |
| countries-visited.com | https://countries-visited.com | popular web tool | Dual-count modes (UN-193 vs 236 territories) + per-continent % charts |
| Travel-Score (Stotz) | https://patrickstotz.github.io/Travel-Score | demo | "Travel score" — single shareable percentage metric |
| raphaellepuschitz/SVG-World-Map | https://github.com/raphaellepuschitz/SVG-World-Map | reusable lib | Drop-in second-level subdivisions GeoJSON for every country |

## 2. Gap analysis — where BeenThere is weak

1. **No trip context.** Just a boolean per country. Travelers want to remember *when* and *with whom*. Every competitor stores at least a date; scratch-map and TravelMap store photo links and notes.
2. **No sub-country granularity.** "Visited the US" is meaningless to a New Yorker who has never seen Wyoming. been.travel, scratch-map, MapChart and Visited all do states/provinces/regions.
3. **No cloud sync.** localStorage is one-device. Clearing browser data wipes years of trips. been.travel, Visited, Polarsteps all sync. Drive export is *backup*, not *sync*.
4. **No sharing.** The whole social hook of these apps is "look at my map". BeenThere produces a KML you have to import into Google My Maps in 6 steps — not shareable.
5. **Stats are shallow.** Just total count + global %. Missing: per-continent %, UN-193 vs 249-territory toggle, % of world population, countries-per-year, longest streak, "furthest from home".
6. **No import path.** Users with existing data in Google Maps Timeline, Polarsteps export, Nomadlist, or even a simple CSV can't onboard. This kills conversion from competitors.
7. **No dark mode.** Every comparable open-source repo has it; trivial omission.
8. **No bucket-list management.** Wishlist exists as a flag but has no target date, priority, or "plan a trip" affordance.
9. **No per-country reference info.** Tap Japan → nothing happens beyond a toggle. Competitors show flag, capital, currency, visa requirement for the user's passport — context that makes the app sticky.
10. **Single-format export.** KML only. Travelers ask for GeoJSON (devs), GPX (Polarsteps/Garmin), PNG/SVG (Instagram), and PDF "passport" (print).

## 3. Prioritized roadmap

### Must-have (high value, low-to-medium cost)

| # | Feature | User impact | Implementation |
|---|---|---|---|
| 1 | **Visit dates + notes per country** | Turns a checkbox into a memory log; unlocks year-based stats, "look back" feeds, and exports. | Change `countryStatuses[code]` from string to `{status, visits: [{date, note}]}` in `App.jsx`. Edit UI in `CountryStatusPanel.jsx`. Migration shim on read. |
| 2 | **PNG/SVG shareable image export** | One-tap "share my map" is the viral loop every competitor has and BeenThere doesn't. | Add `html-to-image` (or `dom-to-image`) in new `utils/imageExport.js`; button in `StatsDashboard.jsx`. ~80 LOC. |
| 3 | **Public read-only share link** | Friends can view your map without installing anything. Conversion driver. | Encode state as compact base64 in URL hash; new `?share=...` route in `App.jsx` renders read-only mode. No backend needed. ~120 LOC. |
| 4 | **Richer stats: per-continent %, UN-193 vs 249, % world population** | Travelers love numbers; this is the dopamine. | Extend `StatsDashboard.jsx`. Add population lookup table to `utils/countryData.js` (Wikidata CSV, ~5KB). |
| 5 | **Dark mode** | Table-stakes; sub-day work. | CSS variables in `styles/App.css`, toggle persisted to localStorage. |
| 6 | **Google Drive *sync* (not just export)** | Cloud backup users actually use; multi-device without a backend. | Extend `utils/googleDrive.js` to read/write a JSON state file. Reuse existing OAuth. Add conflict-resolution prompt. |
| 7 | **CSV / JSON import + export** | Lets users escape Excel sheets, Notion lists, or competitor exports. | New `utils/dataIO.js`; drag-drop zone in `Sidebar.jsx`. Polarsteps JSON adapter as bonus. |

### Nice-to-have (medium value or medium cost)

| # | Feature | User impact | Implementation |
|---|---|---|---|
| 8 | **US states + Canada provinces + EU regions** | Huge for domestic travelers; matches been.travel. | Pull subdivision GeoJSON from `raphaellepuschitz/SVG-World-Map`. Extend `MapView.jsx` with zoom-dependent layer. ~1 day. |
| 9 | **Country info popover (flag, capital, currency, visa)** | Makes BeenThere a planning tool, not just a logger. | Bake `rest-countries` JSON snapshot into `utils/countryData.js` (~200KB gz). Visa lookup via `nickypangers/passport-visa-api` (static JSON, no key). |
| 10 | **"Look back" — per-year timeline** | Year-in-review screen drives annual social sharing. | New `components/Timeline.jsx`, consumes the visit-date data from #1. |
| 11 | **Bucket list with target dates + priority** | Turns wishlist into planning. | Extend wishlist object schema; new "Plan" tab in `Sidebar.jsx`. |
| 12 | **GeoJSON + GPX export** | Power users and Garmin owners. | Add formats to `utils/kmlGenerator.js` (rename `geoExport.js`). |

### Stretch (high cost or niche)

| # | Feature | Why later |
|---|---|---|
| 13 | **Photo uploads per country (IndexedDB)** | Storage quota issues; users mostly want Polarsteps-style trip albums, which need a backend. |
| 14 | **PDF "passport" print export** | Cool but niche; needs `jspdf` + layout work. |
| 15 | **Google Maps Timeline / Polarsteps importer** | Format keeps changing; high maintenance. Ship #7 (generic CSV/JSON) first. |
| 16 | **Partner / friend comparison view** | Requires real accounts + backend. Worth it only after #3 proves social demand. |

## 4. Top 3 recommended next features

**1. Visit dates + notes (Must-have #1).** The single highest-leverage change. It is a small data-model migration (`string` → `{status, visits[]}`), but it unlocks #4 (per-year stats), #10 (timeline), and meaningful exports. Without it, BeenThere stays a toy. Touch: `App.jsx`, `CountryStatusPanel.jsx`, `utils/kmlGenerator.js`. Ship in one sitting.

**2. Shareable PNG export + public share link (Must-have #2 + #3 together).** These are the viral loop. Right now BeenThere has no way for a happy user to recruit another user. PNG export takes an afternoon (`html-to-image`); URL-hash share link takes another (compress state with `lz-string` to ~1-2KB and stuff it in `#?s=...`). Zero infrastructure cost, instant social distribution. Touch: `StatsDashboard.jsx`, new `utils/imageExport.js`, new `utils/shareLink.js`, routing branch in `App.jsx`.

**3. Drive *sync* upgrade + dark mode (Must-have #6 + #5).** The Drive integration already exists for KML; pivoting it to read/write a small JSON state file gives true multi-device sync without standing up a backend. This is the #1 reason serious travelers abandon localStorage-only tools. Pair it with dark mode in the same release for a tangible "1.1" feel. Touch: `utils/googleDrive.js`, `App.jsx` (load-on-boot, debounced save), `styles/App.css`.

Defer subdivisions (#8) and country-info popovers (#9) until after these three ship — they are bigger and the user research baseline from public share-link traffic will tell you which subdivisions matter most (likely US states first).

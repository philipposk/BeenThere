# BeenThere — Your Personal Travel Map

An app that helps you remember which countries you've visited and which ones you'd love to see, and shows them on a colourful world map. Tap a country to mark it as "been there" or "want to go," watch your stats grow, and export your map so you can open it inside Google Maps and share your adventures.

## What it does
- Shows an interactive world map you tap to mark countries as visited (green) or wishlist (orange)
- Tracks your progress — how many countries you've seen and what percentage of the world that covers
- Has a search bar to quickly find any country
- Saves your map to your Google Drive and lets you open it in Google Maps
- Remembers your choices right in your browser, so your map is there next time
- Can be installed on your phone like a regular app

## Status
Working app. It's a website that also installs on your phone like an app (a "Progressive Web App"). Saving to Google Drive needs a one-time Google sign-in; everything else works straight away.

---
### For developers
React + Vite single-page PWA. Map rendering via Leaflet / React Leaflet. Travel state persists in browser `localStorage`. Export builds a KML file (real country polygon coordinates) and uploads to Google Drive via the Drive API + OAuth, for import into Google My Maps. Country shapes come from a public GeoJSON source.

Setup:

```bash
npm install
# create .env with:
#   VITE_GOOGLE_CLIENT_ID=...
#   VITE_GOOGLE_API_KEY=...
npm run dev      # http://localhost:5173
npm run build    # output in dist/
```

Google Cloud setup: enable the Drive API, create an OAuth 2.0 Web Client ID, and add `http://localhost:5173` (and your production domain) as authorized origins. PWA icons go in `public/icons/` (192px and 512px). MIT licensed. More docs: `DEPLOYMENT.md`, `QUICK_DEPLOY.md`, `SETUP.md`.

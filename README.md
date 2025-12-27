# 🌍 BeenThere - Travel Map

**Track your travels, visualize your adventures, and share your journey with the world.**

BeenThere is a Progressive Web App that lets you mark countries you've visited and want to visit on an interactive world map. Export your personalized travel map directly to Google Drive and import it into Google My Maps to view your colored countries in the Google Maps app—perfect for tracking your wanderlust and sharing your adventures.

## Features

- ✅ **Interactive World Map** - Tap countries to mark them as visited or wishlist
- 📊 **Statistics Dashboard** - View your travel progress with beautiful stats
- 🔍 **Country Search** - Quickly find and select any country
- 📤 **Google Drive Integration** - Upload KML files directly to your Drive
- 🗺️ **Google Maps Export** - Import your map into Google My Maps
- 💾 **Local Storage** - Your data is saved locally in your browser
- 📱 **PWA Support** - Install as an app on your phone

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Drive API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google Drive API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized origins:
   - `http://localhost:5173` (for development)
   - Your production domain (for deployment)
7. Copy your **Client ID** and **API Key**

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

1. **Mark Countries**: Tap any country on the map to cycle through states:
   - None → Visited (green) → Wishlist (orange) → None

2. **View Stats**: Click the "📊 Stats" button to see:
   - Total visited countries
   - Total wishlist countries
   - Percentage of world covered
   - Lists of all marked countries

3. **Search**: Use the search bar to quickly find countries

4. **Export to Google Maps**:
   - Click "📤 Upload to Drive"
   - Authorize Google Drive access (first time only)
   - Click "🗺️ Open My Maps"
   - Create a new map or open existing
   - Click "Import" → Select "MyCountries.kml"
   - View your colored countries in Google Maps!

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## PWA Icons

To enable full PWA functionality, add icon files:
- `public/icons/icon-192.png` (192x192 pixels)
- `public/icons/icon-512.png` (512x512 pixels)

You can generate these using tools like [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator).

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings for Leaflet
- **Google Drive API** - File upload
- **PWA Plugin** - Progressive Web App support

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11.3+)
- Mobile browsers with PWA support

## License

MIT

## Notes

- Country data is loaded from a public GeoJSON source
- All data is stored locally in your browser (localStorage)
- Google Drive upload requires OAuth authentication
- KML files use actual country polygon coordinates for accurate maps


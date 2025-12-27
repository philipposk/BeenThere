# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Google Drive API Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Drive API**
4. Create **OAuth 2.0 Client ID** (Web application)
5. Add authorized origins:
   - `http://localhost:5173`
   - Your production URL (if deploying)

## 3. Create `.env` File

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
```

Replace with your actual credentials from Google Cloud Console.

## 4. Run the App

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## 5. Optional: Add PWA Icons

Add icon files to `public/icons/`:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

The app works without icons, but they're needed for full PWA installation.

## Troubleshooting

- **Google Drive upload fails**: Check that your OAuth credentials are correct and the API is enabled
- **Map doesn't load**: Check your internet connection (country data loads from CDN)
- **Icons not showing**: Make sure icon files are in `public/icons/` with correct names


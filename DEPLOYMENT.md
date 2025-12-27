# Deployment Guide

## GitHub Pages Deployment

### Prerequisites
- Repository is public (or GitHub Pro/Team for private repos with Pages)
- GitHub Actions enabled

### Step 1: Add Secrets to GitHub

1. Go to your repository: https://github.com/philipposk/BeenThere
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:
   - Name: `VITE_GOOGLE_CLIENT_ID`
     Value: `971081805164-qej1cpg71ce6p81vlcg6l07m2tah5hkc.apps.googleusercontent.com`
   - Name: `VITE_GOOGLE_API_KEY`
     Value: `AIzaSyBYWCkbwGLl1Tv6xlBxsrbtr8jNIdVJJiM`

### Step 2: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

### Step 3: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   - `https://philipposk.github.io`
5. Add to **Authorized redirect URIs**:
   - `https://philipposk.github.io/BeenThere/`
6. Save

### Step 4: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

The GitHub Action will automatically build and deploy your site!

### Step 5: Access Your Site

Your app will be available at:
**https://philipposk.github.io/BeenThere/**

---

## Alternative: Vercel Deployment (Recommended for PWAs)

### Why Vercel?
- ✅ Better PWA support
- ✅ Easier environment variable management
- ✅ Custom domain support
- ✅ Automatic HTTPS
- ✅ Better performance

### Steps:

1. **Install Vercel CLI** (optional, or use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Add Environment Variables** in Vercel Dashboard:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_API_KEY`

4. **Update OAuth Settings**:
   - Add your Vercel URL to Google OAuth authorized origins

5. **Custom Domain** (optional):
   - Add your domain in Vercel settings
   - Update OAuth settings with your custom domain

---

## Alternative: Netlify Deployment

1. **Connect Repository**:
   - Go to [Netlify](https://www.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**:
   - Go to Site settings → Environment variables
   - Add `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_API_KEY`

4. **Update OAuth Settings**:
   - Add Netlify URL to Google OAuth authorized origins

---

## Comparison

| Feature | GitHub Pages | Vercel | Netlify |
|---------|-------------|--------|---------|
| Free tier | ✅ Yes | ✅ Yes | ✅ Yes |
| Custom domain | ✅ Yes | ✅ Yes | ✅ Yes |
| Environment vars | ⚠️ Secrets only | ✅ Easy | ✅ Easy |
| PWA support | ✅ Good | ✅ Excellent | ✅ Excellent |
| Auto-deploy | ✅ Yes | ✅ Yes | ✅ Yes |
| Build time | ~2-3 min | ~1 min | ~1-2 min |

---

## Troubleshooting

### GitHub Pages: 404 Error
- Check that `base` in `vite.config.js` matches your repo name
- Ensure GitHub Actions workflow completed successfully
- Check Pages settings → Source is set to "GitHub Actions"

### OAuth Not Working
- Verify your deployed URL is in Google OAuth authorized origins
- Check that environment variables are set correctly
- Clear browser cache and try again

### Build Fails
- Check GitHub Actions logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version in workflow matches local


# Quick Deploy to GitHub Pages

## ✅ Yes, you can deploy to GitHub Pages!

Your app is already configured for GitHub Pages deployment.

## Quick Steps:

### 1. Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/philipposk/BeenThere.git
git push -u origin main
```

### 2. Add GitHub Secrets
1. Go to: https://github.com/philipposk/BeenThere/settings/secrets/actions
2. Click **New repository secret**
3. Add these two secrets:
   - `VITE_GOOGLE_CLIENT_ID` = `971081805164-qej1cpg71ce6p81vlcg6l07m2tah5hkc.apps.googleusercontent.com`
   - `VITE_GOOGLE_API_KEY` = `AIzaSyBYWCkbwGLl1Tv6xlBxsrbtr8jNIdVJJiM`

### 3. Enable GitHub Pages
1. Go to: https://github.com/philipposk/BeenThere/settings/pages
2. Under **Source**, select **GitHub Actions**
3. Save

### 4. Update Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials** → Your OAuth Client
3. Add to **Authorized JavaScript origins**:
   - `https://philipposk.github.io`
4. Add to **Authorized redirect URIs**:
   - `https://philipposk.github.io/BeenThere/`
5. Save

### 5. Push and Deploy
```bash
git push origin main
```

The GitHub Action will automatically build and deploy! 🚀

Your site will be live at: **https://philipposk.github.io/BeenThere/**

---

## Alternative: Vercel (Easier, Better for PWAs)

If you prefer Vercel (recommended for PWAs):

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy!

**Vercel advantages:**
- ✅ Easier environment variable setup
- ✅ Better PWA support
- ✅ Faster builds
- ✅ Custom domain support

Both work great! Choose what you prefer.


# GitHub & GitHub Pages Setup - Automated Steps

## ✅ Local Git Setup Complete!

Your repository is initialized, committed, and ready to push.

## Next Steps (GitHub Web Interface)

Since I can't directly access GitHub's API, here are the exact steps:

### 1. Push to GitHub

Run this command:
```bash
git push -u origin main
```

If you get authentication errors, you may need to:
- Use a Personal Access Token (Settings → Developer settings → Personal access tokens)
- Or use GitHub CLI: `gh auth login`

### 2. Add GitHub Secrets (Required for Build)

Go to: **https://github.com/philipposk/BeenThere/settings/secrets/actions**

Click **"New repository secret"** and add:

**Secret 1:**
- Name: `VITE_GOOGLE_CLIENT_ID`
- Value: `971081805164-qej1cpg71ce6p81vlcg6l07m2tah5hkc.apps.googleusercontent.com`

**Secret 2:**
- Name: `VITE_GOOGLE_API_KEY`
- Value: `AIzaSyBYWCkbwGLl1Tv6xlBxsrbtr8jNIdVJJiM`

### 3. Enable GitHub Pages

Go to: **https://github.com/philipposk/BeenThere/settings/pages**

1. Under **"Source"**, select **"GitHub Actions"** (not "Deploy from a branch")
2. Click **Save**

### 4. Update Google OAuth Settings

Go to: **https://console.cloud.google.com/apis/credentials**

1. Click on your OAuth 2.0 Client ID
2. Under **"Authorized JavaScript origins"**, add:
   - `https://philipposk.github.io`
3. Under **"Authorized redirect URIs"**, add:
   - `https://philipposk.github.io/BeenThere/`
4. Click **Save**

### 5. Wait for Deployment

After pushing, GitHub Actions will automatically:
- Build your app
- Deploy to GitHub Pages
- Make it available at: **https://philipposk.github.io/BeenThere/**

Check the Actions tab to see deployment progress: **https://github.com/philipposk/BeenThere/actions**

---

## Quick Command Reference

```bash
# Push to GitHub
git push -u origin main

# Check deployment status
gh run list  # if you have GitHub CLI

# View your site (after deployment)
open https://philipposk.github.io/BeenThere/
```

---

## Troubleshooting

**Build fails?**
- Check Actions tab for error logs
- Verify secrets are set correctly
- Ensure workflow file exists: `.github/workflows/deploy.yml`

**404 on GitHub Pages?**
- Wait 1-2 minutes after first deployment
- Check Pages settings → Source is "GitHub Actions"
- Verify base path in `vite.config.js` is `/BeenThere/`

**OAuth not working?**
- Verify GitHub Pages URL is in Google OAuth settings
- Check browser console for errors
- Ensure environment variables are set in GitHub Secrets


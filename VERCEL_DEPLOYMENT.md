# TrustLens Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)
1. Go to https://vercel.com/import
2. Paste your repository URL: `https://github.com/pariporwal27/webcmd`
3. Click "Import"
4. Vercel will auto-configure and deploy
5. Get your live URL instantly

### Option 2: Vercel CLI Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 3: Git Integration (Automatic)
1. Go to https://vercel.com
2. Click "New Project"
3. Import GitHub repository: `pariporwal27/webcmd`
4. Click "Deploy"
5. Every push to `main` auto-deploys

---

## What's Deployed

✅ **TrustLens Dashboard UI** - Full 4-view interface
✅ **Demo Scenarios** - Pre-loaded evaluations (NovaFlow, Apex Global, etc.)
✅ **Professional Design** - Shield logo, light theme, evidence cards
✅ **Social Media Evidence** - Real platform logos and cards

⚠️ **Real Browser Investigations** - Limited on Vercel
   - Vercel Functions have 60-second timeout
   - Playwright browser automation requires ~15-60 seconds
   - For production, use Railway, Render, or self-hosted server

---

## Environment Setup (Optional)

If you want to add environment variables:
1. Go to Project Settings → Environment Variables
2. Add any custom settings needed

---

## After Deployment

Your live TrustLens dashboard will be available at:
```
https://your-project.vercel.app
```

### Test It:
1. Open the dashboard
2. Click any demo scenario (NovaFlow AI, Apex Global, etc.)
3. See full investigation results with:
   - Trust score and risk assessment
   - Evidence cards
   - Social media presence
   - Platform logos
   - Agent investigation logs

---

## Going Live with Real Investigations

To support real URL investigations with browser automation:

**Option A: Use Railway instead**
- Better for Node.js servers
- Supports Playwright browser automation
- $5/month starting price

**Option B: Use Render**
- Free tier available
- Good for long-running processes
- Easy GitHub integration

**Option C: Self-hosted**
- Docker deployment
- Full control
- Your own server

---

## Support

For issues:
1. Check Vercel Logs: Project → Deployments → View Log
2. Check GitHub Issues: https://github.com/pariporwal27/webcmd/issues
3. Review error messages in browser console (F12)

---

**Live Dashboard URL:** (Will show after deployment)
**Repository:** https://github.com/pariporwal27/webcmd
**Documentation:** https://pariporwal27.github.io/webcmd

# Deployment Guide - pdEnglish

## 🚀 Deploy to Vercel

### Option 1: GitHub + Vercel (Recommended)

1. **Create GitHub Repository:**
   - Go to [GitHub](https://github.com/new)
   - Repository name: `pdEnglish`
   - Description: `Personal English Learning PWA with translation, vocabulary management, AI sentence generation, and spaced repetition`
   - Make it public
   - Don't initialize with README (we already have one)

2. **Push to GitHub:**
   ```bash
   cd ~/Desktop/pdEnglish
   git remote add origin https://github.com/YOUR_USERNAME/pdEnglish.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your `pdEnglish` repository from GitHub
   - Vercel will auto-detect it's a Vite project
   - Add environment variables:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     VITE_DEEPSEEK_API_KEY=sk-bb4172be4c4c4dfba576cfe7f5485cad
     VITE_LIBRETRANSLATE_URL=https://libretranslate.com
     ```
   - Click "Deploy"

### Option 2: Direct Vercel CLI

```bash
cd ~/Desktop/pdEnglish
npm install -g vercel
vercel login
vercel --prod
```

## 🔧 Environment Variables for Production

Make sure to set these in Vercel dashboard:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_DEEPSEEK_API_KEY` - Already configured
- `VITE_LIBRETRANSLATE_URL` - https://libretranslate.com

## 📱 PWA Installation

After deployment:
1. Visit your Vercel URL
2. Look for "Install" button in browser address bar
3. Click to install as PWA on desktop/mobile

## 🔄 Auto-Deployments

With GitHub + Vercel setup:
- Every push to `main` branch auto-deploys
- Preview deployments for pull requests
- Custom domains supported

## 🌐 Custom Domain (Optional)

1. Go to Vercel dashboard → Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## 📊 Analytics

Vercel provides built-in analytics:
- Page views
- Performance metrics
- User engagement

Your app will be live at: `https://pdenglish.vercel.app` (or your custom domain)

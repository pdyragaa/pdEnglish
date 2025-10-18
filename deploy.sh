#!/bin/bash

echo "🚀 DEPLOYMENT SCRIPT FOR PDENGLISH"
echo "=================================="
echo ""

echo "✅ Git repository is ready with commits:"
git log --oneline -3
echo ""

echo "📋 NEXT STEPS:"
echo "1. Create GitHub repository manually:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: pdEnglish"
echo "   - Description: Personal English Learning PWA"
echo "   - Make it PUBLIC"
echo "   - DON'T initialize with README"
echo ""

echo "2. After creating GitHub repo, run these commands:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/pdEnglish.git"
echo "   git push -u origin main"
echo ""

echo "3. Deploy to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Add environment variables (see .env.example)"
echo "   - Deploy!"
echo ""

echo "🔧 Environment variables needed for Vercel:"
echo "VITE_SUPABASE_URL=your_supabase_url"
echo "VITE_SUPABASE_ANON_KEY=your_supabase_key"
echo "VITE_DEEPSEEK_API_KEY=sk-bb4172be4c4c4dfba576cfe7f5485cad"
echo "VITE_LIBRETRANSLATE_URL=https://libretranslate.com"
echo ""

echo "📱 Your app will be available at: https://pdenglish.vercel.app"
echo ""
echo "🎉 Ready to deploy!"

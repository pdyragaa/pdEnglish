#!/bin/bash

# Deploy script for PD English App
# This script pushes changes to GitHub and triggers automatic deployment

set -e

echo "🚀 Starting deployment process..."

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  Warning: You're not on main branch (current: $current_branch)"
    echo "   This will create a new branch and push it."
    read -p "   Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "📝 Uncommitted changes detected. Adding and committing..."
    git add .
    git commit -m "feat: update app for deployment $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin $current_branch

echo "✅ Code pushed to GitHub successfully!"

# Check if we're on main branch for production deployment
if [ "$current_branch" = "main" ]; then
    echo "🌐 Production deployment triggered!"
    echo "   Check Vercel Dashboard for deployment status"
    echo "   Live app will be available at: https://pdenglish.vercel.app"
else
    echo "🔍 Preview deployment triggered!"
    echo "   Check Vercel Dashboard for preview URL"
fi

echo ""
echo "📋 Next steps:"
echo "   1. Check GitHub Actions: https://github.com/TWOJ-USERNAME/pdEnglish/actions"
echo "   2. Check Vercel Dashboard: https://vercel.com/dashboard"
echo "   3. Test the deployed application"
echo ""
echo "🎉 Deployment process completed!"
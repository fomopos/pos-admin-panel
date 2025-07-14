#!/bin/bash

# Deployment Configuration Script
# This script helps set up deployment for different platforms

echo "🚀 POS Admin Panel - Version Bump Setup"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "Current version: $(node -p "require('./package.json').version")"
echo ""

echo "Deployment Status:"
echo "✅ AWS Amplify - Already configured and monitoring your repository"
echo ""
echo "Choose additional setup options:"
echo "1) View AWS Amplify integration details"
echo "2) Alternative deployment setup (GitHub Pages)"
echo "3) Manual/Custom deployment"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "☁️ AWS Amplify Integration Details"
        echo "=================================="
        echo "✅ Your application is already configured with AWS Amplify!"
        echo ""
        echo "How the integration works:"
        echo "1. 🔄 Developer merges changes to main branch"
        echo "2. 🏷️  GitHub Actions automatically bumps version (x.Y.0)"
        echo "3. 📝 Creates git tag and GitHub release"
        echo "4. 🚀 AWS Amplify detects the commit and deploys automatically"
        echo ""
        echo "What this workflow does:"
        echo "• Bumps minor version in package.json"
        echo "• Creates version tags (v1.0.0, v1.1.0, etc.)"
        echo "• Generates GitHub releases with release notes"
        echo "• Runs linting to ensure code quality"
        echo ""
        echo "What AWS Amplify does:"
        echo "• Monitors your main branch for changes"
        echo "• Automatically builds and deploys when commits are detected"
        echo "• Handles environment configuration and hosting"
        ;;
    2)
        echo "📄 Alternative: GitHub Pages deployment..."
        echo "Note: Your current setup with AWS Amplify is recommended"
        echo ""
        echo "To set up GitHub Pages instead:"
        echo "1. Go to your repository Settings → Pages"
        echo "2. Set Source to 'GitHub Actions'"
        echo "3. Modify .github/workflows/deploy.yml to include build and Pages deployment"
        echo "4. Update your vite.config.ts base path if needed:"
        echo "   base: '/your-repo-name/'"
        ;;
    3)
        echo "🔧 Manual/Custom deployment setup..."
        echo "Your current AWS Amplify setup is optimal for most use cases"
        echo ""
        echo "For custom deployment:"
        echo "• The workflow creates version tags and releases"
        echo "• You can modify .github/workflows/deploy.yml to add custom deployment steps"
        echo "• Build artifacts can be generated with 'npm run build' (creates 'dist' folder)"
        echo "• Current setup works great with AWS Amplify's automatic deployments"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Current Setup Status:"
echo "• ✅ Version bumping workflow: Ready"
echo "• ✅ AWS Amplify deployment: Already configured"
echo "• ✅ Automatic releases: Will be created on version bumps"
echo ""
echo "📝 What happens on merge to main:"
echo "1. GitHub Actions bumps minor version automatically"
echo "2. Creates git tag and GitHub release"
echo "3. AWS Amplify detects the change and deploys"
echo "4. Your application is live with the new version!"

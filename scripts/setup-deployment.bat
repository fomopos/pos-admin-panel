@echo off
setlocal enabledelayedexpansion

echo 🚀 POS Admin Panel - Version Bump Setup
echo ======================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

for /f "delims=" %%i in ('node -p "require('./package.json').version"') do set CURRENT_VERSION=%%i
echo Current version: %CURRENT_VERSION%
echo.

echo Deployment Status:
echo ✅ AWS Amplify - Already configured and monitoring your repository
echo.
echo Choose additional setup options:
echo 1^) View AWS Amplify integration details
echo 2^) Alternative deployment setup ^(GitHub Pages^)
echo 3^) Manual/Custom deployment
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo ☁️ AWS Amplify deployment ^(Current Setup^)...
    echo ✅ Your application is already configured for AWS Amplify!
    echo.
    echo How it works:
    echo 1. AWS Amplify monitors your GitHub repository
    echo 2. When you merge to main, this workflow will:
    echo    - Bump the version automatically
    echo    - Create a git tag and GitHub release
    echo    - Push the changes back to main
    echo 3. AWS Amplify detects the push and automatically deploys
    echo.
    echo Optional: Trigger builds programmatically
    echo If you want to trigger Amplify builds from GitHub Actions:
    echo 1. Uncomment the AWS Amplify section in .github/workflows/deploy.yml
    echo 2. Add these secrets to your GitHub repository:
    echo    - AWS_ACCESS_KEY_ID
    echo    - AWS_SECRET_ACCESS_KEY
    echo    - AWS_REGION
    echo    - AMPLIFY_APP_ID
) else if "%choice%"=="2" (
    echo 📄 Setting up GitHub Pages deployment...
    echo 1. Go to your repository Settings → Pages
    echo 2. Set Source to 'GitHub Actions'
    echo 3. Uncomment the GitHub Pages section in .github/workflows/deploy.yml
    echo 4. Update your vite.config.ts base path if needed:
    echo    base: '/your-repo-name/'
) else if "%choice%"=="3" (
    echo 🔧 Manual deployment setup...
    echo You can customize the deployment section in .github/workflows/deploy.yml
    echo The build artifacts will be in the 'dist' folder after running 'npm run build'
    echo Current setup works great with AWS Amplify's automatic deployments
) else (
    echo ❌ Invalid choice
    pause
    exit /b 1
)

echo.
echo ✅ Current Setup Status:
echo • ✅ Version bumping workflow: Ready
echo • ✅ AWS Amplify deployment: Already configured
echo • ✅ Automatic releases: Will be created on version bumps
echo.
echo 📝 What happens on merge to main:
echo 1. GitHub Actions bumps minor version automatically
echo 2. Creates git tag and GitHub release
echo 3. AWS Amplify detects the change and deploys
echo 4. Your application is live with the new version!

pause

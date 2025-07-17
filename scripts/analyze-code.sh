#!/bin/bash

# POS Admin Panel - Code Analysis and Documentation Generator
# This script runs comprehensive code analysis and generates reports

echo "🔍 POS Admin Panel - Code Analysis"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if required tools are available
if ! command -v npx &> /dev/null; then
    print_error "Error: npx is not available. Please install Node.js and npm."
    exit 1
fi

print_info "Starting comprehensive code analysis..."
echo ""

# 1. Run linting
echo "📋 Running ESLint analysis..."
if npm run lint > lint-report.txt 2>&1; then
    print_status "ESLint analysis completed"
else
    print_warning "ESLint found issues - check lint-report.txt for details"
fi
echo ""

# 2. Unused files analysis
echo "📁 Analyzing unimported files..."
if npx unimported --show-unused-files > unused-files-report.txt 2>&1; then
    UNUSED_FILES=$(grep -c "│" unused-files-report.txt || echo "0")
    if [ "$UNUSED_FILES" -gt 0 ]; then
        print_warning "Found $UNUSED_FILES unimported files"
    else
        print_status "No unimported files found"
    fi
else
    print_error "Failed to analyze unimported files"
fi
echo ""

# 3. Unused exports analysis
echo "📤 Analyzing unused exports..."
if npx ts-unused-exports tsconfig.app.json > unused-exports-report.txt 2>&1; then
    UNUSED_EXPORTS=$(grep -c "unused exports" unused-exports-report.txt || echo "0")
    if [ "$UNUSED_EXPORTS" -gt 0 ]; then
        print_warning "Found modules with unused exports"
    else
        print_status "No unused exports found"
    fi
else
    print_error "Failed to analyze unused exports"
fi
echo ""

# 4. Unused dependencies analysis
echo "📦 Analyzing unused dependencies..."
if npx unimported --show-unused-deps > unused-deps-report.txt 2>&1; then
    UNUSED_DEPS=$(grep -c "│" unused-deps-report.txt || echo "0")
    if [ "$UNUSED_DEPS" -gt 0 ]; then
        print_warning "Found $UNUSED_DEPS unused dependencies"
    else
        print_status "No unused dependencies found"
    fi
else
    print_error "Failed to analyze unused dependencies"
fi
echo ""

# 5. Build test
echo "🏗️  Testing build process..."
if npm run build > build-report.txt 2>&1; then
    print_status "Build completed successfully"
else
    print_error "Build failed - check build-report.txt for details"
fi
echo ""

# 6. Generate comprehensive report
echo "📊 Generating comprehensive analysis report..."

cat > analysis-summary.txt << EOF
# POS Admin Panel - Code Analysis Summary
Generated: $(date)

## Overview
This report provides a summary of the code analysis results.

## Linting Results
$(if [ -f "lint-report.txt" ]; then echo "See lint-report.txt for detailed ESLint results"; else echo "Linting failed"; fi)

## Unused Code Analysis

### Unimported Files
$(if [ -f "unused-files-report.txt" ]; then cat unused-files-report.txt; else echo "Analysis failed"; fi)

### Unused Exports  
$(if [ -f "unused-exports-report.txt" ]; then cat unused-exports-report.txt; else echo "Analysis failed"; fi)

### Unused Dependencies
$(if [ -f "unused-deps-report.txt" ]; then cat unused-deps-report.txt; else echo "Analysis failed"; fi)

## Build Results
$(if [ -f "build-report.txt" ]; then echo "Build completed successfully"; cat build-report.txt | tail -20; else echo "Build failed"; fi)

## Recommendations
1. Review unused files and consider removal or documentation
2. Remove unused exports to reduce bundle size
3. Remove unused dependencies to reduce installation time
4. Address any linting issues for code consistency

## Next Steps
1. Review this analysis with the development team
2. Create issues for major cleanup tasks
3. Set up CI/CD integration for automated analysis
4. Schedule regular analysis runs

For detailed guidelines, see:
- docs/DEVELOPER_GUIDE.md
- docs/UNUSED_CODE_REPORT.md
- docs/STYLING_GUIDE.md
EOF

print_status "Analysis summary generated: analysis-summary.txt"
echo ""

# 7. Clean up individual report files (optional)
read -p "🗑️  Remove individual report files? (keep only analysis-summary.txt) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f lint-report.txt unused-files-report.txt unused-exports-report.txt unused-deps-report.txt build-report.txt
    print_status "Individual report files cleaned up"
else
    print_info "Individual report files preserved"
fi
echo ""

# 8. Summary
echo "📈 Analysis Complete!"
echo "===================="
print_info "Generated files:"
echo "  - analysis-summary.txt (comprehensive report)"
if [ -f "lint-report.txt" ]; then echo "  - lint-report.txt"; fi
if [ -f "unused-files-report.txt" ]; then echo "  - unused-files-report.txt"; fi
if [ -f "unused-exports-report.txt" ]; then echo "  - unused-exports-report.txt"; fi
if [ -f "unused-deps-report.txt" ]; then echo "  - unused-deps-report.txt"; fi
if [ -f "build-report.txt" ]; then echo "  - build-report.txt"; fi
echo ""

print_info "Available scripts for ongoing analysis:"
echo "  npm run analyze:unused    - Run all unused code analysis"
echo "  npm run analyze:files     - Analyze unimported files"
echo "  npm run analyze:exports   - Analyze unused exports"
echo "  npm run analyze:deps      - Analyze unused dependencies"
echo "  npm run lint              - Run ESLint"
echo "  npm run build             - Test build process"
echo ""

print_status "Code analysis completed successfully!"
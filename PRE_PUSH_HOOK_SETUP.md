# Pre-Push Hook Setup Instructions

## Automatic Setup (Recommended)

Run this command once after cloning the repository:

```bash
# Copy the pre-push hook and make it executable
cp scripts/hooks/pre-push .git/hooks/pre-push && chmod +x .git/hooks/pre-push
```

## Manual Setup

1. Create the pre-push hook:
```bash
cat > .git/hooks/pre-push << 'EOF'
#!/bin/sh
echo "🔄 Running pre-push hook..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Push aborted."
    exit 1
fi
echo "✅ Build successful!"
exit 0
EOF
```

2. Make it executable:
```bash
chmod +x .git/hooks/pre-push
```

## What it does

- Runs `npm run build` before every push
- If build fails, the push is aborted
- Helps prevent broken code from being pushed to the repository

## Testing

After setup, try pushing a commit. You should see:
```
🔄 Running pre-push hook...
📦 Building project with 'npm run build'...
✅ Build successful! Continuing with push...
```
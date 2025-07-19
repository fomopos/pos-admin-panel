# Version Bump and Release Workflow

This workflow automatically:
1. Bumps the minor version in `package.json` on every merge to main
2. Creates a git tag with the new version
3. Creates a GitHub release
4. AWS Amplify automatically handles deployment when it detects the changes

## Setup Instructions

### 1. Repository Settings
Ensure your repository has the following permissions enabled:
- **Settings → Actions → General → Workflow permissions**: Select "Read and write permissions"

### 2. AWS Amplify Integration

Your application is already configured with AWS Amplify! Here's how the integration works:

1. **Version Bumping**: This GitHub Actions workflow handles automatic version bumping
2. **Deployment**: AWS Amplify monitors your GitHub repository and automatically deploys when changes are detected
3. **Workflow**: 
   - Developer merges to main
   - GitHub Actions bumps version and pushes back to main
   - AWS Amplify detects the new commit and automatically deploys
   - No additional configuration needed!

### 3. Customization

#### Skip CI Commits
The workflow includes `[skip ci]` in the version bump commit message to prevent infinite loops.

#### Version Strategy
Currently set to bump minor version (x.Y.0). You can modify the bump logic in the workflow if needed:
- For patch bumps: Change the version calculation logic
- For major bumps: Add conditional logic based on commit messages

#### Build Configuration
The workflow runs:
- `npm ci` - Clean install
- `npm run lint` - Code quality check
- Version bumping and tagging (AWS Amplify handles the build and deployment)

### 4. Manual Triggers
The workflow can also be triggered manually from the GitHub Actions tab.

## File Structure
```
.github/
  workflows/
    deploy.yml          # Main deployment workflow
  instructions/
    project_goal.instructions.md
```

## Version History
All versions and releases are tracked in:
- Git tags (e.g., `v1.2.0`)
- GitHub Releases with automated release notes
- `package.json` version field
# POS Admin Panel - Developer Guide

A comprehensive guide for developers to implement new features in the POS Admin Panel application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Architecture Guidelines](#architecture-guidelines)
5. [Feature Implementation Guide](#feature-implementation-guide)
6. [Code Quality & Standards](#code-quality--standards)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Process](#deployment-process)
9. [Troubleshooting](#troubleshooting)
10. [Resources](#resources)

---

## Getting Started

### Prerequisites

- **Node.js**: Version 18+ required
- **npm**: Version 9+ (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended IDE with extensions

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/fomopos/pos-admin-panel.git
cd pos-admin-panel

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Essential VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode", 
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

---

## Project Structure

### High-Level Architecture

```
src/
├── api/                    # API integration layer
├── auth/                   # Authentication services
├── components/             # Reusable UI components
│   ├── ui/                # Core UI components
│   ├── category/          # Feature-specific components
│   ├── product/           # Feature-specific components
│   └── ...
├── hooks/                 # Custom React hooks
├── layouts/               # Page layout components
├── pages/                 # Route-level components
├── routes/                # Routing configuration
├── services/              # Business logic & API services
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── assets/                # Static assets
```

### Key Directories

#### `/src/components/ui/`
Core reusable components following the design system:
- `Widget.tsx` - Primary container component
- `Button.tsx` - Button variations
- `InputTextField.tsx` - Form inputs
- `DropdownSearch.tsx` - Searchable dropdowns
- `Modal.tsx` - Modal dialogs
- `Alert.tsx` - Notification alerts

#### `/src/services/`
Business logic and API integration:
```
services/
├── category/              # Category management
├── product/              # Product management
├── user/                 # User management
├── store/                # Store settings
├── types/                # Service-specific types
└── index.ts              # Service aggregation
```

#### `/src/types/`
TypeScript type definitions:
- Feature-specific types (category.ts, product.ts)
- API response types
- Form data types
- Component prop types

#### `/src/hooks/`
Custom React hooks:
- `useError.ts` - Error handling
- `useLocalStorage.ts` - Local storage management
- Feature-specific hooks

---

## Development Workflow

### Branch Strategy

```bash
# Feature development
git checkout -b feature/feature-name

# Bug fixes
git checkout -b fix/bug-description

# Documentation
git checkout -b docs/documentation-update
```

### Commit Convention

Use conventional commits:

```bash
# Feature
git commit -m "feat: add user permission management"

# Bug fix
git commit -m "fix: resolve category deletion issue"

# Documentation
git commit -m "docs: update API documentation"

# Refactor
git commit -m "refactor: improve error handling"

# Style
git commit -m "style: fix linting issues"
```

### Daily Development Routine

1. **Start with clean state**:
   ```bash
   git pull origin main
   npm install  # If package.json changed
   npm run lint # Check code quality
   npm run build # Verify build works
   ```

2. **Development cycle**:
   ```bash
   npm run dev          # Start dev server
   # Make changes
   npm run lint         # Check for issues
   npm run build        # Verify build
   git add .
   git commit -m "type: description"
   ```

3. **Before push**:
   ```bash
   npm run analyze:unused  # Check for unused code
   npm run lint           # Final lint check
   npm run build          # Final build check
   git push origin feature-branch
   ```

---

## Architecture Guidelines

### State Management

The application uses multiple state management strategies:

1. **Local Component State**: `useState` for simple component state
2. **Zustand Stores**: For complex shared state
3. **Context API**: For theme/auth state
4. **React Query**: For server state (if implemented)

#### Zustand Store Example

```typescript
import { create } from 'zustand';

interface FeatureStore {
  items: Item[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setItems: (items: Item[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFeatureStore = create<FeatureStore>((set) => ({
  items: [],
  loading: false,
  error: null,
  
  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));
```

### Error Handling

Use the centralized error handling system:

```typescript
import { useError } from '../hooks/useError';

function MyComponent() {
  const { showError, showSuccess } = useError();
  
  const handleAction = async () => {
    try {
      await apiCall();
      showSuccess('Operation successful');
    } catch (error) {
      showError(error);
    }
  };
}
```

### API Integration

Use the service layer pattern:

```typescript
// services/feature/featureService.ts
export class FeatureService {
  private baseUrl = '/api/features';
  
  async getAll(): Promise<Feature[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  }
  
  async create(data: CreateFeatureRequest): Promise<Feature> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create');
    return response.json();
  }
}

export const featureService = new FeatureService();
```

---

## Feature Implementation Guide

### Step 1: Plan the Feature

1. **Define requirements**: What does the feature do?
2. **Design API contracts**: What data structures are needed?
3. **Plan UI components**: What screens/components are required?
4. **Identify dependencies**: What existing code can be reused?

### Step 2: Create Types

```typescript
// types/feature.ts
export interface Feature {
  id: string;
  name: string;
  description: string;
  status: FeatureStatus;
  createdAt: string;
  updatedAt: string;
}

export enum FeatureStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

export interface CreateFeatureRequest {
  name: string;
  description: string;
  status?: FeatureStatus;
}

export interface UpdateFeatureRequest extends Partial<CreateFeatureRequest> {
  id: string;
}
```

### Step 3: Implement Service Layer

```typescript
// services/feature/featureService.ts
import { Feature, CreateFeatureRequest, UpdateFeatureRequest } from '../../types/feature';

export class FeatureService {
  private baseUrl = '/api/features';
  
  async getAll(): Promise<Feature[]> {
    // Implementation
  }
  
  async getById(id: string): Promise<Feature> {
    // Implementation
  }
  
  async create(data: CreateFeatureRequest): Promise<Feature> {
    // Implementation
  }
  
  async update(data: UpdateFeatureRequest): Promise<Feature> {
    // Implementation
  }
  
  async delete(id: string): Promise<void> {
    // Implementation
  }
}

export const featureService = new FeatureService();
```

### Step 4: Create State Management

```typescript
// stores/featureStore.ts
import { create } from 'zustand';
import { Feature } from '../types/feature';

interface FeatureStore {
  features: Feature[];
  selectedFeature: Feature | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setFeatures: (features: Feature[]) => void;
  addFeature: (feature: Feature) => void;
  updateFeature: (feature: Feature) => void;
  removeFeature: (id: string) => void;
  setSelectedFeature: (feature: Feature | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFeatureStore = create<FeatureStore>((set, get) => ({
  features: [],
  selectedFeature: null,
  loading: false,
  error: null,
  
  setFeatures: (features) => set({ features }),
  
  addFeature: (feature) => set((state) => ({
    features: [...state.features, feature]
  })),
  
  updateFeature: (updatedFeature) => set((state) => ({
    features: state.features.map(feature =>
      feature.id === updatedFeature.id ? updatedFeature : feature
    )
  })),
  
  removeFeature: (id) => set((state) => ({
    features: state.features.filter(feature => feature.id !== id)
  })),
  
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));
```

### Step 5: Create UI Components

#### Feature List Component

```typescript
// components/feature/FeatureList.tsx
import React, { useEffect } from 'react';
import { Widget, Button, SearchAndFilter } from '../ui';
import { useFeatureStore } from '../../stores/featureStore';
import { featureService } from '../../services/feature/featureService';
import { useError } from '../../hooks/useError';

export const FeatureList: React.FC = () => {
  const { features, loading, setFeatures, setLoading } = useFeatureStore();
  const { showError } = useError();
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    loadFeatures();
  }, []);
  
  const loadFeatures = async () => {
    try {
      setLoading(true);
      const data = await featureService.getAll();
      setFeatures(data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search features..."
        actions={
          <Button onClick={() => navigate('/features/create')}>
            Add Feature
          </Button>
        }
      />
      
      <Widget title="Features" className="overflow-hidden">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-4">
            {filteredFeatures.map(feature => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        )}
      </Widget>
    </div>
  );
};
```

#### Feature Form Component

```typescript
// components/feature/FeatureForm.tsx
import React, { useState } from 'react';
import { Widget, InputTextField, Button, DropdownSearch } from '../ui';
import { CreateFeatureRequest, FeatureStatus } from '../../types/feature';
import { useError } from '../../hooks/useError';

interface FeatureFormProps {
  onSubmit: (data: CreateFeatureRequest) => Promise<void>;
  initialData?: Partial<CreateFeatureRequest>;
  isLoading?: boolean;
}

export const FeatureForm: React.FC<FeatureFormProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateFeatureRequest>({
    name: initialData.name || '',
    description: initialData.description || '',
    status: initialData.status || FeatureStatus.ACTIVE
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const statusOptions = [
    { id: FeatureStatus.ACTIVE, label: 'Active' },
    { id: FeatureStatus.INACTIVE, label: 'Inactive' },
    { id: FeatureStatus.PENDING, label: 'Pending' }
  ];
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in parent component
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Widget title="Feature Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="Name"
            required
            value={formData.name}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            error={errors.name}
            placeholder="Enter feature name"
          />
          
          <DropdownSearch
            label="Status"
            value={formData.status}
            options={statusOptions}
            onSelect={(option) => setFormData(prev => ({ 
              ...prev, 
              status: option?.id as FeatureStatus 
            }))}
            placeholder="Select status"
          />
          
          <InputTextField
            label="Description"
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            error={errors.description}
            placeholder="Enter feature description"
            colSpan="md:col-span-2"
          />
        </div>
      </Widget>
      
      <div className="flex justify-end space-x-3">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit" 
          isLoading={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Feature'}
        </Button>
      </div>
    </form>
  );
};
```

### Step 6: Create Pages

```typescript
// pages/feature/FeatureListPage.tsx
import React from 'react';
import { PageHeader } from '../../components/ui';
import { FeatureList } from '../../components/feature/FeatureList';

export const FeatureListPage: React.FC = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Features"
        description="Manage application features and their settings"
      />
      <FeatureList />
    </div>
  );
};
```

### Step 7: Add Routes

```typescript
// routes/featureRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import { FeatureListPage } from '../pages/feature/FeatureListPage';
import { CreateFeaturePage } from '../pages/feature/CreateFeaturePage';
import { EditFeaturePage } from '../pages/feature/EditFeaturePage';

export const FeatureRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<FeatureListPage />} />
      <Route path="create" element={<CreateFeaturePage />} />
      <Route path=":id/edit" element={<EditFeaturePage />} />
    </Routes>
  );
};
```

### Step 8: Update Main Routes

```typescript
// routes/index.tsx
import { FeatureRoutes } from './featureRoutes';

// Add to main routes
<Route path="/features/*" element={<FeatureRoutes />} />
```

---

## Code Quality & Standards

### ESLint Configuration

The project uses strict ESLint rules. Common issues and fixes:

```typescript
// ❌ Avoid
function Component() {
  const [data, setData] = useState(null); // any type
  
  const handleClick = (e: any) => { // any type
    console.log(e);
  };
  
  return <div onClick={handleClick}>Click</div>;
}

// ✅ Prefer
function Component() {
  const [data, setData] = useState<DataType | null>(null);
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log(e);
  };
  
  return <div onClick={handleClick}>Click</div>;
}
```

### TypeScript Best Practices

1. **Use strict types**:
```typescript
// ❌ Avoid
interface User {
  name: string;
  data: any; // Too generic
}

// ✅ Prefer
interface User {
  name: string;
  data: {
    preferences: UserPreferences;
    settings: UserSettings;
  };
}
```

2. **Use enums for constants**:
```typescript
// ❌ Avoid
const STATUS_ACTIVE = 'active';
const STATUS_INACTIVE = 'inactive';

// ✅ Prefer
enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
```

3. **Use union types for options**:
```typescript
// ✅ Good
type Theme = 'light' | 'dark';
type Size = 'sm' | 'md' | 'lg';
```

### Component Best Practices

1. **Use proper TypeScript interfaces**:
```typescript
interface ComponentProps {
  title: string;
  isLoading?: boolean;
  onSubmit: (data: FormData) => void;
  children?: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({
  title,
  isLoading = false,
  onSubmit,
  children
}) => {
  // Component implementation
};
```

2. **Use custom hooks for logic**:
```typescript
// Custom hook
function useFeatureData(id: string) {
  const [data, setData] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadFeature(id);
  }, [id]);
  
  const loadFeature = async (featureId: string) => {
    setLoading(true);
    try {
      const feature = await featureService.getById(featureId);
      setData(feature);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  
  return { data, loading, reload: () => loadFeature(id) };
}
```

### Unused Code Prevention

Use these scripts regularly:

```bash
# Check for unused code before committing
npm run analyze:unused

# Individual checks
npm run analyze:files    # Unimported files
npm run analyze:exports  # Unused exports
npm run analyze:deps     # Unused dependencies
```

### Import Organization

Organize imports in this order:

```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal components (UI first)
import { Widget, Button, InputTextField } from '../components/ui';
import { FeatureCard } from '../components/feature';

// 3. Services and utilities
import { featureService } from '../services/feature';
import { useError } from '../hooks/useError';

// 4. Types
import { Feature, CreateFeatureRequest } from '../types/feature';
```

---

## Testing Strategy

### Unit Testing

Create tests for utilities and hooks:

```typescript
// utils/__tests__/validation.test.ts
import { validateEmail, validateRequired } from '../validation';

describe('validation utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });
    
    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });
});
```

### Component Testing

Use React Testing Library for component tests:

```typescript
// components/__tests__/FeatureForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeatureForm } from '../FeatureForm';

describe('FeatureForm', () => {
  it('should render form fields', () => {
    const mockOnSubmit = jest.fn();
    
    render(<FeatureForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });
  
  it('should validate required fields', async () => {
    const mockOnSubmit = jest.fn();
    
    render(<FeatureForm onSubmit={mockOnSubmit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });
});
```

### Manual Testing

Create a checklist for manual testing:

1. **Feature Creation**:
   - [ ] Form validation works
   - [ ] Success message appears
   - [ ] Redirects to list page
   - [ ] New item appears in list

2. **Feature Editing**:
   - [ ] Form pre-populates with existing data
   - [ ] Changes are saved correctly
   - [ ] Success feedback is shown

3. **Feature Deletion**:
   - [ ] Confirmation dialog appears
   - [ ] Item is removed from list
   - [ ] Success message is shown

---

## Deployment Process

### Build Process

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Run type checking
npm run build

# Check for unused code
npm run analyze:unused
```

### Environment Configuration

Create environment-specific configurations:

```typescript
// config/environment.ts
interface EnvironmentConfig {
  apiBaseUrl: string;
  enableDebug: boolean;
  enableAnalytics: boolean;
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    apiBaseUrl: 'http://localhost:3000/api',
    enableDebug: true,
    enableAnalytics: false
  },
  production: {
    apiBaseUrl: 'https://api.example.com',
    enableDebug: false,
    enableAnalytics: true
  }
};

export const config = environments[import.meta.env.MODE] || environments.development;
```

### Pre-deployment Checklist

- [ ] All tests pass
- [ ] No ESLint errors
- [ ] Build completes successfully
- [ ] No unused code warnings
- [ ] Performance metrics acceptable
- [ ] Security scan passes
- [ ] Documentation updated

---

## Troubleshooting

### Common Issues

#### 1. TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.tmp

# Restart TypeScript server in VS Code
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

#### 2. Vite Build Issues

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 3. ESLint Errors

```bash
# Auto-fix fixable issues
npm run lint -- --fix

# Check specific file
npx eslint src/path/to/file.tsx
```

#### 4. Unused Code Warnings

```bash
# Get detailed analysis
npm run analyze:full

# Check specific type
npm run analyze:files
npm run analyze:exports
npm run analyze:deps
```

### Performance Issues

1. **Large bundle size**:
   - Use dynamic imports for routes
   - Analyze bundle with `npm run build -- --analyze`
   - Remove unused dependencies

2. **Slow development server**:
   - Reduce number of watched files
   - Use `.env.local` for environment variables
   - Optimize Vite configuration

### Debug Tools

Enable development tools:

```typescript
// In main.tsx for development
if (import.meta.env.DEV) {
  // Enable React DevTools
  import('./dev-tools').then(({ setupDevTools }) => {
    setupDevTools();
  });
}
```

---

## Resources

### Documentation

- [Styling Guide](./STYLING_GUIDE.md) - UI component and styling guidelines
- [Error Handling Framework](./framework/ERROR_HANDLING_FRAMEWORK.md) - Error handling system
- [Unused Code Report](./UNUSED_CODE_REPORT.md) - Current unused code analysis

### External Resources

- **React**: [Official Documentation](https://react.dev/)
- **TypeScript**: [Handbook](https://www.typescriptlang.org/docs/)
- **Tailwind CSS**: [Documentation](https://tailwindcss.com/docs)
- **Zustand**: [Documentation](https://zustand.surge.sh/)
- **React Router**: [Documentation](https://reactrouter.com/)
- **Vite**: [Documentation](https://vitejs.dev/)

### Code Examples

Check these files for implementation examples:
- `src/components/category/` - Complete feature implementation
- `src/pages/user/` - User management examples
- `src/components/ui/` - Reusable component patterns

### Tools

- **Code Analysis**: `npm run analyze:unused`
- **Linting**: `npm run lint`
- **Build**: `npm run build`
- **Development**: `npm run dev`

### Getting Help

1. Check existing documentation first
2. Look for similar implementations in the codebase
3. Use TypeScript errors as guidance
4. Check the console for runtime errors
5. Use React DevTools for component debugging

---

## Contribution Guidelines

### Before Starting

1. Understand the requirements clearly
2. Check existing implementations for patterns
3. Plan the feature architecture
4. Discuss breaking changes with the team

### Implementation

1. Start with types and interfaces
2. Implement service layer
3. Create UI components using design system
4. Add proper error handling
5. Write tests (if testing is set up)
6. Update documentation

### Code Review

Ensure your code:
- [ ] Follows TypeScript best practices
- [ ] Uses existing UI components
- [ ] Implements proper error handling
- [ ] Has no unused imports/exports
- [ ] Follows naming conventions
- [ ] Includes proper type definitions
- [ ] Is well-documented

### Maintenance

- Regularly run unused code analysis
- Keep dependencies updated
- Monitor performance metrics
- Update documentation as features evolve
- Refactor when patterns emerge

This guide should be updated as the application evolves and new patterns emerge.
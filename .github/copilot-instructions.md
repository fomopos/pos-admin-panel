# POS Admin Panel - AI Coding Agent Instructions

## Project Overview
React-based admin panel for a Point of Sale system with multi-tenant support, built on Vite + TypeScript + Tailwind CSS. Features AWS Cognito authentication, i18n support (6 languages including RTL Arabic), and a comprehensive design system.

## Critical Architecture Patterns

### Multi-Tenant Architecture
- **Tenant Store** (`src/tenants/tenantStore.ts`): Zustand store managing tenant/store selection with persistence
- Every component requiring tenant context uses `const { currentTenant, currentStore } = useTenantStore()`
- API calls automatically inject `X-Tenant-Id` header via `apiClient` (see `src/services/api.ts`)
- **IMPORTANT**: User must select both tenant AND store before accessing dashboard routes
- Routes with `requiresTenantStore={true}` redirect to `/tenant-store-selection` if missing

### State Management Strategy
- **Zustand** for global state (tenant, error handling)
- **Local state** (useState) for component-specific data
- **No Redux** - use Zustand with middleware for persistence
- Store data persists in localStorage via `persist` middleware

### Authentication Flow (AWS Cognito)
1. Sign in via `authService.signIn()` - returns Cognito session
2. Protected routes check `authService.isAuthenticated()`
3. On logout, `clearAllData()` clears tenant store before Cognito signOut
4. Access tokens automatically added to API requests via `apiClient`

### API Integration Patterns
```typescript
// Use enhanced apiClient from src/services/api.ts
import { apiClient } from '../services/api';

const response = await apiClient.get('/endpoint', { params });
// Automatically handles: auth tokens, tenant headers, error parsing
```

**Error Response Format**:
```typescript
interface ApiErrorResponse {
  code: number;
  slug: string;      // e.g., 'VALIDATION_ERROR'
  message: string;
  details?: Record<string, string>; // field-level errors
}
```

### Error Handling Framework
**Mandatory**: Use the global error handling system for ALL error scenarios:

```typescript
import { useError } from '../hooks/useError';

// In components
const { showError, showSuccess } = useError();

try {
  await operation();
  showSuccess('Operation completed!');
} catch (error) {
  showError(error); // Automatically parses and displays
}
```

- Error boundary wraps entire app in `App.tsx`
- Global handlers catch unhandled rejections/errors (setup in `main.tsx`)
- Toast notifications via react-toastify (4 severities: info/warning/error/critical)
- See `docs/framework/ERROR_HANDLING_FRAMEWORK.md` for complete patterns

## UI Component System

### Import ALL UI components from barrel export:
```typescript
import { 
  Widget, InputTextField, InputTextArea, Button, 
  DropdownSearch, MultipleDropdownSearch, Alert
} from '../components/ui';
```

### Core Component Usage

**Page Structure** (from `docs/STYLING_GUIDE.md`):
```tsx
<div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
  <PageHeader title="Page Title" description="Description">
    <Button variant="primary">Action</Button>
  </PageHeader>
  
  <Alert variant="success">Success message</Alert>
  
  <Widget title="Section" icon={IconComponent} variant="default">
    {/* Content */}
  </Widget>
</div>
```

**Form Patterns**:
- Use `grid grid-cols-1 md:grid-cols-2 gap-6` for form layouts
- `InputTextField` for text inputs, `InputTextArea` for multi-line (see docs/STYLING_GUIDE.md for all props)
- `DropdownSearch` for single selection with search
- `MultipleDropdownSearch` for multi-select (categories, tags, permissions)
- All form components support `error` prop for validation display

**Button Variants**: `primary | secondary | outline | ghost | destructive`

**SearchAndFilter Component**: Use for all list pages with filtering needs (see extensive docs in STYLING_GUIDE.md)

## Internationalization (i18n)

### Translation Keys Structure
Translations live in `src/locales/{lang}/translation.json` with namespaced keys:
```json
{
  "common": { "save": "Save", "cancel": "Cancel" },
  "products": { "title": "Products", "addNew": "Add Product" }
}
```

Usage in components:
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<h1>{t('products.title')}</h1>
```

**Supported Languages**: en, es, hi, ar (RTL), de, sk
- RTL support automatic via `document.dir` in i18n config
- Language detection from localStorage → browser → fallback to 'en'

## Development Workflows

### Build & Dev Commands
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint
npm run preview      # Preview production build
```

### Version Management
- Version in `package.json` injected via Vite config as `import.meta.env.VITE_APP_VERSION`
- Auto-bumped on merge to main via GitHub Actions (`.github/workflows/deploy.yml`)
- Display version with `<VersionDisplay />` component

### Environment Variables
Key variables in `.env`:
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:3001/api in dev)
- AWS Cognito config in `src/auth/config.ts`

## Project-Specific Conventions

### File Organization
- **Services**: API logic in `src/services/{domain}/{domain}Service.ts`
- **Types**: TypeScript interfaces in `src/services/types/{domain}.types.ts`
- **Pages**: Route components in `src/pages/{PageName}.tsx`
- **Components**: Shared UI in `src/components/ui/`, domain components in `src/components/{domain}/`

### Naming Conventions
- **Components**: PascalCase (`ProductEdit.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useCategories.ts`)
- **Services**: camelCase with 'Service' suffix (`categoryService.ts`)
- **Types**: PascalCase interfaces (`Product`, `Category`)

### Code Style
- **No `any`** - use proper TypeScript types
- **Functional components** with hooks (no class components)
- **Arrow functions** for component definitions
- **Destructure props** in function signatures
- **Optional chaining** (`?.`) for nullable navigation

## Common Tasks

### Adding a New CRUD Page
1. Create service in `src/services/{domain}/` with `getAll`, `getById`, `create`, `update`, `delete`
2. Define types in `src/services/types/{domain}.types.ts`
3. Create list page using `SearchAndFilter` + `Widget` pattern
4. Create edit page with form validation (see STYLING_GUIDE.md CRUD section)
5. Add routes in `App.tsx` within `<DashboardLayout>` route

### Adding Translations
1. Add keys to `src/locales/en/translation.json` (source of truth)
2. Copy structure to other language files
3. Run `npm run validate-translations` to check completeness
4. Use `t('namespace.key')` in components

### Working with Forms
- Use `useState` for form data
- Track `originalData` for change detection: `hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)`
- Validate with `useFormError` hook or inline validation
- Clear field errors on input change with `useEffect`
- Show loading state with `isLoading` prop on buttons

## Documentation References
- **Styling patterns**: `docs/STYLING_GUIDE.md` (comprehensive component usage)
- **Error handling**: `docs/framework/ERROR_HANDLING_FRAMEWORK.md`
- **Other domain docs**: `docs/CATEGORY_CACHING_GUIDE.md`, `docs/EMPLOYEE_MANAGEMENT_IMPLEMENTATION.md`, etc.

## Testing & Debugging
- **Debug tenant/store state**: Visit `/debug/tenant-access` page
- **Test i18n**: Visit `/i18n-test` page
- **Test error handling**: Visit `/error-examples` (if `ErrorHandlingExamples` component is routed)
- Console logs prefixed with emojis for visibility (🔍 search, 🚀 init, ✅ success, ❌ error)

## Key Dependencies
- **React 19** + React Router 7 for routing
- **Tailwind CSS 4** + Heroicons for styling
- **Zustand** for state management
- **i18next** for internationalization
- **AWS Amplify** for Cognito auth
- **react-toastify** for notifications

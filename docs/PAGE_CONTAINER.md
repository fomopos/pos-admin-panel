# PageContainer Component - Unified Background Styling

## Overview
The `PageContainer` component provides consistent background styling and spacing across all pages in the application. It eliminates the need to repeatedly write the same background and spacing classes on every page.

## Location
`src/components/ui/PageContainer.tsx`

## Import
```typescript
import { PageContainer } from '../components/ui';
```

## Basic Usage

### Default (Gradient Background)
```typescript
<PageContainer>
  <PageHeader title="My Page" description="Page description" />
  <div>Your content here</div>
</PageContainer>
```

This automatically applies:
- `min-h-screen` - Full viewport height
- `bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40` - Gradient background
- `p-4 space-y-6` - Padding and vertical spacing

## Props

### `variant` (optional)
Controls the background style.

**Options:**
- `'default'` - Blue gradient background (same as SalesDetail page)
- `'minimal'` - Clean white background
- `'gradient'` - Gray gradient background
- `'solid'` - Solid gray background

**Default:** `'default'`

**Examples:**
```typescript
// Default blue gradient
<PageContainer variant="default">
  <Content />
</PageContainer>

// Clean white background
<PageContainer variant="minimal">
  <Content />
</PageContainer>

// Gray gradient
<PageContainer variant="gradient">
  <Content />
</PageContainer>

// Solid gray
<PageContainer variant="solid">
  <Content />
</PageContainer>
```

### `spacing` (optional)
Controls padding and vertical spacing between child elements.

**Options:**
- `'none'` - No padding or spacing
- `'sm'` - Small: `p-2 space-y-4`
- `'md'` - Medium: `p-4 space-y-6`
- `'lg'` - Large: `p-6 space-y-8`

**Default:** `'md'`

**Examples:**
```typescript
// Compact spacing
<PageContainer spacing="sm">
  <Content />
</PageContainer>

// Medium spacing (default)
<PageContainer spacing="md">
  <Content />
</PageContainer>

// Large spacing
<PageContainer spacing="lg">
  <Content />
</PageContainer>

// No spacing (manage your own)
<PageContainer spacing="none">
  <div className="p-8">
    <Content />
  </div>
</PageContainer>
```

### `fullHeight` (optional)
Controls whether the container takes up full viewport height.

**Type:** `boolean`  
**Default:** `true`

**Examples:**
```typescript
// Full height (default)
<PageContainer fullHeight={true}>
  <Content />
</PageContainer>

// Auto height based on content
<PageContainer fullHeight={false}>
  <Content />
</PageContainer>
```

### `className` (optional)
Add custom Tailwind classes to extend or override default styling.

**Type:** `string`

**Examples:**
```typescript
// Add maximum width
<PageContainer className="max-w-7xl mx-auto">
  <Content />
</PageContainer>

// Center content
<PageContainer className="flex items-center justify-center">
  <Content />
</PageContainer>

// Custom padding on specific breakpoints
<PageContainer className="lg:p-8 xl:p-12">
  <Content />
</PageContainer>
```

## Complete Examples

### Sales Detail Page (Current Implementation)
```typescript
import { PageContainer, PageHeader, Card } from '../components/ui';

const SalesDetail: React.FC = () => {
  return (
    <PageContainer variant="default" spacing="lg">
      <PageHeader title="Transaction Details" />
      
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          {/* Content */}
        </Card>
      </div>
    </PageContainer>
  );
};
```

### List Page
```typescript
import { PageContainer, PageHeader } from '../components/ui';

const ProductsList: React.FC = () => {
  return (
    <PageContainer variant="solid" spacing="md">
      <PageHeader 
        title="Products" 
        description="Manage your product catalog"
      />
      
      <DataTable 
        data={products}
        columns={columns}
      />
    </PageContainer>
  );
};
```

### Form Page
```typescript
import { PageContainer, Card } from '../components/ui';

const ProductEdit: React.FC = () => {
  return (
    <PageContainer variant="minimal" spacing="md">
      <div className="max-w-4xl mx-auto">
        <Card>
          <form>
            {/* Form fields */}
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};
```

### Dashboard Page
```typescript
import { PageContainer, Widget } from '../components/ui';

const Dashboard: React.FC = () => {
  return (
    <PageContainer variant="gradient" spacing="lg">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Widget title="Sales">
          <KPICard />
        </Widget>
        <Widget title="Orders">
          <KPICard />
        </Widget>
        <Widget title="Revenue">
          <KPICard />
        </Widget>
      </div>
    </PageContainer>
  );
};
```

### Error Page
```typescript
import { PageContainer, Card, Button } from '../components/ui';

const NotFound: React.FC = () => {
  return (
    <PageContainer variant="minimal" spacing="md">
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
};
```

### Loading State
```typescript
import { PageContainer, Loading } from '../components/ui';

const ProductDetail: React.FC = () => {
  if (isLoading) {
    return (
      <PageContainer variant="minimal">
        <Loading 
          title="Loading Product"
          description="Please wait..."
        />
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      {/* Content */}
    </PageContainer>
  );
};
```

## Migration Guide

### Before (Manual Classes)
```typescript
const SalesDetail: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
      <PageHeader title="Transaction" />
      <div>Content</div>
    </div>
  );
};
```

### After (Using PageContainer)
```typescript
const SalesDetail: React.FC = () => {
  return (
    <PageContainer variant="default" spacing="lg">
      <PageHeader title="Transaction" />
      <div>Content</div>
    </PageContainer>
  );
};
```

## Background Variants Reference

### Default Variant
```css
bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40
```
- Subtle blue gradient
- Professional, modern look
- Best for: Detail pages, forms, dashboards

### Minimal Variant
```css
bg-white
```
- Clean white background
- Best for: Forms, modals, simple content pages

### Gradient Variant
```css
bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100
```
- Neutral gray gradient
- Best for: Reports, analytics pages

### Solid Variant
```css
bg-gray-50
```
- Flat gray background
- Best for: List pages, tables, data-heavy pages

## Spacing Reference

| Spacing | Padding | Vertical Gap | Use Case |
|---------|---------|--------------|----------|
| `none` | None | None | Full control over spacing |
| `sm` | `p-2` (8px) | `space-y-4` (16px) | Compact layouts, mobile |
| `md` | `p-4` (16px) | `space-y-6` (24px) | Default, most pages |
| `lg` | `p-6` (24px) | `space-y-8` (32px) | Spacious layouts, detail pages |

## Best Practices

1. **Use consistently** - Apply to all page-level components
2. **Choose appropriate variant** - Match the page type
3. **Consider spacing** - Use `lg` for detail pages, `md` for lists
4. **Add max-width when needed** - Use `className="max-w-7xl mx-auto"`
5. **Nest content properly** - PageContainer > PageHeader > Content
6. **Don't nest PageContainers** - Use only at the top level

## Common Patterns

### Page with Header and Content
```typescript
<PageContainer>
  <PageHeader title="Page Title" />
  <div className="max-w-7xl mx-auto">
    {/* Content */}
  </div>
</PageContainer>
```

### Centered Content Page
```typescript
<PageContainer className="flex items-center justify-center">
  <Card className="max-w-md">
    {/* Centered content */}
  </Card>
</PageContainer>
```

### Two-Column Layout
```typescript
<PageContainer spacing="lg">
  <PageHeader title="Settings" />
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
    <aside className="lg:col-span-1">
      {/* Sidebar */}
    </aside>
    <main className="lg:col-span-2">
      {/* Main content */}
    </main>
  </div>
</PageContainer>
```

## Accessibility

The PageContainer component:
- ✅ Maintains proper semantic structure
- ✅ Doesn't interfere with screen readers
- ✅ Supports all standard div attributes
- ✅ Works with keyboard navigation

## Performance

- Uses utility-first CSS (no runtime overhead)
- Leverages Tailwind's JIT compiler
- No JavaScript required for styling
- Minimal DOM footprint (single `div` element)

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { PageContainerProps } from '../components/ui';

const props: PageContainerProps = {
  variant: 'default',
  spacing: 'md',
  fullHeight: true,
  className: 'max-w-7xl mx-auto',
  children: <div>Content</div>
};
```

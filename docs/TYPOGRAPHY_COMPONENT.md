# Typography Component Guide

## Overview
The Typography component provides a consistent, reusable way to display text across the application with proper semantic HTML, responsive sizing, and flexible styling options.

## Import

```typescript
// Main component
import { Typography } from '../components/ui';

// Or use convenience components
import { H1, H2, H3, Body1, Body2, Caption, Label } from '../components/ui';
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `TypographyVariant` | `'body1'` | Text style variant (see variants below) |
| `color` | `TypographyColor` | `'primary'` | Text color (see colors below) |
| `align` | `TypographyAlign` | `'left'` | Text alignment |
| `weight` | `TypographyWeight` | - | Font weight override |
| `className` | `string` | - | Additional CSS classes |
| `as` | `React.ElementType` | - | Override HTML element |
| `noWrap` | `boolean` | `false` | Truncate text with ellipsis |
| `gutterBottom` | `boolean` | `false` | Add bottom margin (mb-4) |
| `children` | `React.ReactNode` | - | Text content (required) |

## Variants

### Headings
| Variant | HTML Element | Size | Weight | Usage |
|---------|-------------|------|--------|-------|
| `h1` | `<h1>` | 4xl/5xl | Bold | Main page titles |
| `h2` | `<h2>` | 3xl/4xl | Bold | Section titles |
| `h3` | `<h3>` | 2xl/3xl | Semibold | Subsection titles |
| `h4` | `<h4>` | xl/2xl | Semibold | Card/widget titles |
| `h5` | `<h5>` | lg/xl | Medium | Minor headings |
| `h6` | `<h6>` | base/lg | Medium | Smallest headings |

### Body Text
| Variant | HTML Element | Size | Weight | Usage |
|---------|-------------|------|--------|-------|
| `body1` | `<p>` | base | Normal | Primary body text |
| `body2` | `<p>` | sm | Normal | Secondary body text |
| `subtitle1` | `<h6>` | lg | Medium | Emphasized subtitles |
| `subtitle2` | `<h6>` | base | Medium | Secondary subtitles |

### Special Text
| Variant | HTML Element | Size | Weight | Usage |
|---------|-------------|------|--------|-------|
| `caption` | `<span>` | xs | Normal | Small descriptions, hints |
| `overline` | `<span>` | xs | Medium | Uppercase section labels |
| `label` | `<label>` | sm | Medium | Form field labels |

## Colors

| Color | Tailwind Class | Usage |
|-------|---------------|-------|
| `primary` | `text-gray-900` | Main content (default) |
| `secondary` | `text-gray-700` | Secondary content |
| `muted` | `text-gray-500` | De-emphasized text |
| `error` | `text-red-600` | Error messages |
| `success` | `text-green-600` | Success messages |
| `warning` | `text-orange-600` | Warning messages |
| `info` | `text-blue-600` | Informational text |
| `inherit` | `text-inherit` | Inherit from parent |

## Text Alignment

| Value | Description |
|-------|-------------|
| `left` | Left-aligned (default) |
| `center` | Centered |
| `right` | Right-aligned |
| `justify` | Justified |

## Font Weights

| Weight | Tailwind Class |
|--------|---------------|
| `light` | `font-light` |
| `normal` | `font-normal` |
| `medium` | `font-medium` |
| `semibold` | `font-semibold` |
| `bold` | `font-bold` |

## Usage Examples

### Basic Usage

```tsx
import { Typography } from '../components/ui';

// Page title
<Typography variant="h1" gutterBottom>
  Product Management
</Typography>

// Body text
<Typography variant="body1" color="secondary">
  Manage your product catalog, pricing, and inventory from this dashboard.
</Typography>

// Small caption
<Typography variant="caption" color="muted">
  Last updated: {formattingService.formatDateTime(lastUpdated)}
</Typography>
```

### Convenience Components

```tsx
import { H1, H2, Body1, Caption, Label } from '../components/ui';

<H1 gutterBottom>Dashboard</H1>
<H2 color="secondary">Sales Overview</H2>
<Body1>Your sales performance for this month.</Body1>
<Caption color="muted">Updated 5 minutes ago</Caption>
<Label>Product Name</Label>
```

### Page Header Pattern

```tsx
<div className="space-y-2 mb-6">
  <H1 gutterBottom>Sales Transactions</H1>
  <Body1 color="secondary">
    View and manage all sales transactions across your stores.
  </Body1>
</div>
```

### Widget Title Pattern

```tsx
<div className="space-y-1">
  <H4>Transaction Details</H4>
  <Caption color="muted">Transaction ID: {transaction.id}</Caption>
</div>
```

### Status Display

```tsx
<Typography 
  variant="label" 
  color={status === 'completed' ? 'success' : 'warning'}
>
  {status.toUpperCase()}
</Typography>
```

### Responsive Text

```tsx
// Text automatically responsive with md: breakpoint
<H1>Welcome</H1> // 4xl on mobile, 5xl on desktop

// Override alignment on larger screens
<Typography variant="body1" className="md:text-center">
  Centered on desktop, left-aligned on mobile
</Typography>
```

### Truncated Text

```tsx
<Typography variant="body2" noWrap>
  This very long text will be truncated with ellipsis...
</Typography>
```

### Custom HTML Element

```tsx
// Render h2 styling but with div element
<Typography variant="h2" as="div">
  Section Title
</Typography>

// Render as link
<Typography variant="subtitle1" as="a" href="/products">
  View All Products
</Typography>
```

### With Custom Styling

```tsx
<Typography 
  variant="body1" 
  color="primary"
  className="italic underline hover:text-blue-600 transition-colors"
>
  Custom styled text
</Typography>
```

## Integration with Existing Components

### Replace inline headings

**Before:**
```tsx
<h2 className="text-2xl font-semibold text-gray-900 mb-4">
  Products
</h2>
```

**After:**
```tsx
<H2 gutterBottom>Products</H2>
```

### Replace span/p with colors

**Before:**
```tsx
<span className="text-sm text-gray-500">
  {item.description}
</span>
```

**After:**
```tsx
<Typography variant="body2" color="muted">
  {item.description}
</Typography>
```

### Form labels

**Before:**
```tsx
<label className="block text-sm font-medium text-gray-700 mb-1">
  Product Name
</label>
```

**After:**
```tsx
<Label className="block mb-1">Product Name</Label>
```

## Common Patterns

### Card/Widget Header
```tsx
<div className="flex items-center justify-between mb-4">
  <H3>Recent Orders</H3>
  <Caption color="muted">Last 30 days</Caption>
</div>
```

### List Item
```tsx
<div className="space-y-1">
  <Typography variant="subtitle2">{item.name}</Typography>
  <Body2 color="secondary">{item.description}</Body2>
  <Caption color="muted">{formattingService.formatCurrency(item.price)}</Caption>
</div>
```

### Error Message
```tsx
<Typography variant="body2" color="error" className="mt-1">
  {errorMessage}
</Typography>
```

### Empty State
```tsx
<div className="text-center py-12">
  <Body1 color="muted">No products found</Body1>
  <Caption color="muted" className="mt-1">
    Try adjusting your filters
  </Caption>
</div>
```

### Data Display
```tsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <Caption color="muted">Total Sales</Caption>
    <H3>{formattingService.formatCurrency(totalSales)}</H3>
  </div>
  <div>
    <Caption color="muted">Orders</Caption>
    <H3>{orderCount}</H3>
  </div>
</div>
```

## Responsive Design

All heading variants automatically scale up on larger screens:
- Mobile: Base size
- Desktop (md+): Larger size

Example: `h1` is `text-4xl` on mobile, `text-5xl` on desktop

## Accessibility

- Uses semantic HTML elements by default
- Proper heading hierarchy (h1 → h6)
- Label variant renders `<label>` for form fields
- Can override element while keeping styles with `as` prop

## Best Practices

1. **Use semantic variants**: Choose variants that match content hierarchy
2. **Consistent color usage**: Use color props instead of custom classes
3. **Heading hierarchy**: Maintain proper h1 → h6 order
4. **Convenience components**: Use `H1`, `Body1`, etc. for cleaner code
5. **Combine with spacing**: Use Tailwind spacing utilities or `gutterBottom`
6. **Responsive by default**: Trust built-in responsive scaling

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { 
  TypographyProps, 
  TypographyVariant, 
  TypographyColor,
  TypographyAlign,
  TypographyWeight
} from '../components/ui';
```

## Migration Guide

### From Raw HTML
```tsx
// Before
<h1 className="text-4xl font-bold text-gray-900">Title</h1>

// After
<H1>Title</H1>
```

### From Inline Styles
```tsx
// Before
<p style={{ fontSize: '14px', color: '#6B7280' }}>Description</p>

// After
<Body2 color="secondary">Description</Body2>
```

### From Mixed Classes
```tsx
// Before
<div className="text-sm font-medium text-gray-700">Label</div>

// After
<Label as="div">Label</Label>
```

## Examples by Use Case

### Sales Detail Page
```tsx
// Page header
<H2 gutterBottom>Transaction Details</H2>

// Info labels
<Caption color="muted">Transaction ID</Caption>
<Body1>{transaction.id}</Body1>

// Status
<Label color={status === 'completed' ? 'success' : 'warning'}>
  {status}
</Label>

// Amounts
<Caption color="muted">Total Amount</Caption>
<H3>{formattingService.formatCurrency(total)}</H3>
```

### Product List
```tsx
{products.map(product => (
  <div key={product.id}>
    <Subtitle1>{product.name}</Subtitle1>
    <Body2 color="secondary">{product.description}</Body2>
    <Caption color="muted">
      SKU: {product.sku} | {formattingService.formatCurrency(product.price)}
    </Caption>
  </div>
))}
```

### Dashboard KPI Card
```tsx
<Widget>
  <Overline color="muted">TOTAL REVENUE</Overline>
  <H2 className="mt-2">{formattingService.formatCurrency(revenue)}</H2>
  <Caption color="success" className="flex items-center mt-1">
    <span>↑ 12.5% from last month</span>
  </Caption>
</Widget>
```

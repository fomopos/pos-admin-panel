# AdvancedSearchFilter Component

## Overview

A comprehensive, reusable search and filter component designed to provide a consistent filtering experience across the application. It combines search functionality, view mode toggles, basic and advanced filters, and active filter management in a single, cohesive interface.

## Features

✅ **Search Bar**
- Real-time search with clear button
- Customizable placeholder
- Optional search fields display

✅ **View Mode Toggle**
- Grid, List, and Table views
- Configurable enabled views
- Visual active state

✅ **Filter System**
- Basic filters (always visible)
- Advanced filters (collapsible panel)
- Multiple filter types support
- Dropdown integration with DropdownSearch

✅ **Active Filters Display**
- Visual badges for active filters
- Individual remove buttons
- Clear all functionality

✅ **Results Management**
- Results count display
- Filtered vs total results
- Empty state handling

✅ **Responsive Design**
- Mobile-friendly layout
- Compact mode option
- Flexible grid system

## Installation

The component is already exported from the UI barrel:

```typescript
import { AdvancedSearchFilter } from '../components/ui';
// or
import { AdvancedSearchFilter } from '../components/ui/AdvancedSearchFilter';
```

## Basic Usage

```tsx
import { AdvancedSearchFilter } from '../components/ui';

function MyPage() {
  const [searchValue, setSearchValue] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  return (
    <AdvancedSearchFilter
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );
}
```

## Complete Example

```tsx
import { AdvancedSearchFilter, type FilterConfig } from '../components/ui';

function ProductsPage() {
  // State
  const [searchValue, setSearchValue] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      key: 'category',
      label: 'Category',
      type: 'dropdown',
      options: categoryOptions,
      value: selectedCategory,
      placeholder: 'All Categories'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'dropdown',
      options: statusOptions,
      value: selectedStatus,
      placeholder: 'All Status'
    }
  ];

  // Active filters for badges
  const activeFilters = useMemo(() => {
    const active = [];
    if (selectedCategory) {
      active.push({
        key: 'category',
        label: 'Category',
        value: selectedCategory,
        onRemove: () => setSelectedCategory('')
      });
    }
    if (selectedStatus) {
      active.push({
        key: 'status',
        label: 'Status',
        value: selectedStatus,
        onRemove: () => setSelectedStatus('')
      });
    }
    return active;
  }, [selectedCategory, selectedStatus]);

  // Filter change handler
  const handleFilterChange = (key: string, value: any) => {
    switch (key) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'status':
        setSelectedStatus(value);
        break;
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    setSearchValue('');
    setSelectedCategory('');
    setSelectedStatus('');
  };

  return (
    <AdvancedSearchFilter
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Search products..."
      searchFields={['name', 'sku', 'description']}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      enabledViews={['grid', 'list', 'table']}
      filters={filters}
      onFilterChange={handleFilterChange}
      showAdvancedFilters={showAdvanced}
      onToggleAdvancedFilters={() => setShowAdvanced(!showAdvanced)}
      activeFilters={activeFilters}
      totalResults={products.length}
      filteredResults={filteredProducts.length}
      showResultsCount={true}
      onClearAll={handleClearAll}
    />
  );
}
```

## Props API

### Core Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `searchValue` | `string` | ✅ | Current search text value |
| `onSearchChange` | `(value: string) => void` | ✅ | Search value change handler |
| `searchPlaceholder` | `string` | ❌ | Placeholder text for search input (default: "Search...") |
| `searchFields` | `string[]` | ❌ | Array of field names being searched (displayed below search bar) |

### View Mode Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `viewMode` | `'grid' \| 'list' \| 'table'` | ❌ | Current view mode (default: 'grid') |
| `onViewModeChange` | `(mode: ViewMode) => void` | ❌ | View mode change handler |
| `enabledViews` | `ViewMode[]` | ❌ | Array of enabled view modes (default: ['grid', 'list']) |

### Filter Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `filters` | `FilterConfig[]` | ❌ | Array of filter configurations |
| `onFilterChange` | `(key: string, value: any) => void` | ❌ | Filter value change handler |
| `showAdvancedFilters` | `boolean` | ❌ | Whether advanced filters panel is open |
| `onToggleAdvancedFilters` | `() => void` | ❌ | Toggle advanced filters panel handler |

### Active Filters Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `activeFilters` | `ActiveFilter[]` | ❌ | Array of currently active filters for badge display |

### Results Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `totalResults` | `number` | ❌ | Total number of items before filtering |
| `filteredResults` | `number` | ❌ | Number of items after filtering |
| `showResultsCount` | `boolean` | ❌ | Whether to display results count (default: true) |

### Action Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onClearAll` | `() => void` | ❌ | Clear all filters handler |
| `additionalActions` | `ReactNode` | ❌ | Additional action buttons to display |

### Styling Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `className` | `string` | ❌ | Additional CSS classes for container |
| `compact` | `boolean` | ❌ | Use compact padding (default: false) |

## Type Definitions

### FilterConfig

```typescript
interface FilterConfig {
  key: string;                      // Unique filter identifier
  label: string;                    // Display label
  type: 'dropdown' | 'multiselect' | 'daterange' | 'custom';
  options?: DropdownSearchOption[]; // For dropdown/multiselect types
  value?: any;                      // Current filter value
  placeholder?: string;             // Placeholder text
  renderCustom?: () => ReactNode;   // Custom render function for 'custom' type
}
```

### ActiveFilter

```typescript
interface ActiveFilter {
  key: string;            // Filter identifier
  label: string;          // Display label
  value: string;          // Display value
  onRemove: () => void;   // Remove handler
}
```

### ViewMode

```typescript
type ViewMode = 'grid' | 'list' | 'table';
```

## Usage Patterns

### 1. Search Only

```tsx
<AdvancedSearchFilter
  searchValue={search}
  onSearchChange={setSearch}
  searchPlaceholder="Search transactions..."
/>
```

### 2. Search + View Toggle

```tsx
<AdvancedSearchFilter
  searchValue={search}
  onSearchChange={setSearch}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  enabledViews={['grid', 'list']}
/>
```

### 3. Search + Basic Filters

```tsx
<AdvancedSearchFilter
  searchValue={search}
  onSearchChange={setSearch}
  filters={[
    {
      key: 'category',
      label: 'Category',
      type: 'dropdown',
      options: categories,
      value: selectedCategory
    }
  ]}
  onFilterChange={handleFilterChange}
/>
```

### 4. Full Featured

```tsx
<AdvancedSearchFilter
  searchValue={search}
  onSearchChange={setSearch}
  searchFields={['name', 'email', 'phone']}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  enabledViews={['grid', 'list', 'table']}
  filters={allFilters}
  onFilterChange={handleFilterChange}
  showAdvancedFilters={showAdvanced}
  onToggleAdvancedFilters={toggleAdvanced}
  activeFilters={activeFilterBadges}
  totalResults={1000}
  filteredResults={45}
  onClearAll={clearAllFilters}
  additionalActions={
    <Button onClick={exportData}>
      Export
    </Button>
  }
/>
```

## Styling Customization

The component uses Tailwind CSS classes and can be customized via:

1. **className prop**: Add custom classes to the container
2. **Tailwind config**: Customize primary colors for active states
3. **Component variants**: Use compact mode for tighter layouts

```tsx
<AdvancedSearchFilter
  className="my-custom-styles"
  compact={true}
  // ... other props
/>
```

## Integration with Existing Components

### With DataTable

```tsx
<AdvancedSearchFilter
  searchValue={search}
  onSearchChange={setSearch}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  enabledViews={['table']}
/>

{viewMode === 'table' && (
  <DataTable
    data={filteredData}
    columns={columns}
    searchable={false} // Search handled by AdvancedSearchFilter
  />
)}
```

### With Products Grid

```tsx
<AdvancedSearchFilter
  searchValue={search}
  onSearchChange={setSearch}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  enabledViews={['grid', 'list']}
/>

{viewMode === 'grid' && (
  <div className="grid grid-cols-3 gap-6">
    {filteredProducts.map(product => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
)}
```

## Accessibility

- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Focus management
- ✅ Screen reader friendly

## Migration Guide

### From SearchAndFilter Component

Replace existing `SearchAndFilter` usage:

**Before:**
```tsx
<SearchAndFilter
  searchTerm={search}
  onSearchChange={setSearch}
  placeholder="Search..."
/>
```

**After:**
```tsx
<AdvancedSearchFilter
  searchValue={search}
  onSearchChange={setSearch}
  searchPlaceholder="Search..."
/>
```

### From Custom Search Implementations

Replace custom search bars with view toggles:

**Before:**
```tsx
<div className="flex gap-4">
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search..."
  />
  <button onClick={() => setView('grid')}>Grid</button>
  <button onClick={() => setView('list')}>List</button>
</div>
```

**After:**
```tsx
<AdvancedSearchFilter
  searchValue={search}
  onSearchChange={setSearch}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
/>
```

## Demo Page

See `src/pages/AdvancedSearchFilterDemo.tsx` for a comprehensive working example with:
- All features demonstrated
- Mock data integration
- Multiple view modes
- Filter implementations
- Active filter management

## Best Practices

1. **State Management**: Keep filter state at page level for URL sync capability
2. **Filter Logic**: Apply filters in a useMemo for performance
3. **Active Filters**: Always provide onRemove handlers for filter badges
4. **Results Count**: Update totalResults and filteredResults for user feedback
5. **Clear All**: Implement comprehensive reset logic in onClearAll

## Common Patterns

### URL State Sync

```tsx
const [searchParams, setSearchParams] = useSearchParams();

const searchValue = searchParams.get('search') || '';
const handleSearchChange = (value: string) => {
  setSearchParams(prev => {
    if (value) {
      prev.set('search', value);
    } else {
      prev.delete('search');
    }
    return prev;
  });
};
```

### Performance Optimization

```tsx
const filteredData = useMemo(() => {
  return data.filter(item => {
    // Apply all filters
    return matchesSearch && matchesCategory && matchesStatus;
  });
}, [data, search, selectedCategory, selectedStatus]);
```

## Troubleshooting

**Q: View mode toggle not showing?**
A: Make sure `onViewModeChange` is provided and `enabledViews` has multiple items.

**Q: Filters not working?**
A: Verify `onFilterChange` handler updates the correct state and filter value prop reflects current state.

**Q: Active filters not displaying?**
A: Check that `activeFilters` array is populated with objects containing key, label, value, and onRemove.

## Support

For issues or feature requests, please refer to the main repository documentation or contact the development team.

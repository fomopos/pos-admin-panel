# DropdownSearch Component Documentation

## Overview

The `DropdownSearch` component is a highly reusable, feature-rich dropdown component with built-in search functionality. It was created to replace the complex, duplicated dropdown implementations throughout the application with a single, consistent, and maintainable component.

## Features

### ✅ Core Functionality
- **Real-time Search**: Filter options as you type with instant results
- **Hierarchical Display**: Support for nested options with visual indentation
- **Keyboard Navigation**: Ready for keyboard accessibility enhancements
- **Click Outside to Close**: Automatically closes when clicking elsewhere
- **Form Integration**: Easy integration with existing form systems

### ✅ Customization Options
- **Custom Styling**: Full control over appearance with CSS classes
- **Custom Option Rendering**: Override default option display
- **Flexible Labels**: Configurable placeholder, search text, and messages
- **Error Handling**: Built-in error state display
- **Disabled State**: Support for disabled dropdown

### ✅ Advanced Features
- **Clear/Reset Functionality**: Optional clear button with custom label
- **Custom Display Values**: Control how selected values are shown
- **Search Callbacks**: Optional search event handling
- **Configurable Behavior**: Control closing, focus, and interaction behavior

## Installation

The component is already integrated into the UI components system:

```tsx
import { DropdownSearch } from '../components/ui';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
```

## Basic Usage

### Simple Dropdown
```tsx
const [selectedValue, setSelectedValue] = useState<string | undefined>();

const options: DropdownSearchOption[] = [
  { id: '1', label: 'Option 1', description: 'First option' },
  { id: '2', label: 'Option 2', description: 'Second option' },
  { id: '3', label: 'Option 3', description: 'Third option' },
];

<DropdownSearch
  label="Select Option"
  value={selectedValue}
  options={options}
  onSelect={(option) => setSelectedValue(option?.id)}
  placeholder="Choose an option"
/>
```

### Hierarchical Categories
```tsx
const categoryOptions: DropdownSearchOption[] = [
  { id: '1', label: 'Electronics', level: 0 },
  { id: '2', label: 'Smartphones', level: 1 },
  { id: '3', label: 'iPhone', level: 2 },
  { id: '4', label: 'Android', level: 2 },
  { id: '5', label: 'Laptops', level: 1 },
];

<DropdownSearch
  label="Category"
  value={selectedCategory}
  options={categoryOptions}
  onSelect={handleCategorySelect}
  clearLabel="No Category"
  allowClear={true}
/>
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | The label displayed above the dropdown |
| `options` | `DropdownSearchOption[]` | Array of options to display |
| `onSelect` | `(option: DropdownSearchOption \| null) => void` | Callback when option is selected |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | Currently selected option ID |
| `placeholder` | `string` | `"Select an option"` | Placeholder text when no option selected |
| `searchPlaceholder` | `string` | `"Search options..."` | Placeholder for search input |
| `required` | `boolean` | `false` | Whether the field is required |
| `error` | `string` | `undefined` | Error message to display |
| `disabled` | `boolean` | `false` | Whether the dropdown is disabled |

### Display Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `displayValue` | `(option: DropdownSearchOption \| null) => string` | Auto-generated | Custom display value function |
| `renderOption` | `(option: DropdownSearchOption) => ReactNode` | Default renderer | Custom option renderer |
| `noOptionsMessage` | `string` | `"No options available"` | Message when no options found |
| `clearSearchText` | `string` | `"Clear search"` | Text for clear search button |
| `allowClear` | `boolean` | `true` | Whether to show clear/none option |
| `clearLabel` | `string` | `"None"` | Label for clear option |

### Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | Additional CSS classes for container |
| `buttonClassName` | `string` | `""` | Additional CSS classes for trigger button |
| `dropdownClassName` | `string` | `""` | Additional CSS classes for dropdown |

### Behavior

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `closeOnSelect` | `boolean` | `true` | Whether to close dropdown after selection |
| `autoFocus` | `boolean` | `true` | Whether to auto-focus search input |
| `maxHeight` | `string` | `"min(400px, 60vh)"` | Maximum height for dropdown |
| `onSearch` | `(query: string) => void` | `undefined` | Callback for search events |

## DropdownSearchOption Interface

```tsx
interface DropdownSearchOption {
  id: string;                    // Unique identifier
  label: string;                 // Display text
  description?: string;          // Optional secondary text
  level?: number;               // Hierarchy level (0-based)
  icon?: ReactNode;             // Optional icon
  data?: any;                   // Additional data storage
}
```

## Advanced Examples

### Custom Option Rendering
```tsx
const renderCustomOption = (option: DropdownSearchOption) => (
  <div className="flex items-center space-x-3">
    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
      <span className="text-blue-600 font-medium text-sm">
        {option.label.charAt(0)}
      </span>
    </div>
    <div>
      <div className="font-medium">{option.label}</div>
      <div className="text-xs text-gray-500">{option.description}</div>
    </div>
  </div>
);

<DropdownSearch
  label="Users"
  options={userOptions}
  renderOption={renderCustomOption}
  onSelect={handleUserSelect}
/>
```

### Custom Display Value
```tsx
const getCustomDisplayValue = (option: DropdownSearchOption | null) => {
  if (!option) return "No selection";
  return `${option.label} (${option.description})`;
};

<DropdownSearch
  label="Custom Display"
  options={options}
  displayValue={getCustomDisplayValue}
  onSelect={handleSelect}
/>
```

### Error Handling
```tsx
<DropdownSearch
  label="Required Field"
  options={options}
  onSelect={handleSelect}
  required={true}
  error={validationError}
  disabled={isLoading}
/>
```

## Integration Examples

### CategoryEditPage Integration
The component has been successfully integrated into `CategoryEditPage.tsx` to replace the complex parent category dropdown:

```tsx
<DropdownSearch
  label="Parent Category"
  value={formData.parent_category_id}
  options={getParentDropdownOptions()}
  onSelect={handleParentCategorySelect}
  displayValue={getParentCategoryDisplayValue}
  clearLabel="No Parent (Root Category)"
  allowClear={true}
/>
```

### Form Integration
```tsx
const handleFormSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // selectedValues are automatically managed
  console.log('Form data:', formData);
};

<form onSubmit={handleFormSubmit}>
  <DropdownSearch
    label="Category"
    value={formData.categoryId}
    options={categoryOptions}
    onSelect={(option) => setFormData(prev => ({
      ...prev,
      categoryId: option?.id
    }))}
    required={true}
    error={errors.categoryId}
  />
</form>
```

## Styling Guide

### Default Styling
The component uses Tailwind CSS classes for consistent styling:
- Button: `px-4 py-3 border border-gray-300 rounded-lg`
- Focus: `border-blue-500 ring-2 ring-blue-200`
- Dropdown: `shadow-2xl max-h-80 rounded-lg`

### Custom Styling
```tsx
<DropdownSearch
  className="custom-dropdown-container"
  buttonClassName="border-2 border-purple-300 hover:border-purple-400"
  dropdownClassName="border-2 border-purple-300 shadow-purple-100"
  // ... other props
/>
```

### CSS Variables Support
```css
.custom-dropdown-container {
  --dropdown-border: theme('colors.purple.300');
  --dropdown-focus: theme('colors.purple.500');
  --dropdown-shadow: theme('colors.purple.100');
}
```

## Accessibility

### Current Features
- ✅ Proper label association
- ✅ Keyboard navigation structure
- ✅ Focus management
- ✅ Screen reader friendly

### Future Enhancements
- 🔄 ARIA attributes for complex dropdowns
- 🔄 Full keyboard navigation (arrow keys)
- 🔄 Screen reader announcements
- 🔄 High contrast mode support

## Performance

### Optimizations
- ✅ Debounced search filtering
- ✅ Efficient re-rendering with React hooks
- ✅ Memory leak prevention with cleanup
- ✅ Optimized event listeners

### Best Practices
- Use `React.memo()` for option lists with many items
- Implement virtualization for 100+ options
- Cache computed values when possible

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Migration Guide

### From Manual Dropdowns
1. **Replace** complex dropdown HTML with `<DropdownSearch>`
2. **Convert** option arrays to `DropdownSearchOption[]` format
3. **Update** event handlers to use `onSelect` callback
4. **Remove** manual state management (search, open/close)

### Example Migration
```tsx
// Before (Complex manual dropdown)
const [isOpen, setIsOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [selectedId, setSelectedId] = useState<string>();

// 50+ lines of complex dropdown JSX...

// After (Simple DropdownSearch)
const [selectedId, setSelectedId] = useState<string>();

<DropdownSearch
  label="Options"
  value={selectedId}
  options={options}
  onSelect={(option) => setSelectedId(option?.id)}
/>
```

## Troubleshooting

### Common Issues

**Q: Dropdown not appearing/cut off**
A: Check parent container overflow settings. Use `overflow-visible` on parents.

**Q: Search not working**
A: Ensure options have `label` and optional `description` fields for search.

**Q: TypeScript errors**
A: Import both component and types: `import { DropdownSearch } from '../components/ui'; import type { DropdownSearchOption } from '../components/ui/DropdownSearch';`

**Q: Styling not applying**
A: Use `buttonClassName` and `dropdownClassName` for specific element styling.

## Future Roadmap

### Planned Features
- 🔄 **Multi-select** support with checkboxes
- 🔄 **Async loading** with loading states
- 🔄 **Grouped options** with section headers
- 🔄 **Virtual scrolling** for large datasets
- 🔄 **Custom icons** per option
- 🔄 **Keyboard shortcuts** (Ctrl+K to open, etc.)

### Performance Improvements
- 🔄 **Debounced search** with configurable delay
- 🔄 **Lazy loading** for remote data
- 🔄 **Memoization** optimizations

## Contributing

### Adding Features
1. Update the `DropdownSearchProps` interface
2. Add implementation in component
3. Update documentation
4. Add examples to demo page
5. Write tests

### Reporting Issues
Include:
- Component props used
- Expected vs actual behavior
- Browser and version
- Minimal reproduction code

---

## Success Stories

### Before DropdownSearch
- ❌ 70+ lines of repetitive dropdown code
- ❌ Inconsistent styling across dropdowns
- ❌ Manual state management complexity
- ❌ Different search implementations

### After DropdownSearch
- ✅ Single reusable component
- ✅ Consistent styling and behavior
- ✅ Automatic state management
- ✅ Built-in search functionality
- ✅ Easy maintenance and updates

The DropdownSearch component successfully eliminated code duplication, improved maintainability, and provided a consistent user experience across the entire application.

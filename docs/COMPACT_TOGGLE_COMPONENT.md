# CompactToggle Component

## Overview
Created a new reusable `CompactToggle` component that provides a compact toggle switch matching the height and styling of `InputTextField` components for consistent grid layouts.

## Component Features

### 1. **Design Consistency**
- **Height matching**: Exactly 40px height (`h-10`) to match InputTextField
- **Border styling**: Same border, padding, and focus states as input fields
- **Grid compatibility**: Fits perfectly in responsive grid layouts

### 2. **Toggle Switch Design**
- **Compact size**: 36x20px toggle switch (not too large, not too small)
- **Smooth animations**: Slide transition with `after:transition-all`
- **Visual states**: Clear checked/unchecked, enabled/disabled states
- **Focus ring**: Proper focus indication for accessibility

### 3. **Flexible Labeling**
- **Main label**: Above the toggle (required)
- **Inline label**: Next to toggle switch (optional)
- **Helper text**: Below toggle for additional context (optional)
- **Required indicator**: Red asterisk for required fields

## Component Interface

```typescript
interface CompactToggleProps {
  label: string;              // Main label above toggle
  inlineLabel?: string;       // Text next to toggle switch
  helperText?: string;        // Helper text below
  checked: boolean;           // Toggle state
  onChange: (checked: boolean) => void; // Change handler
  disabled?: boolean;         // Disabled state
  className?: string;         // Additional CSS classes
  required?: boolean;         // Required field indicator
}
```

## Usage Examples

### Basic Usage
```tsx
<CompactToggle
  label="Enable Feature"
  checked={isEnabled}
  onChange={setIsEnabled}
/>
```

### With Inline Label and Helper Text
```tsx
<CompactToggle
  label="Default Selected"
  inlineLabel="Pre-selected"
  helperText="Pre-selected for customers"
  checked={modifier.default_selected}
  onChange={(checked) => updateModifier({ default_selected: checked })}
  disabled={disabled}
/>
```

### Required Field
```tsx
<CompactToggle
  label="Accept Terms"
  inlineLabel="I agree"
  helperText="You must accept to continue"
  checked={accepted}
  onChange={setAccepted}
  required={true}
/>
```

### In Grid Layout
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  <InputTextField label="Name" ... />
  <InputTextField label="Price" ... />
  <InputTextField label="Order" ... />
  <CompactToggle label="Active" ... />
</div>
```

## Implementation Details

### Styling Architecture
```tsx
// Container with proper spacing
<div className="space-y-1">
  
  // Main label with required indicator
  <label className="block text-sm font-medium text-gray-700">
    {label} {required && <span className="text-red-500 ml-1">*</span>}
  </label>
  
  // Input-like container with focus states
  <div className="flex items-center h-10 px-3 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500">
    
    // Toggle switch with animations
    <div className="w-9 h-5 bg-gray-200 ... peer-checked:bg-blue-500">
    
    // Optional inline label
    {inlineLabel && <span>{inlineLabel}</span>}
  </div>
  
  // Optional helper text
  {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
</div>
```

### Focus Management
- **Focus container**: `focus-within:ring-2 focus-within:ring-blue-500`
- **Toggle focus**: `peer-focus:ring-2 peer-focus:ring-blue-100`
- **Keyboard accessible**: Hidden checkbox with proper focus handling

### Accessibility Features
- **Screen reader support**: Hidden checkbox (`sr-only`) for proper semantics
- **Keyboard navigation**: Tab order and space bar toggle
- **ARIA compliance**: Proper labeling and state indication
- **Focus indicators**: Clear visual focus states

## Benefits

### 1. **Code Reusability**
- ✅ **DRY principle**: No more duplicate toggle code
- ✅ **Consistent behavior**: Same toggle logic everywhere
- ✅ **Easy maintenance**: Single component to update

### 2. **Design Consistency**
- ✅ **Uniform appearance**: All toggles look and behave the same
- ✅ **Grid compatibility**: Perfect fit in form layouts
- ✅ **Theme compliance**: Matches application design system

### 3. **Developer Experience**
- ✅ **Simple API**: Easy to use with clear props
- ✅ **TypeScript support**: Full type safety and intellisense
- ✅ **Flexible configuration**: Optional props for different use cases

### 4. **Performance**
- ✅ **Lightweight**: Minimal DOM structure
- ✅ **Optimized CSS**: Efficient styling with Tailwind
- ✅ **No external dependencies**: Pure React component

## Usage in ProductModifierManager

### Before (Inline Implementation)
```tsx
// 15+ lines of complex inline JSX
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Default Selected
  </label>
  <div className="flex items-center h-10 px-3 border border-gray-300 rounded-md bg-white">
    <label className="relative inline-flex items-center cursor-pointer flex-1">
      <input type="checkbox" ... className="sr-only peer" />
      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500" />
      <span className="ml-3 text-sm text-gray-700">Pre-selected</span>
    </label>
  </div>
  <p className="text-xs text-gray-500">Pre-selected for customers</p>
</div>
```

### After (Clean Component Usage)
```tsx
// Clean, readable single component
<CompactToggle
  label="Default Selected"
  inlineLabel="Pre-selected"
  helperText="Pre-selected for customers"
  checked={modifier.default_selected}
  onChange={(checked) => updateModifier(groupIndex, modifierIndex, { 
    default_selected: checked 
  })}
  disabled={disabled}
/>
```

## Future Enhancements

### Potential Additions
- **Size variants**: Small, medium, large options
- **Color themes**: Success, warning, danger variants
- **Icon support**: Icons before/after toggle
- **Loading state**: Spinner while async operations
- **Tooltip support**: Additional context on hover

### Advanced Features
- **Keyboard shortcuts**: Custom key bindings
- **Animation options**: Different transition styles
- **Group support**: Radio button-like groups
- **Validation**: Built-in error states

## File Structure
```
src/components/ui/
├── CompactToggle.tsx     # New component
├── index.ts             # Updated exports
└── ...other components
```

## Migration Guide

### Replacing Inline Toggles
1. Import `CompactToggle` from `../ui`
2. Replace inline toggle JSX with `<CompactToggle />`
3. Map existing props to component interface
4. Test functionality and styling

### Best Practices
- Use `inlineLabel` for short, contextual text
- Use `helperText` for longer explanations
- Set `required={true}` for mandatory fields
- Use `disabled` prop instead of manual styling

This component provides a perfect balance of simplicity, reusability, and design consistency while maintaining all the functionality of the original inline implementation.

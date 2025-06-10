# PropertyCheckbox Component

## Overview
The `PropertyCheckbox` component is a reusable toggle switch component that provides a consistent interface for boolean property controls throughout the application.

## Features
- **Modern Design**: Clean toggle switch with smooth animations
- **Responsive Layout**: Stacks vertically on small screens, horizontal on larger screens
- **Accessibility**: Proper focus states and keyboard navigation
- **Consistent Styling**: Matches the application's design system
- **Flexible**: Supports custom styling and disabled states

## Usage

### Basic Usage
```tsx
import { PropertyCheckbox } from '../components/ui';

<PropertyCheckbox
  title="Active Status"
  description="Whether this category is active and visible to customers"
  checked={isActive}
  onChange={(checked) => setIsActive(checked)}
/>
```

### With Custom Styling
```tsx
<PropertyCheckbox
  title="Featured Item"
  description="Mark this item as featured"
  checked={isFeatured}
  onChange={handleFeaturedChange}
  className="border-2 border-blue-200"
/>
```

### Disabled State
```tsx
<PropertyCheckbox
  title="Advanced Setting"
  description="This setting is currently disabled"
  checked={advancedMode}
  onChange={handleAdvancedMode}
  disabled={!hasPermission}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | Yes | - | The main label for the checkbox |
| `description` | `string` | Yes | - | Descriptive text shown below the title |
| `checked` | `boolean` | Yes | - | Whether the checkbox is checked |
| `onChange` | `(checked: boolean) => void` | Yes | - | Callback when the checkbox value changes |
| `className` | `string` | No | `''` | Additional CSS classes |
| `disabled` | `boolean` | No | `false` | Whether the checkbox is disabled |

## Replacement Benefits

### Before (Redundant Code)
```tsx
<div className="flex items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
  <div className="flex-1 pr-4">
    <h4 className="font-semibold text-gray-900">Active Status</h4>
    <p className="text-sm text-gray-600 mt-1">
      Whether this category is active and visible to customers
    </p>
  </div>
  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
    <input
      type="checkbox"
      checked={formData.is_active}
      onChange={(e) => handleInputChange('is_active', e.target.checked)}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
  </label>
</div>
```

### After (Clean Component)
```tsx
<PropertyCheckbox
  title="Active Status"
  description="Whether this category is active and visible to customers"
  checked={formData.is_active}
  onChange={(checked) => handleInputChange('is_active', checked)}
/>
```

## Benefits
1. **Reduced Code Duplication**: Eliminated ~70 lines of repeated HTML/CSS
2. **Maintainability**: Single source of truth for styling and behavior
3. **Consistency**: Ensures all toggle switches look and behave the same
4. **Readability**: Much cleaner and more declarative code
5. **Reusability**: Can be used across the entire application

## Where It's Used
- CategoryEditPage.tsx - Settings section with 4 toggle switches
- Future forms requiring boolean property controls

## Styling Details
- Background: `bg-gray-50` with rounded corners
- Responsive padding and layout
- Blue accent color for active state
- Smooth transitions and hover effects
- Proper focus states for accessibility

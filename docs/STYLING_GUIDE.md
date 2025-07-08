# POS Admin Panel - Styling Guide

## Overview
This styling guide provides comprehensive guidelines for maintaining consistent design patterns across the POS Admin Panel application. The guide is based on the existing component library and design system.

## Table of Contents
1. [Design System Foundation](#design-system-foundation)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Guidelines](#component-guidelines)
6. [Page Structure](#page-structure)
7. [Form Components](#form-components)
8. [Interactive Elements](#interactive-elements)
9. [States & Feedback](#states--feedback)
10. [Responsive Design](#responsive-design)
11. [Best Practices](#best-practices)

---

## Design System Foundation

### Core Principles
- **Consistency**: All components follow the same design patterns
- **Accessibility**: WCAG 2.1 AA compliant components
- **Responsive**: Mobile-first design approach
- **Modern**: Clean, minimal design with subtle shadows and gradients
- **Functional**: Form follows function with clear information hierarchy

### Technology Stack
- **CSS Framework**: Tailwind CSS
- **Icons**: Heroicons (24px outline variants)
- **Fonts**: Inter (Google Fonts)
- **Components**: React with TypeScript

---

## Color System

### Primary Colors
```css
/* Blue Primary Palette */
primary-50: #eff6ff
primary-100: #dbeafe
primary-200: #bfdbfe
primary-300: #93c5fd
primary-400: #60a5fa
primary-500: #3b82f6
primary-600: #2563eb  /* Main primary */
primary-700: #1d4ed8
primary-800: #1e40af
primary-900: #1e3a8a
```

### Secondary Colors
```css
/* Teal Secondary Palette */
secondary-50: #f0fdfa
secondary-100: #ccfbf1
secondary-200: #99f6e4
secondary-300: #5eead4
secondary-400: #2dd4bf
secondary-500: #14b8a6
secondary-600: #0d9488  /* Main secondary */
secondary-700: #0f766e
secondary-800: #115e59
secondary-900: #134e4a
```

### Semantic Colors
```css
/* Success (Green) */
success-50: #f0fdf4
success-600: #16a34a
success-700: #15803d

/* Warning (Amber) */
warning-50: #fffbeb
warning-600: #d97706
warning-700: #b45309

/* Error (Red) */
error-50: #fef2f2
error-600: #dc2626
error-700: #b91c1c

/* Neutral (Gray) */
gray-50: #f9fafb
gray-100: #f3f4f6
gray-200: #e5e7eb
gray-300: #d1d5db
gray-400: #9ca3af
gray-500: #6b7280
gray-600: #4b5563
gray-700: #374151
gray-800: #1f2937
gray-900: #111827
```

---

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Typography Scale
```css
/* Page Titles */
.page-title {
  font-size: 1.875rem; /* 30px */
  font-weight: 700;
  line-height: 2.25rem;
  color: #0f172a; /* slate-900 */
}

/* Widget/Card Titles */
.widget-title {
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
  line-height: 1.75rem;
  color: #111827; /* gray-900 */
}

/* Form Labels */
.form-label {
  font-size: 0.875rem; /* 14px */
  font-weight: 600;
  line-height: 1.25rem;
  color: #374151; /* gray-700 */
}

/* Body Text */
.body-text {
  font-size: 0.875rem; /* 14px */
  font-weight: 400;
  line-height: 1.25rem;
  color: #4b5563; /* gray-600 */
}

/* Small Text */
.small-text {
  font-size: 0.75rem; /* 12px */
  font-weight: 400;
  line-height: 1rem;
  color: #6b7280; /* gray-500 */
}
```

---

## Spacing & Layout

### Spacing System
```css
/* Tailwind spacing scale - use these values consistently */
spacing-1: 0.25rem;  /* 4px */
spacing-2: 0.5rem;   /* 8px */
spacing-3: 0.75rem;  /* 12px */
spacing-4: 1rem;     /* 16px */
spacing-5: 1.25rem;  /* 20px */
spacing-6: 1.5rem;   /* 24px */
spacing-8: 2rem;     /* 32px */
spacing-10: 2.5rem;  /* 40px */
spacing-12: 3rem;    /* 48px */
```

### Page Layout
```css
/* Main container */
.page-container {
  @apply space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen;
}

/* Content sections */
.content-section {
  @apply space-y-6;
}

/* Grid layouts */
.grid-2-cols {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.grid-3-cols {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}
```

---

## Component Guidelines

### Widget Component
The `Widget` component is the primary container for content sections.

```tsx
// Basic Usage
<Widget
  title="Section Title"
  description="Optional description"
  icon={IconComponent}
  variant="default" // default | primary | success | warning | danger
  size="md" // sm | md | lg
  headerActions={<Button>Action</Button>}
  className="additional-classes"
>
  <div>Content goes here</div>
</Widget>
```

**Variants:**
- `default`: Standard gray theme
- `primary`: Blue theme for important sections
- `success`: Green theme for positive actions
- `warning`: Amber theme for warnings
- `danger`: Red theme for destructive actions

### Card Component
```tsx
// Basic card structure
<Card className="overflow-hidden">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <div>Main content</div>
  </CardContent>
  <CardFooter>
    <div>Footer content</div>
  </CardFooter>
</Card>
```

### PageHeader Component
```tsx
<PageHeader
  title="Page Title"
  description="Page description"
  className="optional-classes"
>
  <Button>Action Button</Button>
</PageHeader>
```

---

## Form Components

### Input Fields
```tsx
// Text input
<InputTextField
  label="Field Label"
  required={true}
  value={value}
  onChange={handleChange}
  placeholder="Enter text"
  error={errors.field}
  helperText="Helper text"
  className="additional-classes"
/>

// Money input
<InputMoneyField
  label="Amount"
  value={amount}
  onChange={handleAmountChange}
  placeholder="0.00"
  error={errors.amount}
/>

// Dropdown
<DropdownSearch
  label="Select Option"
  value={selectedValue}
  placeholder="Choose an option"
  options={options}
  onSelect={handleSelect}
  error={errors.dropdown}
  required={true}
/>
```

### Form Layout
```tsx
// Standard form grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <InputTextField label="First Name" />
  <InputTextField label="Last Name" />
  <InputTextField label="Email" colSpan="md:col-span-2" />
</div>
```

### Property Checkboxes
```tsx
<PropertyCheckbox
  title="Enable Feature"
  description="This will enable the feature for all users"
  checked={isEnabled}
  onChange={handleToggle}
/>
```

---

## Interactive Elements

### Button Component
```tsx
// Button variants
<Button variant="primary" size="md">Primary Button</Button>
<Button variant="secondary" size="md">Secondary Button</Button>
<Button variant="outline" size="md">Outline Button</Button>
<Button variant="ghost" size="md">Ghost Button</Button>
<Button variant="destructive" size="md">Delete Button</Button>

// Loading state
<Button isLoading={loading}>
  {loading ? 'Saving...' : 'Save Changes'}
</Button>
```

### Button Groups
```tsx
// Action button group
<div className="flex items-center justify-end space-x-3">
  <Button variant="outline">Cancel</Button>
  <Button variant="primary">Save</Button>
</div>
```

---

## States & Feedback

### Alert Component
```tsx
// Success alert
<Alert variant="success">
  <CheckCircleIcon className="h-5 w-5" />
  Operation completed successfully!
</Alert>

// Error alert
<Alert variant="error">
  <XCircleIcon className="h-5 w-5" />
  <div>
    <h4 className="font-medium">Error</h4>
    <p className="text-sm">Something went wrong. Please try again.</p>
  </div>
</Alert>

// Warning alert
<Alert variant="warning">
  <ExclamationTriangleIcon className="h-5 w-5" />
  Please review your changes before saving.
</Alert>
```

### Loading States
```tsx
// Page loading
<Loading
  title="Loading Data"
  description="Please wait while we fetch your data..."
  variant="primary"
/>

// Button loading
<Button isLoading={saving}>
  {saving ? 'Saving...' : 'Save Changes'}
</Button>
```

### Confirmation Dialogs
```tsx
<ConfirmDialog
  isOpen={deleteDialog.isOpen}
  onClose={deleteDialog.onClose}
  onConfirm={deleteDialog.onConfirm}
  title="Delete Item"
  message="Are you sure you want to delete this item? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  isLoading={deleteDialog.isLoading}
/>
```

---

## Page Structure

### Standard Page Layout
```tsx
const PageComponent: React.FC = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Page Title"
        description="Page description"
      >
        <Button>Primary Action</Button>
      </PageHeader>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert variant="success">
          <CheckCircleIcon className="h-5 w-5" />
          {successMessage}
        </Alert>
      )}

      {/* Main Content */}
      <form className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Widgets */}
          <Widget
            title="Basic Information"
            description="Essential details"
            icon={InformationCircleIcon}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField label="Name" />
              <InputTextField label="Email" />
            </div>
          </Widget>

          <Widget
            title="Settings"
            description="Configure options"
            icon={CogIcon}
          >
            <div className="space-y-4">
              <PropertyCheckbox
                title="Enable Feature"
                description="Feature description"
                checked={enabled}
                onChange={setEnabled}
              />
            </div>
          </Widget>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button variant="outline">Cancel</Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
```

### List/Grid Pages
```tsx
const ListPage: React.FC = () => {
  return (
    <div className="p-6">
      <PageHeader
        title="Items"
        description="Manage your items"
      >
        <Button>Add New Item</Button>
      </PageHeader>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {/* Grid/List Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Item cards */}
      </div>
    </div>
  );
};
```

---

## Responsive Design

### Breakpoints
```css
/* Tailwind breakpoints */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Responsive Patterns
```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Responsive spacing
<div className="p-4 sm:p-6">

// Responsive text
<h1 className="text-2xl sm:text-3xl">

// Responsive flex
<div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
```

---

## Best Practices

### Component Usage
1. **Always use the provided UI components** from `src/components/ui`
2. **Use the Widget component** for content sections instead of creating custom containers
3. **Implement consistent spacing** using Tailwind's spacing scale
4. **Follow the color system** - don't introduce custom colors
5. **Use semantic HTML** elements for accessibility

### Styling Guidelines
1. **Use Tailwind classes** instead of custom CSS when possible
2. **Maintain consistent spacing** - use `space-y-6` for vertical sections
3. **Apply proper hover states** to interactive elements
4. **Use proper focus states** for accessibility
5. **Follow the established patterns** from existing pages

### Form Guidelines
1. **Use consistent form layouts** with proper grid systems
2. **Implement proper validation** with error states
3. **Provide clear feedback** with success/error messages
4. **Use loading states** for async operations
5. **Group related fields** in widgets or sections

### Performance
1. **Use proper imports** - import only what you need
2. **Optimize images** and icons
3. **Use semantic HTML** for better performance
4. **Implement proper loading states** for better UX

### Accessibility
1. **Use proper ARIA labels** and roles
2. **Ensure keyboard navigation** works correctly
3. **Provide sufficient color contrast**
4. **Use semantic HTML elements**
5. **Test with screen readers**

---

## Code Examples

### Complete Form Example
```tsx
import React, { useState } from 'react';
import { 
  Widget, 
  PageHeader, 
  Button, 
  InputTextField, 
  PropertyCheckbox, 
  Alert 
} from '../components/ui';
import { InformationCircleIcon, CogIcon } from '@heroicons/react/24/outline';

const ExampleForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    enabled: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setSuccess('Form submitted successfully!');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Example Form"
        description="This is an example form following the design system"
      >
        <Button variant="outline">Cancel</Button>
      </PageHeader>

      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Widget
            title="Basic Information"
            description="Enter your basic details"
            icon={InformationCircleIcon}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Name"
                required
                value={formData.name}
                onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                error={errors.name}
                placeholder="Enter your name"
              />
              <InputTextField
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                error={errors.email}
                placeholder="Enter your email"
              />
            </div>
          </Widget>

          <Widget
            title="Settings"
            description="Configure your preferences"
            icon={CogIcon}
          >
            <PropertyCheckbox
              title="Enable Notifications"
              description="Receive email notifications about updates"
              checked={formData.enabled}
              onChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
          </Widget>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
```

This styling guide provides a comprehensive foundation for maintaining consistent design across the POS Admin Panel. Always refer to existing components and patterns before creating new ones, and ensure all new components follow these established guidelines.

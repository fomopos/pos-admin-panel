# POS Admin Panel - Styling Guide

## Overview
This styling guide provides comprehensive guidelines for maintaining consistent design patterns across the POS Admin Panel application. The guide is based on the existing component library and design system.

## Table of Contents
1. [Design System Foundation](#design-system-foundation)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Guidelines](#component-guidelines)
   - [SearchAndFilter Component](#searchandfilter-component)
   - [MultipleDropdownSearch Component](#multipledropdownsearch-component)
6. [Page Structure](#page-structure)
7. [Form Components](#form-components)
8. [Interactive Elements](#interactive-elements)
9. [States & Feedback](#states--feedback)
10. [Responsive Design](#responsive-design)
11. [Best Practices](#best-practices)
    - [Semantic Code Dropdowns](#semantic-code-dropdowns)
    - [EditableCard Component](#editablecard-component)

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

### SearchAndFilter Component
The `SearchAndFilter` component provides a unified interface for search, filtering, and view controls across list pages, ensuring consistent user experience throughout the application.

**Core Features:**
- Real-time search with clear button
- Dropdown filters with custom options
- Grid/List view toggle
- Active filters summary with clear all
- Responsive design with mobile-first approach
- Extensible with additional filters and actions
- Consistent styling with the design system

**Basic Usage:**
```tsx
<SearchAndFilter
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Search items..."
  filterValue={selectedFilter}
  onFilterChange={setSelectedFilter}
  filterOptions={[
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' }
  ]}
  filterPlaceholder="All Items"
  viewMode={viewMode}
  onViewModeChange={setViewMode}
/>
```

**Advanced Configuration:**
```tsx
<SearchAndFilter
  // Search configuration
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Search categories, products, or descriptions..."
  
  // Primary filter
  filterValue={selectedCategory}
  onFilterChange={setSelectedCategory}
  filterOptions={categoryOptions}
  filterLabel="Category"
  filterPlaceholder="All Categories"
  
  // View controls
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  showViewToggle={true}
  
  // Additional functionality
  showClearButton={true}
  onClear={() => {
    // Custom clear logic
    resetAdditionalFilters();
  }}
  
  // Additional filters using design system components
  additionalFilters={
    <DropdownSearch
      label=""
      placeholder="Status: All"
      options={statusOptions}
      onSelect={setStatusFilter}
      buttonClassName="py-3"
    />
  }
  
  // Actions using Button component
  actions={
    <Button variant="outline" size="sm">
      Export
    </Button>
  }
  
  // Styling
  className="mb-6"
  searchClassName="custom-search-styles"
  filterClassName="custom-filter-styles"
/>
```

**Props Interface:**
```tsx
interface SearchAndFilterProps {
  // Search props
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Filter props - uses DropdownSearch component internally
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  filterPlaceholder?: string;
  
  // View mode props - uses Button components
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showViewToggle?: boolean;
  
  // Additional filters
  additionalFilters?: React.ReactNode;
  
  // Styling
  className?: string;
  searchClassName?: string;
  filterClassName?: string;
  
  // Actions
  actions?: React.ReactNode;
  
  // Clear functionality - uses Button component
  showClearButton?: boolean;
  onClear?: () => void;
}

// FilterOption extends DropdownSearchOption for consistency
interface FilterOption extends DropdownSearchOption {
  // Uses id as the value for filtering
  // label for display text
  // Optional: description, level, icon, data
}
```

**Common Use Cases:**
1. **Product Management**: Search products with category filters and view toggles
2. **User Management**: Search users with role/department filters
3. **Category Management**: Search categories with parent category filters
4. **Order Management**: Search orders with status and date filters
5. **Inventory Management**: Search items with location and status filters

**Design Features:**
- **Built with design system components**: Uses DropdownSearch for filters, Button components for actions and view toggle
- **Consistent spacing**: Uses the design system's spacing scale
- **Focus states**: Proper focus indicators for accessibility
- **Hover effects**: Subtle transitions on interactive elements
- **Active filter badges**: Visual feedback for applied filters
- **Responsive layout**: Stacks vertically on mobile devices
- **Clear affordances**: Intuitive icons and button states

**Best Practices:**
1. **Use descriptive placeholders** that guide users on what they can search for
2. **Provide relevant filter options** based on the data being displayed
3. **Show active filters** to help users understand the current view state
4. **Enable clear functionality** to easily reset search and filters
5. **Consider mobile experience** with appropriate touch targets
6. **Include loading states** during filter operations
7. **Maintain filter state** across navigation when appropriate

**Accessibility Features:**
- ARIA labels for screen readers
- Keyboard navigation support
- Proper contrast ratios
- Focus management
- Screen reader announcements for filter changes

### MultipleDropdownSearch Component
The `MultipleDropdownSearch` component is a powerful multi-select dropdown with search functionality, designed for selecting multiple options from a list.

**Core Features:**
- Multi-select functionality with checkboxes
- Real-time search and filtering
- Select All / Clear All options
- Badge display for selected items
- Hierarchical option support with level indentation
- Keyboard navigation
- Custom option rendering
- Responsive design

**Basic Usage:**
```tsx
<MultipleDropdownSearch
  label="Categories"
  values={selectedCategories}
  options={categoryOptions}
  onSelect={handleCategorySelect}
  placeholder="Select categories"
  searchPlaceholder="Search categories..."
/>
```

**Advanced Configuration:**
```tsx
<MultipleDropdownSearch
  label="Product Categories"
  values={formData.category_ids}
  options={getCategoryOptions()}
  onSelect={(selectedValues) => setFormData(prev => ({
    ...prev,
    category_ids: selectedValues
  }))}
  placeholder="No Categories Selected"
  searchPlaceholder="Search categories..."
  
  // Selection controls
  allowSelectAll={true}
  selectAllLabel="Select All Categories"
  clearAllLabel="Clear All Categories"
  
  // Display options
  maxSelectedDisplay={3}
  displayValue={(selectedOptions) => 
    selectedOptions.length > 0 
      ? `${selectedOptions.length} categories selected`
      : "No categories selected"
  }
  
  // Custom rendering
  renderOption={(option, isSelected) => (
    <div className="flex items-center justify-between w-full">
      <span>{option.label}</span>
      {option.level && (
        <span className="text-xs text-gray-400">
          Level {option.level + 1}
        </span>
      )}
    </div>
  )}
  
  // Validation and state
  required={true}
  error={errors.categories}
  disabled={isLoading}
  
  // Styling
  className="w-full"
  buttonClassName="custom-button-styles"
  dropdownClassName="custom-dropdown-styles"
  
  // Behavior
  autoFocus={false}
  maxHeight="min(400px, 60vh)"
  
  // Events
  onSearch={(query) => console.log('Search:', query)}
/>
```

**Option Structure:**
```tsx
interface MultipleDropdownSearchOption {
  id: string;              // Unique identifier
  label: string;           // Display text
  description?: string;    // Optional description
  level?: number;          // For hierarchical display (0-based)
  icon?: ReactNode;        // Optional icon
  data?: any;             // Additional data
}

// Example options array
const categoryOptions: MultipleDropdownSearchOption[] = [
  {
    id: 'electronics',
    label: 'Electronics',
    description: 'Electronic devices and accessories',
    level: 0
  },
  {
    id: 'smartphones',
    label: 'Smartphones',
    description: 'Mobile phones and accessories',
    level: 1
  },
  {
    id: 'laptops',
    label: 'Laptops',
    description: 'Portable computers',
    level: 1
  }
];
```

**Common Use Cases:**
1. **Product Categories**: Multi-category product assignment
2. **User Permissions**: Multiple role/permission selection
3. **Tag Selection**: Multiple tag assignment
4. **Location Selection**: Multiple store/location selection
5. **Feature Flags**: Multiple feature enablement

**Styling Variants:**
```tsx
// With custom badge styling
<MultipleDropdownSearch
  label="Tags"
  values={selectedTags}
  options={tagOptions}
  onSelect={setSelectedTags}
  className="tag-selector"
  renderDisplayValue={(selectedOptions) => (
    <div className="flex flex-wrap gap-1">
      {selectedOptions.map(option => (
        <span
          key={option.id}
          className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
        >
          {option.label}
          <button className="ml-1 hover:bg-green-200 rounded-full">
            <XMarkIcon className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  )}
/>

// With icon support
<MultipleDropdownSearch
  label="Features"
  values={selectedFeatures}
  options={featureOptions.map(feature => ({
    ...feature,
    icon: <CogIcon className="h-4 w-4 text-blue-500" />
  }))}
  onSelect={setSelectedFeatures}
/>
```

**Accessibility Features:**
- ARIA labels and roles for screen readers
- Keyboard navigation (Arrow keys, Enter, Escape)
- Focus management
- Proper contrast ratios
- Screen reader announcements for selection changes

**Best Practices:**
1. **Use descriptive labels** that clearly indicate what's being selected
2. **Provide helpful placeholder text** to guide users
3. **Set appropriate maxSelectedDisplay** to prevent UI overflow
4. **Include search functionality** for lists with 10+ options
5. **Use Select All/Clear All** for better UX with large option sets
6. **Implement proper validation** with clear error messages
7. **Consider performance** with large datasets using virtual scrolling
8. **Test keyboard navigation** for accessibility compliance

---

## Form Components

### Import Statement
```tsx
import { 
  InputTextField, 
  InputTextArea,
  InputMoneyField, 
  DropdownSearch, 
  MultipleDropdownSearch,
  PropertyCheckbox 
} from '../components/ui';
```

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

// Text area input
<InputTextArea
  label="Description"
  required={true}
  value={description}
  onChange={handleDescriptionChange}
  placeholder="Enter detailed description"
  error={errors.description}
  helperText="Provide a comprehensive description"
  rows={4}
  maxLength={500}
  colSpan="md:col-span-2"
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
  onSelect={(option) => setSelectedValue(option?.id)}
  error={errors.dropdown}
  required={true}
/>

// Multiple Selection Dropdown
<MultipleDropdownSearch
  label="Categories"
  values={selectedCategories}
  placeholder="No Categories Selected"
  searchPlaceholder="Search categories..."
  options={categoryOptions}
  onSelect={handleCategorySelect}
  allowSelectAll={true}
  selectAllLabel="Select All Categories"
  clearAllLabel="Clear All Categories"
  noOptionsMessage="No categories available"
  maxSelectedDisplay={3}
  required={true}
  error={errors.categories}
/>
```

### InputTextArea Component
The `InputTextArea` component provides a consistent multi-line text input with the same styling patterns as `InputTextField`.

**Core Features:**
- Multi-line text input with configurable rows
- Consistent styling with other form components
- Error handling with visual feedback
- Helper text support
- Configurable resize behavior
- Label with optional required indicator
- Full accessibility support

**Basic Usage:**
```tsx
<InputTextArea
  label="Description"
  value={formData.description}
  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
  placeholder="Enter description"
  rows={3}
/>
```

**Advanced Configuration:**
```tsx
<InputTextArea
  label="Product Description"
  required={true}
  value={formData.description}
  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
  placeholder="Provide a detailed product description..."
  error={errors.description}
  helperText="Maximum 500 characters recommended"
  
  // Layout and sizing
  rows={5}
  maxLength={1000}
  colSpan="md:col-span-2"
  
  // Behavior
  resize="vertical"
  autoFocus={false}
  
  // Styling
  className="custom-wrapper-classes"
  textareaClassName="custom-textarea-classes"
/>
```

**Props:**
- `label` (required): The label text displayed above the textarea
- `value` (required): Current value of the textarea
- `onChange` (required): Callback function when value changes
- `required`: Shows red asterisk next to label
- `placeholder`: Placeholder text
- `error`: Error message to display with red styling
- `helperText`: Helper text shown below textarea
- `disabled`: Whether the textarea is disabled
- `rows`: Number of visible text lines (default: 3)
- `maxLength`: Maximum character limit
- `resize`: Resize behavior - 'none', 'vertical', 'horizontal', 'both' (default: 'vertical')
- `colSpan`: Grid column span classes
- `autoFocus`: Auto-focus on render
- `className`: Additional wrapper classes
- `textareaClassName`: Additional textarea element classes

**Common Use Cases:**
1. **Product Descriptions**: Multi-line product information
2. **Comments/Notes**: User feedback or administrative notes
3. **Instructions**: Step-by-step guides or help text
4. **Addresses**: Multi-line address input
5. **Configuration**: Settings or rule descriptions

**Styling Variants:**
```tsx
// Compact version
<InputTextArea
  label="Notes"
  value={notes}
  onChange={setNotes}
  rows={2}
  resize="none"
  placeholder="Add quick notes..."
/>

// Large content area
<InputTextArea
  label="Article Content"
  value={content}
  onChange={setContent}
  rows={10}
  maxLength={5000}
  helperText="Write your article content here"
  colSpan="md:col-span-2"
/>

// With validation
<InputTextArea
  label="Feedback"
  required
  value={feedback}
  onChange={setFeedback}
  error={errors.feedback}
  placeholder="Please provide your feedback"
  rows={4}
  maxLength={500}
/>
```

**Best Practices:**
1. **Use appropriate row counts** - 2-3 for short text, 4-6 for medium, 8+ for long content
2. **Set reasonable maxLength** to prevent excessive input
3. **Configure resize behavior** - use 'vertical' for most cases, 'none' for compact forms
4. **Provide helpful placeholder text** that guides users on expected content
5. **Use helper text** to communicate character limits or formatting requirements
6. **Handle validation properly** with clear error messages
7. **Consider accessibility** - screen readers can navigate multi-line content

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

### Dropdown Selection Guidelines
1. **Use DropdownSearch** for single selection with search capability
2. **Use MultipleDropdownSearch** when users need to select multiple items:
   - Product categories (products can belong to multiple categories)
   - User permissions/roles
   - Tags or labels
   - Feature flags
   - Multiple locations or stores
3. **Consider user experience**:
   - Use `maxSelectedDisplay` to prevent UI overflow
   - Enable `allowSelectAll` for lists with many options
   - Provide clear search functionality for 10+ options
   - Use descriptive placeholders and labels
4. **Performance considerations**:
   - Limit option lists to reasonable sizes (< 1000 items)
   - Consider pagination or lazy loading for very large datasets
   - Use proper option filtering for better search performance

### Semantic Code Dropdowns
For dropdowns representing semantic codes (like tax types, status codes, etc.), use descriptive options:

```tsx
// Good: Semantic codes with descriptions
<DropdownSearch
  label="Tax Type Code"
  value={selectedTaxType}
  onSelect={(option) => setSelectedTaxType(option?.id)}
  options={[
    { 
      id: 'VAT', 
      label: 'VAT', 
      description: 'Value Added Tax - Tax applied at each stage of production/distribution' 
    },
    { 
      id: 'SALES', 
      label: 'SALES', 
      description: 'Sales Tax - Tax applied at the point of sale to the end consumer' 
    }
  ]}
  placeholder="Select tax type"
/>
```

**Best Practices:**
- Use the actual code as both `id` and `label`
- Provide clear descriptions explaining what each code means
- Keep descriptions concise but informative
- Use consistent description formatting across similar dropdowns
- Extract the `id` from the option object in the onSelect handler

### EditableCard Component
For tax settings and similar editable list items, use the `EditableCard` component for consistent styling and behavior:

```tsx
import { EditableCard } from '../components/tax';

<EditableCard
  isEditing={isEditing}
  onToggleEdit={() => toggleEdit('authority', index.toString())}
  onDelete={() => deleteItem('authority', authority.authority_id)}
  showDeleteButton={true} // Optional, defaults to true
>
  {isEditing ? (
    <div className="space-y-4">
      {/* Edit form content */}
      <InputTextField
        label="Name"
        value={item.name}
        onChange={(value) => handleChange('name', value)}
      />
    </div>
  ) : (
    <>
      {/* Display content */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
      <p className="text-sm text-gray-500">Details about the item</p>
    </>
  )}
</EditableCard>
```

**Features:**
- Consistent hover effects with shadow and color changes
- Built-in edit/save button with appropriate icons
- Optional delete button
- Responsive design with proper spacing
- Smooth transitions and animations

**Best Practices:**
- Use for all editable cards in tax settings (authorities, groups, locations)
- Set `showDeleteButton={false}` for items that shouldn't be deleted
- Provide clear visual distinction between edit and view modes
- Keep form content organized with proper spacing

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
  InputTextArea,
  PropertyCheckbox, 
  Alert 
} from '../components/ui';
import { InformationCircleIcon, CogIcon } from '@heroicons/react/24/outline';

const ExampleForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
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
              <InputTextArea
                label="Description"
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Tell us about yourself..."
                rows={4}
                colSpan="md:col-span-2"
                helperText="Optional: Provide any additional information"
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

### Product Form with MultipleDropdownSearch Example
```tsx
import React, { useState, useEffect } from 'react';
import { 
  Widget, 
  MultipleDropdownSearch, 
  InputTextField,
  Button 
} from '../components/ui';
import { TagIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  description?: string;
  level: number;
}

const ProductForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    category_ids: [] as string[]
  });
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Convert categories to dropdown options
  const getCategoryOptions = () => {
    return categories.map(category => ({
      id: category.id,
      label: category.name,
      description: category.description,
      level: category.level
    }));
  };

  const handleCategorySelect = (selectedValues: string[]) => {
    setFormData(prev => ({
      ...prev,
      category_ids: selectedValues
    }));
  };

  return (
    <div className="space-y-6">
      <Widget
        title="Product Information"
        description="Configure product details and categories"
        icon={TagIcon}
        variant="primary"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label="Product Name"
            required
            value={formData.name}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            placeholder="Enter product name"
            colSpan="md:col-span-2"
          />
          
          <MultipleDropdownSearch
            label="Categories"
            values={formData.category_ids}
            options={getCategoryOptions()}
            onSelect={handleCategorySelect}
            placeholder="No Categories Selected"
            searchPlaceholder="Search categories..."
            allowSelectAll={true}
            selectAllLabel="Select All Categories"
            clearAllLabel="Clear All Categories"
            noOptionsMessage="No categories available"
            maxSelectedDisplay={3}
            required={true}
            className="md:col-span-2"
          />
        </div>
      </Widget>
    </div>
  );
};
```

---

## CRUD Operations Implementation Guide

This section provides comprehensive guidelines for implementing Create, Read, Update, Delete (CRUD) operations with proper validation, error handling, and API integration patterns.

### CRUD Page Architecture

#### 1. File Structure Pattern
```
pages/
  ItemList.tsx           // List/Read operations
  ItemEdit.tsx           // Create/Update operations
  ItemDetail.tsx         // Detail view (optional)
  
components/item/
  ItemForm.tsx           // Reusable form component
  ItemCard.tsx           // List item display
  ItemFilters.tsx        // Search and filter components
```

#### 2. Core Implementation Patterns

##### List Page (Read Operations)
```tsx
import React, { useState, useEffect } from 'react';
import { 
  PageHeader, 
  SearchAndFilter, 
  Widget, 
  Button, 
  Alert,
  ConfirmDialog,
  Loading 
} from '../components/ui';
import { useError } from '../hooks/useError';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { itemService } from '../services/itemService';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const ItemList: React.FC = () => {
  // State management
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Error and dialog management
  const { error, setError, clearError } = useError();
  const deleteDialog = useConfirmDialog();
  
  // Data fetching
  const fetchItems = async () => {
    try {
      setLoading(true);
      clearError();
      const response = await itemService.getAll({
        search: searchTerm,
        status: statusFilter
      });
      setItems(response.data);
    } catch (err) {
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Effects
  useEffect(() => {
    fetchItems();
  }, [searchTerm, statusFilter]);
  
  // Handlers
  const handleDelete = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;
    
    deleteDialog.open({
      title: 'Delete Item',
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await itemService.delete(id);
          setItems(prev => prev.filter(item => item.id !== id));
          // Optional: Show success message
        } catch (err) {
          setError('Failed to delete item. Please try again.');
        }
      }
    });
  };
  
  const handleStatusChange = async (id: string, status: 'active' | 'inactive') => {
    try {
      await itemService.updateStatus(id, status);
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, status } : item
      ));
    } catch (err) {
      setError('Failed to update item status. Please try again.');
    }
  };
  
  // Filtered data
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  if (loading) {
    return (
      <Loading
        title="Loading Items"
        description="Please wait while we fetch your items..."
      />
    );
  }
  
  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Items"
        description="Manage your items and their settings"
      >
        <Button
          variant="primary"
          onClick={() => navigate('/items/new')}
        >
          Create New Item
        </Button>
      </PageHeader>
      
      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}
      
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search items by name..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { id: 'active', label: 'Active' },
          { id: 'inactive', label: 'Inactive' }
        ]}
        filterPlaceholder="All Statuses"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <Widget
        title={`Items (${filteredItems.length})`}
        description="List of all items in your system"
      >
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/items/new')}
            >
              Create First Item
            </Button>
          </div>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={(id) => navigate(`/items/${id}/edit`)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </Widget>
      
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.onClose}
        onConfirm={deleteDialog.onConfirm}
        title={deleteDialog.title}
        message={deleteDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteDialog.isLoading}
      />
    </div>
  );
};

export default ItemList;
```

##### Edit Page (Create/Update Operations)
```tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PageHeader, 
  Widget, 
  Button, 
  Alert,
  InputTextField,
  InputTextArea,
  DropdownSearch,
  PropertyCheckbox,
  Loading 
} from '../components/ui';
import { useError } from '../hooks/useError';
import { itemService } from '../services/itemService';

interface ItemFormData {
  name: string;
  description: string;
  category_id: string;
  status: 'active' | 'inactive';
  is_featured: boolean;
}

interface ValidationErrors {
  name?: string;
  description?: string;
  category_id?: string;
  [key: string]: string | undefined;
}

const ItemEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  // State management
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    category_id: '',
    status: 'active',
    is_featured: false
  });
  
  const [originalData, setOriginalData] = useState<ItemFormData | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Error management
  const { error, setError, clearError } = useError();
  
  // Change tracking
  const hasChanges = originalData ? 
    JSON.stringify(formData) !== JSON.stringify(originalData) : 
    Object.values(formData).some(value => 
      typeof value === 'string' ? value.trim() !== '' : value !== false
    );
  
  // Data fetching
  const fetchItem = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      clearError();
      const response = await itemService.getById(id);
      const data = response.data;
      setFormData(data);
      setOriginalData(data);
    } catch (err) {
      setError('Failed to load item. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data.map(cat => ({
        id: cat.id,
        label: cat.name,
        description: cat.description
      })));
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };
  
  // Effects
  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchItem();
    }
  }, [id, isEdit]);
  
  // Clear field-specific errors when user starts typing
  useEffect(() => {
    if (errors.name && formData.name.trim()) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  }, [formData.name, errors.name]);
  
  useEffect(() => {
    if (errors.category_id && formData.category_id) {
      setErrors(prev => ({ ...prev, category_id: undefined }));
    }
  }, [formData.category_id, errors.category_id]);
  
  // Validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must not exceed 100 characters';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    
    if (formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form handlers
  const handleInputChange = (field: keyof ItemFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear API errors when user modifies the field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      clearError();
      
      let response;
      if (isEdit) {
        response = await itemService.update(id!, formData);
      } else {
        response = await itemService.create(formData);
      }
      
      // Success handling
      navigate('/items', {
        state: {
          message: `Item ${isEdit ? 'updated' : 'created'} successfully!`
        }
      });
      
    } catch (err: any) {
      // Handle API validation errors
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        setErrors(apiErrors);
      } else if (err.response?.status === 409) {
        setErrors({ name: 'An item with this name already exists' });
      } else {
        setError(`Failed to ${isEdit ? 'update' : 'create'} item. Please try again.`);
      }
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/items');
      }
    } else {
      navigate('/items');
    }
  };
  
  if (loading) {
    return (
      <Loading
        title="Loading Item"
        description="Please wait while we fetch the item details..."
      />
    );
  }
  
  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title={isEdit ? 'Edit Item' : 'Create New Item'}
        description={isEdit ? 'Update item information' : 'Add a new item to your inventory'}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            Back to Items
          </Button>
          {hasChanges && (
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={saving}
              disabled={saving}
            >
              {saving ? 'Saving...' : isEdit ? 'Update Item' : 'Create Item'}
            </Button>
          )}
        </div>
      </PageHeader>
      
      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Widget
            title="Basic Information"
            description="Essential item details"
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Item Name"
                required
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                error={errors.name}
                placeholder="Enter item name"
                disabled={saving}
              />
              
              <DropdownSearch
                label="Category"
                required
                value={formData.category_id}
                placeholder="Select a category"
                options={categories}
                onSelect={(option) => handleInputChange('category_id', option?.id || '')}
                error={errors.category_id}
                disabled={saving}
              />
              
              <InputTextArea
                label="Description"
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                error={errors.description}
                placeholder="Enter item description..."
                rows={4}
                colSpan="md:col-span-2"
                helperText="Optional: Provide a detailed description (max 500 characters)"
                disabled={saving}
              />
            </div>
          </Widget>
          
          <Widget
            title="Settings"
            description="Configure item settings"
          >
            <div className="space-y-4">
              <DropdownSearch
                label="Status"
                value={formData.status}
                placeholder="Select status"
                options={[
                  { id: 'active', label: 'Active', description: 'Item is available' },
                  { id: 'inactive', label: 'Inactive', description: 'Item is not available' }
                ]}
                onSelect={(option) => handleInputChange('status', option?.id || 'active')}
                disabled={saving}
              />
              
              <PropertyCheckbox
                title="Featured Item"
                description="Display this item prominently in listings"
                checked={formData.is_featured}
                onChange={(checked) => handleInputChange('is_featured', checked)}
                disabled={saving}
              />
            </div>
          </Widget>
        </div>
      </form>
    </div>
  );
};

export default ItemEdit;
```

### Validation Framework

#### 1. Client-Side Validation Patterns

##### Field Validation Functions
```tsx
// utils/validation.ts
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule;
}

export const validateField = (
  value: any, 
  rules: ValidationRule, 
  fieldName: string
): string | undefined => {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${fieldName} is required`;
  }
  
  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return undefined;
  }
  
  // Length validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} must not exceed ${rules.maxLength} characters`;
    }
  }
  
  // Pattern validation
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return `${fieldName} format is invalid`;
  }
  
  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }
  
  return undefined;
};

export const validateForm = <T extends Record<string, any>>(
  data: T,
  validationRules: FieldValidation
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.keys(validationRules).forEach(field => {
    const error = validateField(
      data[field],
      validationRules[field],
      field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
    
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

// Specific validation rules
export const itemValidationRules: FieldValidation = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  description: {
    maxLength: 500
  },
  category_id: {
    required: true
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value) => {
      if (value && !value.includes('@')) {
        return 'Email must contain @ symbol';
      }
    }
  }
};
```

##### Real-time Validation Hook
```tsx
// hooks/useFormValidation.ts
import { useState, useCallback } from 'react';
import { validateForm, validateField, FieldValidation } from '../utils/validation';

export const useFormValidation = <T extends Record<string, any>>(
  validationRules: FieldValidation
) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateSingleField = useCallback((
    fieldName: string,
    value: any,
    data?: T
  ) => {
    const rule = validationRules[fieldName];
    if (!rule) return;
    
    const error = validateField(value, rule, fieldName);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || undefined
    }));
    
    return !error;
  }, [validationRules]);
  
  const validateAllFields = useCallback((data: T) => {
    const newErrors = validateForm(data, validationRules);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationRules]);
  
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: undefined }));
  }, []);
  
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  return {
    errors,
    validateSingleField,
    validateAllFields,
    clearFieldError,
    clearAllErrors,
    hasErrors: Object.keys(errors).length > 0
  };
};
```

#### 2. API Integration Patterns

##### Service Layer Structure
```tsx
// services/itemService.ts
import { apiClient } from './apiClient';

export interface ItemResponse {
  data: Item;
  message?: string;
}

export interface ItemListResponse {
  data: Item[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
  code?: string;
}

class ItemService {
  private basePath = '/items';
  
  async getAll(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ItemListResponse> {
    const response = await apiClient.get(this.basePath, { params });
    return response.data;
  }
  
  async getById(id: string): Promise<ItemResponse> {
    const response = await apiClient.get(`${this.basePath}/${id}`);
    return response.data;
  }
  
  async create(data: ItemFormData): Promise<ItemResponse> {
    const response = await apiClient.post(this.basePath, data);
    return response.data;
  }
  
  async update(id: string, data: ItemFormData): Promise<ItemResponse> {
    const response = await apiClient.put(`${this.basePath}/${id}`, data);
    return response.data;
  }
  
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
  
  async updateStatus(id: string, status: string): Promise<ItemResponse> {
    const response = await apiClient.patch(`${this.basePath}/${id}/status`, { status });
    return response.data;
  }
}

export const itemService = new ItemService();
```

##### API Client Configuration
```tsx
// services/apiClient.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Handle forbidden - show access denied
      console.error('Access denied');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);
```

#### 3. Error Handling Framework

##### Global Error Hook
```tsx
// hooks/useError.ts
import { useState, useCallback } from 'react';

export interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info';
  details?: Record<string, any>;
}

export const useError = () => {
  const [error, setErrorState] = useState<ErrorState | null>(null);
  
  const setError = useCallback((
    message: string,
    type: 'error' | 'warning' | 'info' = 'error',
    details?: Record<string, any>
  ) => {
    setErrorState({ message, type, details });
  }, []);
  
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);
  
  return {
    error: error?.message || null,
    errorType: error?.type || 'error',
    errorDetails: error?.details,
    setError,
    clearError,
    hasError: Boolean(error)
  };
};
```

##### API Error Handler
```tsx
// utils/errorHandler.ts
export const handleApiError = (
  error: any,
  setFieldErrors?: (errors: Record<string, string>) => void,
  setGlobalError?: (message: string) => void
) => {
  console.error('API Error:', error);
  
  if (error.response?.status === 422 && error.response?.data?.errors) {
    // Validation errors
    if (setFieldErrors) {
      setFieldErrors(error.response.data.errors);
    }
  } else if (error.response?.status === 409) {
    // Conflict errors (e.g., duplicate entries)
    const message = error.response?.data?.message || 'A conflict occurred';
    if (setGlobalError) {
      setGlobalError(message);
    }
  } else if (error.response?.status === 404) {
    if (setGlobalError) {
      setGlobalError('The requested resource was not found');
    }
  } else if (error.response?.status >= 500) {
    if (setGlobalError) {
      setGlobalError('A server error occurred. Please try again later.');
    }
  } else if (error.code === 'NETWORK_ERROR') {
    if (setGlobalError) {
      setGlobalError('Network error. Please check your connection.');
    }
  } else {
    if (setGlobalError) {
      setGlobalError(error.response?.data?.message || 'An unexpected error occurred');
    }
  }
};
```

### Best Practices Summary

#### 1. Form State Management
- Use separate state for form data, original data, and validation errors
- Implement change tracking to show/hide save buttons
- Clear field-specific errors when user starts typing
- Maintain loading and saving states for better UX

#### 2. Validation Strategy
- Implement both client-side and server-side validation
- Use real-time validation for immediate feedback
- Clear validation errors when fields are modified
- Handle API validation errors gracefully

#### 3. Error Handling
- Use consistent error messaging patterns
- Differentiate between field-specific and global errors
- Provide actionable error messages
- Handle network and server errors appropriately

#### 4. API Integration
- Use service layer pattern for API calls
- Implement proper error handling in API client
- Handle loading states consistently
- Use optimistic updates where appropriate

#### 5. User Experience
- Provide clear loading indicators
- Implement confirmation dialogs for destructive actions
- Show success messages after operations
- Handle unsaved changes appropriately
- Use consistent button states and visibility

#### 6. Performance Considerations
- Debounce search inputs to avoid excessive API calls
- Use pagination for large datasets
- Implement proper caching strategies
- Optimize re-renders with proper dependency arrays

This comprehensive guide ensures consistent implementation of CRUD operations across the POS Admin Panel while maintaining excellent user experience and robust error handling.

---

This styling guide provides a comprehensive foundation for maintaining consistent design across the POS Admin Panel. Always refer to existing components and patterns before creating new ones, and ensure all new components follow these established guidelines.

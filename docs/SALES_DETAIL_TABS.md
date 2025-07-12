# Sales Detail Page - Tabbed Interface

## Overview

The Sales Detail page (`/sales/${transactionId}`) has been redesigned with a tabbed interface to improve usability and organization. The page now uses tabs to separate different aspects of transaction information, making it easier to navigate and reducing page complexity.

## Tab Structure

### 1. Overview Tab (Default)
- **Content**: Transaction summary, totals, store information, and quick actions
- **Layout**: Two-column layout with transaction details on the left and summary cards on the right
- **Features**:
  - Transaction details (ID, terminal, business date, duration, associates)
  - Transaction summary (subtotal, tax, total, amounts tendered/due)
  - Store information
  - Quick action buttons (print, duplicate, QR code)

### 2. Items Tab
- **Content**: Detailed breakdown of all line items in the transaction
- **Features**:
  - Complete item information (ID, description, quantity, prices)
  - Price modifiers and adjustments
  - Tax breakdown per item
  - Notes and special information
  - Visual separation with cards for each item

### 3. Payments Tab
- **Content**: All payment methods used in the transaction
- **Features**:
  - Payment method icons and descriptions
  - Payment amounts and sequences
  - Foreign currency information (if applicable)
  - Change indicators
  - Enhanced visual design with larger payment cards

### 4. Receipts Tab
- **Content**: All receipt documents associated with the transaction
- **Features**:
  - Complete receipt rendering system
  - Multiple receipt support (customer copy, merchant copy, etc.)
  - Print All functionality for all receipts
  - Expandable receipt views
  - Streamlined interface without JSON copy functionality
  - PDF filename customization: saved PDFs are named using transaction ID + receipt ID format (e.g., `TXN-123456789_1`)

## Tab Implementation

### Components Used
- `EnhancedTabs` - Main tabbed interface component
- `TabsContent` - Individual tab content wrapper
- Icons from `@heroicons/react` for tab identification

### Tab Configuration
```typescript
const tabs = [
  {
    id: 'overview',
    name: 'Overview',
    icon: InformationCircleIcon
  },
  {
    id: 'items',
    name: 'Items',
    icon: ShoppingBagIcon
  },
  {
    id: 'payments',
    name: 'Payments', 
    icon: CreditCardIcon
  },
  {
    id: 'receipts',
    name: 'Receipts',
    icon: DocumentTextIcon
  }
];
```

### Dynamic Tab Counts
Tabs display dynamic counts based on transaction data:
- **Items**: Shows count of line items `Items (5)`
- **Payments**: Shows count of payment methods `Payments (2)`
- **Receipts**: Shows count of receipt documents `Receipts (2)`

## Benefits

### 1. **Improved Organization**
- Clear separation of concerns
- Logical grouping of related information
- Reduced cognitive load

### 2. **Better Performance**
- Only active tab content is rendered
- Reduced initial page load complexity
- Faster navigation between sections

### 3. **Enhanced User Experience**
- Intuitive navigation with icons and labels
- Persistent header with transaction info
- Quick access to specific information types

### 4. **Mobile Friendly**
- Responsive tab design
- Touch-friendly interface
- Optimized for smaller screens

### 5. **Scalability**
- Easy to add new tabs in the future
- Modular content organization
- Maintainable code structure

## Usage

### Navigation
- Click on any tab to switch views
- Tab state is maintained during the session
- Default tab is "Overview"

### Header Actions
The page header remains consistent across all tabs and includes:
- Back to Sales button
- Transaction title and metadata
- Primary action buttons (Print Receipt, Duplicate)

### Content Areas
Each tab has its own dedicated content area with:
- Consistent styling and spacing
- Responsive layouts
- Context-appropriate information density

## Technical Implementation

### State Management
```typescript
const [activeTab, setActiveTab] = useState('overview');
```

### Tab Content Rendering
```typescript
<TabsContent value="items" activeTab={activeTab}>
  {/* Items content */}
</TabsContent>
```

### Responsive Design
- Uses CSS Grid and Flexbox for layouts
- Breakpoint-aware column arrangements
- Mobile-optimized tab navigation

## Future Enhancements

1. **URL State Management**: Sync active tab with browser URL
2. **Keyboard Navigation**: Add keyboard shortcuts for tab switching
3. **Tab Persistence**: Remember last viewed tab per user
4. **Conditional Tabs**: Show/hide tabs based on transaction type
5. **Tab Badges**: Add status indicators or counts to tabs
6. **Deep Linking**: Direct links to specific tabs

## Code Structure

```
src/pages/SalesDetail.tsx
├── Tab Configuration
├── EnhancedTabs Component
│   ├── Overview TabsContent
│   │   ├── Transaction Details
│   │   ├── Summary Cards
│   │   └── Quick Actions
│   ├── Items TabsContent
│   │   ├── Line Items List
│   │   ├── Price Modifiers
│   │   └── Tax Breakdown
│   ├── Payments TabsContent
│   │   └── Payment Methods List
│   └── Receipts TabsContent
│       └── ReceiptViewer Component
└── Utility Functions
```

This tabbed interface provides a much cleaner, more organized, and user-friendly way to view transaction details while maintaining all the functionality of the original design.

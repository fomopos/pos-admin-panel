# Receipt Rendering System Documentation

## Overview

The receipt rendering system provides a comprehensive solution for displaying, printing, and managing receipt documents within the POS Admin Panel. This system converts JSON-based receipt data from the backend into interactive, printable receipt views.

## Components

### 1. ReceiptElementRenderer

**Location**: `src/components/receipt/ReceiptElementRenderer.tsx`

This is the core component that renders individual receipt elements. It supports all the element types defined in the Flutter implementation:

#### Supported Element Types:

- **Text Element**: Renders text with alignment options
  ```json
  {
    "type": "text",
    "text": "Your text content",
    "align": "left|center|right|justify",
    "flex": 1
  }
  ```

- **Row Element**: Creates horizontal layouts with multiple child elements
  ```json
  {
    "type": "row",
    "children": [
      {
        "type": "text",
        "text": "Item Name",
        "flex": 2
      },
      {
        "type": "text",
        "text": "$9.99",
        "align": "right",
        "flex": 1
      }
    ]
  }
  ```

- **Barcode Element**: Renders QR codes and other barcode types
  ```json
  {
    "type": "barcode",
    "code": "TXN123456",
    "barcode_type": "qrcode|code39|pdf417"
  }
  ```

- **Picture Element**: Displays images from URLs
  ```json
  {
    "type": "picture",
    "url": "https://example.com/logo.png"
  }
  ```

- **Horizontal Line**: Creates divider lines
  ```json
  {
    "type": "horizontalline"
  }
  ```

- **Page Break**: Adds page breaks for printing
  ```json
  {
    "type": "pagebreak"
  }
  ```

- **Section Reference**: References other sections (future extension)
  ```json
  {
    "type": "sectionref",
    "ref": "header_section"
  }
  ```

- **Iterator**: Loops through data arrays (future extension)
  ```json
  {
    "type": "iterator",
    "path": "line_items",
    "rows": [...]
  }
  ```

### 2. ReceiptViewer

**Location**: `src/components/receipt/ReceiptViewer.tsx`

The main component for displaying receipt documents. Features include:

- **Multiple Document Support**: Can display multiple receipts per transaction
- **Expandable Interface**: Click to expand/collapse individual receipts
- **Print Functionality**: Print individual receipts or all receipts
- **Copy to Clipboard**: Copy raw JSON data
- **Preview Modal**: Full-screen preview mode
- **Responsive Design**: Works on all screen sizes

#### Props:

```typescript
interface ReceiptViewerProps {
  documents: Array<{
    document_id: number;
    data: string; // JSON string
  }>;
  className?: string;
  renderOptions?: ReceiptRenderOptions;
}
```

#### Render Options:

```typescript
interface ReceiptRenderOptions {
  width?: number;        // Receipt width in pixels (default: 300)
  fontSize?: number;     // Base font size (default: 12)
  fontFamily?: string;   // Font family (default: 'monospace')
  showBorders?: boolean; // Show debug borders (default: false)
  backgroundColor?: string; // Background color (default: 'white')
  padding?: number;      // Internal padding (default: 16)
}
```

## Integration

### In Sales Detail Page

The ReceiptViewer is integrated into the `SalesDetail` page (`src/pages/SalesDetail.tsx`) and automatically displays receipt documents when available:

```tsx
{transaction.documents && transaction.documents.length > 0 && (
  <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
    <ReceiptViewer 
      documents={transaction.documents}
      renderOptions={{
        width: 300,
        fontSize: 11,
        fontFamily: 'monospace',
        showBorders: true,
        padding: 12
      }}
    />
  </Card>
)}
```

### Transaction Data Structure

Receipt documents are stored in the `TransactionDetail.documents` array:

```typescript
interface TransactionDocument {
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  tenant_id: string;
  store_id: string;
  terminal_id: string;
  trans_id: string;
  document_id: number;
  data: string; // JSON string containing receipt elements
}
```

## Features

### 1. Print Functionality

- **Individual Receipt Printing**: Each receipt can be printed separately
- **Optimized Print Layout**: Special CSS for print media
- **Automatic Window Management**: Opens in new window and auto-closes after printing

### 2. QR Code Support

- **Built-in QR Generation**: Uses `qrcode.react` library
- **Multiple Barcode Types**: Supports QR codes, Code39, PDF417
- **Fallback Display**: Shows text representation if QR generation fails

### 3. Responsive Design

- **Mobile Friendly**: Works on all screen sizes
- **Touch Interface**: Expandable sections work with touch
- **Accessible**: Proper ARIA labels and keyboard navigation

### 4. Error Handling

- **JSON Parsing**: Graceful handling of malformed JSON
- **Missing Images**: Fallback for broken image URLs
- **Unknown Elements**: Safe rendering of unknown element types

## Demo Page

A comprehensive demo is available at `/receipt-demo` that shows:

- Full receipt rendering with all element types
- Multiple receipt documents
- Print and copy functionality
- Different styling options

**Access**: Navigate to `/receipt-demo` in the application.

## Usage Examples

### Basic Usage

```tsx
import { ReceiptViewer } from '../components/receipt';

const MyComponent = () => {
  const documents = [
    {
      document_id: 1,
      data: JSON.stringify([
        {
          type: 'text',
          text: 'RECEIPT',
          align: 'center'
        },
        {
          type: 'horizontalline'
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Total:',
              flex: 1
            },
            {
              type: 'text',
              text: '$25.99',
              align: 'right',
              flex: 1
            }
          ]
        }
      ])
    }
  ];

  return (
    <ReceiptViewer 
      documents={documents}
      renderOptions={{ width: 320, fontSize: 12 }}
    />
  );
};
```

### Custom Styling

```tsx
<ReceiptViewer 
  documents={documents}
  renderOptions={{
    width: 400,
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    showBorders: true,
    padding: 20
  }}
  className="my-custom-receipt-container"
/>
```

## Dependencies

- **qrcode.react**: QR code generation
- **@heroicons/react**: Icons for UI elements
- **React**: Core framework
- **TypeScript**: Type safety

## Future Enhancements

1. **Template System**: Pre-defined receipt templates
2. **Real-time Editing**: Edit receipt layouts in real-time
3. **Export Options**: PDF, image export functionality
4. **Advanced Barcodes**: Support for more barcode types
5. **Internationalization**: Multi-language receipt support
6. **Custom Fonts**: Support for custom font loading
7. **Receipt Analytics**: Track which receipts are printed/viewed

## API Integration

The receipt system integrates with the transaction API through the `TransactionService`:

```typescript
// Get transaction detail with receipt documents
const transaction = await transactionService.getTransactionDetail(
  tenantId,
  storeId,
  transactionId
);

// Access receipt documents
const receiptDocuments = transaction.documents;
```

## Troubleshooting

### Common Issues

1. **QR Code Not Rendering**: Check that the `qrcode.react` package is installed
2. **JSON Parse Errors**: Ensure receipt data is valid JSON
3. **Print Issues**: Check browser print permissions
4. **Missing Fonts**: Verify font family availability

### Debug Mode

Enable debug mode by setting `showBorders: true` in render options to see element boundaries and layout issues.

### Console Logging

The components include comprehensive console logging for debugging receipt parsing and rendering issues.

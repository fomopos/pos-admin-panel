# Formatting Service Documentation

## Overview
The Formatting Service provides a centralized, consistent way to format dates, currency, numbers, and other data types across the entire application. This ensures uniform presentation and makes it easy to maintain formatting standards.

## Location
- **Service**: `src/services/formatting/formattingService.ts`
- **Types**: `src/services/formatting/types.ts`
- **Exports**: `src/services/formatting/index.ts`

## Installation & Usage

### Basic Import
```typescript
import { formattingService } from '../services/formatting';
```

### Configuration
Set default formatting options at application startup (e.g., in `App.tsx` or `main.tsx`):

```typescript
import { formattingService } from './services/formatting';

// Set default locale based on user preference
formattingService.setDefaultLocale('en-US');

// Set default currency based on store currency
formattingService.setDefaultCurrency('INR');

// Set default time format (12h or 24h)
formattingService.setDefaultTimeFormat('12h');
```

## Date & Time Formatting

### Date Formats

#### Predefined Formats
```typescript
// Short format: "11/5/25"
formattingService.formatDate('2025-11-05', 'short')

// Medium format: "Nov 5, 2025"
formattingService.formatDate('2025-11-05', 'medium')

// Long format: "November 5, 2025"
formattingService.formatDate('2025-11-05', 'long')

// Full format: "Tuesday, November 5, 2025"
formattingService.formatDate('2025-11-05', 'full')

// ISO format: "2025-11-05"
formattingService.formatDate('2025-11-05', 'iso')

// Time only: "2:30 PM"
formattingService.formatDate('2025-11-05T14:30:00Z', 'time')

// Date & Time - Short: "Nov 5, 2025, 2:30 PM"
formattingService.formatDate('2025-11-05T14:30:00Z', 'datetime-short')

// Date & Time - Medium: "November 5, 2025, 2:30 PM"
formattingService.formatDate('2025-11-05T14:30:00Z', 'datetime-medium')

// Date & Time - Long: "Tuesday, November 5, 2025 at 2:30 PM"
formattingService.formatDate('2025-11-05T14:30:00Z', 'datetime-long')
```

#### Custom Date Format
```typescript
formattingService.formatDate('2025-11-05', 'custom', {
  locale: 'en-US',
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
});
// Result: "Tue, November 05, 2025, 02:30 PM"
```

### Date & Time Separate
Perfect for displaying date and time on separate lines in tables:

```typescript
const { date, time } = formattingService.formatDateTimeSeparate(
  '2025-11-05T14:30:00Z',
  'medium',
  '12h'
);

// In React component:
<div>
  <div className="font-medium">{date}</div>
  <div className="text-xs text-gray-500">{time}</div>
</div>
```

### Date Range
```typescript
// Same month: "Nov 1 - 5, 2025"
formattingService.formatDateRange('2025-11-01', '2025-11-05', 'medium')

// Different months: "Nov 1, 2025 - Dec 1, 2025"
formattingService.formatDateRange('2025-11-01', '2025-12-01', 'medium')

// Same date: "Nov 5, 2025"
formattingService.formatDateRange('2025-11-05', '2025-11-05', 'medium')
```

### Relative Time
```typescript
// "2 hours ago"
formattingService.formatRelativeTime(new Date(Date.now() - 3600000 * 2))

// "in 3 days"
formattingService.formatRelativeTime(new Date(Date.now() + 86400000 * 3))

// "just now"
formattingService.formatRelativeTime(new Date())
```

## Currency Formatting

### Basic Currency
```typescript
// Using default currency: "$1,234.56"
formattingService.formatCurrency(1234.56)

// Specific currency: "₹1,234.56"
formattingService.formatCurrency(1234.56, { currency: 'INR' })

// Euro: "€1,234.56"
formattingService.formatCurrency(1234.56, { currency: 'EUR' })

// Without symbol: "1,234.56"
formattingService.formatCurrency(1234.56, { showSymbol: false })

// Compact notation: "$1.2K"
formattingService.formatCurrency(1234.56, { compact: true })

// No decimals: "$1,235"
formattingService.formatCurrency(1234.56, { 
  minimumFractionDigits: 0,
  maximumFractionDigits: 0 
})
```

### Using in DataTable Columns
```typescript
{
  key: 'total',
  title: 'Total Amount',
  render: (value, row) => (
    <div>
      {formattingService.formatCurrency(value, { 
        currency: row.currency || 'USD' 
      })}
    </div>
  ),
}
```

## Number Formatting

### Basic Numbers
```typescript
// With grouping: "1,234,567.89"
formattingService.formatNumber(1234567.89)

// Without grouping: "1234567.89"
formattingService.formatNumber(1234567.89, { useGrouping: false })

// Compact notation: "1.2M"
formattingService.formatNumber(1234567, { compact: true })

// Fixed decimals: "1,234.90"
formattingService.formatNumber(1234.9, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})
```

### Percentage
```typescript
// "15.23%"
formattingService.formatPercentage(0.1523)

// "15.2%"
formattingService.formatPercentage(0.1523, { maximumFractionDigits: 1 })

// "15%"
formattingService.formatPercentage(0.15, { maximumFractionDigits: 0 })
```

## Phone Numbers
```typescript
// National format: "(555) 123-4567"
formattingService.formatPhoneNumber('5551234567', 'national')

// International format: "+1 (555) 123-4567"
formattingService.formatPhoneNumber('15551234567', 'international')

// Compact: "5551234567"
formattingService.formatPhoneNumber('(555) 123-4567', 'compact')
```

## File Sizes
```typescript
// "1.5 MB"
formattingService.formatFileSize(1536000)

// "512 KB"
formattingService.formatFileSize(524288)

// "1 GB"
formattingService.formatFileSize(1073741824)

// Custom decimals: "1.46 MB"
formattingService.formatFileSize(1536000, 2)
```

## Durations
```typescript
// "1h 1m 5s"
formattingService.formatDuration(3665)

// "2m 5s"
formattingService.formatDuration(125)

// Without seconds: "1h 1m"
formattingService.formatDuration(3665, false)
```

## Distance
```typescript
// Metric: "1.5 km"
formattingService.formatDistance(1500, 'metric')

// Metric (short): "500 m"
formattingService.formatDistance(500, 'metric')

// Imperial: "0.9 mi"
formattingService.formatDistance(1500, 'imperial')

// Imperial (short): "1640 ft"
formattingService.formatDistance(500, 'imperial')
```

## Utility Functions

### Truncate Text
```typescript
// "Lorem ipsu..."
formattingService.truncateText('Lorem ipsum dolor sit amet', 10)

// Custom ellipsis: "Lorem ipsum…"
formattingService.truncateText('Lorem ipsum dolor sit amet', 15, '…')
```

### Ordinal Numbers
```typescript
// "1st"
formattingService.formatOrdinal(1)

// "22nd"
formattingService.formatOrdinal(22)

// "103rd"
formattingService.formatOrdinal(103)
```

## React Component Examples

### Sales DataTable Column
```typescript
const columns: Column<Sale>[] = [
  {
    key: 'createdAt',
    title: 'Date & Time',
    sortable: true,
    render: (value) => {
      const { date, time } = formattingService.formatDateTimeSeparate(value, 'medium');
      return (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{date}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
      );
    },
  },
  {
    key: 'total',
    title: 'Total Amount',
    className: 'text-right',
    render: (value, sale) => (
      <div className="text-sm font-semibold">
        {formattingService.formatCurrency(value, { 
          currency: sale.currency 
        })}
      </div>
    ),
  },
  {
    key: 'status',
    title: 'Status',
    render: (value) => <Badge>{value}</Badge>
  }
];
```

### Product Card
```typescript
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <div className="price">
        {formattingService.formatCurrency(product.price, {
          currency: product.currency
        })}
      </div>
      <div className="updated">
        Updated {formattingService.formatRelativeTime(product.updatedAt)}
      </div>
    </div>
  );
};
```

### Report Date Range
```typescript
const ReportHeader: React.FC<{ startDate: string; endDate: string }> = ({ startDate, endDate }) => {
  return (
    <div className="report-header">
      <h2>Sales Report</h2>
      <p>
        Period: {formattingService.formatDateRange(startDate, endDate, 'long')}
      </p>
    </div>
  );
};
```

## Integration with i18n

The formatting service automatically uses the locale set via `setDefaultLocale()`. You can integrate it with your i18n system:

```typescript
// In App.tsx or where you initialize i18n
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formattingService } from './services/formatting';
import { useTenantStore } from './tenants/tenantStore';

function App() {
  const { i18n } = useTranslation();
  const { currentStore } = useTenantStore();

  useEffect(() => {
    // Update formatting service when language changes
    formattingService.setDefaultLocale(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    // Update currency when store changes
    if (currentStore) {
      formattingService.setDefaultCurrency(currentStore.store_currency);
    }
  }, [currentStore]);

  return <div>{/* Your app */}</div>;
}
```

## TypeScript Support

All formatting functions have full TypeScript support with proper type definitions:

```typescript
import type { 
  DateFormatType,
  CurrencyFormatOptions,
  NumberFormatOptions 
} from '../services/formatting';

// Type-safe format selection
const format: DateFormatType = 'datetime-short';
formattingService.formatDate(date, format);

// Type-safe currency options
const options: CurrencyFormatOptions = {
  currency: 'INR',
  locale: 'hi-IN',
  compact: true
};
formattingService.formatCurrency(amount, options);
```

## Best Practices

1. **Always use the formatting service** instead of inline formatting logic
2. **Set defaults early** in your application lifecycle
3. **Pass currency from data** rather than hardcoding
4. **Use appropriate format types** for your use case
5. **Handle invalid inputs** - the service returns error messages for invalid data
6. **Consistent locale** - update locale when user changes language
7. **Cache formatted values** in useMemo for expensive operations in lists

## Error Handling

The service gracefully handles invalid inputs:

```typescript
formattingService.formatDate('invalid-date', 'medium')
// Returns: "Invalid Date"

formattingService.formatCurrency('not-a-number')
// Returns: "Invalid Amount"

formattingService.formatNumber(NaN)
// Returns: "Invalid Number"
```

## Performance Considerations

- The service uses native `Intl` formatters which are optimized
- Create formatters outside render loops when possible
- Use `useMemo` for expensive formatting in large lists

```typescript
const formattedItems = useMemo(() => 
  items.map(item => ({
    ...item,
    formattedPrice: formattingService.formatCurrency(item.price, {
      currency: item.currency
    })
  })),
  [items]
);
```

## Migration Guide

### Before (inline formatting)
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

### After (using formatting service)
```typescript
import { formattingService } from '../services/formatting';

// Simply call the service methods
formattingService.formatCurrency(amount, { currency: 'USD' });
formattingService.formatDate(dateString, 'datetime-short');
```

## Support

For issues or feature requests related to the formatting service, please check:
- Type definitions in `src/services/formatting/types.ts`
- Implementation in `src/services/formatting/formattingService.ts`
- Examples in this documentation

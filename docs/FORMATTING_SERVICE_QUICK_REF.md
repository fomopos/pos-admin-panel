# Formatting Service - Quick Reference

## Import
```typescript
import { formattingService } from '../services/formatting';
```

## Common Use Cases

### 1. Date in Table (Separate Lines)
```typescript
const { date, time } = formattingService.formatDateTimeSeparate(value, 'medium');
<div>
  <div className="font-medium">{date}</div>
  <div className="text-xs text-gray-500">{time}</div>
</div>
```

### 2. Currency with Store Currency
```typescript
{formattingService.formatCurrency(value, { currency: row.currency })}
```

### 3. Simple Date
```typescript
{formattingService.formatDate(value, 'medium')} // Nov 5, 2025
```

### 4. Date & Time Together
```typescript
{formattingService.formatDate(value, 'datetime-short')} // Nov 5, 2025, 2:30 PM
```

### 5. Relative Time
```typescript
{formattingService.formatRelativeTime(value)} // 2 hours ago
```

### 6. Number with Commas
```typescript
{formattingService.formatNumber(value)} // 1,234,567
```

### 7. Percentage
```typescript
{formattingService.formatPercentage(0.1523)} // 15.23%
```

### 8. File Size
```typescript
{formattingService.formatFileSize(bytes)} // 1.5 MB
```

### 9. Phone Number
```typescript
{formattingService.formatPhoneNumber(phone, 'national')} // (555) 123-4567
```

### 10. Date Range
```typescript
{formattingService.formatDateRange(start, end, 'medium')} // Nov 1 - 5, 2025
```

## Format Types

### Date Formats
- `'short'` → 11/5/25
- `'medium'` → Nov 5, 2025
- `'long'` → November 5, 2025
- `'full'` → Tuesday, November 5, 2025
- `'iso'` → 2025-11-05
- `'time'` → 2:30 PM
- `'datetime-short'` → Nov 5, 2025, 2:30 PM
- `'datetime-medium'` → November 5, 2025, 2:30 PM
- `'datetime-long'` → Tuesday, November 5, 2025 at 2:30 PM

### Currency Options
```typescript
{
  currency: 'USD' | 'INR' | 'EUR' | ...,
  locale: 'en-US' | 'hi-IN' | ...,
  minimumFractionDigits: 0-20,
  maximumFractionDigits: 0-20,
  showSymbol: true | false,
  compact: true | false  // $1.2K instead of $1,234
}
```

### Phone Formats
- `'national'` → (555) 123-4567
- `'international'` → +1 (555) 123-4567
- `'compact'` → 5551234567

## Configuration
```typescript
// Set defaults (do this once at app startup)
formattingService.setDefaultLocale('en-US');
formattingService.setDefaultCurrency('INR');
formattingService.setDefaultTimeFormat('12h'); // or '24h'
```

## DataTable Column Examples

```typescript
const columns: Column<Sale>[] = [
  // Date & Time (2 lines)
  {
    key: 'createdAt',
    title: 'Date & Time',
    render: (value) => {
      const { date, time } = formattingService.formatDateTimeSeparate(value);
      return (
        <div>
          <div className="font-medium">{date}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
      );
    },
  },
  
  // Currency
  {
    key: 'total',
    title: 'Amount',
    className: 'text-right',
    render: (value, row) => (
      <div>
        {formattingService.formatCurrency(value, { 
          currency: row.currency 
        })}
      </div>
    ),
  },
  
  // Number
  {
    key: 'quantity',
    title: 'Qty',
    render: (value) => formattingService.formatNumber(value)
  },
  
  // Percentage
  {
    key: 'discount',
    title: 'Discount',
    render: (value) => formattingService.formatPercentage(value)
  }
];
```

## Tips

1. **Always pass currency from data**: `{ currency: row.currency }` not `{ currency: 'USD' }`
2. **Use useMemo for lists**: Avoid re-formatting on every render
3. **Set defaults early**: In App.tsx or similar
4. **Sync with i18n**: Update locale when language changes
5. **Consistent formatting**: Use service everywhere, not inline formatters

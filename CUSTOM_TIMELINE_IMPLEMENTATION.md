# Custom Timeline Integration

## Overview
The dashboard metrics service now supports custom date ranges in addition to predefined periods (today, week, month, quarter, year).

## New Features Added

### 1. Enhanced TimePeriod Type
```typescript
export type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
```

### 2. CustomDateRange Interface
```typescript
export interface CustomDateRange {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string;   // Format: YYYY-MM-DD
}
```

### 3. Enhanced Methods

#### getDateRangeForPeriod
```typescript
getDateRangeForPeriod(
  period: TimePeriod, 
  timezone?: string,  // Optional - auto-detected if not provided
  customDateRange?: CustomDateRange
): DashboardMetricsFilters
```

#### getDashboardMetricsForPeriod
```typescript
async getDashboardMetricsForPeriod(
  period: TimePeriod, 
  timezone?: string,  // Optional - auto-detected if not provided
  customDateRange?: CustomDateRange
): Promise<DashboardMetricsResponse>
```

#### getDashboardMetricsForCustomRange
```typescript
async getDashboardMetricsForCustomRange(
  startDate: string, 
  endDate: string,
  timezone?: string  // Optional - auto-detected if not provided
): Promise<DashboardMetricsResponse>
```

## Usage Examples

### Example 1: Using Custom Date Range with Period Method
```typescript
import { dashboardMetricsService } from '../services/dashboard/dashboardMetricsService';

// Get metrics for a custom date range (timezone auto-detected)
const customRange = {
  startDate: '2025-01-01',
  endDate: '2025-01-31'
};

const metrics = await dashboardMetricsService.getDashboardMetricsForPeriod(
  'custom',
  undefined, // Auto-detect timezone
  customRange
);
```

### Example 2: Using Direct Custom Range Method
```typescript
// Simpler approach for custom ranges (timezone auto-detected)
const metrics = await dashboardMetricsService.getDashboardMetricsForCustomRange(
  '2025-01-01',
  '2025-01-31'
  // timezone parameter omitted - will be auto-detected
);
```

### Example 3: Integrating with Dashboard Component (Dropdown Style)
```typescript
const Dashboard: React.FC = () => {
  const [currentPeriod, setCurrentPeriod] = useState<TimePeriod>('month');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>();

  const handlePeriodChange = async (period: TimePeriod, customRange?: CustomDateRange) => {
    setCurrentPeriod(period);
    setCustomDateRange(customRange);
    
    const data = await dashboardMetricsService.getDashboardMetricsForPeriod(
      period,
      undefined, // Auto-detect timezone
      customRange
    );
    
    setDashboardData(data);
  };

  return (
    <div>
      {/* Period Selector with Custom Option */}
      <select
        value={currentPeriod}
        onChange={(e) => {
          const period = e.target.value as TimePeriod;
          if (period === 'custom') {
            // Set default custom range or trigger date picker
            const today = new Date();
            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const customRange: CustomDateRange = {
              startDate: lastWeek.toISOString().split('T')[0],
              endDate: today.toISOString().split('T')[0]
            };
            handlePeriodChange(period, customRange);
          } else {
            handlePeriodChange(period);
          }
        }}
      >
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="quarter">This Quarter</option>
        <option value="year">This Year</option>
        <option value="custom">Custom Range</option>
      </select>

      {/* Custom Date Inputs - Show when custom is selected */}
      {currentPeriod === 'custom' && (
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={customDateRange?.startDate || ''}
            onChange={(e) => {
              const newRange = {
                startDate: e.target.value,
                endDate: customDateRange?.endDate || e.target.value
              };
              setCustomDateRange(newRange);
              handlePeriodChange('custom', newRange);
            }}
          />
          <span>to</span>
          <input
            type="date"
            value={customDateRange?.endDate || ''}
            onChange={(e) => {
              const newRange = {
                startDate: customDateRange?.startDate || e.target.value,
                endDate: e.target.value
              };
              setCustomDateRange(newRange);
              handlePeriodChange('custom', newRange);
            }}
          />
        </div>
      )}
    </div>
  );
};
```

## Dashboard Integration

The Dashboard component now includes:

### Enhanced Period Selector
- **Original Dropdown Design**: Maintains the existing select dropdown styling
- **Custom Range Option**: Added "Custom Range" option to the dropdown
- **Inline Date Inputs**: When "Custom Range" is selected, date inputs appear inline
- **Auto-timezone Detection**: No need to specify timezone - automatically detected

### UI Flow:
1. User selects from dropdown: Today, This Week, This Month, This Quarter, This Year, Custom Range
2. When "Custom Range" is selected:
   - Two date inputs appear inline (start date and end date)
   - Default range is set to last 7 days
   - Changes trigger immediate data refresh
3. Date inputs update the dashboard in real-time as users change dates

### Design Benefits:
- ✅ **Consistent UI**: Maintains original dashboard design language
- ✅ **Progressive Enhancement**: Custom option only shows additional UI when needed
- ✅ **Intuitive UX**: Familiar dropdown interface with contextual date inputs
- ✅ **Real-time Updates**: Data refreshes immediately when dates change

## Date Range Validation

The custom timeline includes built-in validation:

1. **Required Fields**: Both start and end dates are required for custom ranges
2. **Date Order**: Start date must be before or equal to end date
3. **Format Validation**: Dates must be in YYYY-MM-DD format
4. **Error Handling**: Throws descriptive errors for invalid inputs

## Timezone Handling

The service now includes intelligent timezone detection:

1. **Tenant Store Priority**: Tries to get timezone from the current store in tenant store
2. **Browser Fallback**: Uses browser's timezone if tenant store is unavailable
3. **Default Fallback**: Uses '+05:30' if both methods fail

### Timezone Detection Flow:
```typescript
private getCurrentTimezone(): string {
  try {
    // 1. Try tenant store timezone
    const { useTenantStore } = require('../../tenants/tenantStore');
    const { currentStore } = useTenantStore.getState();
    
    if (currentStore?.timezone) {
      return currentStore.timezone;
    }
    
    // 2. Fallback to browser timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const sign = offset > 0 ? '-' : '+';
    const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
    
    return `${sign}${hours}:${minutes}`;
  } catch (error) {
    return '+05:30'; // Default fallback
  }
}
```

## Console Logging

Debug information is logged for custom date ranges:

```
📅 Custom date range: {
  provided: { startDate: '2025-01-01', endDate: '2025-01-31' },
  parsed: {
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-01-31T23:59:59.999Z'
  }
}
```

## Integration Notes

1. The custom timeline functionality is backward compatible with existing code
2. Existing predefined periods (today, week, month, etc.) continue to work as before
3. The new functionality extends the existing API without breaking changes
4. All date calculations include proper timezone handling

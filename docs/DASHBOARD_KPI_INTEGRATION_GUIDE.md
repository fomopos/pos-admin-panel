# Dashboard KPI Integration Guide

## Overview
This guide provides a comprehensive JSON payload structure for implementing advanced POS dashboard analytics. The payload covers all major KPI categories for restaurant and retail operations.

## API Endpoint Structure

### Primary Endpoint
```
GET /v0/tenant/{tenant_id}/store/{store_id}/dashboard/kpis
```

### Query Parameters
- `period_type`: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
- `start_date`: ISO 8601 date string (required for custom period)
- `end_date`: ISO 8601 date string (required for custom period)
- `categories`: Comma-separated list of KPI categories to include
- `real_time`: Boolean flag to include real-time metrics

### Example API Calls
```bash
# Get daily KPIs for current day
GET /v0/tenant/tenant_12345/store/store_67890/dashboard/kpis?period_type=daily

# Get weekly KPIs with real-time data
GET /v0/tenant/tenant_12345/store/store_67890/dashboard/kpis?period_type=weekly&real_time=true

# Get custom date range KPIs
GET /v0/tenant/tenant_12345/store/store_67890/dashboard/kpis?period_type=custom&start_date=2025-06-01&end_date=2025-06-15

# Get specific KPI categories only
GET /v0/tenant/tenant_12345/store/store_67890/dashboard/kpis?categories=sales_revenue,operational_stats,financial_kpis
```

## KPI Categories Breakdown

### 📊 Sales & Revenue Statistics
**Key Metrics:**
- Gross vs Net Sales
- Sales by Category (Food, Drinks, Desserts)
- Sales by Item (Top performers)
- Payment Type Distribution (Cash, Card, UPI, Wallets)
- Average Order Value with growth tracking
- Discount analysis
- Tax collection breakdown
- Refunds/Voids/Cancellations tracking
- Revenue trends over time

**Business Value:**
- Identify best-selling categories and items
- Optimize payment processing
- Track promotional effectiveness
- Monitor revenue trends and patterns

### ⏱️ Operational Statistics
**Key Metrics:**
- Hourly and daily order volumes
- Order preparation times (avg/min/max)
- Table turnover rates
- Queue management and wait times
- Peak hour identification
- Order channel distribution (online, dine-in, takeaway, delivery)
- Delivery performance metrics

**Business Value:**
- Optimize staffing during peak hours
- Improve kitchen efficiency
- Reduce customer wait times
- Balance order channels

### 👨‍🍳 Employee Performance
**Key Metrics:**
- Sales performance by staff member
- Tips collection and rates
- Service time efficiency
- Upselling success rates
- Attendance and punctuality tracking
- Hours worked vs sales generated

**Business Value:**
- Identify top performers
- Optimize staff scheduling
- Improve service quality
- Increase upselling revenue

### 🍽️ Inventory & Wastage
**Key Metrics:**
- Real-time stock levels
- Ingredient usage rates
- Stock alerts (low/overstock/expiring)
- Food wastage tracking and costs
- Recipe consumption analysis
- Variance analysis (expected vs actual usage)

**Business Value:**
- Reduce food waste
- Optimize inventory levels
- Control costs
- Improve menu planning

### 🧾 Customer & Loyalty
**Key Metrics:**
- Unique customer counts and growth
- Repeat customer rates
- Customer feedback and ratings
- Loyalty program performance
- Top customer identification
- Visit frequency analysis

**Business Value:**
- Improve customer retention
- Enhance customer satisfaction
- Optimize loyalty programs
- Identify VIP customers

### 💻 Device / Terminal Performance
**Key Metrics:**
- Sales per terminal
- System uptime and errors
- Terminal reconciliation
- Offline sales tracking
- Crash and downtime logs

**Business Value:**
- Ensure system reliability
- Optimize terminal placement
- Reduce technical issues
- Improve reconciliation accuracy

### 🏪 Multi-Store Performance
**Key Metrics:**
- Store-wise sales comparison
- Staff efficiency by location
- Inter-store inventory transfers
- Profit margins by store

**Business Value:**
- Compare store performance
- Optimize resource allocation
- Balance inventory across locations
- Identify best practices

### 📈 Financial KPIs
**Key Metrics:**
- Profit margins (gross/net)
- Cost of Goods Sold analysis
- Daily cash flow tracking
- Break-even analysis
- Revenue vs targets
- Year-over-year growth metrics

**Business Value:**
- Monitor profitability
- Control costs
- Track financial health
- Set realistic targets

## Implementation Steps

### 1. Database Schema Preparation
Ensure your database can aggregate data for:
- Sales transactions with detailed breakdowns
- Inventory movements and levels
- Employee time tracking and sales data
- Customer visit and purchase history
- Terminal and system logs
- Financial data and calculations

### 2. API Service Implementation
Create services to:
- Aggregate data by time periods
- Calculate KPIs and growth metrics
- Handle real-time data updates
- Format responses according to the JSON schema

### 3. Frontend Integration
Update the dashboard to:
- Display KPI cards with modern UI
- Show charts and visualizations
- Implement filtering and date range selection
- Add real-time data refresh
- Create alert notification system

### 4. Performance Optimization
Consider:
- Caching frequently accessed KPIs
- Pre-calculating daily/weekly aggregations
- Using background jobs for complex calculations
- Implementing pagination for large datasets

## Dashboard UI Components

### KPI Cards Layout
```tsx
const kpiCards = [
  {
    title: "Total Sales",
    value: formatCurrency(kpiData.sales_revenue.total_sales.gross_sales),
    change: `+${kpiData.sales_revenue.average_order_value.growth_percentage}%`,
    trend: "up",
    icon: CurrencyDollarIcon
  },
  {
    title: "Active Orders",
    value: kpiData.real_time_metrics.current_active_orders,
    subtitle: "Real-time",
    icon: ShoppingCartIcon
  }
  // ... more cards
];
```

### Charts Integration
- **Revenue Trends**: Line/Area chart using ApexCharts
- **Category Breakdown**: Pie/Donut chart for sales distribution
- **Hourly Performance**: Bar chart for peak hours
- **Staff Performance**: Horizontal bar chart
- **Inventory Alerts**: Status indicators with colors

### Real-time Updates
```tsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchRealTimeMetrics();
  }, 30000); // Update every 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

## Alert System Integration

### Alert Types
- **Inventory Warnings**: Low stock, expiring items
- **System Errors**: Terminal crashes, payment failures
- **Operational Alerts**: Long wait times, peak hour staffing
- **Financial Alerts**: Cash variance, target deviations

### Alert Display
```tsx
const AlertBadge = ({ alert }) => (
  <div className={`alert alert-${alert.type} priority-${alert.priority}`}>
    <Icon type={alert.category} />
    <span>{alert.message}</span>
    <Button onClick={() => resolveAlert(alert.id)}>Resolve</Button>
  </div>
);
```

## Data Refresh Strategy

### Refresh Intervals
- **Real-time metrics**: Every 30 seconds
- **Hourly stats**: Every 15 minutes
- **Daily KPIs**: Every hour
- **Weekly/Monthly**: Once per day

### Caching Strategy
- Cache daily aggregations for 1 hour
- Cache weekly/monthly data for 24 hours
- Real-time data with 1-minute TTL
- Invalidate cache on data updates

## Security Considerations

### Access Control
- Tenant-level data isolation
- Store-level access restrictions
- Role-based KPI visibility
- Audit logging for sensitive data

### Data Privacy
- Anonymize customer data where possible
- Implement data retention policies
- Secure API endpoints with proper authentication
- Rate limiting on KPI endpoints

## Testing Strategy

### Unit Tests
- KPI calculation functions
- Data aggregation logic
- Alert threshold checking
- Currency and date formatting

### Integration Tests
- End-to-end KPI retrieval
- Real-time data updates
- Multi-store data aggregation
- Performance under load

### Performance Testing
- Large dataset handling
- Concurrent user access
- Memory usage optimization
- Response time benchmarks

## Monitoring & Analytics

### API Monitoring
- Response time tracking
- Error rate monitoring
- Usage pattern analysis
- Resource utilization

### Business Metrics
- KPI accuracy validation
- User engagement with dashboard
- Alert response times
- Feature usage statistics

This comprehensive KPI system provides restaurant and retail businesses with deep insights into their operations, enabling data-driven decision making and improved profitability.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { Button, Loading, Alert, Badge, PageHeader, PageContainer, AdvancedSearchFilter } from '../components/ui';
import type { FilterConfig } from '../components/ui';
import DataTable, { type Column } from '../components/ui/DataTable';
import { transactionService, type ConvertedSale, type TransactionQueryParams } from '../services/transaction';
import { AdvancedFilter, type AdvancedFilterState } from '../components/filters/AdvancedFilter';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import { formattingService } from '../services/formatting';

// Use ConvertedSale from transaction service
type Sale = ConvertedSale;

const Sales: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  
  // Simple search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced filter state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>({
    dateFilter: 'today',
    customDateRange: { start: '', end: '' },
    statusFilter: 'all',
    paymentStatusFilter: 'all',
    paymentMethodFilter: 'all',
    amountRangeFilter: { min: '', max: '' },
    cashierFilter: 'all'
  });
  
  // Alert state
  const [alertState, setAlertState] = useState<{
    type: 'success' | 'error' | 'warning' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // API Integration - Fetch transactions from API
  const fetchTransactions = async () => {
    if (!currentTenant || !currentStore) {
      console.log('⚠️ Missing tenant or store information');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setAlertState({ type: null, message: '' });
    
    try {
      console.log('🔄 Fetching transactions for:', {
        tenantId: currentTenant.id,
        storeId: currentStore.store_id,
        dateFilter: advancedFilters.dateFilter
      });

      // Build query parameters based on current filters
      const queryParams: TransactionQueryParams = {};
      
      // Add date range
      const dateRange = transactionService.getDateRange(advancedFilters.dateFilter);
      if (dateRange.start_date) {
        queryParams.start_date = dateRange.start_date;
      }
      if (dateRange.end_date) {
        queryParams.end_date = dateRange.end_date;
      }
      
      // Handle custom date range
      if (advancedFilters.dateFilter === 'custom' && advancedFilters.customDateRange.start && advancedFilters.customDateRange.end) {
        queryParams.start_date = advancedFilters.customDateRange.start;
        queryParams.end_date = advancedFilters.customDateRange.end;
      }
      
      // Add filters based on current state
      if (advancedFilters.statusFilter !== 'all') {
        queryParams.filter_type = 'status';
        queryParams.value = advancedFilters.statusFilter;
      } else if (advancedFilters.cashierFilter !== 'all') {
        queryParams.filter_type = 'cashier';
        queryParams.value = advancedFilters.cashierFilter;
      }

      // Fetch data from API
      const response = await transactionService.getTransactionSummary(
        currentStore.store_id,
        queryParams
      );

      // Convert API response to Sale format
      const convertedSales = response.datalist.map(transaction => 
        transactionService.convertTransactionToSale(transaction)
      );
      
      setSales(convertedSales);
      setHasNextPage(!!response.next);
      setNextCursor(response.next);
      
      console.log('✅ Successfully loaded transactions:', {
        count: convertedSales.length,
        hasNext: !!response.next
      });

      // Clear any previous errors on successful load
      setAlertState({ type: null, message: '' });

      } catch (error: any) {
        console.error('❌ Error fetching transactions:', error);
        
        // Handle different error types with user-friendly messages
        let errorMessage = 'Failed to load sales data. Please try again.';
        let errorType: 'error' | 'warning' = 'error';
        
        if (error?.response?.status === 404) {
          errorMessage = 'No sales data found for the selected period.';
          errorType = 'warning';
        } else if (error?.response?.status === 403) {
          errorMessage = 'You do not have permission to view sales data.';
        } else if (error?.response?.status >= 500) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
          errorMessage = 'Network connection error. Please check your internet connection.';
        } else if (error instanceof Error) {
          // Check error message patterns for different error types
          if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network connection error. Please check your internet connection.';
          } else if (error.message.includes('404') || error.message.includes('Not Found')) {
            errorMessage = 'Sales data not found for the selected period.';
            errorType = 'warning';
          } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
            errorMessage = 'You do not have permission to view sales data.';
          } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
            errorMessage = 'Server error occurred while loading sales data.';
          }
        }
        
        setAlertState({
          type: errorType,
          message: errorMessage
        });
        
        setSales([]);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      // Clear any previous alerts when filters change
      setAlertState({ type: null, message: '' });
      fetchTransactions();
    }, [currentTenant, currentStore, advancedFilters.dateFilter, advancedFilters.statusFilter, advancedFilters.cashierFilter, advancedFilters.customDateRange]);

  // Load more transactions (pagination)
  const loadMoreTransactions = async () => {
    if (!hasNextPage || !nextCursor || !currentTenant || !currentStore) return;

    setIsLoadingMore(true);
    
    try {
      console.log('📄 Loading more transactions with cursor:', nextCursor);

      // Build query parameters with cursor for pagination
      const queryParams: TransactionQueryParams = {
        cursor: nextCursor
      };
      
      // Add current filters
      const dateRange = transactionService.getDateRange(advancedFilters.dateFilter);
      if (dateRange.start_date) {
        queryParams.start_date = dateRange.start_date;
      }
      if (dateRange.end_date) {
        queryParams.end_date = dateRange.end_date;
      }
      
      if (advancedFilters.dateFilter === 'custom' && advancedFilters.customDateRange.start && advancedFilters.customDateRange.end) {
        queryParams.start_date = advancedFilters.customDateRange.start;
        queryParams.end_date = advancedFilters.customDateRange.end;
      }
      
      if (advancedFilters.statusFilter !== 'all') {
        queryParams.filter_type = 'status';
        queryParams.value = advancedFilters.statusFilter;
      } else if (advancedFilters.cashierFilter !== 'all') {
        queryParams.filter_type = 'cashier';
        queryParams.value = advancedFilters.cashierFilter;
      }

      // Fetch additional data
      let response;
      try {
        response = await transactionService.getTransactionSummary(
          currentStore.store_id,
          queryParams
        );
      } catch (apiError) {
        console.warn('Failed to fetch additional transaction data:', apiError);
        return;
      }

      // Convert and append new sales
      const newSales = response.datalist.map(transaction => 
        transactionService.convertTransactionToSale(transaction)
      );
      
      setSales(prevSales => [...prevSales, ...newSales]);
      setHasNextPage(!!response.next);
      setNextCursor(response.next);
      
      console.log('✅ Loaded additional transactions:', {
        newCount: newSales.length,
        totalCount: sales.length + newSales.length,
        hasNext: !!response.next
      });

    } catch (error: any) {
      console.error('❌ Error loading more transactions:', error);
      
      // Show error notification for pagination failures
      let errorMessage = 'Failed to load additional sales data. Please try again.';
      
      if (error?.response?.status === 404) {
        errorMessage = 'No more sales data found.';
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Server error occurred while loading more data.';
      } else if (error instanceof Error && error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setAlertState({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Enhanced filtering logic (client-side for additional filters not supported by API)
  const filteredSales = sales.filter(sale => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Payment status filter (client-side)
    const matchesPaymentStatus = advancedFilters.paymentStatusFilter === 'all' || 
      sale.paymentStatus === advancedFilters.paymentStatusFilter;
    
    // Payment method filter (client-side)
    const matchesPaymentMethod = advancedFilters.paymentMethodFilter === 'all' || 
      sale.paymentMethod === advancedFilters.paymentMethodFilter;
    
    // Amount range filter (client-side)
    const matchesAmountRange = 
      (!advancedFilters.amountRangeFilter.min || sale.total >= parseFloat(advancedFilters.amountRangeFilter.min)) &&
      (!advancedFilters.amountRangeFilter.max || sale.total <= parseFloat(advancedFilters.amountRangeFilter.max));
    
    return matchesSearch && matchesPaymentStatus && matchesPaymentMethod && matchesAmountRange;
  });

  // Get unique cashiers for filter
  const getUniqueCashiers = (): DropdownSearchOption[] => {
    const uniqueCashiers = new Map<string, string>();
    sales.forEach(sale => {
      if (sale.cashierId && sale.cashierName) {
        uniqueCashiers.set(sale.cashierId, sale.cashierName);
      }
    });
    
    return Array.from(uniqueCashiers.entries()).map(([id, name]) => ({
      id,
      label: name,
      icon: '👤'
    }));
  };

  // Handle advanced filter apply
  const handleAdvancedFilterApply = (filters: AdvancedFilterState) => {
    setAdvancedFilters(filters);
  };

  // Handle advanced filter clear
  const handleAdvancedFilterClear = () => {
    setAdvancedFilters({
      dateFilter: 'today',
      customDateRange: { start: '', end: '' },
      statusFilter: 'all',
      paymentStatusFilter: 'all',
      paymentMethodFilter: 'all',
      amountRangeFilter: { min: '', max: '' },
      cashierFilter: 'all'
    });
  };

  // Filter configuration for AdvancedSearchFilter
  const filterConfigs: FilterConfig[] = [
    {
      key: 'dateFilter',
      label: 'Date Range',
      type: 'dropdown',
      options: [
        { id: 'today', label: 'Today' },
        { id: 'yesterday', label: 'Yesterday' },
        { id: 'last7days', label: 'Last 7 Days' },
        { id: 'last30days', label: 'Last 30 Days' },
        { id: 'thisMonth', label: 'This Month' },
        { id: 'lastMonth', label: 'Last Month' },
        { id: 'custom', label: 'Custom Range' }
      ],
      value: advancedFilters.dateFilter
    },
    {
      key: 'status',
      label: 'Status',
      type: 'dropdown',
      options: [
        { id: 'all', label: 'All Status' },
        { id: 'completed', label: 'Completed' },
        { id: 'pending', label: 'Pending' },
        { id: 'cancelled', label: 'Cancelled' },
        { id: 'refunded', label: 'Refunded' }
      ],
      value: advancedFilters.statusFilter
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      type: 'dropdown',
      options: [
        { id: 'all', label: 'All' },
        { id: 'paid', label: 'Paid' },
        { id: 'partially_paid', label: 'Partially Paid' },
        { id: 'unpaid', label: 'Unpaid' }
      ],
      value: advancedFilters.paymentStatusFilter
    }
  ];

  // Handle filter changes from AdvancedSearchFilter
  const handleFilterChange = (key: string, value: any) => {
    if (key === 'dateFilter') {
      setAdvancedFilters(prev => ({ ...prev, dateFilter: value as string }));
    } else if (key === 'status') {
      setAdvancedFilters(prev => ({ ...prev, statusFilter: value as string }));
    } else if (key === 'paymentStatus') {
      setAdvancedFilters(prev => ({ ...prev, paymentStatusFilter: value as string }));
    }
  };

  // Active filters for badge display
  const activeFilters: Array<{ key: string; label: string; value: string; onRemove: () => void }> = [];
  
  if (searchTerm) {
    activeFilters.push({
      key: 'search',
      label: 'Search',
      value: searchTerm,
      onRemove: () => setSearchTerm('')
    });
  }
  
  if (advancedFilters.dateFilter !== 'today') {
    const dateLabel = filterConfigs[0].options?.find(opt => opt.id === advancedFilters.dateFilter)?.label || advancedFilters.dateFilter;
    activeFilters.push({
      key: 'dateFilter',
      label: 'Date Range',
      value: dateLabel,
      onRemove: () => setAdvancedFilters(prev => ({ ...prev, dateFilter: 'today' }))
    });
  }
  
  if (advancedFilters.statusFilter !== 'all') {
    const statusLabel = filterConfigs[1].options?.find(opt => opt.id === advancedFilters.statusFilter)?.label || advancedFilters.statusFilter;
    activeFilters.push({
      key: 'status',
      label: 'Status',
      value: statusLabel,
      onRemove: () => setAdvancedFilters(prev => ({ ...prev, statusFilter: 'all' }))
    });
  }
  
  if (advancedFilters.paymentStatusFilter !== 'all') {
    const paymentLabel = filterConfigs[2].options?.find(opt => opt.id === advancedFilters.paymentStatusFilter)?.label || advancedFilters.paymentStatusFilter;
    activeFilters.push({
      key: 'paymentStatus',
      label: 'Payment Status',
      value: paymentLabel,
      onRemove: () => setAdvancedFilters(prev => ({ ...prev, paymentStatusFilter: 'all' }))
    });
  }

  const handleClearAllFilters = () => {
    setSearchTerm('');
    handleAdvancedFilterClear();
  };

  // Utility functions
  const getStatusBadge = (status: Sale['status']) => {
    const statusConfig = {
      completed: { color: 'green' as const, label: 'Completed' },
      pending: { color: 'yellow' as const, label: 'Pending' },
      suspended: { color: 'blue' as const, label: 'Suspended' },
      cancelled: { color: 'gray' as const, label: 'Cancelled' },
      refunded: { color: 'red' as const, label: 'Refunded' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge color={config.color} size="sm">{config.label}</Badge>;
  };

  const handleViewDetails = (sale: Sale) => {
    navigate(`/sales/${sale.id}`);
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedTransactions);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedTransactions(newSelection);
  };

  // Define DataTable columns
  const columns: Column<Sale>[] = [
    {
      key: 'id',
      title: '',
      width: '50px',
      render: (_, sale) => (
        <input
          type="checkbox"
          checked={selectedTransactions.has(sale.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleSelectTransaction(sale.id, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
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
      key: 'saleNumber',
      title: 'Transaction ID',
      sortable: true,
      render: (value) => (
        <div className="text-sm font-medium text-blue-600">{value}</div>
      ),
    },
    {
      key: 'terminalId',
      title: 'Terminal',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-700">{value}</div>
      ),
    },
    {
      key: 'lineItemsCount',
      title: 'Items',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-900 text-center">{value}</div>
      ),
    },
    {
      key: 'subtotal',
      title: 'Subtotal',
      sortable: true,
      className: 'text-right',
      render: (value, sale) => (
        <div className="text-sm text-gray-700">
          {formattingService.formatCurrency(value, { currency: sale.currency || 'USD' })}
        </div>
      ),
    },
    {
      key: 'totalTax',
      title: 'Tax',
      sortable: true,
      className: 'text-right',
      render: (value, sale) => (
        <div className="text-sm text-gray-700">
          {formattingService.formatCurrency(value, { currency: sale.currency || 'USD' })}
        </div>
      ),
    },
    {
      key: 'total',
      title: 'Total Amount',
      sortable: true,
      className: 'text-right',
      render: (value, sale) => (
        <div className="text-sm font-semibold text-gray-900">
          {formattingService.formatCurrency(value, { currency: sale.currency || 'USD' })}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
  ];

  if (isLoading) {
    return (
      <PageContainer spacing="md">
        <Loading
          title="Loading Sales"
          description="Please wait while we fetch your sales data..."
          fullScreen={false}
          size="md"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer spacing="none">
      {/* Page Header */}
      <PageHeader
        title="Transactions"
        description={currentStore ? `${currentStore.store_name} - Manage your sales transactions` : 'Manage your sales transactions'}
      />

        {/* Error/Warning Alerts */}
        {alertState.type && (
          <div className="mb-4">
            <Alert 
              variant={alertState.type} 
              onClose={() => setAlertState({ type: null, message: '' })}
            >
              {alertState.message}
            </Alert>
          </div>
        )}

        {/* Search and Filter */}
        <AdvancedSearchFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchLabel="Search Transactions"
          searchPlaceholder="Search by transaction ID, customer, or cashier..."
          filters={filterConfigs}
          onFilterChange={handleFilterChange}
          activeFilters={activeFilters}
          totalResults={sales.length}
          filteredResults={filteredSales.length}
          showResultsCount={true}
          onClearAll={handleClearAllFilters}
          className="mb-6"
          additionalActions={
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(true)}
              className="text-sm"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          }
        />

        {/* DataTable with built-in search, sorting, and pagination */}
        <DataTable
              data={filteredSales}
              columns={columns}
              loading={false}
              searchable={false}
              pagination={true}
              pageSize={20}
              pageSizeOptions={[10, 20, 50, 100]}
              defaultSort={{ key: 'createdAt', direction: 'desc' }}
              onRowClick={(sale) => handleViewDetails(sale)}
              hasMore={hasNextPage}
              onLoadMore={loadMoreTransactions}
              loadingMore={isLoadingMore}
              emptyState={
                <div className="text-center py-12">
                  <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchTerm || advancedFilters.statusFilter !== 'all'
                      ? 'Try adjusting your filters to see more results.'
                      : 'No transactions available at the moment.'
                    }
                  </p>
                </div>
              }
            />

      {/* Advanced Filter Modal */}
      <AdvancedFilter
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={advancedFilters}
        onApply={handleAdvancedFilterApply}
        onClear={handleAdvancedFilterClear}
        cashierOptions={getUniqueCashiers()}
        showCashierFilter={true}
      />
    </PageContainer>
  );
};

export default Sales;

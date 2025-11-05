import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { Button, Loading, Alert, Badge, PageHeader } from '../components/ui';
import DataTable, { type Column } from '../components/ui/DataTable';
import { transactionService, type ConvertedSale, type TransactionQueryParams } from '../services/transaction';
import { AdvancedFilter, type AdvancedFilterState } from '../components/filters/AdvancedFilter';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';

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
    setSearchTerm('');
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{formatDateTime(value).split(',')[0]}</div>
          <div className="text-xs text-gray-500">{formatDateTime(value).split(',')[1]}</div>
        </div>
      ),
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
          {new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: sale.currency || 'USD' 
          }).format(value)}
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
          {new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: sale.currency || 'USD' 
          }).format(value)}
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
          {new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: sale.currency || 'USD' 
          }).format(value)}
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
      <Loading
        title="Loading Sales"
        description="Please wait while we fetch your sales data..."
        fullScreen={false}
        size="md"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        {/* Page Header */}
          <PageHeader
            title="Transactions"
            description={currentStore ? `${currentStore.store_name} - Manage your sales transactions` : 'Manage your sales transactions'}
          />

        {/* Error/Warning Alerts */}
        {alertState.type && (
          <div className="mb-4 px-4 sm:px-6 lg:px-8">
            <Alert 
              variant={alertState.type} 
              onClose={() => setAlertState({ type: null, message: '' })}
            >
              {alertState.message}
            </Alert>
          </div>
        )}

        {/* Action Bar */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(true)}
                className="text-sm"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* DataTable with built-in search, sorting, and pagination */}
        <div className="mt-6">
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
        </div>
      </div>

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
    </div>
  );
};

export default Sales;

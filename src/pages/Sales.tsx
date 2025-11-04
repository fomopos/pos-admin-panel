import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { Button, Loading, Alert, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
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
  
  // Tab state for transaction status
  const [activeTab, setActiveTab] = useState('all');
  
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

  const getPaymentMethodIcon = (method: Sale['paymentMethod']) => {
    // Return simple text for now since we removed icon imports
    return method;
  };

  const handleViewDetails = (sale: Sale) => {
    navigate(`/sales/${sale.id}`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(new Set(filteredSales.map(s => s.id)));
    } else {
      setSelectedTransactions(new Set());
    }
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

  // Calculate tab counts
  const tabCounts = {
    all: sales.length,
    new: sales.filter(s => s.status === 'pending' || s.status === 'suspended').length,
    completed: sales.filter(s => s.status === 'completed').length,
    suspended: sales.filter(s => s.status === 'suspended').length,
    cancelled: sales.filter(s => s.status === 'cancelled').length
  };

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
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        </div>

        {/* Error/Warning Alerts */}
        {alertState.type && (
          <div className="mb-6">
            <Alert 
              variant={alertState.type} 
              onClose={() => setAlertState({ type: null, message: '' })}
            >
              {alertState.message}
            </Alert>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow">
          {/* Tabs for Transaction Status */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('all')}
                className={`${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                All transactions
                <Badge color="gray" size="sm">{tabCounts.all}</Badge>
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`${
                  activeTab === 'new'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                Pending review
                <Badge color="yellow" size="sm">{tabCounts.new}</Badge>
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                Approved
                <Badge color="green" size="sm">{tabCounts.completed}</Badge>
              </button>
            </nav>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
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

          {/* Table */}
          {filteredSales.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.size === filteredSales.length && filteredSales.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction number</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow 
                        key={sale.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewDetails(sale)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedTransactions.has(sale.id)}
                            onChange={(e) => handleSelectTransaction(sale.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{formatDateTime(sale.createdAt).split(',')[0]}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-gray-900">{sale.saleNumber}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{sale.customerName}</div>
                          <div className="text-xs text-gray-500">{sale.items.length} item{sale.items.length !== 1 ? 's' : ''}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(sale.total)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-700 capitalize">{getPaymentMethodIcon(sale.paymentMethod).replace('_', ' ')}</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(sale.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {Math.min(filteredSales.length, 20)} of {filteredSales.length} items
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Rows per page:</span>
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>10</option>
                    <option selected>20</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                  <div className="flex items-center gap-1 ml-4">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="bg-blue-600 text-white border-blue-600">
                      1
                    </Button>
                    <Button variant="outline" size="sm">
                      2
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </div>
              </div>

              {/* Load More for API Pagination */}
              {hasNextPage && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
                  <Button
                    onClick={loadMoreTransactions}
                    disabled={isLoadingMore}
                    variant="outline"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 px-6">
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || advancedFilters.statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first transaction.'
                }
              </p>
              {!searchTerm && advancedFilters.statusFilter === 'all' && (
                <Button className="mt-4">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create transaction
                </Button>
              )}
            </div>
          )}
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

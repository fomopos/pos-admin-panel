import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  PlusIcon, 
  EyeIcon, 
  PrinterIcon, 
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { Button, Card, PageHeader, Loading, Alert } from '../components/ui';
import { transactionService, type ConvertedSale, type TransactionQueryParams } from '../services/transaction';

// Use ConvertedSale from transaction service
type Sale = ConvertedSale;

const Sales: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  
  // Enhanced Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [amountRangeFilter, setAmountRangeFilter] = useState({ min: '', max: '' });
  const [cashierFilter, setCashierFilter] = useState<string>('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
        dateFilter
      });

      // Build query parameters based on current filters
      const queryParams: TransactionQueryParams = {};
      
      // Add date range
      const dateRange = transactionService.getDateRange(dateFilter);
      if (dateRange.start_date) {
        queryParams.start_date = dateRange.start_date;
      }
      if (dateRange.end_date) {
        queryParams.end_date = dateRange.end_date;
      }
      
      // Handle custom date range
      if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
        queryParams.start_date = customDateRange.start;
        queryParams.end_date = customDateRange.end;
      }
      
      // Add filters based on current state
      if (statusFilter !== 'all') {
        queryParams.filter_type = 'status';
        queryParams.value = statusFilter;
      } else if (cashierFilter !== 'all') {
        queryParams.filter_type = 'cashier';
        queryParams.value = cashierFilter;
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
    }, [currentTenant, currentStore, dateFilter, statusFilter, cashierFilter, customDateRange]);

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
      const dateRange = transactionService.getDateRange(dateFilter);
      if (dateRange.start_date) {
        queryParams.start_date = dateRange.start_date;
      }
      if (dateRange.end_date) {
        queryParams.end_date = dateRange.end_date;
      }
      
      if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
        queryParams.start_date = customDateRange.start;
        queryParams.end_date = customDateRange.end;
      }
      
      if (statusFilter !== 'all') {
        queryParams.filter_type = 'status';
        queryParams.value = statusFilter;
      } else if (cashierFilter !== 'all') {
        queryParams.filter_type = 'cashier';
        queryParams.value = cashierFilter;
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
    
    // Status filters
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || sale.paymentStatus === paymentStatusFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || sale.paymentMethod === paymentMethodFilter;
    
    // Cashier filter
    const matchesCashier = cashierFilter === 'all' || sale.cashierId === cashierFilter;
    
    // Amount range filter
    const matchesAmountRange = (!amountRangeFilter.min || sale.total >= parseFloat(amountRangeFilter.min)) &&
                              (!amountRangeFilter.max || sale.total <= parseFloat(amountRangeFilter.max));
    
    // Enhanced date filtering
    const saleDate = new Date(sale.createdAt);
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    let matchesDate = true;
    switch (dateFilter) {
      case 'today':
        matchesDate = saleDate >= startOfDay;
        break;
      case 'week':
        matchesDate = saleDate >= startOfWeek;
        break;
      case 'month':
        matchesDate = saleDate >= startOfMonth;
        break;
      case 'year':
        matchesDate = saleDate >= startOfYear;
        break;
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start);
          const endDate = new Date(customDateRange.end);
          matchesDate = saleDate >= startDate && saleDate <= endDate;
        }
        break;
      case 'all':
      default:
        matchesDate = true;
    }
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && 
           matchesPaymentMethod && matchesCashier && matchesAmountRange && matchesDate;
  });

  // Sorting logic
  const sortedSales = [...filteredSales].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'saleNumber':
        aValue = a.saleNumber;
        bValue = b.saleNumber;
        break;
      case 'customerName':
        aValue = a.customerName;
        bValue = b.customerName;
        break;
      case 'total':
        aValue = a.total;
        bValue = b.total;
        break;
      case 'createdAt':
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Statistics calculation
  const salesStats = {
    total: filteredSales.length,
    completed: filteredSales.filter(s => s.status === 'completed').length,
    pending: filteredSales.filter(s => s.status === 'pending').length,
    totalRevenue: filteredSales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total, 0),
    avgOrderValue: filteredSales.length > 0 ? filteredSales.reduce((sum, s) => sum + s.total, 0) / filteredSales.length : 0
  };

  // Utility functions
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setPaymentMethodFilter('all');
    setDateFilter('today');
    setAmountRangeFilter({ min: '', max: '' });
    setCashierFilter('all');
    setCustomDateRange({ start: '', end: '' });
  };

  const getUniqueValues = (key: string) => {
    const values: string[] = [];
    sales.forEach(sale => {
      if (key === 'cashierName' && sale.cashierName) {
        values.push(sale.cashierName);
      }
    });
    return [...new Set(values)].filter(Boolean);
  };

  const getStatusBadge = (status: Sale['status']) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      suspended: { bg: 'bg-blue-100', text: 'text-blue-800', icon: ClockIcon },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XMarkIcon },
      refunded: { bg: 'bg-red-100', text: 'text-red-800', icon: ExclamationTriangleIcon }
    };
    
    const config = statusConfig[status];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  const getPaymentStatusBadge = (status: Sale['paymentStatus']) => {
    const statusConfig = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      partial: { bg: 'bg-orange-100', text: 'text-orange-800', icon: ClockIcon },
      refunded: { bg: 'bg-red-100', text: 'text-red-800', icon: ExclamationTriangleIcon }
    };
    
    const config = statusConfig[status];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentMethodIcon = (method: Sale['paymentMethod']) => {
    switch (method) {
      case 'cash':
        return BanknotesIcon;
      case 'card':
        return CreditCardIcon;
      case 'digital_wallet':
        return DevicePhoneMobileIcon;
      case 'bank_transfer':
        return BuildingLibraryIcon;
      default:
        return CurrencyDollarIcon;
    }
  };

  const handleViewDetails = (sale: Sale) => {
    navigate(`/sales/${sale.id}`);
  };

  const handlePrintReceipt = (sale: Sale) => {
    console.log('Printing receipt for sale:', sale.saleNumber);
    alert(`Printing receipt for ${sale.saleNumber}`);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6 space-y-8">
      {/* Error handling through Alert component */}
      {alertState.type && (
        <Alert 
          variant={alertState.type} 
          onClose={() => setAlertState({ type: null, message: '' })}
        >
          {alertState.message}
        </Alert>
      )}
      {/* Enhanced Header with Stats */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden">
        <div className="p-8">
          <PageHeader
            title={t('nav.sales')}
            description={`${currentStore ? `${currentStore.store_name} - ` : ''}${t('sales.description')}`}
          >
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="inline-flex items-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                {t('sales.export')}
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <PlusIcon className="h-4 w-4 mr-2" />
                {t('sales.newSale')}
              </Button>
            </div>
          </PageHeader>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">{t('sales.stats.totalSales')}</p>
                  <p className="text-2xl font-bold text-blue-900">{salesStats.total}</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 border border-green-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">{t('sales.stats.completed')}</p>
                  <p className="text-2xl font-bold text-green-900">{salesStats.completed}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl p-6 border border-yellow-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">{t('sales.stats.pending')}</p>
                  <p className="text-2xl font-bold text-yellow-900">{salesStats.pending}</p>
                </div>
                <ClockIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 border border-purple-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">{t('sales.stats.revenue')}</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(salesStats.totalRevenue)}</p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl overflow-hidden">
        <div className="p-6">
          {/* Primary Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('sales.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm text-slate-900 placeholder:text-slate-500 transition-all"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">{t('sales.filters.allStatus')}</option>
              <option value="completed">{t('sales.filters.completed')}</option>
              <option value="new">{t('sales.filters.new')}</option>
              <option value="suspended">{t('sales.filters.suspended')}</option>
              <option value="cancelled">{t('sales.filters.cancelled')}</option>
              <option value="cancel_orphaned">{t('sales.filters.cancelOrphaned')}</option>
            </select>
            
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <ListBulletIcon className="h-4 w-4 mr-1" />
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4 mr-1" />
                Grid
              </button>
            </div>
            
            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="h-12 px-4 bg-white/70 backdrop-blur-sm border-slate-200 hover:bg-white/90 transition-all"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
              Advanced
              <ChevronDownIcon className={`ml-2 h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Payment Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Payment Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                
                {/* Payment Method Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Methods</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="digital_wallet">Digital Wallet</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                
                {/* Cashier Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cashier</label>
                  <select
                    value={cashierFilter}
                    onChange={(e) => setCashierFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Cashiers</option>
                    {getUniqueValues('cashierName').map((cashier) => (
                      <option key={cashier} value={cashier}>{cashier}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Amount Range Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Min Amount</label>
                  <input
                    type="number"
                    placeholder="$0.00"
                    value={amountRangeFilter.min}
                    onChange={(e) => setAmountRangeFilter(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Amount</label>
                  <input
                    type="number"
                    placeholder="$999.99"
                    value={amountRangeFilter.max}
                    onChange={(e) => setAmountRangeFilter(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Custom Date Range */}
              {dateFilter === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
              
              {/* Clear Filters Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="bg-white/70 border-slate-200 hover:bg-white/90"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modern Data Display */}
      <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl overflow-hidden">
        <div className="p-6">
          {/* Header with Sort Controls */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">Sales Transactions</h3>
              <p className="text-sm text-slate-500">
                {sortedSales.length} of {sales.length} sales • Avg: {formatCurrency(salesStats.avgOrderValue)}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date</option>
                <option value="saleNumber">Sale #</option>
                <option value="customerName">Customer</option>
                <option value="total">Amount</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-slate-500 hover:text-slate-700 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 hover:bg-white/90 transition-all"
              >
                {sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          {/* List View */}
          {viewMode === 'list' && (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors"
                      onClick={() => handleSort('saleNumber')}
                    >
                      <div className="flex items-center">
                        Sale #
                        <ArrowsUpDownIcon className="ml-1 h-3 w-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors"
                      onClick={() => handleSort('customerName')}
                    >
                      <div className="flex items-center">
                        Customer
                        <ArrowsUpDownIcon className="ml-1 h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Items
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors"
                      onClick={() => handleSort('total')}
                    >
                      <div className="flex items-center">
                        Total
                        <ArrowsUpDownIcon className="ml-1 h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Date
                        <ArrowsUpDownIcon className="ml-1 h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {sortedSales.map((sale, index) => (
                    <tr 
                      key={sale.id} 
                      className={`hover:bg-slate-50 transition-all cursor-pointer ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                      onClick={() => handleViewDetails(sale)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">{sale.saleNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {sale.customerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900">{sale.customerName}</div>
                            {sale.customerEmail && (
                              <div className="text-xs text-slate-500">{sale.customerEmail}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700">
                          <span className="font-medium">{sale.items.length}</span> item{sale.items.length !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">{formatCurrency(sale.total)}</div>
                        {sale.totalDiscount > 0 && (
                          <div className="text-xs text-orange-600">-{formatCurrency(sale.totalDiscount)} discount</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-slate-700">
                            {(() => {
                              const PaymentIcon = getPaymentMethodIcon(sale.paymentMethod);
                              return <PaymentIcon className="h-4 w-4 mr-1" />;
                            })()}
                            <span className="capitalize">{sale.paymentMethod.replace('_', ' ')}</span>
                          </div>
                          {getPaymentStatusBadge(sale.paymentStatus)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(sale.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{formatDateTime(sale.createdAt)}</div>
                        <div className="text-xs text-slate-500">by {sale.cashierName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(sale);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrintReceipt(sale);
                            }}
                            className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                            title="Print Receipt"
                          >
                            <PrinterIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSales.map((sale) => (
                <div
                  key={sale.id}
                  className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                  onClick={() => handleViewDetails(sale)}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {sale.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{sale.saleNumber}</h4>
                        <p className="text-xs text-slate-500">{formatDateTime(sale.createdAt)}</p>
                      </div>
                    </div>
                    {getStatusBadge(sale.status)}
                  </div>
                  
                  {/* Customer Info */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-900">{sale.customerName}</p>
                    {sale.customerEmail && (
                      <p className="text-xs text-slate-500">{sale.customerEmail}</p>
                    )}
                  </div>
                  
                  {/* Sale Summary */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Items</p>
                      <p className="text-sm font-semibold text-slate-900">{sale.items.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(sale.total)}</p>
                    </div>
                  </div>
                  
                  {/* Payment Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-xs text-slate-600">
                      {(() => {
                        const PaymentIcon = getPaymentMethodIcon(sale.paymentMethod);
                        return <PaymentIcon className="h-3 w-3 mr-1" />;
                      })()}
                      <span className="capitalize">{sale.paymentMethod.replace('_', ' ')}</span>
                    </div>
                    {getPaymentStatusBadge(sale.paymentStatus)}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-xs text-slate-500">by {sale.cashierName}</span>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(sale);
                        }}
                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <EyeIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintReceipt(sale);
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                        title="Print Receipt"
                      >
                        <PrinterIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            onClick={loadMoreTransactions}
            disabled={isLoadingMore}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading more...
              </>
            ) : (
              'Load More Sales'
            )}
          </Button>
        </div>
      )}

      {filteredSales.length === 0 && (
        <Card className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <ShoppingCartIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">No sales found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating your first sale.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && dateFilter === 'all' && (
            <Button className="mt-4">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default Sales;

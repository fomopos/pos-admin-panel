import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PlusIcon, 
  EyeIcon, 
  PrinterIcon, 
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserIcon,
  ClockIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

interface Sale {
  id: string;
  saleNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  items: SaleItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital_wallet' | 'bank_transfer';
  paymentStatus: 'paid' | 'pending' | 'partial' | 'refunded';
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  cashierId: string;
  cashierName: string;
}

const Sales: React.FC = () => {
  const { t } = useTranslation();
  const { currentTenant, currentStore } = useTenantStore();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSales([
        {
          id: '1',
          saleNumber: 'SALE-2024-001',
          customerName: 'John Doe',
          customerEmail: 'john.doe@email.com',
          items: [
            {
              id: '1',
              productId: '1',
              productName: 'Wireless Headphones',
              sku: 'WH-001',
              quantity: 1,
              unitPrice: 199.99,
              discount: 10,
              tax: 8.5,
              total: 197.49
            },
            {
              id: '2',
              productId: '2',
              productName: 'Cotton T-Shirt',
              sku: 'CT-002',
              quantity: 2,
              unitPrice: 29.99,
              discount: 0,
              tax: 8.5,
              total: 65.08
            }
          ],
          subtotal: 259.97,
          totalDiscount: 20.00,
          totalTax: 22.60,
          total: 262.57,
          paymentMethod: 'card',
          paymentStatus: 'paid',
          status: 'completed',
          notes: 'Customer requested gift wrapping',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          cashierId: 'user1',
          cashierName: 'Alice Johnson'
        },
        {
          id: '2',
          saleNumber: 'SALE-2024-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane.smith@email.com',
          items: [
            {
              id: '3',
              productId: '3',
              productName: 'Coffee Beans',
              sku: 'CB-003',
              quantity: 3,
              unitPrice: 15.99,
              discount: 5,
              tax: 0,
              total: 45.57
            }
          ],
          subtotal: 47.97,
          totalDiscount: 2.40,
          totalTax: 0,
          total: 45.57,
          paymentMethod: 'cash',
          paymentStatus: 'paid',
          status: 'completed',
          createdAt: '2024-01-15T14:20:00Z',
          updatedAt: '2024-01-15T14:20:00Z',
          cashierId: 'user2',
          cashierName: 'Bob Wilson'
        },
        {
          id: '3',
          saleNumber: 'SALE-2024-003',
          customerName: 'Mike Johnson',
          items: [
            {
              id: '4',
              productId: '4',
              productName: 'Programming Book',
              sku: 'PB-004',
              quantity: 1,
              unitPrice: 49.99,
              discount: 15,
              tax: 0,
              total: 42.49
            }
          ],
          subtotal: 49.99,
          totalDiscount: 7.50,
          totalTax: 0,
          total: 42.49,
          paymentMethod: 'digital_wallet',
          paymentStatus: 'pending',
          status: 'pending',
          createdAt: '2024-01-15T16:45:00Z',
          updatedAt: '2024-01-15T16:45:00Z',
          cashierId: 'user1',
          cashierName: 'Alice Johnson'
        },
        {
          id: '4',
          saleNumber: 'SALE-2024-004',
          customerName: 'Sarah Brown',
          customerEmail: 'sarah.brown@email.com',
          items: [
            {
              id: '5',
              productId: '1',
              productName: 'Wireless Headphones',
              sku: 'WH-001',
              quantity: 1,
              unitPrice: 199.99,
              discount: 10,
              tax: 8.5,
              total: 197.49
            }
          ],
          subtotal: 199.99,
          totalDiscount: 20.00,
          totalTax: 17.49,
          total: 197.49,
          paymentMethod: 'card',
          paymentStatus: 'refunded',
          status: 'refunded',
          notes: 'Product defective, full refund issued',
          createdAt: '2024-01-14T09:15:00Z',
          updatedAt: '2024-01-15T11:30:00Z',
          cashierId: 'user2',
          cashierName: 'Bob Wilson'
        }
      ]);
      
      setIsLoading(false);
    };

    fetchSales();
  }, [currentTenant]);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.cashierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    
    // Simple date filtering - in real app, this would be more sophisticated
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && new Date(sale.createdAt).toDateString() === new Date().toDateString());
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: Sale['status']) => {
    const statusConfig = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusConfig[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: Sale['paymentStatus']) => {
    const statusConfig = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      refunded: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusConfig[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const handlePrintReceipt = (sale: Sale) => {
    // In a real app, this would generate and print a receipt
    console.log('Printing receipt for sale:', sale.saleNumber);
    alert(`Printing receipt for ${sale.saleNumber}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Calculate summary stats
  const todaysSales = sales.filter(sale => 
    new Date(sale.createdAt).toDateString() === new Date().toDateString()
  );
  
  const todaysRevenue = todaysSales.reduce((sum, sale) => 
    sale.status === 'completed' ? sum + sale.total : sum, 0
  );
  
  const completedSales = sales.filter(sale => sale.status === 'completed');
  const pendingSales = sales.filter(sale => sale.status === 'pending');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('nav.sales')}</h1>
          <p className="text-slate-500">
            {currentStore ? `${currentStore.store_name} - ` : ''}
            Manage and track your sales transactions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Export
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </button>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-2xl mb-4">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Today's Revenue</p>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(todaysRevenue)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-2xl mb-4">
                <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Today's Sales</p>
              <p className="text-3xl font-bold text-slate-900">{todaysSales.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-2xl mb-4">
                <span className="text-green-600 font-semibold text-lg">✓</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Completed</p>
              <p className="text-3xl font-bold text-slate-900">{completedSales.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-2xl mb-4">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Pending</p>
              <p className="text-3xl font-bold text-slate-900">{pendingSales.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <button className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            Custom Range
          </button>
        </div>
      </Card>

      {/* Sales Table */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-1">Sales Transactions</h3>
          <p className="text-sm text-slate-500">{filteredSales.length} sales found</p>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Sale #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {sale.saleNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-slate-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {sale.customerName}
                        </div>
                        {sale.customerEmail && (
                          <div className="text-sm text-slate-500">
                            {sale.customerEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {formatCurrency(sale.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-slate-900 capitalize">
                        {sale.paymentMethod.replace('_', ' ')}
                      </div>
                      {getPaymentStatusBadge(sale.paymentStatus)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(sale.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDateTime(sale.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(sale)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePrintReceipt(sale)}
                        className="text-slate-600 hover:text-slate-700 transition-colors"
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
      </Card>

      {/* Sale Details Modal */}
      {showDetails && selectedSale && (
        <div className="fixed inset-0 bg-slate-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-2xl bg-white border-slate-200">
            <Card className="border-0 shadow-none">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">Sale Details - {selectedSale.saleNumber}</h3>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(selectedSale.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-6">
                  {/* Customer & Sale Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedSale.customerName}</p>
                        {selectedSale.customerEmail && (
                          <p><span className="font-medium">Email:</span> {selectedSale.customerEmail}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Sale Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Cashier:</span> {selectedSale.cashierName}</p>
                        <p><span className="font-medium">Payment:</span> {selectedSale.paymentMethod.replace('_', ' ')}</p>
                        <p><span className="font-medium">Status:</span> {getStatusBadge(selectedSale.status)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Items</h4>
                    <div className="overflow-hidden">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Qty</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Discount</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedSale.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2 text-sm text-slate-900">{item.productName}</td>
                              <td className="px-4 py-2 text-sm text-slate-500">{item.sku}</td>
                              <td className="px-4 py-2 text-sm text-slate-900">{item.quantity}</td>
                              <td className="px-4 py-2 text-sm text-slate-900">{formatCurrency(item.unitPrice)}</td>
                              <td className="px-4 py-2 text-sm text-slate-900">{item.discount}%</td>
                              <td className="px-4 py-2 text-sm font-medium text-slate-900">{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-4">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(selectedSale.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Discount:</span>
                          <span>-{formatCurrency(selectedSale.totalDiscount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax:</span>
                          <span>{formatCurrency(selectedSale.totalTax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold border-t pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(selectedSale.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedSale.notes && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Notes</h4>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                        {selectedSale.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <button
                      onClick={() => handlePrintReceipt(selectedSale)}
                      className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <PrinterIcon className="h-4 w-4 mr-2" />
                      Print Receipt
                    </button>
                    <Button onClick={() => setShowDetails(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  PlusIcon, 
  EyeIcon, 
  PrinterIcon, 
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ShoppingCartIcon,
  UserIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { Button, Card, PageHeader, Loading } from '../components/ui';

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
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');

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
    // Navigate to the dedicated sales detail page
    navigate(`/sales/${sale.id}`);
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
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={t('nav.sales')}
        description={`${currentStore ? `${currentStore.store_name} - ` : ''}Manage and track your sales transactions`}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="inline-flex items-center"
          >
            Export
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </PageHeader>

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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PrinterIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  UserIcon,
  ShoppingBagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Button, Card, PageHeader, Loading } from '../components/ui';
import { EnhancedTabs, TabsContent } from '../components/ui/Tabs';
import { ReceiptViewer } from '../components/receipt';
import { useTenantStore } from '../tenants/tenantStore';
import { transactionService, type TransactionDetail } from '../services/transaction';

const SalesDetail: React.FC = () => {
  const { transId } = useParams<{ transId: string }>();
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('items');

  useEffect(() => {
    if (transId) {
      loadTransaction();
    }
  }, [transId, currentTenant, currentStore]);

  const loadTransaction = async () => {
    if (!currentTenant || !currentStore || !transId) {
      setError('Missing required information to load transaction');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading transaction detail:', {
        tenantId: currentTenant.id,
        storeId: currentStore.store_id,
        transId
      });

      // Fetch transaction detail from API
      const transactionData = await transactionService.getTransactionDetail(
        currentTenant.id,
        currentStore.store_id,
        transId
      );
      
      setTransaction(transactionData);
      console.log('✅ Successfully loaded transaction detail:', transactionData);

    } catch (error) {
      console.error('❌ Error loading transaction detail:', error);
      setError(error instanceof Error ? error.message : 'Failed to load transaction details');
      setTransaction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: string | number, currency: string = 'INR') => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(numericAmount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusBadge = (status: TransactionDetail['status']) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      new: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      suspended: { bg: 'bg-blue-100', text: 'text-blue-800', icon: ClockIcon },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: ExclamationTriangleIcon },
      cancel_orphaned: { bg: 'bg-gray-100', text: 'text-gray-800', icon: ExclamationTriangleIcon }
    };
    
    const config = statusConfig[status];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentIcon = (tenderId: string) => {
    switch (tenderId) {
      case 'cash':
        return BanknotesIcon;
      case 'credit':
      case 'card':
        return CreditCardIcon;
      case 'bank_transfer':
        return BuildingLibraryIcon;
      default:
        return CurrencyDollarIcon;
    }
  };

  const handlePrintReceipt = () => {
    console.log('Printing receipt for transaction:', transId);
    alert(`Printing receipt for transaction ${transId}`);
  };

  const handleDuplicateTransaction = () => {
    console.log('Duplicating transaction:', transId);
    alert(`Duplicating transaction ${transId}`);
  };

  // Tab configuration
  const tabs = [
    {
      id: 'items',
      name: 'Items',
      icon: ShoppingBagIcon
    },
    {
      id: 'payments',
      name: 'Payments', 
      icon: CreditCardIcon
    },
    {
      id: 'receipts',
      name: 'Receipts',
      icon: DocumentTextIcon
    }
  ];

  // Add counts to tabs when transaction is loaded
  const tabsWithCounts = transaction ? tabs.map(tab => ({
    ...tab,
    name: tab.id === 'items' ? `Items (${transaction.line_items.length})` :
          tab.id === 'payments' ? `Payments (${transaction.payment_line_items.length})` :
          tab.id === 'receipts' ? `Receipts (${transaction.documents.length})` :
          tab.name
  })) : tabs;

  if (isLoading) {
    return (
      <Loading
        title="Loading Transaction"
        description="Please wait while we fetch the transaction details..."
        fullScreen={false}
        size="lg"
      />
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-white/20">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction Not Found</h3>
            <p className="text-red-600 mb-6">{error || 'The requested transaction could not be found.'}</p>
            <Button onClick={() => navigate('/sales')}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Sales
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 space-y-8">
      {/* Header */}
      <PageHeader
        title={`Transaction ${transaction.trans_id}`}
        description={`${transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)} • ${formatDateTime(transaction.created_at)}`}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/sales')}
            className="flex items-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Sales
          </Button>
          <Button
            variant="outline"
            onClick={handleDuplicateTransaction}
            className="flex items-center backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
          >
            <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button
            onClick={handlePrintReceipt}
            className="flex items-center bg-blue-600 hover:bg-blue-700"
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </PageHeader>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Transaction Details and Summary - Above Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction Details */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">Transaction Details</h3>
                {getStatusBadge(transaction.status)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Transaction ID</label>
                    <p className="text-lg font-semibold text-slate-900">{transaction.trans_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Terminal</label>
                    <p className="text-slate-900">{transaction.terminal_id}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Business Date</label>
                    <p className="text-slate-900">{formatDateTime(transaction.business_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Duration</label>
                    <p className="text-slate-900">
                      {Math.round((new Date(transaction.end_datetime).getTime() - new Date(transaction.begin_datetime).getTime()) / 1000)} seconds
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Associates</label>
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-900">{transaction.associates.join(', ')}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Locale</label>
                    <p className="text-slate-900">{transaction.store_locale}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Transaction Summary */}
          <div>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Transaction Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(transaction.sub_total, transaction.store_currency)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax Total</span>
                  <span className="font-medium">{formatCurrency(transaction.tax_total, transaction.store_currency)}</span>
                </div>
                
                {parseFloat(transaction.round_total) !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rounding</span>
                    <span className="font-medium">{formatCurrency(transaction.round_total, transaction.store_currency)}</span>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(transaction.total, transaction.store_currency)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount Tendered</span>
                    <span className="font-medium">{formatCurrency(
                      transaction.payment_line_items.reduce((sum, payment) => sum + parseFloat(payment.amount), 0).toString(),
                      transaction.store_currency
                    )}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount Due</span>
                    <span className="font-medium">{formatCurrency(
                      (parseFloat(transaction.total) - transaction.payment_line_items.reduce((sum, payment) => sum + parseFloat(payment.amount), 0)).toString(),
                      transaction.store_currency
                    )}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabbed Content */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 overflow-hidden">
          <EnhancedTabs
            tabs={tabsWithCounts}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="bg-transparent"
          >
            {/* Items Tab */}
            <TabsContent value="items" activeTab={activeTab}>
              <div className="space-y-4">
                {transaction.line_items.map((item) => (
                  <div key={item.line_item_id} className="border border-slate-200 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-lg">{item.item_id}</h4>
                        {item.item_description && (
                          <p className="text-slate-600 mt-1">{item.item_description}</p>
                        )}
                        {item.notes && (
                          <p className="text-amber-600 text-sm mt-2 font-medium">💡 {item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(item.extended_amount, transaction.store_currency)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {item.quantity} × {formatCurrency(item.unit_price, transaction.store_currency)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Price Modifiers */}
                    {item.price_modifiers.length > 0 && (
                      <div className="bg-orange-50 rounded-lg p-3 mb-3">
                        <h5 className="font-medium text-orange-800 mb-2">Price Adjustments</h5>
                        {item.price_modifiers.map((modifier, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-orange-700">{modifier.price_change_reason_code}</span>
                            <span className="font-medium text-orange-700">
                              {formatCurrency(modifier.price_change_amount, transaction.store_currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Tax Breakdown */}
                    {item.tax_modifiers.length > 0 && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <h5 className="font-medium text-slate-700 mb-2">Tax Breakdown</h5>
                        <div className="space-y-1">
                          {item.tax_modifiers.map((tax, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-slate-600">
                                {tax.tax_rule_name} ({(parseFloat(tax.tax_percent) * 100).toFixed(1)}%)
                              </span>
                              <span className="font-medium text-slate-700">
                                {formatCurrency(tax.tax_amount, transaction.store_currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" activeTab={activeTab}>
              <div className="space-y-4">
                {transaction.payment_line_items.map((payment) => {
                  const PaymentIcon = getPaymentIcon(payment.tender_id);
                  return (
                    <div key={payment.payment_seq} className="flex items-center justify-between p-6 border border-slate-200 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <PaymentIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-lg">{payment.tender_description}</p>
                          <p className="text-sm text-slate-500">Payment #{payment.payment_seq}</p>
                          {payment.change_flag && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                              Change
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold text-slate-900">
                          {formatCurrency(payment.amount, transaction.store_currency)}
                        </p>
                        {payment.foreign_amount && (
                          <p className="text-sm text-slate-500">
                            Foreign: {payment.foreign_amount} (Rate: {payment.exchange_rate})
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Receipts Tab */}
            <TabsContent value="receipts" activeTab={activeTab}>
              {transaction.documents && transaction.documents.length > 0 ? (
                <ReceiptViewer 
                  documents={transaction.documents}
                  renderOptions={{
                    width: 300,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    showBorders: true,
                    padding: 12
                  }}
                />
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Receipts Available</h3>
                  <p className="text-gray-500">No receipt documents found for this transaction.</p>
                </div>
              )}
            </TabsContent>

            {/* Notes */}
            {transaction.notes && (
              <div className="mt-6 border border-slate-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Notes</h3>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{transaction.notes}</p>
              </div>
            )}
          </EnhancedTabs>
        </Card>
      </div>
    </div>
  );
};

export default SalesDetail;

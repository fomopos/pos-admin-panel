import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PrinterIcon,
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
import { Button, Card, PageHeader, Loading, PageContainer, H3, H4, H5, Body1, Body2, Label, Caption } from '../components/ui';
import { EnhancedTabs, TabsContent } from '../components/ui/Tabs';
import { ReceiptViewer } from '../components/receipt';
import { useTenantStore } from '../tenants/tenantStore';
import { transactionService, type TransactionDetail, fromScaledInt } from '../services/transaction';
import { formattingService } from '../services/formatting';

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

  const getStatusBadge = (status: TransactionDetail['status']) => {
    const statusConfig = {
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      NEW: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      SUSPEND: { bg: 'bg-blue-100', text: 'text-blue-800', icon: ClockIcon },
      RESUME: { bg: 'bg-blue-100', text: 'text-blue-800', icon: ClockIcon },
      CANCEL: { bg: 'bg-gray-100', text: 'text-gray-800', icon: ExclamationTriangleIcon }
    };
    
    // Fallback for unknown status values
    const config = statusConfig[status] || { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      icon: ClockIcon 
    };
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
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
          tab.id === 'payments' ? `Payments (${transaction.payments.length})` :
          tab.id === 'receipts' ? `Receipts (${transaction.documents.length})` :
          tab.name
  })) : tabs;

  if (isLoading) {
    return (
      <PageContainer variant="default" spacing="md">
        <Loading
          title="Loading Transaction"
          description="Please wait while we fetch the transaction details..."
          fullScreen={false}
          size="lg"
        />
      </PageContainer>
    );
  }

  if (error || !transaction) {
    return (
      <PageContainer variant="default" spacing="md">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-white/20">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <H3 color="primary" className="mb-2">Transaction Not Found</H3>
            <Body1 color="error" className="mb-6">{error || 'The requested transaction could not be found.'}</Body1>
            <Button onClick={() => navigate('/sales')}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Sales
            </Button>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="default" spacing="none">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <PageHeader
          title={`Transaction ${transaction.trans_seq}`}
          description={`${transaction.trans_type.charAt(0).toUpperCase() + transaction.trans_type.slice(1).toLowerCase()} • ${formattingService.formatDate(transaction.begin_time, 'datetime-short')}`}
        >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/sales')}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Sales
          </Button>
          <Button
            variant="primary"
            onClick={handlePrintReceipt}
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
                <H4 color="slate-900">Transaction Details</H4>
                {getStatusBadge(transaction.status)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label color="slate-600">Transaction ID</Label>
                    <H5 color="slate-900">{transaction.trans_seq}</H5>
                  </div>
                  <div>
                    <Label color="slate-600">Terminal</Label>
                    <Body1 color="slate-900">{transaction.terminal_id}</Body1>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label color="slate-600">Business Date</Label>
                    <Body1 color="slate-900">{formattingService.formatDate(transaction.biz_date, 'datetime-short')}</Body1>
                  </div>
                  <div>
                    <Label color="slate-600">Duration</Label>
                    <Body1 color="slate-900">
                      {transaction.end_time 
                        ? formattingService.formatDuration(Math.round((new Date(transaction.end_time).getTime() - new Date(transaction.begin_time).getTime()) / 1000))
                        : 'In Progress'}
                    </Body1>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label color="slate-600">Associates</Label>
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <Body1 color="slate-900">{transaction.associates.join(', ')}</Body1>
                    </div>
                  </div>
                  <div>
                    <Label color="slate-600">Locale</Label>
                    <Body1 color="slate-900">{transaction.locale}</Body1>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Transaction Summary */}
          <div>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
              <H4 color="slate-900" gutterBottom>Transaction Summary</H4>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Body2 color="slate-600">Subtotal</Body2>
                  <Body2 weight="medium">{formattingService.formatCurrency(fromScaledInt(transaction.sub_total), { currency: transaction.currency })}</Body2>
                </div>
                
                <div className="flex justify-between">
                  <Body2 color="slate-600">Tax Total</Body2>
                  <Body2 weight="medium">{formattingService.formatCurrency(fromScaledInt(transaction.tax_total), { currency: transaction.currency })}</Body2>
                </div>

                {fromScaledInt(transaction.disc_total) !== 0 && (
                  <div className="flex justify-between">
                    <Body2 color="slate-600">Discount Total</Body2>
                    <Body2 weight="medium" className="text-green-600">-{formattingService.formatCurrency(fromScaledInt(transaction.disc_total), { currency: transaction.currency })}</Body2>
                  </div>
                )}
                
                {fromScaledInt(transaction.round_total) !== 0 && (
                  <div className="flex justify-between">
                    <Body2 color="slate-600">Rounding</Body2>
                    <Body2 weight="medium">{formattingService.formatCurrency(fromScaledInt(transaction.round_total), { currency: transaction.currency })}</Body2>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <H5>Total</H5>
                    <H5>{formattingService.formatCurrency(fromScaledInt(transaction.total), { currency: transaction.currency })}</H5>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <Body2 color="slate-600">Amount Tendered</Body2>
                    <Body2 weight="medium">{formattingService.formatCurrency(
                      transaction.payments.reduce((sum, payment) => sum + fromScaledInt(payment.amt), 0),
                      { currency: transaction.currency }
                    )}</Body2>
                  </div>
                  <div className="flex justify-between">
                    <Body2 color="slate-600">Amount Due</Body2>
                    <Body2 weight="medium">{formattingService.formatCurrency(
                      fromScaledInt(transaction.total) - transaction.payments.reduce((sum, payment) => sum + fromScaledInt(payment.amt), 0),
                      { currency: transaction.currency }
                    )}</Body2>
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
                  <div key={item.seq} className="border border-slate-200 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <H4 color="slate-900">{item.item_id}</H4>
                        {item.item_desc && (
                          <Body2 color="slate-600" className="mt-1">{item.item_desc}</Body2>
                        )}
                        {item.notes && (
                          <Body2 color="warning" weight="medium" className="mt-2">💡 {item.notes}</Body2>
                        )}
                      </div>
                      <div className="text-right">
                        <H5 color="slate-900">
                          {formattingService.formatCurrency(fromScaledInt(item.ext_amt), { currency: transaction.currency })}
                        </H5>
                        <Caption color="slate-500">
                          {fromScaledInt(item.qty)} × {formattingService.formatCurrency(fromScaledInt(item.unit_price), { currency: transaction.currency })}
                        </Caption>
                      </div>
                    </div>
                    
                    {/* Price Modifiers */}
                    {item.modifiers.length > 0 && (
                      <div className="bg-orange-50 rounded-lg p-3 mb-3">
                        <Label color="warning" className="mb-2">Price Adjustments</Label>
                        {item.modifiers.map((modifier, idx) => (
                          <div key={idx} className="flex justify-between">
                            <Caption color="warning">{modifier.reason}</Caption>
                            <Caption color="warning" weight="medium">
                              {formattingService.formatCurrency(fromScaledInt(modifier.change_amt), { currency: transaction.currency })}
                            </Caption>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Tax Breakdown */}
                    {item.taxes.length > 0 && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <Label color="slate-700" className="mb-2">Tax Breakdown</Label>
                        <div className="space-y-1">
                          {item.taxes.map((tax, idx) => (
                            <div key={idx} className="flex justify-between">
                              <Caption color="slate-600">
                                {tax.tax_rule_name} ({formattingService.formatPercentage(fromScaledInt(tax.tax_pct))})
                              </Caption>
                              <Caption color="slate-700" weight="medium">
                                {formattingService.formatCurrency(fromScaledInt(tax.tax_amt), { currency: transaction.currency })}
                              </Caption>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Addons */}
                    {item.addons && item.addons.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 mt-3">
                        <Label color="info" className="mb-2">Add-ons</Label>
                        <div className="space-y-1">
                          {item.addons.map((addon, idx) => (
                            <div key={idx} className="flex justify-between">
                              <Caption color="slate-600">{addon.mod_desc}</Caption>
                              <Caption color="slate-700" weight="medium">
                                {formattingService.formatCurrency(fromScaledInt(addon.ext_amt), { currency: transaction.currency })}
                              </Caption>
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
                {transaction.payments.map((payment) => {
                  const PaymentIcon = getPaymentIcon(payment.tender_id);
                  return (
                    <div key={payment.seq} className="flex items-center justify-between p-6 border border-slate-200 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <PaymentIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <H5 color="slate-900">{payment.tender_desc}</H5>
                          <Caption color="slate-500">Payment #{payment.seq}</Caption>
                          {payment.is_change && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                              Change
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <H4 color="slate-900">
                          {formattingService.formatCurrency(fromScaledInt(payment.amt), { currency: transaction.currency })}
                        </H4>
                        {payment.foreign_amt && (
                          <Caption color="slate-500">
                            Foreign: {formattingService.formatCurrency(fromScaledInt(payment.foreign_amt), { currency: transaction.currency })} (Rate: {payment.exch_rate ? fromScaledInt(payment.exch_rate) : 'N/A'})
                          </Caption>
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
                  showCopyButton={false}
                  printButtonText="Print All"
                  transactionId={transaction.trans_seq}
                />
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <H3 color="primary" className="mb-2">No Receipts Available</H3>
                  <Body1 color="muted">No receipt documents found for this transaction.</Body1>
                </div>
              )}
            </TabsContent>

            {/* Notes */}
            {transaction.notes && (
              <div className="mt-6 border border-slate-200 rounded-xl p-6">
                <H3 color="slate-900" gutterBottom>Notes</H3>
                <Body1 color="slate-700" className="bg-slate-50 p-4 rounded-lg">{transaction.notes}</Body1>
              </div>
            )}
          </EnhancedTabs>
        </Card>
      </div>
      </div>
    </PageContainer>
  );
};

export default SalesDetail;

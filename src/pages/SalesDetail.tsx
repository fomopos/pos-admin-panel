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
  QrCodeIcon,
  CalendarDaysIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Button, Card, PageHeader, Loading } from '../components/ui';
import { useTenantStore } from '../tenants/tenantStore';

// Types based on the API response
interface TaxModifier {
  authority_id: string;
  authority_name: string | null;
  authority_type: string;
  tax_group_id: string;
  tax_rule_id: number;
  tax_rule_name: string;
  tax_location_id: string;
  taxable_amount: string;
  tax_amount: string;
  tax_percent: string;
  tax_override: boolean;
}

interface PriceModifier {
  price_modifier_seq: number;
  price_change_amount: string;
  price_change_reason_code: string;
  deal_id: string | null;
  amount: string | null;
  percent: string | null;
  extended_amount: string;
  notes: string | null;
  description: string | null;
  is_void: boolean;
}

interface LineItem {
  line_item_id: number;
  item_id: string;
  item_description: string;
  entered_description: string | null;
  is_void: boolean;
  quantity: string;
  gross_quantity: string;
  net_quantity: string;
  unit_price: string;
  extended_amount: string;
  net_amount: string;
  gross_amount: string;
  tax_group_id: string;
  base_unit_price: string;
  base_extended_amount: string;
  notes: string | null;
  tax_modifiers: TaxModifier[];
  price_modifiers: PriceModifier[];
}

interface PaymentLineItem {
  payment_seq: number;
  amount: string;
  change_flag: boolean;
  tender_id: string;
  tender_description: string;
  is_void: boolean;
  foreign_amount: string | null;
  exchange_rate: string | null;
}

interface TransactionDocument {
  document_id: number;
  data: string; // JSON string containing receipt data
}

interface TransactionTotals {
  subTotal: string;
  total: string;
  discountTotal: string;
  taxTotal: string;
  tenderedAmount: string;
  amountDue: string;
  transactionDiscountAmount: string | null;
  transactionDiscountReasonCode: string | null;
  transactionDiscountDescription: string | null;
}

interface Transaction {
  tenant_id: string;
  store_id: string;
  terminal_id: string;
  trans_id: string;
  store_locale: string;
  store_currency: string;
  transaction_type: string;
  business_date: string;
  begin_datetime: string;
  end_datetime: string;
  total: string;
  tax_total: string;
  sub_total: string;
  round_total: string;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  is_void: boolean;
  customer_id: string | null;
  associates: string[];
  notes: string | null;
  return_ref: string | null;
  external_order_id: string | null;
  external_order_source: string | null;
  line_items: LineItem[];
  documents: TransactionDocument[];
  payment_line_items: PaymentLineItem[];
  totals: TransactionTotals;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

const SalesDetail: React.FC = () => {
  const { transId } = useParams<{ transId: string }>();
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transId) {
      loadTransaction();
    }
  }, [transId, currentTenant, currentStore]);

  const loadTransaction = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/v0/tenant/${currentTenant?.id}/store/${currentStore?.store_id}/transaction/${transId}`);
      // const data = await response.json();
      
      // Mock data based on your API structure
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const mockTransaction: Transaction = {
        created_at: "2025-06-14T19:54:36.644806Z",
        created_by: "Y8Z4UL",
        updated_at: "2025-06-14T19:55:14.620257Z",
        updated_by: "Y8Z4UL",
        tenant_id: "2711",
        store_id: "10001",
        terminal_id: "101",
        trans_id: transId || "448",
        store_locale: "en-IN",
        store_currency: "INR",
        transaction_type: "sale",
        business_date: "2025-06-13T20:00:00.000Z",
        begin_datetime: "2025-06-14T19:54:36.644779Z",
        end_datetime: "2025-06-14T19:55:14.620253Z",
        total: "36.50",
        tax_total: "6.04",
        sub_total: "41.2",
        round_total: "0",
        status: "completed",
        is_void: false,
        customer_id: null,
        associates: ["Y8Z4UL"],
        notes: null,
        return_ref: null,
        external_order_id: null,
        external_order_source: null,
        line_items: [
          {
            line_item_id: 1,
            item_id: "babyspinatsalat",
            item_description: "mit birnen, nüssen, frischkäse, walnussöl & honig",
            entered_description: null,
            is_void: false,
            quantity: "1",
            gross_quantity: "1",
            net_quantity: "1",
            unit_price: "12.9",
            extended_amount: "12.9",
            net_amount: "10.77",
            gross_amount: "12.9",
            tax_group_id: "GST18",
            base_unit_price: "12.9",
            base_extended_amount: "12.9",
            notes: null,
            tax_modifiers: [
              {
                authority_id: "IN-CGST",
                authority_name: null,
                authority_type: "VAT",
                tax_group_id: "GST18",
                tax_rule_id: 1,
                tax_rule_name: "Central GST",
                tax_location_id: "TL-IN",
                taxable_amount: "12.9",
                tax_amount: "1.07",
                tax_percent: "0.09",
                tax_override: false
              },
              {
                authority_id: "IN-SGST",
                authority_name: null,
                authority_type: "VAT",
                tax_group_id: "GST18",
                tax_rule_id: 2,
                tax_rule_name: "State GST",
                tax_location_id: "TL-IN",
                taxable_amount: "12.9",
                tax_amount: "1.07",
                tax_percent: "0.09",
                tax_override: false
              }
            ],
            price_modifiers: []
          },
          {
            line_item_id: 2,
            item_id: "beef_tatar",
            item_description: "klassisch mariniert",
            entered_description: null,
            is_void: false,
            quantity: "1",
            gross_quantity: "1",
            net_quantity: "1",
            unit_price: "10.0",
            extended_amount: "10.0",
            net_amount: "8.35",
            gross_amount: "14.5",
            tax_group_id: "GST18",
            base_unit_price: "14.5",
            base_extended_amount: "14.5",
            notes: "Price Override: EMPLOYEE_DISCOUNT",
            tax_modifiers: [
              {
                authority_id: "IN-CGST",
                authority_name: null,
                authority_type: "VAT",
                tax_group_id: "GST18",
                tax_rule_id: 1,
                tax_rule_name: "Central GST",
                tax_location_id: "TL-IN",
                taxable_amount: "10.0",
                tax_amount: "0.83",
                tax_percent: "0.09",
                tax_override: false
              }
            ],
            price_modifiers: [
              {
                price_modifier_seq: 1,
                price_change_amount: "10.0",
                price_change_reason_code: "EMPLOYEE_DISCOUNT",
                deal_id: null,
                amount: null,
                percent: null,
                extended_amount: "0",
                notes: null,
                description: null,
                is_void: false
              }
            ]
          }
        ],
        documents: [
          {
            document_id: 1,
            data: JSON.stringify([
              { flex: 1, type: "text", text: "Spice Garden", align: "center" },
              { flex: 1, type: "text", text: "store.address.address1", align: "center" },
              { type: "horizontalline" },
              { type: "row", children: [
                { flex: 1, type: "text", text: "Table: 0", align: "left" },
                { flex: 1, type: "text", text: `Ticket: ${transId}`, align: "right" }
              ]}
            ])
          }
        ],
        payment_line_items: [
          {
            payment_seq: 1,
            amount: "10",
            change_flag: false,
            tender_id: "credit",
            tender_description: "Credit Card",
            is_void: false,
            foreign_amount: null,
            exchange_rate: null
          },
          {
            payment_seq: 2,
            amount: "26.50",
            change_flag: false,
            tender_id: "cash",
            tender_description: "Cash",
            is_void: false,
            foreign_amount: null,
            exchange_rate: null
          }
        ],
        totals: {
          subTotal: "41.2",
          total: "36.50",
          discountTotal: "4.70",
          taxTotal: "6.04",
          tenderedAmount: "36.50",
          amountDue: "0.00",
          transactionDiscountAmount: null,
          transactionDiscountReasonCode: null,
          transactionDiscountDescription: null
        }
      };
      
      setTransaction(mockTransaction);
    } catch (err) {
      console.error('Failed to load transaction:', err);
      setError('Failed to load transaction details. Please try again.');
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

  const getStatusBadge = (status: Transaction['status']) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: ExclamationTriangleIcon },
      refunded: { bg: 'bg-red-100', text: 'text-red-800', icon: ExclamationTriangleIcon }
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

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Overview */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Transaction Overview</h3>
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

          {/* Line Items */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Items ({transaction.line_items.length})</h3>
            
            <div className="space-y-4">
              {transaction.line_items.map((item) => (
                <div key={item.line_item_id} className="border border-slate-200 rounded-xl p-4">
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
          </Card>

          {/* Payment Methods */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Payment Methods</h3>
            
            <div className="space-y-4">
              {transaction.payment_line_items.map((payment) => {
                const PaymentIcon = getPaymentIcon(payment.tender_id);
                return (
                  <div key={payment.payment_seq} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <PaymentIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{payment.tender_description}</p>
                        <p className="text-sm text-slate-500">Payment #{payment.payment_seq}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900">
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
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Transaction Totals */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Transaction Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(transaction.totals.subTotal, transaction.store_currency)}</span>
              </div>
              
              {parseFloat(transaction.totals.discountTotal) > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Total Discounts</span>
                  <span className="font-medium">-{formatCurrency(transaction.totals.discountTotal, transaction.store_currency)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-slate-600">Tax Total</span>
                <span className="font-medium">{formatCurrency(transaction.totals.taxTotal, transaction.store_currency)}</span>
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
                  <span>{formatCurrency(transaction.totals.total, transaction.store_currency)}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount Tendered</span>
                  <span className="font-medium">{formatCurrency(transaction.totals.tenderedAmount, transaction.store_currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount Due</span>
                  <span className="font-medium">{formatCurrency(transaction.totals.amountDue, transaction.store_currency)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Store Information */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Store Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <BuildingLibraryIcon className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">Store {transaction.store_id}</p>
                  <p className="text-sm text-slate-500">Terminal {transaction.terminal_id}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Business Date</p>
                  <p className="font-medium text-slate-900">{formatDateTime(transaction.business_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Currency</p>
                  <p className="font-medium text-slate-900">{transaction.store_currency}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handlePrintReceipt}
                className="w-full justify-start"
              >
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDuplicateTransaction}
                className="w-full justify-start"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                Duplicate Transaction
              </Button>
              
              {transaction.documents.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <QrCodeIcon className="w-4 h-4 mr-2" />
                  View QR Code
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesDetail;

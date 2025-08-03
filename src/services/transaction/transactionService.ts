import { apiClient } from '../api';

// API Response Types
export interface TenderSummary {
  tender: string;
  amount: string;
}

export interface TransactionSummary {
  transaction_id: string;
  terminal_id: string;
  business_date: string;
  created_at: string;
  status: 'completed' | 'cancelled' | 'cancel_orphaned' | 'new' | 'suspended';
  transaction_type: 'sale' | 'return' | 'exchange';
  total: string;
  sub_total: string;
  tax_total: string;
  store_currency: string;
  associates: string[];
  is_void: boolean;
  tender_summary: TenderSummary[];
  line_items_count: number;
}

export interface TransactionSummaryResponse {
  datalist: TransactionSummary[];
  next: string | null;
}

// Query Parameters
export interface TransactionQueryParams {
  start_date?: string;
  end_date?: string;
  filter_type?: 'status' | 'cashier' | 'type';
  value?: string;
  cursor?: string;
  limit?: number;
}

// Converted Sale interface for UI compatibility
export interface ConvertedSale {
  id: string;
  saleNumber: string;
  customerName: string;
  customerEmail?: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    total: number;
  }>;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'partial' | 'refunded';
  status: 'completed' | 'pending' | 'cancelled' | 'refunded' | 'suspended';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  cashierId: string;
  cashierName: string;
  currency: string;
  terminalId: string;
  businessDate: string;
  lineItemsCount: number;
  isVoid: boolean;
}

// Detailed Transaction Types for Transaction Detail API
export interface TaxModifier {
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  tenant_id: string;
  store_id: string;
  terminal_id: string;
  trans_id: string;
  line_item_id: number;
  tax_modifier_seq: number;
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
  original_taxable_amount: string | null;
  raw_tax_percentage: string | null;
  raw_tax_amount: string;
  tax_override: boolean;
  tax_override_amount: string | null;
  tax_override_reason_code: string | null;
}

export interface PriceModifier {
  // Based on the response, price_modifiers array is empty, but keeping the structure for future use
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

export interface TransactionLineItem {
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  tenant_id: string;
  store_id: string;
  terminal_id: string;
  trans_id: string;
  line_item_id: number;
  business_date: string;
  category: string | null;
  item_id: string;
  item_description: string;
  entered_description: string | null;
  is_void: boolean;
  quantity: string;
  gross_quantity: string;
  net_quantity: string;
  unit_price: string;
  extended_amount: string;
  vat_amount: string | null;
  return_flag: string | null;
  item_id_entry_method: string | null;
  price_entry_method: string | null;
  price_property_code: string | null;
  net_amount: string;
  gross_amount: string;
  serial_number: string | null;
  scanned_item_id: string | null;
  tax_group_id: string;
  original_trans_seq: string | null;
  original_store_id: string | null;
  original_line_item_seq: string | null;
  original_terminal_id: string | null;
  original_business_date: string | null;
  return_comment: string | null;
  return_reason: string | null;
  return_type_code: string | null;
  base_unit_price: string;
  base_extended_amount: string;
  food_stamp_applied_amount: string | null;
  vendor_id: string | null;
  regular_base_price: string;
  shipping_weight: string | null;
  unit_cost: string | null;
  initial_quantity: string | null;
  non_returnable: string | null;
  exclude_from_net_sales: string | null;
  measure_required: string | null;
  weight_entry_method: string | null;
  tare_value: string | null;
  tare_type: string | null;
  tare_uom: string | null;
  notes: string | null;
  tax_modifiers: TaxModifier[];
  price_modifiers: PriceModifier[];
}

export interface PaymentLineItem {
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  tenant_id: string;
  store_id: string;
  terminal_id: string;
  trans_id: string;
  payment_seq: number;
  amount: string;
  change_flag: boolean;
  tender_id: string;
  tender_description: string;
  is_void: boolean;
  serial_number: string | null;
  tender_stat_code: string | null;
  foreign_amount: string | null;
  exchange_rate: string | null;
}

export interface TransactionDocument {
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  tenant_id: string;
  store_id: string;
  terminal_id: string;
  trans_id: string;
  document_id: number;
  data: string; // JSON string containing receipt data
}

export interface TransactionDetail {
  transaction_id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  deleted_at: string | null;
  tenant_id: string;
  store_id: string;
  terminal_id: string;
  barcode: string | null;
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
  status: 'completed' | 'cancelled' | 'cancel_orphaned' | 'new' | 'suspended';
  is_void: boolean;
  customer_id: string | null;
  associates: string[];
  notes: string | null;
  return_ref: string | null;
  external_order_id: string | null;
  external_order_source: string | null;
  line_items: TransactionLineItem[];
  documents: TransactionDocument[];
  payment_line_items: PaymentLineItem[];
}

export class TransactionService {
  private readonly basePath = '/v0/store';

  /**
   * Fetch transaction summary with optional filters
   */
  async getTransactionSummary(
    tenantId: string,
    storeId: string,
    params?: TransactionQueryParams
  ): Promise<TransactionSummaryResponse> {
    try {
      const endpoint = `${this.basePath}/${storeId}/transaction/summary`;
      
      // Build query parameters
      const searchParams = new URLSearchParams();
      
      if (params?.start_date) {
        searchParams.append('start_date', params.start_date);
      }
      
      if (params?.end_date) {
        searchParams.append('end_date', params.end_date);
      }
      
      if (params?.filter_type && params?.value) {
        searchParams.append('filter_type', params.filter_type);
        searchParams.append('value', params.value);
      }
      
      if (params?.cursor) {
        searchParams.append('cursor', params.cursor);
      }
      
      if (params?.limit) {
        searchParams.append('limit', params.limit.toString());
      }

      const queryString = searchParams.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

      console.log('🔄 Fetching transaction summary:', fullEndpoint);

      const response = await apiClient.get<TransactionSummaryResponse>(fullEndpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transaction summary:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Convert API transaction data to UI Sale format
   */
  convertTransactionToSale(transaction: TransactionSummary): ConvertedSale {
    // Map payment method from tender summary
    const primaryTender = transaction.tender_summary[0];
    const paymentMethod = this.mapTenderToPaymentMethod(primaryTender?.tender || 'Cash');
    
    // Determine payment status based on transaction status
    const paymentStatus = this.mapStatusToPaymentStatus(transaction.status, transaction.is_void);
    
    // Map transaction status
    const status = this.mapTransactionStatus(transaction.status, transaction.is_void);

    return {
      id: transaction.transaction_id,
      saleNumber: `TXN-${transaction.transaction_id}`,
      customerName: 'Walk-in Customer', // API doesn't provide customer info
      customerEmail: undefined,
      items: [], // Would need separate API call to get line items
      subtotal: parseFloat(transaction.sub_total),
      totalDiscount: 0, // Not provided in summary API
      totalTax: parseFloat(transaction.tax_total),
      total: parseFloat(transaction.total),
      paymentMethod,
      paymentStatus,
      status,
      notes: transaction.is_void ? 'Transaction voided' : undefined,
      createdAt: transaction.created_at,
      updatedAt: transaction.created_at, // API doesn't provide updated_at
      cashierId: transaction.associates[0] || 'unknown',
      cashierName: this.getCashierName(transaction.associates[0]),
      currency: transaction.store_currency,
      terminalId: transaction.terminal_id,
      businessDate: transaction.business_date,
      lineItemsCount: transaction.line_items_count,
      isVoid: transaction.is_void
    };
  }

  /**
   * Map tender type to payment method
   */
  private mapTenderToPaymentMethod(tender: string): string {
    const tenderMap: Record<string, string> = {
      'Cash': 'cash',
      'Card': 'card',
      'Credit Card': 'card',
      'Debit Card': 'card',
      'Digital Wallet': 'digital_wallet',
      'Bank Transfer': 'bank_transfer',
      'UPI': 'digital_wallet',
      'PayTM': 'digital_wallet',
      'Google Pay': 'digital_wallet'
    };

    return tenderMap[tender] || 'cash';
  }

  /**
   * Map transaction status to payment status
   */
  private mapStatusToPaymentStatus(status: string, isVoid: boolean): 'paid' | 'pending' | 'partial' | 'refunded' {
    if (isVoid) return 'refunded';
    
    switch (status) {
      case 'completed':
        return 'paid';
      case 'new':
      case 'suspended':
        return 'pending';
      case 'cancelled':
      case 'cancel_orphaned':
        return 'refunded';
      default:
        return 'pending';
    }
  }

  /**
   * Map transaction status to sale status
   */
  private mapTransactionStatus(status: string, isVoid: boolean): 'completed' | 'pending' | 'cancelled' | 'refunded' | 'suspended' {
    if (isVoid) return 'refunded';
    
    switch (status) {
      case 'completed':
        return 'completed';
      case 'new':
        return 'pending';
      case 'suspended':
        return 'suspended';
      case 'cancelled':
      case 'cancel_orphaned':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  /**
   * Get cashier name from cashier ID (placeholder implementation)
   */
  private getCashierName(cashierId: string): string {
    // In a real implementation, this would fetch from a cashier/user service
    const cashierNames: Record<string, string> = {
      'Y8Z4UL': 'Store Manager',
      'user1': 'Alice Johnson',
      'user2': 'Bob Wilson'
    };
    
    return cashierNames[cashierId] || `Cashier ${cashierId}`;
  }

  /**
   * Build date range for common filters
   */
  getDateRange(period: string): { start_date?: string; end_date?: string } {
    const today = new Date();
    const startOfDay = today;
    
    switch (period) {
      case 'today':
        return {
          start_date: startOfDay.toISOString().split('T')[0]
        };
        
      case 'week':
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        return {
          start_date: startOfWeek.toISOString().split('T')[0]
        };
        
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start_date: startOfMonth.toISOString().split('T')[0]
        };
        
      case 'year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return {
          start_date: startOfYear.toISOString().split('T')[0]
        };
        
      default:
        return {};
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.response?.status === 404) {
      return new Error('Transaction data not found');
    }
    
    if (error.response?.status === 403) {
      return new Error('Insufficient permissions to access transaction data');
    }
    
    return new Error(error.message || 'Failed to fetch transaction data');
  }

  /**
   * Fetch detailed transaction by transaction ID
   */
  async getTransactionDetail(
    tenantId: string,
    storeId: string,
    transactionId: string
  ): Promise<TransactionDetail> {
    try {
      const endpoint = `${this.basePath}/${storeId}/transaction/${transactionId}`;

      console.log('🔄 Fetching transaction detail:', endpoint);

      const response = await apiClient.get<TransactionDetail>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transaction detail:', error);
      throw this.handleError(error);
    }
  }
}

// Create singleton instance
export const transactionService = new TransactionService();

import { apiClient } from '../api';

// =============================================================================
// SCALED INT UTILITIES
// =============================================================================

/**
 * ScaledInt values are integers scaled by 10,000 to preserve 4 decimal places.
 * Example: $12.50 = 125000
 * To display to user: value / 10000 = actual amount
 */
export const SCALE_FACTOR = 10000;

/**
 * Convert a ScaledInt value to a displayable number
 * @param scaledValue - The scaled integer value (e.g., 125000)
 * @returns The actual decimal value (e.g., 12.50)
 */
export function fromScaledInt(scaledValue: number | string | null | undefined): number {
  if (scaledValue === null || scaledValue === undefined) return 0;
  const numValue = typeof scaledValue === 'string' ? parseFloat(scaledValue) : scaledValue;
  return numValue / SCALE_FACTOR;
}

/**
 * Convert a display number to ScaledInt for API requests
 * @param value - The actual decimal value (e.g., 12.50)
 * @returns The scaled integer value (e.g., 125000)
 */
export function toScaledInt(value: number): number {
  return Math.round(value * SCALE_FACTOR);
}

/**
 * Format a ScaledInt as a string representation of the actual value
 * @param scaledValue - The scaled integer value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 */
export function formatScaledInt(scaledValue: number | string | null | undefined, decimals: number = 2): string {
  return fromScaledInt(scaledValue).toFixed(decimals);
}

// =============================================================================
// ENUMERATIONS (matching API spec)
// =============================================================================

export type TransactionType = 'RETAIL_SALE';

export type TransactionStatus = 'COMPLETED' | 'CANCEL' | 'NEW' | 'RESUME' | 'SUSPEND';

export type LineItemTypeCode = 'SALE' | 'RETURN';

export type ReturnTypeCode = 'BLIND' | 'VERIFIED' | 'UNVERIFIED';

export type PriceModReasonCode = 
  | 'DEAL' 
  | 'LINE_ITEM_DISCOUNT' 
  | 'GROUP_DISCOUNT' 
  | 'TRANSACTION_DISCOUNT' 
  | 'PRICE_OVERRIDE' 
  | 'PROMPT_PRICE_CHANGE' 
  | 'BASE_PRICE_RULE' 
  | 'NEW_PRICE_RULE' 
  | 'DOCUMENT' 
  | 'MANUFACTURER_COUPON' 
  | 'REFUND_PRORATION' 
  | 'CALCULATED_WARRANTY_PRICE' 
  | 'ENTITLEMENT';

// =============================================================================
// API RESPONSE TYPES - Transaction Summary (List View)
// =============================================================================

export interface TenderSummary {
  tender: string;
  amount: number; // ScaledInt
}

export interface TransactionSummary {
  trans_id: string; // Composite ID like "20260208-101-93"
  trans_seq: string;
  terminal_id: string;
  barcode: string | null;
  biz_date: string;
  begin_time: string;
  created_at: string;
  created_by: string;
  status: TransactionStatus;
  trans_type: TransactionType;
  total: number; // ScaledInt
  sub_total: number; // ScaledInt
  tax_total: number; // ScaledInt
  currency: string;
  associates: string[];
  is_void: boolean;
  tenders: TenderSummary[];
  item_count: number;
  disc_amt: number | null;
}

export interface TransactionSummaryResponse {
  datalist: TransactionSummary[];
  next: string | null;
}

// =============================================================================
// QUERY PARAMETERS
// =============================================================================

export interface TransactionQueryParams {
  start_date?: string;
  end_date?: string;
  filter_type?: 'status' | 'cashier' | 'type';
  value?: string;
  cursor?: string;
  limit?: number;
}

// =============================================================================
// CONVERTED SALE INTERFACE (For UI Compatibility)
// =============================================================================

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

// =============================================================================
// NESTED OBJECTS - Tax Modifiers
// =============================================================================

export interface TaxModifier {
  seq: number;
  authority_id: string;
  authority_name: string | null;
  authority_type: string;
  tax_group_id: string;
  tax_rule_id: number;
  tax_rule_name: string;
  tax_location_id: string;
  taxable_amt: number; // ScaledInt
  tax_amt: number; // ScaledInt
  tax_pct: number; // ScaledInt (percentage * 10000)
  orig_taxable_amt?: number; // ScaledInt
  raw_tax_pct?: number; // ScaledInt
  raw_tax_amt?: number; // ScaledInt
  tax_override: boolean;
  override_amt?: number | null; // ScaledInt
  override_reason?: string | null;
}

// =============================================================================
// NESTED OBJECTS - Price Modifiers
// =============================================================================

export interface PriceModifier {
  seq: number;
  reason: PriceModReasonCode;
  amt?: number | null; // ScaledInt
  percent?: number | null; // ScaledInt
  change_amt: number; // ScaledInt
  change_reason?: string | null;
  disc_code?: string | null;
  disc_reason?: string | null;
  deal_id?: string | null;
  deal_amt?: number | null; // ScaledInt
  serial_num?: string | null;
  ext_amt: number; // ScaledInt
  desc?: string | null;
  is_void: boolean;
  notes?: string | null;
}

// =============================================================================
// NESTED OBJECTS - Additional Line Item Modifiers (Addons)
// =============================================================================

export interface TransactionAdditionalLineItemModifier {
  seq: number;
  group_id: string;
  mod_id: string;
  mod_desc: string;
  qty: number; // ScaledInt
  unit_price: number; // ScaledInt
  ext_amt: number; // ScaledInt
}

// =============================================================================
// NESTED OBJECTS - Transaction Line Item
// =============================================================================

export interface TransactionLineItem {
  seq: number;
  category?: string | null;
  item_id: string;
  line_type: LineItemTypeCode;
  item_desc: string;
  entered_desc?: string | null;
  is_void: boolean;
  qty: number; // ScaledInt
  gross_qty: number; // ScaledInt
  net_qty: number; // ScaledInt
  unit_price: number; // ScaledInt
  ext_amt: number; // ScaledInt
  vat_amt?: number | null; // ScaledInt
  is_return: boolean;
  item_entry?: string | null;
  price_entry?: string | null;
  price_prop?: string | null;
  net_amt: number; // ScaledInt
  gross_amt: number; // ScaledInt
  serial_num?: string | null;
  scanned_id?: string | null;
  tax_group_id: string;
  // Return-related fields
  orig_trans_seq?: string | null;
  orig_store_id?: string | null;
  orig_line_seq?: number | null;
  orig_terminal_id?: string | null;
  orig_biz_date?: string | null;
  return_comment?: string | null;
  return_reason?: string | null;
  return_type?: ReturnTypeCode | null;
  // Price fields
  base_unit_price: number; // ScaledInt
  base_ext_amt: number; // ScaledInt
  food_stamp_amt?: number | null; // ScaledInt
  vendor_id?: string | null;
  regular_price: number; // ScaledInt
  unit_cost?: number | null; // ScaledInt
  init_qty?: number | null; // ScaledInt
  // Flags
  non_returnable: boolean;
  exclude_net_sales: boolean;
  measure_req: boolean;
  // Weight/measurement fields
  weight_method?: string | null;
  tare_value?: number | null; // ScaledInt
  tare_type?: string | null;
  tare_uom?: string | null;
  notes?: string | null;
  // Nested modifiers
  taxes: TaxModifier[];
  modifiers: PriceModifier[];
  addons: TransactionAdditionalLineItemModifier[];
}

// =============================================================================
// NESTED OBJECTS - Payment Line Item
// =============================================================================

export interface PaymentLineItem {
  seq: number;
  amt: number; // ScaledInt
  is_change: boolean;
  tender_id: string;
  tender_desc: string;
  is_void: boolean;
  serial_num?: string | null;
  tender_status?: string | null;
  foreign_amt?: number | null; // ScaledInt
  exch_rate?: number | null; // ScaledInt
}

// =============================================================================
// NESTED OBJECTS - Transaction Discount Line Item
// =============================================================================

export interface TransactionDiscountLineItem {
  seq: number;
  disc_code: string;
  percent?: number | null; // ScaledInt
  amt: number; // ScaledInt
  serial_num?: string | null;
}

// =============================================================================
// NESTED OBJECTS - Transaction Table (Restaurant)
// =============================================================================

export interface TransactionTable {
  table_id: string;
  table_name: string;
  section_id: string;
  server_id: string;
  guests: number;
}

// =============================================================================
// NESTED OBJECTS - Transaction Document
// =============================================================================

export interface TransactionDocument {
  doc_id: string;
  doc_type: string;
  data: string;
}

// =============================================================================
// MAIN TRANSACTION DETAIL OBJECT
// =============================================================================

export interface TransactionDetail {
  tenant_id: string;
  store_id: string;
  terminal_id: string;
  trans_seq: string;
  locale: string;
  currency: string;
  trans_type: TransactionType;
  biz_date: string;
  begin_time: string;
  end_time?: string | null;
  total: number; // ScaledInt
  tax_total: number; // ScaledInt
  sub_total: number; // ScaledInt
  disc_total: number; // ScaledInt
  round_total: number; // ScaledInt
  status: TransactionStatus;
  is_void: boolean;
  customer_id?: string | null;
  associates: string[];
  notes?: string | null;
  return_ref?: string[] | null;
  ext_order_id?: string | null;
  ext_order_src?: string | null;
  trans_table?: TransactionTable | null;
  line_items: TransactionLineItem[];
  documents: TransactionDocument[];
  payments: PaymentLineItem[];
  discounts: TransactionDiscountLineItem[];
  // Audit fields (may be present in API response)
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  deleted_at?: string | null;
}

// =============================================================================
// TRANSACTION SERVICE CLASS
// =============================================================================

export class TransactionService {
  private readonly basePath = '/v0/store';

  /**
   * Fetch transaction summary with optional filters
   */
  async getTransactionSummary(
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
   * Convert API transaction summary data to UI Sale format
   */
  convertTransactionToSale(transaction: TransactionSummary): ConvertedSale {
    // Map payment method from tenders array
    const primaryTender = transaction.tenders[0];
    const paymentMethod = this.mapTenderToPaymentMethod(primaryTender?.tender || 'Cash');
    
    // Determine payment status based on transaction status
    const paymentStatus = this.mapStatusToPaymentStatus(transaction.status, transaction.is_void);
    
    // Map transaction status
    const status = this.mapTransactionStatus(transaction.status, transaction.is_void);

    return {
      id: transaction.trans_id,
      saleNumber: transaction.trans_id,
      customerName: 'Walk-in Customer',
      customerEmail: undefined,
      items: [], // Would need separate API call to get line items
      subtotal: fromScaledInt(transaction.sub_total),
      totalDiscount: fromScaledInt(transaction.disc_amt),
      totalTax: fromScaledInt(transaction.tax_total),
      total: fromScaledInt(transaction.total),
      paymentMethod,
      paymentStatus,
      status,
      notes: transaction.is_void ? 'Transaction voided' : undefined,
      createdAt: transaction.created_at,
      updatedAt: transaction.created_at,
      cashierId: transaction.associates[0] || 'unknown',
      cashierName: this.getCashierName(transaction.associates[0]),
      currency: transaction.currency,
      terminalId: transaction.terminal_id,
      businessDate: transaction.biz_date,
      lineItemsCount: transaction.item_count,
      isVoid: transaction.is_void
    };
  }

  /**
   * Map tender type to payment method
   */
  private mapTenderToPaymentMethod(tender: string): string {
    const tenderMap: Record<string, string> = {
      'Cash': 'cash',
      'CASH': 'cash',
      'Card': 'card',
      'CARD': 'card',
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
  private mapStatusToPaymentStatus(status: TransactionStatus, isVoid: boolean): 'paid' | 'pending' | 'partial' | 'refunded' {
    if (isVoid) return 'refunded';
    
    switch (status) {
      case 'COMPLETED':
        return 'paid';
      case 'NEW':
      case 'SUSPEND':
      case 'RESUME':
        return 'pending';
      case 'CANCEL':
        return 'refunded';
      default:
        return 'pending';
    }
  }

  /**
   * Map transaction status to sale status
   */
  private mapTransactionStatus(status: TransactionStatus, isVoid: boolean): 'completed' | 'pending' | 'cancelled' | 'refunded' | 'suspended' {
    if (isVoid) return 'refunded';
    
    switch (status) {
      case 'COMPLETED':
        return 'completed';
      case 'NEW':
      case 'RESUME':
        return 'pending';
      case 'SUSPEND':
        return 'suspended';
      case 'CANCEL':
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
   * @param storeId - The store ID
   * @param transId - The transaction ID (e.g., "20260208-101-93") or trans_seq for backward compatibility
   */
  async getTransactionDetail(
    storeId: string,
    transId: string
  ): Promise<TransactionDetail> {
    try {
      const endpoint = `${this.basePath}/${storeId}/transaction/${transId}`;

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

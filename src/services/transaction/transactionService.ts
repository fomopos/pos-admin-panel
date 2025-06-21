import { apiClient } from '../api';

// API Response Types
export interface TenderSummary {
  tender: string;
  amount: string;
}

export interface TransactionSummary {
  trans_id: string;
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

export class TransactionService {
  private readonly basePath = '/v0/tenant';

  /**
   * Fetch transaction summary with optional filters
   */
  async getTransactionSummary(
    tenantId: string,
    storeId: string,
    params?: TransactionQueryParams
  ): Promise<TransactionSummaryResponse> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}/transaction/summary`;
      
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
      id: transaction.trans_id,
      saleNumber: `TXN-${transaction.trans_id}`,
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
}

// Create singleton instance
export const transactionService = new TransactionService();

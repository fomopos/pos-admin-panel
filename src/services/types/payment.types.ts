// Payment configuration type definitions

// Denomination structure for currency tenders
export interface TenderDenomination {
  id: string;
  value: number;
  description: string;
  display_order: number;
}

// User settings for tender permissions
export interface TenderUserSettings {
  group_id: string;
  usage_code: string[];
  over_tender_limit: number;
  min_amount: number;
  max_amount: number;
  max_refund_with_receipt: number;
  max_refund_without_receipt: number;
}

// Configuration options for tender
export interface TenderConfiguration {
  serial_nbr_req: boolean;
  open_cash_drawer: boolean;
  unit_count_code: string;
  min_denomination: number;
  effective_date: string;
  expiry_date: string;
  max_refund_days: number;
  customer_required: boolean;
  change_tender_id: string;
  change_cash_limit: number;
  split_tender_allowed: boolean;
}

export interface Tender {
  tender_id: string;
  type_code: string;
  currency_id: string;
  description: string;
  display_order: number;
  is_active: boolean;
  over_tender_allowed: boolean;
  denomination: TenderDenomination[];
  user_settings: TenderUserSettings[];
  configuration: TenderConfiguration;
  availability: string[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// Request/Response types
export interface CreateTenderRequest {
  tender_id: string;
  type_code: string;
  currency_id: string;
  description: string;
  display_order: number;
  is_active: boolean;
  over_tender_allowed: boolean;
  denomination: TenderDenomination[];
  user_settings: TenderUserSettings[];
  configuration: TenderConfiguration;
  availability: string[];
}

export interface UpdateTenderRequest extends Partial<CreateTenderRequest> {
  tender_id: string;
}

// Query parameters
export interface TenderQueryParams {
  tenant_id?: string;
  store_id?: string;
  tender_id?: string;
  type_code?: string;
  currency_id?: string;
}

// Response types
export interface TenderListResponse {
  tenders: Tender[];
}

// Error types
export interface PaymentServiceError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// Supported tender types
export type TenderType = 
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'gift_card'
  | 'store_credit'
  | 'check'
  | 'mobile_payment'
  | 'voucher'
  | 'bank_transfer'
  | 'cryptocurrency';

// Supported currencies
export type CurrencyCode = 
  | 'usd'
  | 'eur'
  | 'gbp'
  | 'aed'
  | 'inr'
  | 'jpy'
  | 'cad'
  | 'aud'
  | 'chf'
  | 'cny';

// Payment method configuration
export interface PaymentMethodConfig {
  enabled: boolean;
  min_amount?: number;
  max_amount?: number;
  fee_percentage?: number;
  fee_fixed?: number;
  processing_time?: string;
  provider_config?: Record<string, any>;
}

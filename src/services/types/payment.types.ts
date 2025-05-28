// Payment configuration type definitions
export interface Tender {
  tender_id: string;
  type_code: string;
  currency_id: string;
  description: string;
  over_tender_allowed: boolean;
  availability: ('sale' | 'return')[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  is_active?: boolean;
}

export interface PaymentConfiguration {
  tenant_id: string;
  store_id: string;
  tenders: Tender[];
  default_tender_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

// Request/Response types
export interface CreateTenderRequest {
  tender_id: string;
  type_code: string;
  currency_id: string;
  description: string;
  over_tender_allowed: boolean;
  availability: ('sale' | 'return')[];
}

export interface UpdateTenderRequest extends Partial<CreateTenderRequest> {
  tender_id: string;
}

export interface CreatePaymentConfigurationRequest {
  tenant_id: string;
  store_id: string;
  tenders: CreateTenderRequest[];
  default_tender_id?: string;
}

export interface UpdatePaymentConfigurationRequest extends Partial<CreatePaymentConfigurationRequest> {
  tenant_id: string;
  store_id: string;
}

// Query parameters
export interface PaymentConfigurationQueryParams {
  tenant_id?: string;
  store_id?: string;
  include_inactive?: boolean;
}

export interface TenderQueryParams {
  tenant_id?: string;
  store_id?: string;
  tender_id?: string;
  type_code?: string;
  currency_id?: string;
}

// Response types
export interface PaymentConfigurationResponse {
  configurations: PaymentConfiguration[];
}

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

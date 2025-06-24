// Discount types for the POS system

export interface Discount {
  tenant_id: string;
  store_id: string;
  discount_id: string;
  discount_code: string;
  effective_datetime: string;
  expr_datetime: string;
  typcode: 'DISCOUNT' | 'VOUCHER' | 'COUPON';
  app_mthd_code: 'LINE_ITEM' | 'TRANSACTION' | 'GROUP';
  percentage?: number | null;
  discount?: number | null;
  description: string;
  calculation_mthd_code: 'PERCENT' | 'AMOUNT' | 'PROMPT_PERCENT' | 'PROMPT_AMOUNT';
  prompt: string;
  max_trans_count?: number | null;
  exclusive_discount_flag: 0 | 1;
  min_eligible_price?: number | null;
  serialized_discount_flag: 0 | 1;
  max_discount?: number | null;
  sort_order: number;
  disallow_change_flag: 0 | 1;
  max_amount?: number | null;
  max_percentage?: number | null;
  properties?: Record<string, any> | null;
  created_at: string;
  create_user_id: string;
  updated_at: string;
  update_user_id: string | null;
}

export interface CreateDiscountRequest {
  discount_code: string;
  effective_datetime: string;
  expr_datetime: string;
  typcode: 'DISCOUNT' | 'VOUCHER' | 'COUPON';
  app_mthd_code: 'LINE_ITEM' | 'TRANSACTION' | 'GROUP';
  percentage?: number | null;
  discount?: number | null;
  description: string;
  calculation_mthd_code: 'PERCENT' | 'AMOUNT' | 'PROMPT_PERCENT' | 'PROMPT_AMOUNT';
  prompt: string;
  max_trans_count?: number | null;
  exclusive_discount_flag: 0 | 1;
  min_eligible_price?: number | null;
  serialized_discount_flag: 0 | 1;
  max_discount?: number | null;
  sort_order: number;
  disallow_change_flag: 0 | 1;
  max_amount?: number | null;
  max_percentage?: number | null;
}

export interface DiscountsResponse {
  discounts: Discount[];
  total: number;
}

export interface DiscountQueryParams {
  tenant_id?: string;
  store_id?: string;
  active_only?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

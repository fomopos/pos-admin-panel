// Reason Code types for the POS system

export type ReasonCodeCategory = 'DISCOUNT' | 'RETURN' | 'TRANSACTION' | 'VOID' | 'PROMOTION' | 'OTHER';

export interface ReasonCode {
  tenant_id: string;
  store_id: string;
  reason_code_id: string;
  code: string;
  description: string;
  categories: ReasonCodeCategory[];
  active: boolean;
  created_at: string;
  create_user_id: string;
  updated_at: string;
  update_user_id: string | null;
}

export interface CreateReasonCodeRequest {
  code: string;
  description: string;
  categories: ReasonCodeCategory[];
  active: boolean;
}

export interface ReasonCodesResponse {
  reason_codes: ReasonCode[];
  total: number;
}

export interface ReasonCodeQueryParams {
  tenant_id?: string;
  store_id?: string;
  active_only?: boolean;
  category?: ReasonCodeCategory;
  search?: string;
  limit?: number;
  offset?: number;
}

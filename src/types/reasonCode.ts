// Reason Code types for the POS system

export type ReasonCodeCategory = 'operational' | 'financial' | 'item-related' | 'transaction' | 'other';

export interface ReasonCode {
  tenant_id: string;
  store_id: string;
  categories: string[];
  code: string;
  description: string;
  active: boolean;
  sort_order: number;
  req_cmt: boolean;
  parent_code: string | null;
  created_at: string;
  updated_at: string;
  create_user_id: string;
  update_user_id: string;
  type: string;
}

export interface ReasonCodeDAO extends ReasonCode {
  pk: string;
  sk: string;
}

export interface CreateReasonCodeRequest {
  categories: string[];
  code: string;
  description: string;
  active?: boolean;
  sort_order?: number;
  req_cmt?: boolean;
  parent_code?: string | null;
}

export interface UpdateReasonCodeRequest {
  categories?: string[];
  code?: string;
  description?: string;
  active?: boolean;
  sort_order?: number;
  req_cmt?: boolean;
  parent_code?: string | null;
}

export interface ReasonCodesResponse {
  reason_codes: ReasonCode[];
  total: number;
}

export interface ReasonCodeQueryParams {
  store_id: string;
  category?: string;
  active?: boolean;
}

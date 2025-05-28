// Tax-related type definitions
export interface TaxAuthority {
  authority_id: string;
  name: string;
  rounding_code: 'HALF_UP' | 'HALF_DOWN' | 'UP' | 'DOWN';
  rounding_digit: number;
}

export interface TaxLocation {
  tax_loc_id: string;
  name: string;
  description: string;
}

export interface TaxRule {
  tax_rule_seq: number;
  tax_authority_id: string;
  name: string;
  description: string;
  tax_type_code: string;
  fiscal_tax_id: string;
  effective_datetime: string | null;
  expr_datetime: string | null;
  percentage: number;
  amount: number | null;
}

export interface TaxGroup {
  tax_group_id: string;
  name: string;
  description: string;
  group_rule: TaxRule[];
}

export interface TaxConfiguration {
  tenant_id: string;
  store_id: string;
  authority: TaxAuthority[];
  tax_location: TaxLocation;
  tax_group: TaxGroup[];
  properties: any;
  created_at: string;
  create_user_id: string;
  updated_at: string;
  update_user_id: string | null;
}

// Request/Response types
export interface CreateTaxAuthorityRequest {
  authority_id: string;
  name: string;
  rounding_code: 'HALF_UP' | 'HALF_DOWN' | 'UP' | 'DOWN';
  rounding_digit: number;
}

export interface UpdateTaxAuthorityRequest extends Partial<CreateTaxAuthorityRequest> {
  authority_id: string;
}

export interface CreateTaxGroupRequest {
  tax_group_id: string;
  name: string;
  description: string;
  group_rule?: TaxRule[];
}

export interface UpdateTaxGroupRequest extends Partial<CreateTaxGroupRequest> {
  tax_group_id: string;
}

export interface CreateTaxRuleRequest {
  tax_rule_seq: number;
  tax_authority_id: string;
  name: string;
  description: string;
  tax_type_code: string;
  fiscal_tax_id: string;
  effective_datetime?: string | null;
  expr_datetime?: string | null;
  percentage: number;
  amount?: number | null;
}

export interface UpdateTaxRuleRequest extends Partial<CreateTaxRuleRequest> {
  tax_rule_seq: number;
}

export interface UpdateTaxLocationRequest {
  tax_loc_id: string;
  name: string;
  description: string;
}

// Query parameters
export interface TaxConfigurationQueryParams {
  tenant_id?: string;
  store_id?: string;
  include_inactive?: boolean;
}

export interface TaxGroupQueryParams {
  tenant_id?: string;
  store_id?: string;
  tax_group_id?: string;
  include_rules?: boolean;
}

export interface TaxAuthorityQueryParams {
  tenant_id?: string;
  store_id?: string;
  authority_id?: string;
}

// Response types
export interface TaxConfigurationResponse {
  tax_list: TaxConfiguration[];
}

export interface TaxAuthorityListResponse {
  authorities: TaxAuthority[];
}

export interface TaxGroupListResponse {
  tax_groups: TaxGroup[];
}

export interface TaxRuleListResponse {
  tax_rules: TaxRule[];
}

// Error types
export interface TaxServiceError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

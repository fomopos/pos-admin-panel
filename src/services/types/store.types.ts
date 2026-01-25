// Store configuration type definitions

// Real Store API Types (from v0/tenant/:tenantId/store/:storeId)
export interface StoreAddress {
  address1: string;
  address2?: string;
  address3?: string;
  address4?: string;
  city: string;
  state: string;
  district?: string;
  area?: string;
  postal_code: string;
  country: string;
  county?: string;
}

export interface StoreTimings {
  [day: string]: string; // Format: "HH:MM-HH:MM"
}

export interface Terminal {
  terminal_id: string;
  device_id: string;
  status: 'active' | 'inactive';
  platform: string;
  model: string;
  arch: string;
  name: string;
}

export interface StoreDetails {
  tenant_id: string;
  store_id: string;
  status: 'active' | 'inactive' | 'suspended';
  store_name: string;
  description?: string;
  location_type: string;
  store_type: string;
  address: StoreAddress;
  locale: string;
  timezone: string;
  currency: string;
  latitude?: string;
  longitude?: string;
  telephone1?: string;
  telephone2?: string;
  telephone3?: string;
  telephone4?: string;
  email?: string;
  legal_entity_id?: string;
  legal_entity_name?: string;
  store_timing?: StoreTimings | null;
  terminals?: Record<string, Terminal>;
  properties?: any;
  created_at: string;
  create_user_id: string;
  updated_at: string;
  update_user_id?: string;
}

// Legacy Store Settings Types (for compatibility)
export interface BusinessHours {
  day: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
  fax?: string;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface StoreInformation {
  store_name: string;
  business_name: string;
  registration_number?: string;
  tax_number?: string;
  address: Address;
  contact_info: ContactInfo;
  business_hours: BusinessHours[];
  timezone: string;
  logo_url?: string;
}

export interface RegionalSettings {
  currency: string;
  currency_symbol: string;
  currency_position: 'before' | 'after';
  decimal_places: number;
  thousands_separator: ',' | '.' | ' ';
  decimal_separator: '.' | ',';
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  first_day_of_week: 0 | 1; // 0 = Sunday, 1 = Monday
  tax_inclusive_pricing: boolean;
}

export interface ReceiptSettings {
  header_text?: string;
  footer_text?: string;
  show_logo: boolean;
  show_barcode: boolean;
  show_qr_code: boolean;
  paper_size: 'thermal_58mm' | 'thermal_80mm' | 'a4' | 'letter';
  auto_print: boolean;
  print_copies: number;
  show_customer_info: boolean;
  show_tax_breakdown: boolean;
  show_payment_details: boolean;
  custom_fields: Array<{
    name: string;
    value: string;
    position: 'header' | 'footer';
  }>;
}

export interface HardwareConfig {
  barcode_scanner: {
    enabled: boolean;
    prefix?: string;
    suffix?: string;
    min_length?: number;
    max_length?: number;
  };
  thermal_printer: {
    enabled: boolean;
    printer_name?: string;
    connection_type: 'usb' | 'network' | 'bluetooth';
    ip_address?: string;
    port?: number;
  };
  cash_drawer: {
    enabled: boolean;
    auto_open: boolean;
    trigger_event: 'sale_complete' | 'payment_received';
  };
  customer_display: {
    enabled: boolean;
    display_type: 'lcd' | 'led';
    connection_type: 'serial' | 'usb';
  };
  scale: {
    enabled: boolean;
    brand?: string;
    connection_type: 'serial' | 'usb';
  };
}

export interface OperationalSettings {
  inventory_alerts: {
    low_stock_threshold: number;
    out_of_stock_notifications: boolean;
    negative_inventory_allowed: boolean;
    auto_reorder: boolean;
    reorder_point?: number;
    reorder_quantity?: number;
  };
  return_policy: {
    returns_allowed: boolean;
    return_period_days: number;
    require_receipt: boolean;
    partial_returns_allowed: boolean;
    exchange_allowed: boolean;
    restocking_fee_percentage?: number;
  };
  discount_settings: {
    max_discount_percentage: number;
    manager_approval_required: boolean;
    approval_threshold_percentage: number;
    employee_discount_allowed: boolean;
    employee_discount_percentage?: number;
  };
  transaction_settings: {
    void_requires_approval: boolean;
    refund_requires_approval: boolean;
    price_override_allowed: boolean;
    quantity_limit_per_item?: number;
    minimum_sale_amount?: number;
    maximum_sale_amount?: number;
  };
}

export interface UserRole {
  role_id: string;
  role_name: string;
  permissions: string[];
  description?: string;
}

export interface UserManagement {
  roles: UserRole[];
  default_role: string;
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
    password_expiry_days?: number;
  };
  session_settings: {
    session_timeout_minutes: number;
    max_concurrent_sessions: number;
    auto_logout_on_idle: boolean;
  };
}

export interface IntegrationSettings {
  payment_processors: Array<{
    provider_id: string;
    provider_name: string;
    enabled: boolean;
    configuration: Record<string, any>;
    test_mode: boolean;
  }>;
  accounting_software: {
    enabled: boolean;
    provider?: string;
    sync_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
    auto_sync: boolean;
    last_sync?: string;
  };
  ecommerce_platforms: Array<{
    platform_id: string;
    platform_name: string;
    enabled: boolean;
    sync_inventory: boolean;
    sync_customers: boolean;
    sync_orders: boolean;
  }>;
  email_service: {
    enabled: boolean;
    provider?: string;
    smtp_settings?: {
      host: string;
      port: number;
      username: string;
      use_ssl: boolean;
    };
  };
}

export interface SecuritySettings {
  data_backup: {
    enabled: boolean;
    backup_frequency: 'daily' | 'weekly' | 'monthly';
    backup_time: string;
    retention_days: number;
    cloud_backup_enabled: boolean;
  };
  audit_logs: {
    enabled: boolean;
    log_level: 'basic' | 'detailed' | 'comprehensive';
    retention_days: number;
    events_to_log: string[];
  };
  compliance: {
    pci_compliance_enabled: boolean;
    gdpr_compliance_enabled: boolean;
    data_encryption_enabled: boolean;
    access_logging_enabled: boolean;
  };
  security_policies: {
    failed_login_attempts_limit: number;
    account_lockout_duration_minutes: number;
    two_factor_authentication_required: boolean;
    ip_whitelist_enabled: boolean;
    allowed_ip_addresses?: string[];
  };
}

export interface ApiInformation {
  api_version: string;
  base_url: string;
  endpoints: {
    health_check: string;
    products: string;
    orders: string;
    customers: string;
    inventory: string;
    reports: string;
    settings: string;
  };
  authentication: {
    method: 'bearer_token' | 'api_key' | 'oauth2';
    token_expires_in?: number;
    refresh_token_enabled: boolean;
  };
  rate_limiting: {
    enabled: boolean;
    requests_per_minute: number;
    burst_limit: number;
  };
  webhooks: {
    enabled: boolean;
    supported_events: string[];
    callback_url?: string;
    secret_key?: string;
  };
  documentation: {
    swagger_url?: string;
    postman_collection_url?: string;
    api_docs_url?: string;
  };
}

export interface StoreSettings {
  tenant_id: string;
  store_id: string;
  store_information: StoreInformation;
  regional_settings: RegionalSettings;
  receipt_settings: ReceiptSettings;
  hardware_config: HardwareConfig;
  operational_settings: OperationalSettings;
  user_management: UserManagement;
  integration_settings: IntegrationSettings;
  api_information: ApiInformation;
  security_settings: SecuritySettings;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

// Request/Response types
export interface CreateStoreSettingsRequest {
  tenant_id: string;
  store_id: string;
  store_information: StoreInformation;
  regional_settings: RegionalSettings;
  receipt_settings?: Partial<ReceiptSettings>;
  hardware_config?: Partial<HardwareConfig>;
  operational_settings?: Partial<OperationalSettings>;
  user_management?: Partial<UserManagement>;
  integration_settings?: Partial<IntegrationSettings>;
  security_settings?: Partial<SecuritySettings>;
}

export interface UpdateStoreSettingsRequest extends Partial<CreateStoreSettingsRequest> {
  tenant_id: string;
  store_id: string;
}

// Query parameters
export interface StoreSettingsQueryParams {
  tenant_id?: string;
  store_id?: string;
}

// Response types
export interface StoreSettingsResponse {
  settings: StoreSettings[];
}

// Error types
export interface StoreServiceError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// Supported currencies
export type SupportedCurrency =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'AED'
  | 'INR'
  | 'JPY'
  | 'CAD'
  | 'AUD'
  | 'CHF'
  | 'CNY';

// Supported timezones (common ones)
export type SupportedTimezone =
  | 'America/New_York'
  | 'America/Chicago'
  | 'America/Denver'
  | 'America/Los_Angeles'
  | 'Europe/London'
  | 'Europe/Paris'
  | 'Europe/Berlin'
  | 'Asia/Dubai'
  | 'Asia/Kolkata'
  | 'Asia/Tokyo'
  | 'Asia/Shanghai'
  | 'Australia/Sydney';

// Permissions list
export const AVAILABLE_PERMISSIONS = [
  'sales_create',
  'sales_read',
  'sales_update',
  'sales_delete',
  'sales_void',
  'sales_refund',
  'products_create',
  'products_read',
  'products_update',
  'products_delete',
  'products_import',
  'products_export',
  'inventory_read',
  'inventory_update',
  'inventory_adjust',
  'customers_create',
  'customers_read',
  'customers_update',
  'customers_delete',
  'reports_sales',
  'reports_inventory',
  'reports_customers',
  'reports_financial',
  'settings_store',
  'settings_users',
  'settings_payment',
  'settings_tax',
  'settings_system',
  'users_create',
  'users_read',
  'users_update',
  'users_delete',
  'roles_create',
  'roles_read',
  'roles_update',
  'roles_delete',
  'cash_management',
  'discount_apply',
  'discount_override',
  'price_override',
  'manager_functions'
] as const;

export type Permission = typeof AVAILABLE_PERMISSIONS[number];

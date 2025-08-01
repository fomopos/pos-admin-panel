import { apiClient } from '../api';
import type {
  StoreSettings,
  CreateStoreSettingsRequest,
  UpdateStoreSettingsRequest,
  StoreSettingsQueryParams,
  StoreServiceError,
  SupportedCurrency,
  SupportedTimezone,
  BusinessHours
} from '../types/store.types';

export class StoreSettingsService {
  private readonly basePath = '/v0/store';

  /**
   * Get store settings for a store
   */
  async getStoreSettings(params: StoreSettingsQueryParams): Promise<StoreSettings | null> {
    try {
      const { store_id } = params;
      const endpoint = `${this.basePath}/${store_id}/settings`;
      const response = await apiClient.get<StoreSettings>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch store settings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all store settings for current tenant
   */
  async getAllStoreSettings(): Promise<StoreSettings[]> {
    try {
      // Note: This might need to be updated based on actual API structure
      // For now, getting all stores and their settings might require multiple calls
      const endpoint = `${this.basePath}/settings`;
      const response = await apiClient.get<{ settings: StoreSettings[] }>(endpoint);
      return response.data.settings || [];
    } catch (error) {
      console.error('Failed to fetch store settings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create new store settings
   */
  async createStoreSettings(data: CreateStoreSettingsRequest): Promise<StoreSettings> {
    try {
      // Validate required fields
      this.validateStoreSettingsData(data);
      
      const { store_id } = data;
      const endpoint = `${this.basePath}/${store_id}/settings`;
      const response = await apiClient.post<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create store settings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update store settings
   */
  async updateStoreSettings(storeId: string, data: UpdateStoreSettingsRequest): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings`;
      const response = await apiClient.put<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update store settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete store settings
   */
  async deleteStoreSettings(storeId: string): Promise<void> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings`;
      await apiClient.delete<void>(endpoint);
    } catch (error) {
      console.error(`Failed to delete store settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Update specific settings section
   */
  async updateStoreInformation(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/information`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update store information for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateRegionalSettings(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/regional`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update regional settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateReceiptSettings(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/receipt`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update receipt settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateHardwareConfig(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/hardware`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update hardware config for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateOperationalSettings(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/operational`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update operational settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateUserManagement(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/users`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update user management for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateIntegrationSettings(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/integrations`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update integration settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateApiInformation(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/api`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update API information for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  async updateSecuritySettings(storeId: string, data: any): Promise<StoreSettings> {
    try {
      const endpoint = `${this.basePath}/${storeId}/settings/security`;
      const response = await apiClient.patch<StoreSettings>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update security settings for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): Array<{ code: SupportedCurrency; name: string; symbol: string }> {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
    ];
  }

  /**
   * Get supported timezones
   */
  getSupportedTimezones(): Array<{ code: SupportedTimezone; name: string; offset: string }> {
    return [
      { code: 'America/New_York', name: 'Eastern Time (US)', offset: 'UTC-5/-4' },
      { code: 'America/Chicago', name: 'Central Time (US)', offset: 'UTC-6/-5' },
      { code: 'America/Denver', name: 'Mountain Time (US)', offset: 'UTC-7/-6' },
      { code: 'America/Los_Angeles', name: 'Pacific Time (US)', offset: 'UTC-8/-7' },
      { code: 'Europe/London', name: 'Greenwich Mean Time', offset: 'UTC+0/+1' },
      { code: 'Europe/Paris', name: 'Central European Time', offset: 'UTC+1/+2' },
      { code: 'Europe/Berlin', name: 'Central European Time', offset: 'UTC+1/+2' },
      { code: 'Asia/Dubai', name: 'Gulf Standard Time', offset: 'UTC+4' },
      { code: 'Asia/Kolkata', name: 'India Standard Time', offset: 'UTC+5:30' },
      { code: 'Asia/Tokyo', name: 'Japan Standard Time', offset: 'UTC+9' },
      { code: 'Asia/Shanghai', name: 'China Standard Time', offset: 'UTC+8' },
      { code: 'Australia/Sydney', name: 'Australian Eastern Time', offset: 'UTC+10/+11' }
    ];
  }

  /**
   * Get default business hours
   */
  getDefaultBusinessHours(): BusinessHours[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      is_open: !['Saturday', 'Sunday'].includes(day),
      open_time: '09:00',
      close_time: '18:00'
    }));
  }

  /**
   * Validate store settings data
   */
  private validateStoreSettingsData(data: CreateStoreSettingsRequest): void {
    const errors: StoreServiceError[] = [];

    if (!data.tenant_id) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tenant ID is required',
        field: 'tenant_id'
      });
    }

    if (!data.store_id) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Store ID is required',
        field: 'store_id'
      });
    }

    if (!data.store_information?.store_name) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Store name is required',
        field: 'store_information.store_name'
      });
    }

    if (!data.regional_settings?.currency) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Currency is required',
        field: 'regional_settings.currency'
      });
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    // Check if it's already our structured ApiError
    if (error.name === 'ApiError') {
      return error;
    }
    
    // Handle HTTP response errors that might have the new error format
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Check if it has the new structured format
      if (errorData.code && errorData.slug && errorData.message) {
        const { ApiError } = require('../api');
        return new ApiError(
          errorData.message,
          errorData.code,
          errorData.slug,
          errorData.details
        );
      }
      
      // Fallback to legacy format
      if (errorData.message) {
        return new Error(errorData.message);
      }
    }
    
    // Default error handling
    return new Error(error.message || 'An unexpected error occurred');
  }

  /**
   * Mock data for development/testing
   */
  async getMockStoreSettings(): Promise<StoreSettings> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      tenant_id: "272e",
      store_id: "*",
      store_information: {
        store_name: "Downtown Electronics Store",
        business_name: "Tech Solutions LLC",
        registration_number: "LLC-2023-001234",
        tax_number: "TAX-123456789",
        address: {
          street1: "123 Main Street",
          street2: "Suite 100",
          city: "New York",
          state: "NY",
          postal_code: "10001",
          country: "United States"
        },
        contact_info: {
          phone: "+1 (555) 123-4567",
          email: "info@techsolutions.com",
          website: "https://www.techsolutions.com",
          fax: "+1 (555) 123-4568"
        },
        business_hours: this.getDefaultBusinessHours(),
        timezone: "America/New_York",
        logo_url: "https://example.com/logo.png"
      },
      regional_settings: {
        currency: "USD",
        currency_symbol: "$",
        currency_position: "before",
        decimal_places: 2,
        thousands_separator: ",",
        decimal_separator: ".",
        timezone: "America/New_York",
        date_format: "MM/DD/YYYY",
        time_format: "12h",
        first_day_of_week: 1,
        tax_inclusive_pricing: false
      },
      receipt_settings: {
        header_text: "Thank you for shopping with us!",
        footer_text: "Visit us again soon!",
        show_logo: true,
        show_barcode: true,
        show_qr_code: false,
        paper_size: "thermal_80mm",
        auto_print: true,
        print_copies: 1,
        show_customer_info: true,
        show_tax_breakdown: true,
        show_payment_details: true,
        custom_fields: [
          { name: "Return Policy", value: "30 days with receipt", position: "footer" },
          { name: "Store Hours", value: "Mon-Fri 9AM-6PM", position: "footer" }
        ]
      },
      hardware_config: {
        barcode_scanner: {
          enabled: true,
          prefix: "",
          suffix: "",
          min_length: 8,
          max_length: 20
        },
        receipt_printer: {
          enabled: true,
          printer_name: "EPSON TM-T88V",
          connection_type: "usb",
          ip_address: undefined,
          port: undefined
        },
        cash_drawer: {
          enabled: true,
          auto_open: true,
          trigger_event: "sale_complete"
        },
        customer_display: {
          enabled: false,
          display_type: "lcd",
          connection_type: "usb"
        },
        scale: {
          enabled: false,
          brand: undefined,
          connection_type: "usb"
        }
      },
      operational_settings: {
        inventory_alerts: {
          low_stock_threshold: 10,
          out_of_stock_notifications: true,
          negative_inventory_allowed: false,
          auto_reorder: false,
          reorder_point: 5,
          reorder_quantity: 50
        },
        return_policy: {
          returns_allowed: true,
          return_period_days: 30,
          require_receipt: true,
          partial_returns_allowed: true,
          exchange_allowed: true,
          restocking_fee_percentage: 0
        },
        discount_settings: {
          max_discount_percentage: 50,
          manager_approval_required: true,
          approval_threshold_percentage: 20,
          employee_discount_allowed: true,
          employee_discount_percentage: 10
        },
        transaction_settings: {
          void_requires_approval: true,
          refund_requires_approval: true,
          price_override_allowed: true,
          quantity_limit_per_item: 100,
          minimum_sale_amount: 0.01,
          maximum_sale_amount: 10000
        }
      },
      user_management: {
        roles: [
          {
            role_id: "cashier",
            role_name: "Cashier",
            permissions: ["sales_create", "sales_read", "products_read", "customers_read"],
            description: "Basic POS operations"
          },
          {
            role_id: "manager",
            role_name: "Manager",
            permissions: ["sales_create", "sales_read", "sales_void", "sales_refund", "products_create", "products_read", "products_update", "customers_create", "customers_read", "customers_update", "reports_sales", "discount_apply", "price_override"],
            description: "Store management operations"
          },
          {
            role_id: "admin",
            role_name: "Administrator",
            permissions: ["sales_create", "sales_read", "sales_update", "sales_delete", "sales_void", "sales_refund", "products_create", "products_read", "products_update", "products_delete", "customers_create", "customers_read", "customers_update", "customers_delete", "reports_sales", "reports_inventory", "reports_customers", "settings_store", "settings_users", "users_create", "users_read", "users_update", "users_delete"],
            description: "Full system access"
          }
        ],
        default_role: "cashier",
        password_policy: {
          min_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_symbols: false,
          password_expiry_days: 90
        },
        session_settings: {
          session_timeout_minutes: 480,
          max_concurrent_sessions: 3,
          auto_logout_on_idle: true
        }
      },
      integration_settings: {
        payment_processors: [
          {
            provider_id: "stripe",
            provider_name: "Stripe",
            enabled: true,
            configuration: {
              publishable_key: "pk_test_...",
              webhook_endpoint: "https://api.example.com/webhooks/stripe"
            },
            test_mode: true
          },
          {
            provider_id: "square",
            provider_name: "Square",
            enabled: false,
            configuration: {},
            test_mode: true
          }
        ],
        accounting_software: {
          enabled: false,
          provider: undefined,
          sync_frequency: "daily",
          auto_sync: false,
          last_sync: undefined
        },
        ecommerce_platforms: [
          {
            platform_id: "shopify",
            platform_name: "Shopify",
            enabled: false,
            sync_inventory: false,
            sync_customers: false,
            sync_orders: false
          }
        ],
        email_service: {
          enabled: true,
          provider: "smtp",
          smtp_settings: {
            host: "smtp.gmail.com",
            port: 587,
            username: "noreply@techsolutions.com",
            use_ssl: true
          }
        }
      },
      api_information: {
        api_version: "v1.2.0",
        base_url: "https://api.pos-system.com/v1",
        endpoints: {
          health_check: "/health",
          products: "/products",
          orders: "/orders",
          customers: "/customers",
          inventory: "/inventory",
          reports: "/reports",
          settings: "/settings"
        },
        authentication: {
          method: "bearer_token",
          token_expires_in: 3600,
          refresh_token_enabled: true
        },
        rate_limiting: {
          enabled: true,
          requests_per_minute: 1000,
          burst_limit: 100
        },
        webhooks: {
          enabled: true,
          supported_events: ["order.created", "order.updated", "payment.completed", "inventory.low_stock"],
          callback_url: "https://your-store.com/webhooks/pos",
          secret_key: "whsec_..."
        },
        documentation: {
          swagger_url: "https://api.pos-system.com/docs",
          postman_collection_url: "https://api.pos-system.com/postman",
          api_docs_url: "https://docs.pos-system.com"
        }
      },
      security_settings: {
        data_backup: {
          enabled: true,
          backup_frequency: "daily",
          backup_time: "02:00",
          retention_days: 30,
          cloud_backup_enabled: true
        },
        audit_logs: {
          enabled: true,
          log_level: "detailed",
          retention_days: 90,
          events_to_log: ["login", "logout", "sale", "refund", "void", "settings_change", "user_management"]
        },
        compliance: {
          pci_compliance_enabled: true,
          gdpr_compliance_enabled: true,
          data_encryption_enabled: true,
          access_logging_enabled: true
        },
        security_policies: {
          failed_login_attempts_limit: 5,
          account_lockout_duration_minutes: 30,
          two_factor_authentication_required: false,
          ip_whitelist_enabled: false,
          allowed_ip_addresses: []
        }
      },
      created_at: "2025-05-28T10:00:00Z",
      updated_at: "2025-05-28T10:00:00Z",
      created_by: "admin"
    };
  }
}

// Create and export a singleton instance
export const storeSettingsService = new StoreSettingsService();

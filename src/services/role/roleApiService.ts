import { apiClient } from '../api';

// Types for the API response
export interface PermissionCategory {
  category_info: {
    name: string;
    description: string;
    icon: string;
    order: number;
  };
  permissions: Permission[];
}

export interface Permission {
  name: string;
  description: string;
  category: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  requires_approval: boolean;
}

export interface ApiRole {
  role_id: string;
  tenant_id: string;
  store_id: string;
  name: string;
  description: string;
  permissions: {
    permissions: string[];
    count: number;
  };
  is_active: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

class RoleApiService {
  private baseUrl = '/v0';

  private getBaseUrl(tenantId: string, storeId: string): string {
    return `${this.baseUrl}/tenant/${tenantId}/store/${storeId}/role`;
  }

  /**
   * Get list of permission categories with permissions
   */
  async getPermissions(tenantId: string, storeId: string): Promise<PermissionCategory[]> {
    try {
      const url = `${this.getBaseUrl(tenantId, storeId)}/permissions`;
      const response = await apiClient.get<PermissionCategory[]>(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      // Return mock data for development
      return this.getMockPermissions();
    }
  }

  /**
   * Get all roles
   */
  async getRoles(tenantId: string, storeId: string): Promise<ApiRole[]> {
    try {
      const url = this.getBaseUrl(tenantId, storeId);
      const response = await apiClient.get<ApiRole[]>(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      // Return mock data for development
      return this.getMockRoles();
    }
  }

  /**
   * Create a new role
   */
  async createRole(tenantId: string, storeId: string, data: CreateRoleRequest): Promise<ApiRole> {
    try {
      const url = this.getBaseUrl(tenantId, storeId);
      const response = await apiClient.post<ApiRole>(url, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  /**
   * Update a role
   */
  async updateRole(tenantId: string, storeId: string, roleId: string, data: Partial<CreateRoleRequest>): Promise<ApiRole> {
    try {
      const url = `${this.getBaseUrl(tenantId, storeId)}/${roleId}`;
      const response = await apiClient.put<ApiRole>(url, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(tenantId: string, storeId: string, roleId: string): Promise<void> {
    try {
      const url = `${this.getBaseUrl(tenantId, storeId)}/${roleId}`;
      await apiClient.delete(url);
    } catch (error) {
      console.error('Failed to delete role:', error);
      throw error;
    }
  }

  /**
   * Mock permissions data for development
   */
  private getMockPermissions(): PermissionCategory[] {
    return [
      {
        category_info: {
          name: "Sales",
          description: "Manage sales transactions, processing, refunds, and customer purchases",
          icon: "shopping-cart",
          order: 1
        },
        permissions: [
          {
            name: "sales_create",
            description: "Create new sales transactions and process customer purchases",
            category: "Sales",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "sales_read",
            description: "View sales transactions, receipts, and transaction history",
            category: "Sales",
            risk_level: "low",
            requires_approval: false
          },
          {
            name: "sales_update",
            description: "Modify existing sales transactions before finalization",
            category: "Sales",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "sales_delete",
            description: "Delete sales transactions (typically restricted to draft/pending)",
            category: "Sales",
            risk_level: "high",
            requires_approval: true
          },
          {
            name: "sales_void",
            description: "Void completed sales transactions with proper audit trail",
            category: "Sales",
            risk_level: "high",
            requires_approval: true
          },
          {
            name: "sales_refund",
            description: "Process full or partial refunds for completed transactions",
            category: "Sales",
            risk_level: "high",
            requires_approval: true
          }
        ]
      },
      {
        category_info: {
          name: "Products",
          description: "Control product catalog, inventory items, pricing, and product lifecycle",
          icon: "package",
          order: 2
        },
        permissions: [
          {
            name: "products_create",
            description: "Add new products to the inventory catalog",
            category: "Products",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "products_read",
            description: "View product information, prices, and inventory levels",
            category: "Products",
            risk_level: "low",
            requires_approval: false
          },
          {
            name: "products_update",
            description: "Modify product details, pricing, and specifications",
            category: "Products",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "products_delete",
            description: "Remove products from the catalog (archive)",
            category: "Products",
            risk_level: "high",
            requires_approval: true
          }
        ]
      },
      {
        category_info: {
          name: "Users",
          description: "Manage user accounts, profiles, authentication, and access control",
          icon: "users",
          order: 3
        },
        permissions: [
          {
            name: "users_create",
            description: "Create new user accounts and assign initial permissions",
            category: "Users",
            risk_level: "high",
            requires_approval: true
          },
          {
            name: "users_read",
            description: "View user profiles, roles, and basic account information",
            category: "Users",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "users_update",
            description: "Modify user profiles, roles, and account settings",
            category: "Users",
            risk_level: "high",
            requires_approval: true
          },
          {
            name: "users_delete",
            description: "Deactivate or delete user accounts",
            category: "Users",
            risk_level: "critical",
            requires_approval: true
          }
        ]
      },
      {
        category_info: {
          name: "Settings",
          description: "Configure system settings, store policies, and operational parameters",
          icon: "settings",
          order: 4
        },
        permissions: [
          {
            name: "settings_store",
            description: "Configure store settings, taxes, payment methods, and policies",
            category: "Settings",
            risk_level: "high",
            requires_approval: true
          },
          {
            name: "settings_users",
            description: "Manage user settings, roles, and permission configurations",
            category: "Settings",
            risk_level: "critical",
            requires_approval: true
          }
        ]
      },
      {
        category_info: {
          name: "Management",
          description: "Access manager overrides, approvals, and supervisory functions",
          icon: "shield-check",
          order: 5
        },
        permissions: [
          {
            name: "manager_functions",
            description: "Access manager override functions and approvals",
            category: "Management",
            risk_level: "critical",
            requires_approval: true
          }
        ]
      },
      {
        category_info: {
          name: "Inventory",
          description: "Control stock levels, adjustments, transfers, and inventory tracking",
          icon: "warehouse",
          order: 6
        },
        permissions: [
          {
            name: "inventory_create",
            description: "Add new inventory items and stock entries",
            category: "Inventory",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "inventory_read",
            description: "View inventory levels, stock status, and movement history",
            category: "Inventory",
            risk_level: "low",
            requires_approval: false
          },
          {
            name: "inventory_update",
            description: "Update inventory information and stock details",
            category: "Inventory",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "inventory_delete",
            description: "Remove inventory items and stock entries",
            category: "Inventory",
            risk_level: "high",
            requires_approval: true
          },
          {
            name: "inventory_adjust",
            description: "Adjust inventory quantities for corrections and transfers",
            category: "Inventory",
            risk_level: "high",
            requires_approval: true
          }
        ]
      },
      {
        category_info: {
          name: "Reports",
          description: "Access business intelligence, analytics, and data export capabilities",
          icon: "bar-chart",
          order: 7
        },
        permissions: [
          {
            name: "reports_view",
            description: "Access and view standard business reports",
            category: "Reports",
            risk_level: "low",
            requires_approval: false
          },
          {
            name: "reports_export",
            description: "Export reports to various formats (PDF, Excel, CSV)",
            category: "Reports",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "reports_finance",
            description: "Access financial reports including P&L, revenue, and costs",
            category: "Reports",
            risk_level: "high",
            requires_approval: true
          }
        ]
      },
      {
        category_info: {
          name: "Customers",
          description: "Manage customer relationships, profiles, and purchase history",
          icon: "user-check",
          order: 8
        },
        permissions: [
          {
            name: "customers_create",
            description: "Create new customer profiles and accounts",
            category: "Customers",
            risk_level: "low",
            requires_approval: false
          },
          {
            name: "customers_read",
            description: "View customer information and purchase history",
            category: "Customers",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "customers_update",
            description: "Modify customer profiles and account information",
            category: "Customers",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "customers_delete",
            description: "Delete customer accounts and associated data",
            category: "Customers",
            risk_level: "high",
            requires_approval: true
          }
        ]
      },
      {
        category_info: {
          name: "Discounts",
          description: "Create and manage promotional offers, coupons, and pricing strategies",
          icon: "percent",
          order: 9
        },
        permissions: [
          {
            name: "discounts_create",
            description: "Create new discount codes and promotional offers",
            category: "Discounts",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "discounts_read",
            description: "View discount configurations and usage statistics",
            category: "Discounts",
            risk_level: "low",
            requires_approval: false
          },
          {
            name: "discounts_update",
            description: "Modify existing discount rules and conditions",
            category: "Discounts",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "discounts_delete",
            description: "Remove discount codes and promotional campaigns",
            category: "Discounts",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "discounts_apply",
            description: "Apply discounts to transactions during checkout",
            category: "Discounts",
            risk_level: "medium",
            requires_approval: false
          }
        ]
      },
      {
        category_info: {
          name: "System",
          description: "Control core system operations, backups, and infrastructure settings",
          icon: "server",
          order: 10
        },
        permissions: [
          {
            name: "system_backup",
            description: "Create system backups and data exports",
            category: "System",
            risk_level: "high",
            requires_approval: true
          },
          {
            name: "system_restore",
            description: "Restore system from backups",
            category: "System",
            risk_level: "critical",
            requires_approval: true
          },
          {
            name: "system_settings",
            description: "Configure core system settings and parameters",
            category: "System",
            risk_level: "critical",
            requires_approval: true
          },
          {
            name: "system_logs",
            description: "Access system logs and diagnostic information",
            category: "System",
            risk_level: "high",
            requires_approval: true
          }
        ]
      },
      {
        category_info: {
          name: "Audit",
          description: "Access compliance logs, activity tracking, and security monitoring",
          icon: "file-search",
          order: 11
        },
        permissions: [
          {
            name: "audit_view",
            description: "View audit trails and system activity logs",
            category: "Audit",
            risk_level: "high",
            requires_approval: true
          },
          {
            name: "audit_export",
            description: "Export audit logs and compliance reports",
            category: "Audit",
            risk_level: "high",
            requires_approval: true
          }
        ]
      },
      {
        category_info: {
          name: "Categories",
          description: "Organize products into hierarchical categories and classifications",
          icon: "folder-tree",
          order: 12
        },
        permissions: [
          {
            name: "categories_create",
            description: "Create new product categories and classifications",
            category: "Categories",
            risk_level: "low",
            requires_approval: false
          },
          {
            name: "categories_read",
            description: "View product categories and their hierarchies",
            category: "Categories",
            risk_level: "low",
            requires_approval: false
          },
          {
            name: "categories_update",
            description: "Modify category names, descriptions, and structures",
            category: "Categories",
            risk_level: "medium",
            requires_approval: false
          },
          {
            name: "categories_delete",
            description: "Remove product categories from the system",
            category: "Categories",
            risk_level: "medium",
            requires_approval: false
          }
        ]
      },
      {
        category_info: {
          name: "Analytics",
          description: "View performance metrics, trends, and business intelligence insights",
          icon: "trending-up",
          order: 13
        },
        permissions: [
          {
            name: "analytics_view",
            description: "Access basic analytics dashboards and metrics",
            category: "Analytics",
            risk_level: "low",
            requires_approval: false
          },
          {
            name: "analytics_advanced",
            description: "Access advanced analytics, trends, and predictive insights",
            category: "Analytics",
            risk_level: "medium",
            requires_approval: false
          }
        ]
      }
    ];
  }

  /**
   * Mock roles data for development
   */
  private getMockRoles(): ApiRole[] {
    return [
      {
        role_id: "20250625cashier",
        tenant_id: "2711",
        store_id: "10001",
        name: "Cashier",
        description: "Basic point of sale operations",
        permissions: {
          permissions: [
            "sales_create",
            "sales_read",
            "sales_refund",
            "products_read",
            "customers_read",
            "discounts_apply",
            "inventory_read"
          ],
          count: 7
        },
        is_active: true,
        created_at: "2025-06-25T18:39:12.9742836+05:30",
        created_by: "Y8Z4UL",
        updated_at: "2025-06-25T18:39:12.9742836+05:30",
        updated_by: "Y8Z4UL"
      },
      {
        role_id: "20250625inventorymanager",
        tenant_id: "2711",
        store_id: "10001",
        name: "Inventory Manager",
        description: "Full inventory and product management",
        permissions: {
          permissions: [
            "products_create",
            "products_read",
            "products_update",
            "products_delete",
            "inventory_create",
            "inventory_read",
            "inventory_update",
            "inventory_delete",
            "inventory_adjust",
            "categories_create",
            "categories_read",
            "categories_update",
            "categories_delete",
            "reports_view"
          ],
          count: 14
        },
        is_active: true,
        created_at: "2025-06-25T18:39:46.5682883+05:30",
        created_by: "Y8Z4UL",
        updated_at: "2025-06-25T18:39:46.5682883+05:30",
        updated_by: "Y8Z4UL"
      },
      {
        role_id: "20250625salesassociate",
        tenant_id: "2711",
        store_id: "10001",
        name: "Sales Associate",
        description: "Customer service and basic inventory management",
        permissions: {
          permissions: [
            "sales_create",
            "sales_read",
            "products_read",
            "customers_create",
            "customers_read",
            "customers_update",
            "inventory_read",
            "discounts_read",
            "discounts_apply",
            "categories_read"
          ],
          count: 10
        },
        is_active: true,
        created_at: "2025-06-25T18:39:30.2013584+05:30",
        created_by: "Y8Z4UL",
        updated_at: "2025-06-25T18:49:29.3445831+05:30",
        updated_by: "Y8Z4UL"
      },
      {
        role_id: "20250625storemanager",
        tenant_id: "2711",
        store_id: "10001",
        name: "Store Manager",
        description: "Full store management access with all permissions",
        permissions: {
          permissions: [
            "sales_create",
            "sales_read",
            "sales_update",
            "sales_delete",
            "sales_void",
            "sales_refund",
            "products_create",
            "products_read",
            "products_update",
            "products_delete",
            "users_create",
            "users_read",
            "users_update",
            "settings_store",
            "settings_users",
            "manager_functions",
            "inventory_create",
            "inventory_read",
            "inventory_update",
            "inventory_adjust",
            "reports_view",
            "reports_export",
            "reports_finance",
            "customers_create",
            "customers_read",
            "customers_update",
            "discounts_create",
            "discounts_read",
            "discounts_update",
            "discounts_apply",
            "categories_create",
            "categories_read",
            "categories_update",
            "analytics_view",
            "analytics_advanced"
          ],
          count: 35
        },
        is_active: true,
        created_at: "2025-06-25T18:38:52.6815667+05:30",
        created_by: "Y8Z4UL",
        updated_at: "2025-06-25T18:38:52.6815667+05:30",
        updated_by: "Y8Z4UL"
      }
    ];
  }
}

export const roleApiService = new RoleApiService();

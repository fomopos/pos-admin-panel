/**
 * Tenant Dashboard Types
 * 
 * Type definitions for the tenant-level dashboard including
 * billing, user management, audit logs, and tenant settings.
 */

// ─── Tenant Roles & RBAC ────────────────────────────────────────────────────

export type TenantRole = 'owner' | 'admin' | 'staff' | 'viewer';

export interface TenantRolePermissions {
  canManageBilling: boolean;
  canManageUsers: boolean;
  canManageStores: boolean;
  canViewBilling: boolean;
  canViewAuditLog: boolean;
  canManageSettings: boolean;
  canCancelSubscription: boolean;
}

export const ROLE_PERMISSIONS: Record<TenantRole, TenantRolePermissions> = {
  owner: {
    canManageBilling: true,
    canManageUsers: true,
    canManageStores: true,
    canViewBilling: true,
    canViewAuditLog: true,
    canManageSettings: true,
    canCancelSubscription: true,
  },
  admin: {
    canManageBilling: false,
    canManageUsers: true,
    canManageStores: true,
    canViewBilling: true, // read-only
    canViewAuditLog: true,
    canManageSettings: true,
    canCancelSubscription: false,
  },
  staff: {
    canManageBilling: false,
    canManageUsers: false,
    canManageStores: false,
    canViewBilling: false,
    canViewAuditLog: false,
    canManageSettings: false,
    canCancelSubscription: false,
  },
  viewer: {
    canManageBilling: false,
    canManageUsers: false,
    canManageStores: false,
    canViewBilling: false,
    canViewAuditLog: false,
    canManageSettings: false,
    canCancelSubscription: false,
  },
};

// ─── Subscription & Billing ──────────────────────────────────────────────────

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_per_seat: number; // price per store/seat per month
  currency: string;
  features: string[];
  max_stores: number | null; // null = unlimited
  max_users: number | null;  // null = unlimited
}

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  seat_count: number; // number of active stores
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  estimated_monthly_cost: number;
  currency: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible' | 'draft';
  date: string;
  period_start: string;
  period_end: string;
  invoice_url?: string;
}

export interface BillingOverview {
  subscription: Subscription;
  last_invoice?: Invoice;
  upcoming_invoice?: {
    amount: number;
    currency: string;
    date: string;
  };
  billing_portal_url?: string;
}

// ─── Tenant Overview ─────────────────────────────────────────────────────────

export interface TenantOverviewData {
  tenant_id: string;
  tenant_name: string;
  active_stores_count: number;
  total_stores_count: number;
  active_users_count: number;
  total_users_count: number;
  subscription: Subscription;
  created_at: string;
}

// ─── Tenant Users ────────────────────────────────────────────────────────────

export interface TenantUser {
  id: string;
  email: string;
  name: string;
  role: TenantRole;
  status: 'active' | 'invited' | 'deactivated';
  last_login?: string;
  invited_at?: string;
  joined_at?: string;
  invited_by?: string;
}

export interface InviteUserRequest {
  email: string;
  role: TenantRole;
  message?: string;
}

export interface UpdateUserRoleRequest {
  role: TenantRole;
}

// ─── Tenant Stores ───────────────────────────────────────────────────────────

export interface TenantStore {
  store_id: string;
  store_name: string;
  status: 'active' | 'inactive' | 'pending';
  location_type: string;
  store_type: string;
  city?: string;
  country?: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export type AuditAction =
  | 'store_created'
  | 'store_deleted'
  | 'store_deactivated'
  | 'store_activated'
  | 'user_invited'
  | 'user_removed'
  | 'user_role_changed'
  | 'subscription_updated'
  | 'subscription_canceled'
  | 'subscription_reactivated'
  | 'plan_changed'
  | 'tenant_settings_updated'
  | 'billing_updated';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actor_id: string;
  actor_name: string;
  actor_email: string;
  target_type: 'store' | 'user' | 'subscription' | 'tenant';
  target_id?: string;
  target_name?: string;
  details?: Record<string, string>;
  timestamp: string;
}

export interface AuditLogFilters {
  action?: AuditAction;
  actor_id?: string;
  target_type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

// ─── Tenant Settings ─────────────────────────────────────────────────────────

export interface TenantSettings {
  tenant_id: string;
  name: string;
  logo_url?: string;
  default_currency: string;
  default_timezone: string;
  notification_preferences: {
    billing_emails: boolean;
    user_activity_emails: boolean;
    store_alerts: boolean;
    marketing_emails: boolean;
  };
  branding?: {
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
    favicon_url?: string;
  };
}

export interface UpdateTenantSettingsRequest {
  name?: string;
  logo_url?: string;
  default_currency?: string;
  default_timezone?: string;
  notification_preferences?: Partial<TenantSettings['notification_preferences']>;
  branding?: Partial<TenantSettings['branding']>;
}

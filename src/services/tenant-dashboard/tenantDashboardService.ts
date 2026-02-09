/**
 * Tenant Dashboard Service
 * 
 * Handles all API calls for the tenant-level dashboard including
 * overview data, billing, user management, stores, audit logs, and settings.
 * 
 * All endpoints are tenant-scoped. The tenant_id is automatically
 * injected via the X-Tenant-Id header by apiClient.
 */

import { apiClient } from '../api';
import type {
  TenantOverviewData,
  BillingOverview,
  Subscription,
  Invoice,
  TenantUser,
  InviteUserRequest,
  UpdateUserRoleRequest,
  TenantStore,
  AuditLogFilters,
  AuditLogResponse,
  TenantSettings,
  UpdateTenantSettingsRequest,
  SubscriptionPlan,
} from '../types/tenant-dashboard.types';

// ─── Tenant Overview ─────────────────────────────────────────────────────────

class TenantDashboardService {
  private basePath = '/tenant';

  /**
   * Fetch tenant overview data (summary stats)
   * TODO: Connect to real API endpoint — GET /tenant/overview
   */
  async getOverview(): Promise<TenantOverviewData> {
    const response = await apiClient.get<TenantOverviewData>(`${this.basePath}/overview`);
    return response.data;
  }
}

export const tenantDashboardService = new TenantDashboardService();

// ─── Billing Service ─────────────────────────────────────────────────────────

class TenantBillingService {
  private basePath = '/tenant/billing';

  /**
   * Fetch billing overview including current subscription and last invoice
   * TODO: Connect to real API endpoint — GET /tenant/billing
   */
  async getBillingOverview(): Promise<BillingOverview> {
    const response = await apiClient.get<BillingOverview>(this.basePath);
    return response.data;
  }

  /**
   * Get current subscription details
   * TODO: Connect to real API endpoint — GET /tenant/billing/subscription
   */
  async getSubscription(): Promise<Subscription> {
    const response = await apiClient.get<Subscription>(`${this.basePath}/subscription`);
    return response.data;
  }

  /**
   * Get available plans for upgrade/downgrade
   * TODO: Connect to real API endpoint — GET /tenant/billing/plans
   */
  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<SubscriptionPlan[]>(`${this.basePath}/plans`);
    return response.data;
  }

  /**
   * Get invoice history
   * TODO: Connect to real API endpoint — GET /tenant/billing/invoices
   */
  async getInvoices(page: number = 1, limit: number = 10): Promise<{ invoices: Invoice[]; total: number }> {
    const response = await apiClient.get<{ invoices: Invoice[]; total: number }>(
      `${this.basePath}/invoices`,
      { page, limit }
    );
    return response.data;
  }

  /**
   * Get a link to the Stripe Billing Portal
   * TODO: Connect to real API endpoint — POST /tenant/billing/portal-session
   */
  async getBillingPortalUrl(): Promise<{ url: string }> {
    const response = await apiClient.post<{ url: string }>(`${this.basePath}/portal-session`);
    return response.data;
  }

  /**
   * Change subscription plan
   * TODO: Connect to real API endpoint — POST /tenant/billing/change-plan
   */
  async changePlan(planId: string): Promise<Subscription> {
    const response = await apiClient.post<Subscription>(`${this.basePath}/change-plan`, { plan_id: planId });
    return response.data;
  }

  /**
   * Cancel subscription (owner only)
   * TODO: Connect to real API endpoint — POST /tenant/billing/cancel
   */
  async cancelSubscription(reason?: string): Promise<Subscription> {
    const response = await apiClient.post<Subscription>(`${this.basePath}/cancel`, { reason });
    return response.data;
  }

  /**
   * Reactivate a canceled subscription
   * TODO: Connect to real API endpoint — POST /tenant/billing/reactivate
   */
  async reactivateSubscription(): Promise<Subscription> {
    const response = await apiClient.post<Subscription>(`${this.basePath}/reactivate`);
    return response.data;
  }
}

export const tenantBillingService = new TenantBillingService();

// ─── User Management Service ─────────────────────────────────────────────────

class TenantUserService {
  private basePath = '/tenant/users';

  /**
   * List all users in the tenant
   * TODO: Connect to real API endpoint — GET /tenant/users
   */
  async getUsers(): Promise<TenantUser[]> {
    const response = await apiClient.get<TenantUser[]>(this.basePath);
    return response.data;
  }

  /**
   * Invite a new user to the tenant
   * TODO: Connect to real API endpoint — POST /tenant/users/invite
   */
  async inviteUser(data: InviteUserRequest): Promise<TenantUser> {
    const response = await apiClient.post<TenantUser>(`${this.basePath}/invite`, data);
    return response.data;
  }

  /**
   * Update a user's role in the tenant
   * TODO: Connect to real API endpoint — PATCH /tenant/users/:userId/role
   */
  async updateUserRole(userId: string, data: UpdateUserRoleRequest): Promise<TenantUser> {
    const response = await apiClient.patch<TenantUser>(`${this.basePath}/${userId}/role`, data);
    return response.data;
  }

  /**
   * Remove a user from the tenant
   * TODO: Connect to real API endpoint — DELETE /tenant/users/:userId
   */
  async removeUser(userId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${userId}`);
  }

  /**
   * Resend invitation to a pending user
   * TODO: Connect to real API endpoint — POST /tenant/users/:userId/resend-invite
   */
  async resendInvite(userId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${userId}/resend-invite`);
  }
}

export const tenantUserService = new TenantUserService();

// ─── Store Management Service (Tenant Scope) ────────────────────────────────

class TenantStoreService {
  private basePath = '/tenant/stores';

  /**
   * List all stores under the tenant
   * TODO: Connect to real API endpoint — GET /tenant/stores
   */
  async getStores(): Promise<TenantStore[]> {
    const response = await apiClient.get<TenantStore[]>(this.basePath);
    return response.data;
  }

  /**
   * Deactivate a store (reduces seat count)
   * TODO: Connect to real API endpoint — POST /tenant/stores/:storeId/deactivate
   */
  async deactivateStore(storeId: string): Promise<TenantStore> {
    const response = await apiClient.post<TenantStore>(`${this.basePath}/${storeId}/deactivate`);
    return response.data;
  }

  /**
   * Activate a store (increases seat count)
   * TODO: Connect to real API endpoint — POST /tenant/stores/:storeId/activate
   */
  async activateStore(storeId: string): Promise<TenantStore> {
    const response = await apiClient.post<TenantStore>(`${this.basePath}/${storeId}/activate`);
    return response.data;
  }

  /**
   * Delete a store permanently (decreases seat count)
   * TODO: Connect to real API endpoint — DELETE /tenant/stores/:storeId
   */
  async deleteStore(storeId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${storeId}`);
  }
}

export const tenantStoreService = new TenantStoreService();

// ─── Audit Log Service ───────────────────────────────────────────────────────

class TenantAuditLogService {
  private basePath = '/tenant/audit-log';

  /**
   * Fetch audit log entries with optional filters
   * TODO: Connect to real API endpoint — GET /tenant/audit-log
   */
  async getEntries(filters?: AuditLogFilters): Promise<AuditLogResponse> {
    const params: Record<string, string | number> = {};
    if (filters?.action) params.action = filters.action;
    if (filters?.actor_id) params.actor_id = filters.actor_id;
    if (filters?.target_type) params.target_type = filters.target_type;
    if (filters?.start_date) params.start_date = filters.start_date;
    if (filters?.end_date) params.end_date = filters.end_date;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;

    const response = await apiClient.get<AuditLogResponse>(this.basePath, params);
    return response.data;
  }
}

export const tenantAuditLogService = new TenantAuditLogService();

// ─── Tenant Settings Service ─────────────────────────────────────────────────

class TenantSettingsService {
  private basePath = '/tenant/settings';

  /**
   * Get tenant settings
   * TODO: Connect to real API endpoint — GET /tenant/settings
   */
  async getSettings(): Promise<TenantSettings> {
    const response = await apiClient.get<TenantSettings>(this.basePath);
    return response.data;
  }

  /**
   * Update tenant settings
   * TODO: Connect to real API endpoint — PATCH /tenant/settings
   */
  async updateSettings(data: UpdateTenantSettingsRequest): Promise<TenantSettings> {
    const response = await apiClient.patch<TenantSettings>(this.basePath, data);
    return response.data;
  }

  /**
   * Upload tenant logo
   * TODO: Connect to real API endpoint — POST /tenant/settings/logo
   * Note: This would typically use multipart/form-data
   */
  async uploadLogo(file: File): Promise<{ logo_url: string }> {
    // TODO: Implement file upload with FormData
    const formData = new FormData();
    formData.append('logo', file);
    const response = await apiClient.post<{ logo_url: string }>(`${this.basePath}/logo`, formData);
    return response.data;
  }
}

export const tenantSettingsService = new TenantSettingsService();

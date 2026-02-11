/**
 * Store Billing Service
 *
 * Handles real billing API calls per BILLING_API_DOCUMENTATION.md:
 *   - Store creation with 402 checkout handling
 *   - Change store plan (PUT /v0/store/:storeId/plan)
 *   - Create checkout session (POST /v0/billing/checkout-session)
 *
 * This service uses raw fetch (via apiClient pattern) so we can inspect
 * HTTP status codes (201 vs 402) which apiClient.post() would throw on.
 *
 * ⚠️  Does NOT collect card details or call Stripe APIs directly.
 * ⚠️  Does NOT store Stripe IDs in frontend state.
 * ⚠️  Does NOT optimistically update billing state.
 */

import { authService } from '../../auth/authService';
import { API_BASE_URL, ApiError } from '../api';
import type { StoreApiResponse } from '../tenant/tenantApiService';

// ─── Types (per BILLING_API_DOCUMENTATION.md) ────────────────────────────────

export type BillingPlan = 'free' | 'starter' | 'pro';

/** Plan rank for determining upgrade vs downgrade direction */
export const PLAN_RANK: Record<BillingPlan, number> = {
  free: 0,
  starter: 1,
  pro: 2,
};

/** Response shape from PUT /v0/store/:storeId/plan (per BILLING_FRONTEND_GUIDE.md) */
export interface ChangeStorePlanResponse {
  store: StoreApiResponse;
  checkout_required: boolean;
  checkout_url?: string;
  checkout_session_id?: string;
  pending_plan?: BillingPlan | null;
  downgrade_effective_at?: string | null;
  downgrade_scheduled: boolean;
}

/** Response when checkout is required (HTTP 402) */
export interface CheckoutRequiredResponse {
  store: StoreApiResponse;
  checkout_required: true;
  checkout_url?: string;
  checkout_session_id?: string;
}

/** Result of store creation or plan change — enriched for UI consumption */
export interface StoreBillingResult {
  store: StoreApiResponse;
  checkoutRequired: boolean;
  checkoutUrl?: string;
  downgradeScheduled: boolean;
  pendingPlan?: BillingPlan | null;
  downgradeEffectiveAt?: string | null;
}

/** Response from POST /v0/billing/checkout-session */
export interface CheckoutSessionResponse {
  checkout_session_id: string;
  checkout_url: string;
}

// ─── Pricing constants (display-only, per MD) ────────────────────────────────

export const PLAN_PRICES: Record<BillingPlan, number> = {
  free: 0,
  starter: 15,
  pro: 25,
};

export const PLAN_LABELS: Record<BillingPlan, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
};

export const PLAN_DESCRIPTIONS: Record<BillingPlan, string> = {
  free: 'Basic features. Limited to 1 store per tenant.',
  starter: 'Standard POS features for small businesses.',
  pro: 'Advanced features, analytics, multi-terminal support.',
};

export const PLAN_CURRENCY = '€';

// ─── Helper: build authenticated headers ─────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = await authService.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Dynamically read tenant from store (same pattern as apiClient)
  const { useTenantStore } = await import('../../tenants/tenantStore');
  const currentTenant = useTenantStore.getState().currentTenant;
  if (currentTenant?.id) {
    headers['X-Tenant-Id'] = currentTenant.id;
  }

  return headers;
}

// ─── Service ─────────────────────────────────────────────────────────────────

class StoreBillingService {
  private readonly baseUrl = API_BASE_URL;

  /**
   * Change the billing plan of an existing store.
   *
   * Endpoint: PUT /v0/store/:storeId/plan
   *
   * Returns:
   *   - 200 → plan changed, subscription synced
   *   - 402 → plan changed but checkout needed (redirect to Stripe)
   *
   * Per MD: "You only get a 402 when paid stores exist but the tenant
   * has never completed Stripe Checkout."
   */
  async changeStorePlan(
    storeId: string,
    billingPlan: BillingPlan
  ): Promise<StoreBillingResult> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/v0/store/${storeId}/plan`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ billing_plan: billingPlan }),
    });

    if (response.status === 200) {
      const data: ChangeStorePlanResponse = await response.json();
      return {
        store: data.store,
        checkoutRequired: false,
        downgradeScheduled: data.downgrade_scheduled,
        pendingPlan: data.pending_plan || null,
        downgradeEffectiveAt: data.downgrade_effective_at || null,
      };
    }

    if (response.status === 402) {
      const data: ChangeStorePlanResponse = await response.json();
      return {
        store: data.store,
        checkoutRequired: true,
        checkoutUrl: data.checkout_url,
        downgradeScheduled: false,
        pendingPlan: null,
        downgradeEffectiveAt: null,
      };
    }

    // All other errors
    const errorData = await response.json().catch(() => ({
      code: response.status,
      slug: 'UNKNOWN_ERROR',
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));

    throw new ApiError(
      errorData.message || `Failed to change plan`,
      errorData.code,
      errorData.slug,
      errorData.details
    );
  }

  /**
   * Create a Stripe Checkout Session explicitly.
   *
   * Endpoint: POST /v0/billing/checkout-session
   *
   * Use for:
   *   - "Set up billing" / "Retry payment" buttons
   *   - User navigated away from checkout
   *   - Session expired
   *
   * Returns:
   *   - 200 → checkout session created
   *   - 409 → tenant already has an active subscription
   */
  async createCheckoutSession(
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSessionResponse> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/v0/billing/checkout-session`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    if (response.status === 200) {
      return await response.json();
    }

    if (response.status === 409) {
      throw new ApiError(
        'Subscription already active',
        1404,
        'OPERATION_NOT_ALLOWED'
      );
    }

    const errorData = await response.json().catch(() => ({
      code: response.status,
      slug: 'UNKNOWN_ERROR',
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));

    throw new ApiError(
      errorData.message || 'Failed to create checkout session',
      errorData.code,
      errorData.slug,
      errorData.details
    );
  }

  /**
   * Create a store with billing plan support.
   *
   * Endpoint: POST /v0/store
   *
   * This is a wrapper around the standard store creation that handles
   * the 402 checkout response. The caller should use this instead of
   * tenantApiService.createStore() when billing_plan is set.
   *
   * Returns:
   *   - 201 → store created, subscription synced (or free plan)
   *   - 402 → store created but checkout needed
   */
  async createStoreWithBilling(
    storeData: Partial<StoreApiResponse>
  ): Promise<StoreBillingResult> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/v0/store`, {
      method: 'POST',
      headers,
      body: JSON.stringify(storeData),
    });

    if (response.status === 201) {
      const store: StoreApiResponse = await response.json();
      return { store, checkoutRequired: false, downgradeScheduled: false };
    }

    if (response.status === 402) {
      const data: CheckoutRequiredResponse = await response.json();
      return {
        store: data.store,
        checkoutRequired: true,
        checkoutUrl: data.checkout_url,
        downgradeScheduled: false,
      };
    }

    // All other errors
    const errorData = await response.json().catch(() => ({
      code: response.status,
      slug: 'UNKNOWN_ERROR',
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));

    throw new ApiError(
      errorData.message || 'Failed to create store',
      errorData.code,
      errorData.slug,
      errorData.details
    );
  }

  /**
   * Redirect user to Stripe Checkout.
   * Per MD: "Full-page redirect (recommended)"
   */
  redirectToCheckout(checkoutUrl: string): void {
    console.log('🔄 Redirecting to Stripe Checkout:', checkoutUrl);
    window.location.href = checkoutUrl;
  }

  /**
   * Build the success/cancel URLs for Stripe Checkout.
   * Uses {CHECKOUT_SESSION_ID} placeholder per Stripe conventions.
   */
  getCheckoutCallbackUrls(): { successUrl: string; cancelUrl: string } {
    const origin = window.location.origin;
    return {
      successUrl: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/billing/cancel`,
    };
  }

  /**
   * Format a dollar amount for display.
   */
  formatAmount(amount: number): string {
    return `${PLAN_CURRENCY}${amount.toFixed(0)}`;
  }

  /**
   * Check if a plan change is an upgrade, downgrade, or same.
   */
  getPlanChangeDirection(
    currentPlan: BillingPlan,
    targetPlan: BillingPlan
  ): 'upgrade' | 'downgrade' | 'same' {
    if (PLAN_RANK[targetPlan] > PLAN_RANK[currentPlan]) return 'upgrade';
    if (PLAN_RANK[targetPlan] < PLAN_RANK[currentPlan]) return 'downgrade';
    return 'same';
  }
}

// Export singleton
export const storeBillingService = new StoreBillingService();

/**
 * Billing Service
 * 
 * Manages all billing, subscription, and payment operations.
 * Currently uses mock data — swap to real Stripe API endpoints
 * by replacing the mock implementations with apiClient calls.
 * 
 * Stripe Integration Points:
 *   - getBillingOverview()     → GET /tenant/billing
 *   - getPlans()              → GET /tenant/billing/plans  (or use Stripe Products API)
 *   - getInvoices()           → GET /tenant/billing/invoices (wraps Stripe List Invoices)
 *   - getInvoiceById()        → GET /tenant/billing/invoices/:id
 *   - changePlan()            → POST /tenant/billing/change-plan (updates Stripe Subscription)
 *   - cancelSubscription()    → POST /tenant/billing/cancel
 *   - reactivateSubscription()→ POST /tenant/billing/reactivate
 *   - getBillingPortalUrl()   → POST /tenant/billing/portal-session (Stripe Customer Portal)
 *   - getPaymentMethods()     → GET /tenant/billing/payment-methods
 *   - setDefaultPaymentMethod()→ POST /tenant/billing/payment-methods/:id/default
 *   - removePaymentMethod()   → DELETE /tenant/billing/payment-methods/:id
 */

import type {
  SubscriptionPlan,
  Subscription,
  Invoice,
  PaymentMethod,
  BillingOverview,
  CancelSubscriptionRequest,
  ChangePlanRequest,
} from '../types/billing.types';

import {
  MOCK_BILLING_OVERVIEW,
  MOCK_PLANS,
  MOCK_INVOICES,
  MOCK_PAYMENT_METHODS,
  MOCK_SUBSCRIPTION,
} from './billingMockData';

// Simulate API delay
const delay = (ms: number = 600) => new Promise<void>((resolve) => setTimeout(resolve, ms));

class BillingService {
  // ── Local mock state (simulates backend) ────────────────────────────────
  private _subscription: Subscription = { ...MOCK_SUBSCRIPTION };
  private _paymentMethods: PaymentMethod[] = [...MOCK_PAYMENT_METHODS];
  private _invoices: Invoice[] = [...MOCK_INVOICES];

  // ── Overview ────────────────────────────────────────────────────────────

  /**
   * Get the full billing overview for the current tenant
   * TODO: Replace with → GET /tenant/billing
   */
  async getBillingOverview(): Promise<BillingOverview> {
    await delay();
    return {
      ...MOCK_BILLING_OVERVIEW,
      subscription: { ...this._subscription },
      payment_methods: [...this._paymentMethods],
      recent_invoices: this._invoices.slice(0, 5),
    };
  }

  // ── Plans ───────────────────────────────────────────────────────────────

  /**
   * Get all available subscription plans
   * TODO: Replace with → GET /tenant/billing/plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    await delay(400);
    return [...MOCK_PLANS];
  }

  /**
   * Get a specific plan by ID
   */
  async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    await delay(200);
    return MOCK_PLANS.find((p) => p.id === planId) || null;
  }

  // ── Subscription ───────────────────────────────────────────────────────

  /**
   * Get current subscription
   * TODO: Replace with → GET /tenant/billing/subscription
   */
  async getSubscription(): Promise<Subscription> {
    await delay();
    return { ...this._subscription };
  }

  /**
   * Change the subscription plan
   * TODO: Replace with → POST /tenant/billing/change-plan
   *       Backend calls Stripe Subscription update with proration
   */
  async changePlan(request: ChangePlanRequest): Promise<Subscription> {
    await delay(1200);

    const newPlan = MOCK_PLANS.find((p) => p.id === request.plan_id);
    if (!newPlan) {
      throw new Error('Plan not found');
    }

    const unitAmount = request.billing_interval === 'year' ? newPlan.price_yearly : newPlan.price_monthly;

    this._subscription = {
      ...this._subscription,
      plan: newPlan,
      billing_interval: request.billing_interval,
      unit_amount: unitAmount,
      estimated_monthly_cost: unitAmount * this._subscription.seat_count,
      status: 'active',
      cancel_at_period_end: false,
    };

    return { ...this._subscription };
  }

  /**
   * Cancel subscription at end of billing period
   * TODO: Replace with → POST /tenant/billing/cancel
   *       Backend calls stripe.subscriptions.update({ cancel_at_period_end: true })
   */
  async cancelSubscription(request?: CancelSubscriptionRequest): Promise<Subscription> {
    await delay(800);

    if (request?.cancel_immediately) {
      this._subscription = {
        ...this._subscription,
        status: 'canceled',
        cancel_at_period_end: false,
        canceled_at: new Date().toISOString(),
        cancel_reason: request.reason,
      };
    } else {
      this._subscription = {
        ...this._subscription,
        cancel_at_period_end: true,
        cancel_reason: request?.reason,
      };
    }

    return { ...this._subscription };
  }

  /**
   * Reactivate a canceled subscription
   * TODO: Replace with → POST /tenant/billing/reactivate
   *       Backend calls stripe.subscriptions.update({ cancel_at_period_end: false })
   */
  async reactivateSubscription(): Promise<Subscription> {
    await delay(800);

    this._subscription = {
      ...this._subscription,
      status: 'active',
      cancel_at_period_end: false,
      canceled_at: undefined,
      cancel_reason: undefined,
    };

    return { ...this._subscription };
  }

  // ── Stripe Customer Portal ─────────────────────────────────────────────

  /**
   * Get a URL to the Stripe Customer Billing Portal
   * TODO: Replace with → POST /tenant/billing/portal-session
   *       Backend calls stripe.billingPortal.sessions.create()
   */
  async getBillingPortalUrl(): Promise<{ url: string }> {
    await delay(600);
    // In production this returns a real Stripe Customer Portal URL
    return { url: 'https://billing.stripe.com/p/session/test_portal_session' };
  }

  // ── Invoices ───────────────────────────────────────────────────────────

  /**
   * List invoices with pagination
   * TODO: Replace with → GET /tenant/billing/invoices?page=X&limit=Y
   *       Backend calls stripe.invoices.list()
   */
  async getInvoices(page: number = 1, limit: number = 10): Promise<{ invoices: Invoice[]; total: number; page: number; limit: number }> {
    await delay();
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      invoices: this._invoices.slice(start, end),
      total: this._invoices.length,
      page,
      limit,
    };
  }

  /**
   * Get a single invoice by ID
   * TODO: Replace with → GET /tenant/billing/invoices/:id
   */
  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    await delay(400);
    return this._invoices.find((inv) => inv.id === invoiceId) || null;
  }

  // ── Payment Methods ────────────────────────────────────────────────────

  /**
   * List all payment methods
   * TODO: Replace with → GET /tenant/billing/payment-methods
   *       Backend calls stripe.paymentMethods.list()
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    await delay(400);
    return [...this._paymentMethods];
  }

  /**
   * Set a payment method as default
   * TODO: Replace with → POST /tenant/billing/payment-methods/:id/default
   *       Backend calls stripe.customers.update({ invoice_settings.default_payment_method })
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod[]> {
    await delay(600);
    this._paymentMethods = this._paymentMethods.map((pm) => ({
      ...pm,
      is_default: pm.id === paymentMethodId,
    }));
    this._subscription.default_payment_method_id = paymentMethodId;
    return [...this._paymentMethods];
  }

  /**
   * Remove a payment method
   * TODO: Replace with → DELETE /tenant/billing/payment-methods/:id
   *       Backend calls stripe.paymentMethods.detach()
   */
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    await delay(600);
    const pm = this._paymentMethods.find((p) => p.id === paymentMethodId);
    if (pm?.is_default) {
      throw new Error('Cannot remove the default payment method. Set another one as default first.');
    }
    this._paymentMethods = this._paymentMethods.filter((p) => p.id !== paymentMethodId);
  }

  // ── Utilities ──────────────────────────────────────────────────────────

  /**
   * Format currency amount for display
   */
  formatAmount(amount: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  /**
   * Get the card brand icon name (for UI display)
   */
  getCardBrandDisplay(brand: string): { label: string; color: string } {
    const brands: Record<string, { label: string; color: string }> = {
      visa: { label: 'Visa', color: 'text-blue-600' },
      mastercard: { label: 'Mastercard', color: 'text-orange-600' },
      amex: { label: 'Amex', color: 'text-blue-500' },
      discover: { label: 'Discover', color: 'text-orange-500' },
    };
    return brands[brand] || { label: brand, color: 'text-gray-600' };
  }
}

// Singleton
export const billingService = new BillingService();
export default billingService;

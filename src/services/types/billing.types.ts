/**
 * Billing & Subscription Types
 * 
 * Comprehensive type definitions for the billing system.
 * Designed to map directly to Stripe objects for easy migration
 * from mock data to real Stripe API integration.
 * 
 * Stripe mapping:
 *   SubscriptionPlan     → Stripe Product + Price
 *   Subscription         → Stripe Subscription
 *   Invoice              → Stripe Invoice
 *   InvoiceLineItem      → Stripe InvoiceLineItem
 *   PaymentMethod        → Stripe PaymentMethod
 *   UsageRecord          → Custom usage tracking
 */

// ─── Plans ───────────────────────────────────────────────────────────────────

export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;       // e.g. "Up to 5", "Unlimited"
  tooltip?: string;
}

export interface SubscriptionPlan {
  id: string;                       // maps to Stripe Price ID
  product_id: string;               // maps to Stripe Product ID
  tier: PlanTier;
  name: string;
  description: string;
  price_monthly: number;            // per-seat monthly price
  price_yearly: number;             // per-seat yearly price (discounted)
  currency: string;
  features: PlanFeature[];
  max_stores: number | null;        // null = unlimited
  max_users: number | null;
  max_products: number | null;
  max_transactions_per_month: number | null;
  support_level: 'community' | 'email' | 'priority' | 'dedicated';
  is_popular?: boolean;
  is_custom?: boolean;              // enterprise custom pricing
}

// ─── Subscription ────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

export type BillingInterval = 'month' | 'year';

export interface Subscription {
  id: string;                        // maps to Stripe Subscription ID (sub_xxx)
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_interval: BillingInterval;
  seat_count: number;                // number of active stores
  unit_amount: number;               // effective per-seat price for current interval
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  cancel_reason?: string;
  trial_start?: string;
  trial_end?: string;
  estimated_monthly_cost: number;
  currency: string;
  discount?: {
    id: string;
    coupon_code: string;
    percent_off?: number;
    amount_off?: number;
    duration: 'once' | 'repeating' | 'forever';
    duration_in_months?: number;
  };
  default_payment_method_id?: string;
  created_at: string;
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_amount: number;
  amount: number;
  period_start: string;
  period_end: string;
  proration: boolean;
}

export interface Invoice {
  id: string;                        // maps to Stripe Invoice ID (in_xxx)
  number: string;                    // invoice number (INV-0001)
  status: InvoiceStatus;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  created_at: string;
  due_date?: string;
  paid_at?: string;
  period_start: string;
  period_end: string;
  lines: InvoiceLineItem[];
  invoice_pdf_url?: string;
  hosted_invoice_url?: string;
  payment_method_brand?: string;     // visa, mastercard, etc.
  payment_method_last4?: string;
  billing_reason: 'subscription_create' | 'subscription_cycle' | 'subscription_update' | 'manual';
  attempt_count: number;
  next_payment_attempt?: string;
}

// ─── Payment Methods ─────────────────────────────────────────────────────────

export type PaymentMethodType = 'card' | 'bank_account' | 'sepa_debit';

export interface PaymentMethod {
  id: string;                        // maps to Stripe PaymentMethod ID (pm_xxx)
  type: PaymentMethodType;
  is_default: boolean;
  card?: {
    brand: string;                   // visa, mastercard, amex, discover
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
    country: string;
  };
  bank_account?: {
    bank_name: string;
    last4: string;
    routing_number?: string;
  };
  billing_details: {
    name?: string;
    email?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
  };
  created_at: string;
}

// ─── Usage / Metrics ─────────────────────────────────────────────────────────

export interface UsageMetric {
  key: string;
  label: string;
  current: number;
  limit: number | null;              // null = unlimited
  unit: string;                      // "stores", "users", "products", "transactions"
  percentage?: number;               // 0-100
  status: 'ok' | 'warning' | 'critical';
}

// ─── Billing Overview (aggregated) ───────────────────────────────────────────

export interface BillingOverview {
  subscription: Subscription;
  payment_methods: PaymentMethod[];
  recent_invoices: Invoice[];
  upcoming_invoice?: {
    amount: number;
    currency: string;
    date: string;
    lines: InvoiceLineItem[];
  };
  usage: UsageMetric[];
  billing_email: string;
  billing_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

// ─── API Requests ────────────────────────────────────────────────────────────

export interface ChangePlanRequest {
  plan_id: string;
  billing_interval: BillingInterval;
  promo_code?: string;
}

export interface CancelSubscriptionRequest {
  reason?: string;
  feedback?: string;
  cancel_immediately?: boolean;
}

export interface AddPaymentMethodRequest {
  payment_method_id: string;         // Stripe PM ID from Elements
  set_as_default?: boolean;
}

export interface UpdateBillingDetailsRequest {
  billing_email?: string;
  billing_address?: BillingOverview['billing_address'];
  tax_id?: string;
}

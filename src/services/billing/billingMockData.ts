/**
 * Billing Mock Data
 * 
 * Realistic mock data for the billing & subscription system.
 * All IDs follow Stripe naming conventions (sub_xxx, in_xxx, pm_xxx, price_xxx)
 * so swapping to real Stripe data requires minimal changes.
 * 
 * TODO: Replace with real Stripe API calls when backend is ready.
 */

import type {
  SubscriptionPlan,
  Subscription,
  Invoice,
  PaymentMethod,
  UsageMetric,
  BillingOverview,
} from '../types/billing.types';

// ─── Plans ───────────────────────────────────────────────────────────────────

export const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'price_free_monthly',
    product_id: 'prod_free',
    tier: 'free',
    name: 'Free',
    description: 'Get started with basic POS features for a single store.',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'usd',
    max_stores: 1,
    max_users: 2,
    max_products: 50,
    max_transactions_per_month: 500,
    support_level: 'community',
    features: [
      { name: '1 Store', included: true },
      { name: 'Up to 2 Users', included: true },
      { name: 'Up to 50 Products', included: true },
      { name: '500 Transactions/mo', included: true },
      { name: 'Basic Reports', included: true },
      { name: 'Email Support', included: false },
      { name: 'Multi-currency', included: false },
      { name: 'API Access', included: false },
      { name: 'Custom Branding', included: false },
      { name: 'Priority Support', included: false },
    ],
  },
  {
    id: 'price_starter_monthly',
    product_id: 'prod_starter',
    tier: 'starter',
    name: 'Starter',
    description: 'Perfect for small businesses with a few locations.',
    price_monthly: 29,
    price_yearly: 24,
    currency: 'usd',
    max_stores: 3,
    max_users: 10,
    max_products: 500,
    max_transactions_per_month: 5000,
    support_level: 'email',
    features: [
      { name: 'Up to 3 Stores', included: true },
      { name: 'Up to 10 Users', included: true },
      { name: 'Up to 500 Products', included: true },
      { name: '5,000 Transactions/mo', included: true },
      { name: 'Advanced Reports', included: true },
      { name: 'Email Support', included: true },
      { name: 'Multi-currency', included: false },
      { name: 'API Access', included: false },
      { name: 'Custom Branding', included: false },
      { name: 'Priority Support', included: false },
    ],
  },
  {
    id: 'price_professional_monthly',
    product_id: 'prod_professional',
    tier: 'professional',
    name: 'Professional',
    description: 'For growing businesses that need advanced features.',
    price_monthly: 79,
    price_yearly: 66,
    currency: 'usd',
    max_stores: 10,
    max_users: 50,
    max_products: null,
    max_transactions_per_month: null,
    support_level: 'priority',
    is_popular: true,
    features: [
      { name: 'Up to 10 Stores', included: true },
      { name: 'Up to 50 Users', included: true },
      { name: 'Unlimited Products', included: true },
      { name: 'Unlimited Transactions', included: true },
      { name: 'Advanced Reports & Analytics', included: true },
      { name: 'Email & Chat Support', included: true },
      { name: 'Multi-currency', included: true },
      { name: 'API Access', included: true },
      { name: 'Custom Branding', included: true },
      { name: 'Priority Support', included: false },
    ],
  },
  {
    id: 'price_enterprise_monthly',
    product_id: 'prod_enterprise',
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited scale with dedicated support and SLA.',
    price_monthly: 199,
    price_yearly: 166,
    currency: 'usd',
    max_stores: null,
    max_users: null,
    max_products: null,
    max_transactions_per_month: null,
    support_level: 'dedicated',
    is_custom: true,
    features: [
      { name: 'Unlimited Stores', included: true },
      { name: 'Unlimited Users', included: true },
      { name: 'Unlimited Products', included: true },
      { name: 'Unlimited Transactions', included: true },
      { name: 'Advanced Reports & Analytics', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'Multi-currency', included: true },
      { name: 'Full API Access', included: true },
      { name: 'Custom Branding & White-label', included: true },
      { name: '99.9% SLA & Priority Support', included: true },
    ],
  },
];

// ─── Current Subscription ────────────────────────────────────────────────────

const now = new Date();
const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

export const MOCK_SUBSCRIPTION: Subscription = {
  id: 'sub_1RBxyz1234567890',
  plan: MOCK_PLANS[2], // Professional
  status: 'active',
  billing_interval: 'month',
  seat_count: 3,
  unit_amount: 79,
  current_period_start: periodStart.toISOString(),
  current_period_end: periodEnd.toISOString(),
  cancel_at_period_end: false,
  estimated_monthly_cost: 237, // 3 seats × $79
  currency: 'usd',
  default_payment_method_id: 'pm_1RBxyz1234567890',
  created_at: '2025-06-15T10:00:00Z',
};

// ─── Payment Methods ─────────────────────────────────────────────────────────

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm_1RBxyz1234567890',
    type: 'card',
    is_default: true,
    card: {
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2027,
      funding: 'credit',
      country: 'US',
    },
    billing_details: {
      name: 'John Doe',
      email: 'john@acmecorp.com',
      address: {
        city: 'San Francisco',
        country: 'US',
        line1: '123 Market St',
        postal_code: '94102',
        state: 'CA',
      },
    },
    created_at: '2025-06-15T10:00:00Z',
  },
  {
    id: 'pm_2ABcde5678901234',
    type: 'card',
    is_default: false,
    card: {
      brand: 'mastercard',
      last4: '8210',
      exp_month: 8,
      exp_year: 2026,
      funding: 'debit',
      country: 'US',
    },
    billing_details: {
      name: 'John Doe',
      email: 'john@acmecorp.com',
    },
    created_at: '2025-09-20T14:30:00Z',
  },
];

// ─── Invoices ────────────────────────────────────────────────────────────────

function generateInvoices(): Invoice[] {
  const invoices: Invoice[] = [];
  const baseDate = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let i = 0; i < 8; i++) {
    const invoiceDate = new Date(baseDate);
    invoiceDate.setMonth(invoiceDate.getMonth() - i);
    const invoicePeriodEnd = new Date(invoiceDate);
    invoicePeriodEnd.setMonth(invoicePeriodEnd.getMonth() + 1);
    invoicePeriodEnd.setDate(0);

    const seatCount = i === 0 ? 3 : i < 3 ? 3 : 2;
    const unitAmount = 79;
    const subtotal = seatCount * unitAmount;
    const tax = Math.round(subtotal * 0.087 * 100) / 100; // 8.7% tax
    const total = subtotal + tax;

    invoices.push({
      id: `in_${(1000 + i).toString(36)}xyz${i}`,
      number: `INV-${String(2026 * 100 + (baseDate.getMonth() + 1 - i)).padStart(6, '0')}`,
      status: i === 0 ? 'open' : 'paid',
      amount_due: i === 0 ? total : 0,
      amount_paid: i === 0 ? 0 : total,
      amount_remaining: i === 0 ? total : 0,
      subtotal,
      tax,
      total,
      currency: 'usd',
      created_at: invoiceDate.toISOString(),
      due_date: i === 0
        ? new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 15).toISOString()
        : undefined,
      paid_at: i === 0 ? undefined : new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 3).toISOString(),
      period_start: invoiceDate.toISOString(),
      period_end: invoicePeriodEnd.toISOString(),
      lines: [
        {
          id: `il_seat_${i}`,
          description: `Professional plan — ${seatCount} store${seatCount > 1 ? 's' : ''} × $${unitAmount}/mo`,
          quantity: seatCount,
          unit_amount: unitAmount,
          amount: subtotal,
          period_start: invoiceDate.toISOString(),
          period_end: invoicePeriodEnd.toISOString(),
          proration: false,
        },
      ],
      invoice_pdf_url: `https://pay.stripe.com/invoice/${`in_${i}`}/pdf`,
      hosted_invoice_url: `https://invoice.stripe.com/i/${`in_${i}`}`,
      payment_method_brand: 'visa',
      payment_method_last4: '4242',
      billing_reason: i === 0 ? 'subscription_cycle' : 'subscription_cycle',
      attempt_count: i === 0 ? 0 : 1,
    });
  }

  return invoices;
}

export const MOCK_INVOICES: Invoice[] = generateInvoices();

// ─── Usage Metrics ───────────────────────────────────────────────────────────

export const MOCK_USAGE: UsageMetric[] = [
  {
    key: 'stores',
    label: 'Active Stores',
    current: 3,
    limit: 10,
    unit: 'stores',
    percentage: 30,
    status: 'ok',
  },
  {
    key: 'users',
    label: 'Team Members',
    current: 8,
    limit: 50,
    unit: 'users',
    percentage: 16,
    status: 'ok',
  },
  {
    key: 'products',
    label: 'Products',
    current: 342,
    limit: null,
    unit: 'products',
    status: 'ok',
  },
  {
    key: 'transactions',
    label: 'Transactions This Month',
    current: 1847,
    limit: null,
    unit: 'transactions',
    status: 'ok',
  },
];

// ─── Complete Billing Overview ───────────────────────────────────────────────

export const MOCK_BILLING_OVERVIEW: BillingOverview = {
  subscription: MOCK_SUBSCRIPTION,
  payment_methods: MOCK_PAYMENT_METHODS,
  recent_invoices: MOCK_INVOICES.slice(0, 5),
  upcoming_invoice: {
    amount: 257.63, // 3 × $79 + tax
    currency: 'usd',
    date: periodEnd.toISOString(),
    lines: [
      {
        id: 'il_upcoming',
        description: 'Professional plan — 3 stores × $79/mo',
        quantity: 3,
        unit_amount: 79,
        amount: 237,
        period_start: periodEnd.toISOString(),
        period_end: new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 2, 0).toISOString(),
        proration: false,
      },
    ],
  },
  usage: MOCK_USAGE,
  billing_email: 'billing@acmecorp.com',
  billing_address: {
    line1: '123 Market St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94102',
    country: 'US',
  },
};

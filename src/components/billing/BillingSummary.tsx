/**
 * BillingSummary
 *
 * Display-only widget showing seat-based billing breakdown.
 * Per BILLING_API_DOCUMENTATION.md:
 *   - Starter: $29/store/month
 *   - Pro: $79/store/month
 *   - Free: $0/store/month
 *
 * ⚠️ This component ONLY computes display values.
 *    It does NOT enforce billing logic.
 *    The backend is the single source of truth for billing.
 */

import React from 'react';
import { Widget } from '../ui';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { Store, BillingPlan } from '../../tenants/tenantStore';
import { PLAN_PRICES, PLAN_LABELS } from '../../services/billing/storeBillingService';

interface BillingSummaryProps {
  stores: Store[];
}

const BillingSummary: React.FC<BillingSummaryProps> = ({ stores }) => {
  // Count stores per plan
  const planCounts: Record<BillingPlan, number> = { free: 0, starter: 0, pro: 0 };

  stores.forEach((store) => {
    const plan = store.billing_plan || 'free';
    if (plan in planCounts) {
      planCounts[plan as BillingPlan]++;
    }
  });

  const starterTotal = planCounts.starter * PLAN_PRICES.starter;
  const proTotal = planCounts.pro * PLAN_PRICES.pro;
  const estimatedMonthly = starterTotal + proTotal;

  // Only show billing summary if there are any stores
  if (stores.length === 0) return null;

  return (
    <Widget title="Billing Summary" icon={CurrencyDollarIcon} variant="default">
      <div className="space-y-4">
        {/* Plan breakdown */}
        <div className="space-y-3">
          {planCounts.free > 0 && (
            <BillingRow
              plan="Free"
              count={planCounts.free}
              price={PLAN_PRICES.free}
              total={0}
            />
          )}
          {planCounts.starter > 0 && (
            <BillingRow
              plan={PLAN_LABELS.starter}
              count={planCounts.starter}
              price={PLAN_PRICES.starter}
              total={starterTotal}
            />
          )}
          {planCounts.pro > 0 && (
            <BillingRow
              plan={PLAN_LABELS.pro}
              count={planCounts.pro}
              price={PLAN_PRICES.pro}
              total={proTotal}
            />
          )}
        </div>

        {/* Estimated total */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Estimated Monthly Total</span>
            <span className="text-xl font-bold text-blue-600">
              ${estimatedMonthly.toFixed(0)}/mo
            </span>
          </div>
        </div>

        {/* Info note */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 This is a display-only estimate. Actual billing is managed by Stripe and may include prorations.
          </p>
        </div>
      </div>
    </Widget>
  );
};

// ─── Sub-component ───────────────────────────────────────────────────────────

interface BillingRowProps {
  plan: string;
  count: number;
  price: number;
  total: number;
}

const BillingRow: React.FC<BillingRowProps> = ({ plan, count, price, total }) => (
  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-900">{plan}</span>
      <span className="text-xs text-gray-500">
        {count} store{count !== 1 ? 's' : ''} × ${price}/mo
      </span>
    </div>
    <span className="text-sm font-semibold text-gray-900">
      ${total.toFixed(0)}/mo
    </span>
  </div>
);

export default BillingSummary;

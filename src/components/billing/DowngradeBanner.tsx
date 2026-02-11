/**
 * DowngradeBanner
 *
 * Displays a banner when a store has a pending downgrade scheduled.
 * Per BILLING_FRONTEND_GUIDE.md:
 *   - Show when `pending_plan` is set and `downgrade_effective_at` is set.
 *   - User keeps full access to current plan until effective date.
 *   - "Cancel Downgrade" sends PUT /v0/store/:storeId/plan with billing_plan = current plan.
 */

import React, { useState } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import type { BillingPlan } from '../../tenants/tenantStore';
import {
  storeBillingService,
  PLAN_LABELS,
} from '../../services/billing/storeBillingService';

interface DowngradeBannerProps {
  storeId: string;
  currentPlan: BillingPlan;
  pendingPlan: BillingPlan;
  downgradeEffectiveAt: string;
  onDowngradeCancelled: () => void;
  compact?: boolean;
}

const DowngradeBanner: React.FC<DowngradeBannerProps> = ({
  storeId,
  currentPlan,
  pendingPlan,
  downgradeEffectiveAt,
  onDowngradeCancelled,
  compact = false,
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCancelDowngrade = async () => {
    try {
      setIsCancelling(true);
      setErrorMessage(null);

      // Cancel downgrade by requesting the current plan
      await storeBillingService.changeStorePlan(storeId, currentPlan);
      onDowngradeCancelled();
    } catch (error: unknown) {
      console.error('❌ Failed to cancel downgrade:', error);
      const apiError = error as { message?: string };
      setErrorMessage(apiError?.message || 'Failed to cancel downgrade.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600">
        <CalendarDaysIcon className="h-3.5 w-3.5" />
        <span>
          → {PLAN_LABELS[pendingPlan]} on {formatDate(downgradeEffectiveAt)}
        </span>
      </div>
    );
  }

  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start gap-3">
        <CalendarDaysIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-800">Downgrade scheduled</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Your store plan will change from <strong>{PLAN_LABELS[currentPlan]}</strong> to{' '}
            <strong>{PLAN_LABELS[pendingPlan]}</strong> on{' '}
            <strong>{formatDate(downgradeEffectiveAt)}</strong>. You'll continue to have{' '}
            {PLAN_LABELS[currentPlan]} features until then.
          </p>

          {errorMessage && (
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
          )}

          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelDowngrade}
              disabled={isCancelling}
              isLoading={isCancelling}
            >
              Keep {PLAN_LABELS[currentPlan]} Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DowngradeBanner;

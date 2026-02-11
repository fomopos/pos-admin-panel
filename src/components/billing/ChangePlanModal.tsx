/**
 * ChangePlanModal
 *
 * Modal dialog to change a store's billing plan.
 * Per BILLING_FRONTEND_GUIDE.md:
 *   - Upgrades apply immediately (200, downgrade_scheduled=false)
 *   - Downgrades are scheduled (200, downgrade_scheduled=true)
 *   - Cancel downgrade by requesting current plan
 *   - 402 requires Stripe checkout redirect
 *   - 409 code 3032 = free plan limit reached
 *   - 409 code 3031 = store not active
 */

import React, { useState } from 'react';
import { Button, Alert } from '../ui';
import {
  CheckIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { BillingPlan } from '../../tenants/tenantStore';
import {
  storeBillingService,
  PLAN_PRICES,
  PLAN_LABELS,
  PLAN_DESCRIPTIONS,
  PLAN_CURRENCY,
} from '../../services/billing/storeBillingService';
import type { ApiError } from '../../services/api';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
  currentPlan: BillingPlan;
  pendingPlan?: BillingPlan | null;
  downgradeEffectiveAt?: string | null;
  onPlanChanged: () => void;
}

type UIState = 'idle' | 'loading' | 'redirecting_to_stripe' | 'success_upgrade' | 'success_downgrade_scheduled' | 'success_downgrade_cancelled' | 'error';

const ChangePlanModal: React.FC<ChangePlanModalProps> = ({
  isOpen,
  onClose,
  storeId,
  storeName,
  currentPlan,
  pendingPlan,
  downgradeEffectiveAt,
  onPlanChanged,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan>(currentPlan);
  const [uiState, setUIState] = useState<UIState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scheduledInfo, setScheduledInfo] = useState<{
    pendingPlan: BillingPlan;
    effectiveAt: string;
  } | null>(null);

  if (!isOpen) return null;

  const hasDowngradePending = !!pendingPlan && !!downgradeEffectiveAt;
  const hasChanged = selectedPlan !== currentPlan;
  const direction = storeBillingService.getPlanChangeDirection(currentPlan, selectedPlan);

  const handleSubmit = async () => {
    if (!hasChanged && !hasDowngradePending) return;

    try {
      setUIState('loading');
      setErrorMessage(null);
      setScheduledInfo(null);

      const result = await storeBillingService.changeStorePlan(storeId, selectedPlan);

      // 402 — redirect to Stripe Checkout
      if (result.checkoutRequired && result.checkoutUrl) {
        setUIState('redirecting_to_stripe');
        storeBillingService.redirectToCheckout(result.checkoutUrl);
        return;
      }

      // Downgrade scheduled (not immediate)
      if (result.downgradeScheduled && result.pendingPlan && result.downgradeEffectiveAt) {
        setScheduledInfo({
          pendingPlan: result.pendingPlan,
          effectiveAt: result.downgradeEffectiveAt,
        });
        setUIState('success_downgrade_scheduled');
        onPlanChanged();
        return;
      }

      // Cancel downgrade (user picked their current plan while downgrade was pending)
      if (!result.downgradeScheduled && selectedPlan === currentPlan && hasDowngradePending) {
        setUIState('success_downgrade_cancelled');
        onPlanChanged();
        return;
      }

      // Upgrade applied immediately
      setUIState('success_upgrade');
      onPlanChanged();
    } catch (error: unknown) {
      console.error('❌ Failed to change plan:', error);
      setUIState('error');

      const apiError = error as ApiError;
      const errorCode = apiError?.code;
      const slug = apiError?.slug;

      switch (errorCode) {
        case 3032:
          setErrorMessage(
            'You already have a free store. Free plan is limited to 1 store per tenant. Delete the existing free store first, or keep this store on a paid plan.'
          );
          break;
        case 3031:
          setErrorMessage(
            'This store is not active. Plan changes can only be made on active stores.'
          );
          break;
        case 1406:
          setErrorMessage('Invalid billing plan selected.');
          break;
        case 1409:
          setErrorMessage(
            'This feature requires a higher plan. Please select a higher tier.'
          );
          break;
        case 1411:
          setErrorMessage(
            'Payment setup is required. Please complete checkout to continue.'
          );
          break;
        default:
          switch (slug) {
            case 'OPERATION_NOT_ALLOWED':
              setErrorMessage('This operation is not allowed. Please contact support.');
              break;
            case 'SUBSCRIPTION_INACTIVE':
              setErrorMessage('Your subscription is not active. Please set up billing first.');
              break;
            case 'PAYMENT_FAILED':
              setErrorMessage('Payment failed. Please update your payment method and try again.');
              break;
            default:
              setErrorMessage(apiError?.message || 'Failed to change plan. Please try again.');
          }
      }
    }
  };

  const handleCancelDowngrade = async () => {
    // Cancel downgrade by requesting the current plan
    try {
      setUIState('loading');
      setErrorMessage(null);

      await storeBillingService.changeStorePlan(storeId, currentPlan);

      setUIState('success_downgrade_cancelled');
      onPlanChanged();
    } catch (error: unknown) {
      console.error('❌ Failed to cancel downgrade:', error);
      setUIState('error');
      const apiError = error as ApiError;
      setErrorMessage(apiError?.message || 'Failed to cancel downgrade. Please try again.');
    }
  };

  const isSubmitting = uiState === 'loading' || uiState === 'redirecting_to_stripe';
  const isSuccessState = uiState === 'success_upgrade' || uiState === 'success_downgrade_scheduled' || uiState === 'success_downgrade_cancelled';

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={isSubmitting ? undefined : onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Change Plan</h2>
            <p className="text-sm text-gray-500 mt-0.5">{storeName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Redirecting state */}
          {uiState === 'redirecting_to_stripe' && (
            <div className="text-center py-6">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-700">Redirecting to Stripe Checkout...</p>
              <p className="text-xs text-gray-500 mt-1">Please wait while we set up your payment.</p>
            </div>
          )}

          {/* Success: Upgrade applied immediately */}
          {uiState === 'success_upgrade' && (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Plan upgraded successfully!</p>
              <p className="text-xs text-gray-500 mt-1">
                Your store is now on the <strong>{PLAN_LABELS[selectedPlan]}</strong> plan. Changes are effective immediately.
              </p>
            </div>
          )}

          {/* Success: Downgrade scheduled */}
          {uiState === 'success_downgrade_scheduled' && scheduledInfo && (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <CalendarDaysIcon className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Downgrade scheduled</p>
              <p className="text-xs text-gray-500 mt-2">
                Your store plan will change from <strong>{PLAN_LABELS[currentPlan]}</strong> to{' '}
                <strong>{PLAN_LABELS[scheduledInfo.pendingPlan]}</strong> on{' '}
                <strong>{formatDate(scheduledInfo.effectiveAt)}</strong>.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                You'll continue to have {PLAN_LABELS[currentPlan]} features until then.
              </p>
            </div>
          )}

          {/* Success: Downgrade cancelled */}
          {uiState === 'success_downgrade_cancelled' && (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Downgrade cancelled</p>
              <p className="text-xs text-gray-500 mt-1">
                Your store will stay on the <strong>{PLAN_LABELS[currentPlan]}</strong> plan.
              </p>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Pending downgrade banner */}
          {hasDowngradePending && !isSuccessState && uiState !== 'redirecting_to_stripe' && (
            <Alert variant="warning">
              <div className="flex items-start gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Downgrade scheduled</p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    Your plan will change from <strong>{PLAN_LABELS[currentPlan]}</strong> to{' '}
                    <strong>{PLAN_LABELS[pendingPlan!]}</strong> on{' '}
                    <strong>{formatDate(downgradeEffectiveAt!)}</strong>. You still have{' '}
                    {PLAN_LABELS[currentPlan]} features until then.
                  </p>
                  <button
                    onClick={handleCancelDowngrade}
                    disabled={isSubmitting}
                    className="mt-2 text-sm font-medium text-amber-800 underline hover:text-amber-900 disabled:opacity-50"
                  >
                    Keep {PLAN_LABELS[currentPlan]} Plan
                  </button>
                </div>
              </div>
            </Alert>
          )}

          {/* Plan options */}
          {!isSuccessState && uiState !== 'redirecting_to_stripe' && (
            <div className="space-y-3">
              {(['free', 'starter', 'pro'] as BillingPlan[]).map((plan) => {
                const isSelected = selectedPlan === plan;
                const isCurrent = currentPlan === plan;
                const isPending = pendingPlan === plan;
                const planDirection = storeBillingService.getPlanChangeDirection(currentPlan, plan);

                return (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setErrorMessage(null);
                      if (uiState === 'error') setUIState('idle');
                    }}
                    disabled={isSubmitting}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{PLAN_LABELS[plan]}</span>
                          {isCurrent && (
                            <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                              Current
                            </span>
                          )}
                          {isPending && !isCurrent && (
                            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                              Scheduled
                            </span>
                          )}
                          {!isCurrent && !isPending && planDirection === 'upgrade' && (
                            <ArrowUpIcon className="h-3.5 w-3.5 text-green-500" />
                          )}
                          {!isCurrent && !isPending && planDirection === 'downgrade' && (
                            <ArrowDownIcon className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{PLAN_DESCRIPTIONS[plan]}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {PLAN_PRICES[plan] === 0 ? 'Free' : `${PLAN_CURRENCY}${PLAN_PRICES[plan]}/mo`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Change direction indicator */}
          {hasChanged && !isSuccessState && uiState !== 'redirecting_to_stripe' && (
            <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm ${
              direction === 'upgrade'
                ? 'bg-green-50 text-green-700'
                : direction === 'downgrade'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-gray-50 text-gray-500'
            }`}>
              <span className="font-medium">{PLAN_LABELS[currentPlan]}</span>
              <ArrowRightIcon className="h-4 w-4" />
              <span className="font-medium">{PLAN_LABELS[selectedPlan]}</span>
              {direction === 'upgrade' && (
                <span className="text-xs ml-1">(immediate)</span>
              )}
              {direction === 'downgrade' && (
                <span className="text-xs ml-1">(scheduled at end of billing cycle)</span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isSuccessState ? (
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : uiState !== 'redirecting_to_stripe' ? (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={(!hasChanged && !hasDowngradePending) || isSubmitting}
              isLoading={uiState === 'loading'}
            >
              {direction === 'downgrade'
                ? `Schedule Downgrade to ${PLAN_LABELS[selectedPlan]}`
                : direction === 'upgrade'
                  ? `Upgrade to ${PLAN_LABELS[selectedPlan]}`
                  : hasDowngradePending && selectedPlan === currentPlan
                    ? `Keep ${PLAN_LABELS[currentPlan]} Plan`
                    : `Change to ${PLAN_LABELS[selectedPlan]}`}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChangePlanModal;

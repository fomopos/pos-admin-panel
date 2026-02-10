/**
 * ChangePlanModal
 *
 * Modal dialog to change a store's billing plan.
 * Per BILLING_API_DOCUMENTATION.md:
 *   - Calls PUT /v0/store/:storeId/plan
 *   - Handles 200 (plan changed) and 402 (checkout required)
 *
 * ⚠️ Does NOT optimistically update billing state.
 * ⚠️ Does NOT compute proration.
 */

import React, { useState } from 'react';
import { Button } from '../ui';
import {
  CheckIcon,
  XMarkIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import type { BillingPlan } from '../../tenants/tenantStore';
import {
  storeBillingService,
  PLAN_PRICES,
  PLAN_LABELS,
  PLAN_DESCRIPTIONS,
} from '../../services/billing/storeBillingService';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
  currentPlan: BillingPlan;
  onPlanChanged: () => void; // Callback to refresh store list after plan change
}

type UIState = 'idle' | 'loading' | 'redirecting_to_stripe' | 'error';

const ChangePlanModal: React.FC<ChangePlanModalProps> = ({
  isOpen,
  onClose,
  storeId,
  storeName,
  currentPlan,
  onPlanChanged,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan>(currentPlan);
  const [uiState, setUIState] = useState<UIState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasChanged = selectedPlan !== currentPlan;

  const handleSubmit = async () => {
    if (!hasChanged) return;

    try {
      setUIState('loading');
      setErrorMessage(null);

      const result = await storeBillingService.changeStorePlan(storeId, selectedPlan);

      if (result.checkoutRequired && result.checkoutUrl) {
        // 402 — redirect to Stripe Checkout
        setUIState('redirecting_to_stripe');
        storeBillingService.redirectToCheckout(result.checkoutUrl);
        return;
      }

      // 200 — plan changed successfully
      onPlanChanged();
      onClose();
    } catch (error: unknown) {
      console.error('❌ Failed to change plan:', error);
      setUIState('error');

      if (error instanceof Error) {
        // Handle specific billing errors per MD
        const apiError = error as { slug?: string; message?: string };
        switch (apiError.slug) {
          case 'OPERATION_NOT_ALLOWED':
            setErrorMessage('This operation is not allowed. Please contact support.');
            break;
          case 'SUBSCRIPTION_INACTIVE':
            setErrorMessage('Your subscription is not active. Please set up billing first.');
            break;
          case 'PAYMENT_FAILED':
            setErrorMessage('Payment failed. Please update your payment method and try again.');
            break;
          case 'INVALID_BILLING_PLAN':
            setErrorMessage('Invalid billing plan selected.');
            break;
          default:
            setErrorMessage(apiError.message || 'Failed to change plan. Please try again.');
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  const isSubmitting = uiState === 'loading' || uiState === 'redirecting_to_stripe';

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

          {/* Error message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Plan options */}
          {uiState !== 'redirecting_to_stripe' && (
            <div className="space-y-3">
              {(['free', 'starter', 'pro'] as BillingPlan[]).map((plan) => {
                const isSelected = selectedPlan === plan;
                const isCurrent = currentPlan === plan;

                return (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setErrorMessage(null);
                      setUIState('idle');
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
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{PLAN_DESCRIPTIONS[plan]}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {PLAN_PRICES[plan] === 0 ? 'Free' : `$${PLAN_PRICES[plan]}/mo`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Change direction indicator */}
          {hasChanged && uiState !== 'redirecting_to_stripe' && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-500">
              <span className="font-medium">{PLAN_LABELS[currentPlan]}</span>
              <ArrowRightIcon className="h-4 w-4" />
              <span className="font-medium text-blue-600">{PLAN_LABELS[selectedPlan]}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {uiState !== 'redirecting_to_stripe' && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!hasChanged || isSubmitting}
              isLoading={uiState === 'loading'}
            >
              {selectedPlan === 'free' && currentPlan !== 'free'
                ? 'Downgrade to Free'
                : PLAN_PRICES[selectedPlan] > PLAN_PRICES[currentPlan]
                  ? `Upgrade to ${PLAN_LABELS[selectedPlan]}`
                  : `Change to ${PLAN_LABELS[selectedPlan]}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePlanModal;

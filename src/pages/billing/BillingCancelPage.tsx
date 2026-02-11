/**
 * BillingCancelPage
 *
 * Shown when user cancels Stripe Checkout (clicks "Back" or closes the page).
 * Route: /billing/cancel
 *
 * Per BILLING_API_DOCUMENTATION.md:
 *   - The store WAS ALREADY CREATED before the checkout redirect.
 *   - The store exists but the subscription is not yet active.
 *   - User can complete payment setup at any time.
 *
 * This page offers a "Set up billing" / "Retry payment" button
 * that calls POST /v0/billing/checkout-session to get a new checkout URL.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTenantStore } from '../../tenants/tenantStore';
import { storeBillingService } from '../../services/billing/storeBillingService';
import { useError } from '../../hooks/useError';
import { Button } from '../../components/ui';

type UIState = 'idle' | 'loading' | 'redirecting_to_stripe' | 'error';

const BillingCancelPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, fetchStoresForTenant } = useTenantStore();
  const { showError } = useError();

  const [uiState, setUIState] = useState<UIState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refetch store data on mount — always re-sync after Stripe redirect
  useEffect(() => {
    const refreshData = async () => {
      if (!currentTenant?.id) return;
      try {
        console.log('🔄 Refreshing store data after billing cancel');
        await fetchStoresForTenant(currentTenant.id);
      } catch (error) {
        console.error('❌ Failed to refresh stores after billing cancel:', error);
      }
    };

    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTenant?.id]);

  /**
   * Retry checkout: POST /v0/billing/checkout-session
   * Per MD: "Manually creates a checkout session (e.g., user navigated away, session expired)"
   */
  const handleRetryCheckout = async () => {
    try {
      setUIState('loading');
      setErrorMessage(null);

      const { successUrl, cancelUrl } = storeBillingService.getCheckoutCallbackUrls();
      const { checkout_url } = await storeBillingService.createCheckoutSession(successUrl, cancelUrl);

      setUIState('redirecting_to_stripe');
      storeBillingService.redirectToCheckout(checkout_url);
    } catch (error: unknown) {
      console.error('❌ Failed to create checkout session:', error);
      setUIState('error');

      if (error instanceof Error) {
        const apiError = error as { slug?: string; message?: string };
        if (apiError.slug === 'OPERATION_NOT_ALLOWED') {
          // 409 — subscription is already active, which is great
          setErrorMessage('Your subscription is already active! Redirecting...');
          setTimeout(() => navigate('/tenant/stores', { replace: true }), 2000);
          return;
        }
        setErrorMessage(apiError.message || 'Failed to create checkout session.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }

      showError(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Cancel icon */}
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <XCircleIcon className="h-10 w-10 text-amber-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>

        <p className="text-gray-600 mb-2">
          Your store was created but billing is not yet set up.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          You can complete payment setup at any time. Your store will have full access once billing is activated.
        </p>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Redirecting state */}
        {uiState === 'redirecting_to_stripe' && (
          <div className="mb-6">
            <div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-500">Redirecting to Stripe Checkout...</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={handleRetryCheckout}
            disabled={uiState === 'loading' || uiState === 'redirecting_to_stripe'}
            isLoading={uiState === 'loading'}
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Set Up Billing
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/tenant/stores', { replace: true })}
            disabled={uiState === 'loading' || uiState === 'redirecting_to_stripe'}
          >
            Go to Stores
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard', { replace: true })}
            disabled={uiState === 'loading' || uiState === 'redirecting_to_stripe'}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BillingCancelPage;

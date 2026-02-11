/**
 * BillingSuccessPage
 *
 * Shown after user completes Stripe Checkout successfully.
 * Route: /billing/success?session_id={CHECKOUT_SESSION_ID}
 *
 * Per BILLING_API_DOCUMENTATION.md:
 *   - ✅ The store has already been created (happened before the 402)
 *   - ⏳ The webhook may or may not have fired yet
 *   - ✅ The subscription will be active momentarily
 *
 * ⚠️ Do NOT call any API to "confirm" the checkout.
 *    The backend webhook handles everything automatically.
 *    This page is purely a UX confirmation.
 *
 * After a short delay, we refetch tenant/store data and redirect to stores page.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTenantStore } from '../../tenants/tenantStore';
import { Button } from '../../components/ui';

const BillingSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { currentTenant, fetchStoresForTenant } = useTenantStore();

  const [countdown, setCountdown] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refetch store data after redirect — always refetch, never assume payment success
  useEffect(() => {
    const refreshData = async () => {
      if (!currentTenant?.id) return;
      try {
        setIsRefreshing(true);
        console.log('🔄 Refreshing store data after billing success, session:', sessionId);
        await fetchStoresForTenant(currentTenant.id);
      } catch (error) {
        console.error('❌ Failed to refresh stores after billing success:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTenant?.id]);

  // Countdown auto-redirect
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/tenant/stores', { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Your subscription is now active. Your store has been created and billing has been set up.
        </p>

        {isRefreshing && (
          <p className="text-sm text-gray-500 mb-4">
            Refreshing your store data...
          </p>
        )}

        <p className="text-sm text-gray-500 mb-6">
          Redirecting to your stores in <strong>{countdown}</strong> second{countdown !== 1 ? 's' : ''}...
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => navigate('/tenant/stores', { replace: true })}
          >
            Go to Stores Now
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard', { replace: true })}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BillingSuccessPage;

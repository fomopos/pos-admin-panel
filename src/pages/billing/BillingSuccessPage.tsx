/**
 * BillingSuccessPage
 *
 * Shown after user completes Stripe Checkout successfully.
 * Route: /billing/success?session_id={CHECKOUT_SESSION_ID}
 *
 * Per BILLING_FRONTEND_GUIDE.md:
 *   - The store has already been created (happened before the 402)
 *   - The webhook may or may not have fired yet
 *   - The subscription will be active momentarily
 *
 * After checkout completion, we wait and use exponential backoff (2s, 4s, 8s)
 * to refresh store data, then redirect to stores page.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useTenantStore } from '../../tenants/tenantStore';
import { Button } from '../../components/ui';

const MAX_RETRIES = 4;
const INITIAL_DELAY_MS = 2000;

const BillingSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { currentTenant, fetchStoresForTenant } = useTenantStore();

  const [countdown, setCountdown] = useState(8);
  const [refreshStatus, setRefreshStatus] = useState<'refreshing' | 'success' | 'pending'>('refreshing');
  const [retryCount, setRetryCount] = useState(0);
  const retryRef = useRef(0);

  // Refetch store data with exponential backoff
  useEffect(() => {
    if (!currentTenant?.id) return;

    let cancelled = false;

    const refreshWithBackoff = async () => {
      console.log('🔄 Refreshing store data after billing success, session:', sessionId);

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (cancelled) return;

        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt); // 2s, 4s, 8s, 16s
        await new Promise((resolve) => setTimeout(resolve, delay));

        if (cancelled) return;

        try {
          retryRef.current = attempt + 1;
          setRetryCount(attempt + 1);

          await fetchStoresForTenant(currentTenant.id);
          console.log(`✅ Store data refreshed on attempt ${attempt + 1}`);
          setRefreshStatus('success');
          return;
        } catch (error) {
          console.warn(`⚠️ Refresh attempt ${attempt + 1} failed:`, error);
        }
      }

      // After all retries, show a "pending" message
      if (!cancelled) {
        setRefreshStatus('pending');
      }
    };

    refreshWithBackoff();

    return () => {
      cancelled = true;
    };
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

        {/* Refresh status indicator */}
        {refreshStatus === 'refreshing' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              <p className="text-sm text-blue-700">
                Setting up your subscription...{retryCount > 1 && ` (attempt ${retryCount})`}
              </p>
            </div>
          </div>
        )}

        {refreshStatus === 'pending' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <ClockIcon className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-amber-700">
                Your payment was received. Changes may take a moment to reflect.
              </p>
            </div>
          </div>
        )}

        {refreshStatus === 'success' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <p className="text-sm text-green-700">Store data updated successfully!</p>
            </div>
          </div>
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

/**
 * PlanSelectionPage
 *
 * Full-page plan comparison and selection. Supports monthly/yearly toggle,
 * highlights current plan and popular plan, and handles upgrade/downgrade
 * confirmation with proration preview.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Button,
  Badge,
  Loading,
  ConfirmDialog,
} from '../../components/ui';
import { billingService } from '../../services/billing/billingService';
import { useError } from '../../hooks/useError';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import type {
  SubscriptionPlan,
  Subscription,
  BillingInterval,
  PlanTier,
} from '../../services/types/billing.types';
import {
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

// Plan tier ordering for comparison
const TIER_ORDER: Record<PlanTier, number> = {
  free: 0,
  starter: 1,
  professional: 2,
  enterprise: 3,
};

const PlanSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useError();
  const confirmDialog = useConfirmDialog();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [interval, setInterval] = useState<BillingInterval>('month');
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [fetchedPlans, fetchedSub] = await Promise.all([
          billingService.getPlans(),
          billingService.getSubscription(),
        ]);
        setPlans(fetchedPlans);
        setSubscription(fetchedSub);
        setInterval(fetchedSub.billing_interval);
      } catch (error) {
        showError(error);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!subscription) return;
    if (plan.id === subscription.plan.id && interval === subscription.billing_interval) return;

    const currentTier = TIER_ORDER[subscription.plan.tier];
    const newTier = TIER_ORDER[plan.tier];
    const isUpgrade = newTier > currentTier;
    const isIntervalChange = plan.id === subscription.plan.id;

    let message = '';
    if (isIntervalChange) {
      message = `Switch your billing cycle to ${interval === 'year' ? 'annual' : 'monthly'}? ${
        interval === 'year'
          ? `You'll save ${billingService.formatAmount((plan.price_monthly - plan.price_yearly) * 12)} per year.`
          : 'You will be billed monthly going forward.'
      }`;
    } else if (isUpgrade) {
      message = `Upgrade to ${plan.name}? Your new rate will be ${billingService.formatAmount(
        interval === 'year' ? plan.price_yearly : plan.price_monthly
      )} per store/${interval === 'year' ? 'year' : 'month'}. You'll be charged a prorated amount for the remainder of this billing period.`;
    } else {
      message = `Downgrade to ${plan.name}? Your new rate will be ${billingService.formatAmount(
        interval === 'year' ? plan.price_yearly : plan.price_monthly
      )} per store/${interval === 'year' ? 'year' : 'month'}. The change will take effect at the start of your next billing period.`;
    }

    confirmDialog.openDialog(
      async () => {
        try {
          setChangingPlan(true);
          const updated = await billingService.changePlan({
            plan_id: plan.id,
            billing_interval: interval,
          });
          setSubscription(updated);
          showSuccess(`Successfully ${isUpgrade ? 'upgraded' : 'changed'} to ${plan.name}!`);
        } catch (error) {
          showError(error);
        } finally {
          setChangingPlan(false);
        }
      },
      {
        title: isUpgrade ? 'Upgrade Plan' : isIntervalChange ? 'Change Billing Cycle' : 'Change Plan',
        message,
        variant: 'info',
        confirmText: isUpgrade ? 'Upgrade Now' : 'Confirm Change',
      }
    );
  };

  if (loading) {
    return <Loading title="Loading Plans" description="Fetching available plans..." />;
  }

  const yearlySavingsPercent = plans[1]
    ? Math.round(((plans[1].price_monthly - plans[1].price_yearly) / plans[1].price_monthly) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Plan"
        description="Choose the plan that fits your business needs"
      >
        <Button variant="outline" onClick={() => navigate('/tenant/billing')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Billing
        </Button>
      </PageHeader>

      {/* Monthly / Yearly Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${interval === 'month' ? 'text-gray-900' : 'text-gray-400'}`}>
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={interval === 'year'}
          onClick={() => setInterval(interval === 'month' ? 'year' : 'month')}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
            interval === 'year' ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              interval === 'year' ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${interval === 'year' ? 'text-gray-900' : 'text-gray-400'}`}>
          Yearly
        </span>
        {yearlySavingsPercent > 0 && (
          <Badge color="green" size="sm">Save {yearlySavingsPercent}%</Badge>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = subscription?.plan.id === plan.id && subscription?.billing_interval === interval;
          const price = interval === 'year' ? plan.price_yearly : plan.price_monthly;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 flex flex-col transition-all ${
                plan.is_popular
                  ? 'border-blue-500 shadow-lg shadow-blue-100'
                  : isCurrent
                  ? 'border-green-500 bg-green-50/30'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular badge */}
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm">
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current badge */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge color="green" size="sm">Current Plan</Badge>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-6 pt-2">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                <div className="mt-4">
                  {plan.is_custom ? (
                    <p className="text-3xl font-bold text-gray-900">Custom</p>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-gray-900">
                        {billingService.formatAmount(price)}
                        <span className="text-base font-normal text-gray-500">/store/{interval === 'year' ? 'yr' : 'mo'}</span>
                      </p>
                      {interval === 'year' && plan.price_monthly > 0 && (
                        <p className="text-xs text-gray-400 mt-1 line-through">
                          {billingService.formatAmount(plan.price_monthly)}/store/mo
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XMarkIcon className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {isCurrent ? (
                <Button variant="outline" disabled className="w-full">
                  Current Plan
                </Button>
              ) : plan.is_custom ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('mailto:sales@example.com?subject=Enterprise%20Plan%20Inquiry', '_blank')}
                >
                  Contact Sales
                </Button>
              ) : (
                <Button
                  variant={plan.is_popular ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => handleSelectPlan(plan)}
                  isLoading={changingPlan}
                >
                  {subscription && TIER_ORDER[plan.tier] > TIER_ORDER[subscription.plan.tier]
                    ? 'Upgrade'
                    : 'Select Plan'}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ / Trust */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="text-center p-4">
          <ShieldCheckIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-gray-900">Cancel Anytime</h4>
          <p className="text-xs text-gray-500 mt-1">No lock-in. Downgrade or cancel whenever you need to.</p>
        </div>
        <div className="text-center p-4">
          <SparklesIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-gray-900">Prorated Billing</h4>
          <p className="text-xs text-gray-500 mt-1">When upgrading, you only pay the difference for the rest of the period.</p>
        </div>
        <div className="text-center p-4">
          <ShieldCheckIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-gray-900">Secure Payments</h4>
          <p className="text-xs text-gray-500 mt-1">All payments processed securely through Stripe.</p>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.dialogState.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.dialogState.title}
        message={confirmDialog.dialogState.message}
        confirmText={confirmDialog.dialogState.confirmText}
        cancelText={confirmDialog.dialogState.cancelText}
        variant={confirmDialog.dialogState.variant}
        isLoading={confirmDialog.dialogState.isLoading}
      />
    </div>
  );
};

export default PlanSelectionPage;

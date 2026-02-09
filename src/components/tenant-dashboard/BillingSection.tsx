/**
 * BillingSection
 *
 * Main billing dashboard showing subscription overview, usage metrics,
 * payment methods, and recent invoices. Links out to dedicated pages
 * for plan selection, invoice details, and payment method management.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Widget,
  Button,
  Badge,
  Alert,
  ConfirmDialog,
  Loading,
} from '../ui';
import { useTenantRole } from '../../hooks/useTenantRole';
import { useError } from '../../hooks/useError';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { billingService } from '../../services/billing/billingService';
import type {
  BillingOverview,
  PaymentMethod,
  UsageMetric,
} from '../../services/types/billing.types';
import {
  CreditCardIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  SparklesIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const invoiceStatusConfig: Record<string, { color: 'green' | 'yellow' | 'red' | 'gray'; label: string }> = {
  paid: { color: 'green', label: 'Paid' },
  open: { color: 'yellow', label: 'Open' },
  void: { color: 'gray', label: 'Void' },
  uncollectible: { color: 'red', label: 'Uncollectible' },
  draft: { color: 'gray', label: 'Draft' },
};

const usageBarColor = (status: string): string => {
  switch (status) {
    case 'critical':
      return 'bg-red-500';
    case 'warning':
      return 'bg-amber-500';
    default:
      return 'bg-blue-500';
  }
};

const cardBrandLogo: Record<string, string> = {
  visa: '💳 Visa',
  mastercard: '💳 Mastercard',
  amex: '💳 Amex',
  discover: '💳 Discover',
};

// ─── Component ────────────────────────────────────────────────────────────────

const BillingSection: React.FC = () => {
  const navigate = useNavigate();
  const { can, isOwner } = useTenantRole();
  const { showError, showInfo } = useError();
  const confirmDialog = useConfirmDialog();

  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const canManageBilling = can('canManageBilling');
  const canViewBilling = can('canViewBilling');

  // ── Fetch ─────────────────────────────────────────────────────────────

  const fetchBilling = async () => {
    try {
      setLoading(true);
      const data = await billingService.getBillingOverview();
      setBilling(data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canViewBilling) {
      fetchBilling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewBilling]);

  // ── Actions ───────────────────────────────────────────────────────────

  const handleOpenBillingPortal = async () => {
    try {
      setPortalLoading(true);
      const { url } = await billingService.getBillingPortalUrl();
      window.open(url, '_blank');
    } catch (error) {
      showError(error);
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    if (!isOwner) return;

    confirmDialog.openDialog(
      async () => {
        try {
          const updated = await billingService.cancelSubscription({
            reason: 'user_requested',
          });
          setBilling((prev) =>
            prev ? { ...prev, subscription: updated } : prev
          );
          showInfo('Your subscription has been set to cancel at the end of the current billing period.');
        } catch (error) {
          showError(error);
        }
      },
      {
        title: 'Cancel Subscription',
        message:
          'Are you sure you want to cancel? Your access will continue until the end of the current billing period. You can reactivate at any time before then.',
        variant: 'danger',
        confirmText: 'Cancel Subscription',
      }
    );
  };

  const handleReactivate = async () => {
    try {
      const updated = await billingService.reactivateSubscription();
      setBilling((prev) =>
        prev ? { ...prev, subscription: updated } : prev
      );
      showInfo('Your subscription has been reactivated!');
    } catch (error) {
      showError(error);
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────

  if (!canViewBilling) {
    return (
      <div className="text-center py-12">
        <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">You do not have permission to view billing information.</p>
      </div>
    );
  }

  if (loading) {
    return <Loading title="Loading Billing" description="Fetching billing information..." />;
  }

  if (!billing) {
    return (
      <div className="text-center py-12">
        <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No billing information available.</p>
      </div>
    );
  }

  const { subscription, payment_methods, recent_invoices, upcoming_invoice, usage } = billing;
  const isCanceling = subscription.cancel_at_period_end;
  const isPastDue = subscription.status === 'past_due';
  const defaultPayment = payment_methods.find((pm) => pm.is_default);

  return (
    <div className="space-y-6">
      {/* ── Status Banners ──────────────────────────────────────────────── */}

      {isPastDue && (
        <Alert variant="error">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Payment Past Due</p>
              <p className="text-sm text-red-700 mt-1">
                Your latest payment failed. Please update your payment method to avoid service interruption.
              </p>
              {canManageBilling && (
                <Button variant="destructive" size="sm" className="mt-2" onClick={() => navigate('/tenant/billing/payment-methods')}>
                  Update Payment Method
                </Button>
              )}
            </div>
          </div>
        </Alert>
      )}

      {isCanceling && (
        <Alert variant="warning">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Subscription Canceling</p>
              <p className="text-sm text-amber-700 mt-1">
                Your subscription will cancel on{' '}
                <strong>
                  {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </strong>.
              </p>
              {canManageBilling && (
                <Button variant="primary" size="sm" className="mt-2" onClick={handleReactivate}>
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Reactivate Subscription
                </Button>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* ── Plan & Cost Row ─────────────────────────────────────────────── */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <Widget title="Current Plan" icon={SparklesIcon} variant="primary" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-gray-900">{subscription.plan.name}</h3>
                  {subscription.plan.is_popular && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{subscription.plan.description}</p>
              </div>
              <Badge
                color={subscription.status === 'active' ? 'green' : subscription.status === 'trialing' ? 'blue' : 'red'}
                size="md"
              >
                {subscription.status}
              </Badge>
            </div>

            {/* Key plan features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {subscription.plan.features.filter((f) => f.included).slice(0, 6).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature.name}
                </div>
              ))}
            </div>

            {/* Actions */}
            {canManageBilling && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <Button variant="primary" onClick={() => navigate('/tenant/billing/change-plan')}>
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Change Plan
                </Button>
                <Button variant="outline" onClick={handleOpenBillingPortal} isLoading={portalLoading}>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                  Stripe Portal
                </Button>
                {isOwner && !isCanceling && subscription.plan.tier !== 'free' && (
                  <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={handleCancelSubscription}>
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </Widget>

        {/* Cost Summary */}
        <Widget title="Monthly Cost" icon={CurrencyDollarIcon} variant="default">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Active Stores (Seats)</p>
              <p className="text-2xl font-bold text-gray-900">{subscription.seat_count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Per Store / {subscription.billing_interval === 'year' ? 'Year' : 'Month'}</p>
              <p className="text-lg font-semibold text-gray-900">
                {billingService.formatAmount(subscription.unit_amount)}
              </p>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">Estimated Monthly Total</p>
              <p className="text-2xl font-bold text-blue-600">
                {billingService.formatAmount(subscription.estimated_monthly_cost)}
              </p>
            </div>
            {subscription.discount && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 font-medium">
                  🎉 Discount applied: {subscription.discount.coupon_code}
                  {subscription.discount.percent_off && ` (${subscription.discount.percent_off}% off)`}
                  {subscription.discount.amount_off && ` (${billingService.formatAmount(subscription.discount.amount_off)} off)`}
                </p>
              </div>
            )}
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 Billing is per active store. Add or remove stores to adjust your cost.
              </p>
            </div>
          </div>
        </Widget>
      </div>

      {/* ── Usage Metrics ───────────────────────────────────────────────── */}

      <Widget title="Resource Usage" icon={ChartBarIcon} variant="default">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {usage.map((metric: UsageMetric) => (
            <UsageCard key={metric.key} metric={metric} />
          ))}
        </div>
      </Widget>

      {/* ── Payment Methods & Billing Period ────────────────────────────── */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Default Payment Method */}
        <Widget title="Payment Method" icon={CreditCardIcon} variant="default">
          {defaultPayment ? (
            <div className="space-y-4">
              <PaymentCardDisplay method={defaultPayment} />
              {payment_methods.length > 1 && (
                <p className="text-xs text-gray-400">
                  +{payment_methods.length - 1} more payment method{payment_methods.length > 2 ? 's' : ''}
                </p>
              )}
              {canManageBilling && (
                <div className="pt-3 border-t border-gray-200">
                  <Button variant="outline" size="sm" onClick={() => navigate('/tenant/billing/payment-methods')}>
                    <CreditCardIcon className="h-4 w-4 mr-1" />
                    Manage Payment Methods
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <CreditCardIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No payment method on file</p>
              {canManageBilling && (
                <Button variant="primary" size="sm" onClick={() => navigate('/tenant/billing/payment-methods')}>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Payment Method
                </Button>
              )}
            </div>
          )}
        </Widget>

        {/* Billing Period & Upcoming */}
        <Widget title="Billing Period" icon={DocumentTextIcon} variant="default">
          <div className="space-y-3">
            <BillingRow label="Period Start" value={new Date(subscription.current_period_start).toLocaleDateString()} />
            <BillingRow label="Period End" value={new Date(subscription.current_period_end).toLocaleDateString()} />
            <BillingRow label="Billing Interval" value={subscription.billing_interval === 'year' ? 'Annual' : 'Monthly'} />
            {subscription.trial_end && (
              <BillingRow label="Trial Ends" value={new Date(subscription.trial_end).toLocaleDateString()} />
            )}
            {upcoming_invoice && (
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Next Invoice</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {billingService.formatAmount(upcoming_invoice.amount)} on {new Date(upcoming_invoice.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Widget>
      </div>

      {/* ── Recent Invoices ──────────────────────────────────────────────── */}

      <Widget title="Recent Invoices" icon={DocumentTextIcon} variant="default">
        {recent_invoices.length > 0 ? (
          <div className="space-y-3">
            {/* Table header */}
            <div className="hidden sm:grid sm:grid-cols-6 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span>Invoice</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Payment</span>
              <span className="text-right">Actions</span>
            </div>

            {recent_invoices.map((invoice) => {
              const statusCfg = invoiceStatusConfig[invoice.status] || invoiceStatusConfig.draft;
              return (
                <div
                  key={invoice.id}
                  className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-4 items-center px-4 py-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/tenant/billing/invoices/${invoice.id}`)}
                >
                  <span className="text-sm font-medium text-gray-900">{invoice.number}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {billingService.formatAmount(invoice.total)}
                  </span>
                  <span>
                    <Badge color={statusCfg.color} size="sm">{statusCfg.label}</Badge>
                  </span>
                  <span className="text-sm text-gray-500">
                    {invoice.payment_method_brand && invoice.payment_method_last4
                      ? `${invoice.payment_method_brand.charAt(0).toUpperCase() + invoice.payment_method_brand.slice(1)} •••• ${invoice.payment_method_last4}`
                      : '—'}
                  </span>
                  <span className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tenant/billing/invoices/${invoice.id}`);
                      }}
                    >
                      View
                    </Button>
                  </span>
                </div>
              );
            })}

            <div className="pt-2 text-center">
              <Button variant="outline" size="sm" onClick={() => navigate('/tenant/billing/invoices')}>
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                View All Invoices
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <DocumentTextIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No invoices yet</p>
          </div>
        )}
      </Widget>

      {/* ── Security Note ────────────────────────────────────────────────── */}

      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
        <ShieldCheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
        <p className="text-xs text-gray-500">
          All payment processing is handled securely by <strong>Stripe</strong>. We never store your full card details.
        </p>
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

// ─── Sub-components ──────────────────────────────────────────────────────────

const UsageCard: React.FC<{ metric: UsageMetric }> = ({ metric }) => {
  const percentage = metric.percentage ?? (metric.limit ? Math.round((metric.current / metric.limit) * 100) : null);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <p className="text-sm font-medium text-gray-700">{metric.label}</p>
        <p className="text-xs text-gray-400">{metric.unit}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-gray-900">{metric.current.toLocaleString()}</span>
        {metric.limit !== null ? (
          <span className="text-sm text-gray-400">/ {metric.limit.toLocaleString()}</span>
        ) : (
          <span className="text-sm text-gray-400">/ ∞</span>
        )}
      </div>
      {percentage !== null && (
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${usageBarColor(metric.status)}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
      {percentage === null && (
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-green-400 w-full opacity-20" />
        </div>
      )}
    </div>
  );
};

const PaymentCardDisplay: React.FC<{ method: PaymentMethod }> = ({ method }) => (
  <div className="flex items-center gap-4">
    <div className="w-12 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-md flex items-center justify-center text-white text-xs font-bold">
      {method.card?.brand?.slice(0, 2).toUpperCase() ?? 'PM'}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-900">
          {cardBrandLogo[method.card?.brand ?? ''] ?? '💳 Card'} •••• {method.card?.last4}
        </p>
        {method.is_default && (
          <Badge color="blue" size="sm">Default</Badge>
        )}
      </div>
      <p className="text-xs text-gray-500">
        Expires {String(method.card?.exp_month).padStart(2, '0')}/{method.card?.exp_year}
        {method.card?.funding && ` · ${method.card.funding}`}
      </p>
    </div>
  </div>
);

const BillingRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

export default BillingSection;

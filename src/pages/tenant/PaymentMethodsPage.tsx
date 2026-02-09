/**
 * PaymentMethodsPage
 *
 * Manage payment methods — list all cards, set a default,
 * remove non-default methods. Add new payment method placeholder
 * (real implementation will use Stripe Elements).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Widget,
  Button,
  Badge,
  Alert,
  Loading,
  ConfirmDialog,
} from '../../components/ui';
import { billingService } from '../../services/billing/billingService';
import { useTenantRole } from '../../hooks/useTenantRole';
import { useError } from '../../hooks/useError';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import type { PaymentMethod } from '../../services/types/billing.types';
import {
  ArrowLeftIcon,
  CreditCardIcon,
  TrashIcon,
  StarIcon,
  PlusIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const brandColors: Record<string, string> = {
  visa: 'from-blue-700 to-blue-900',
  mastercard: 'from-orange-600 to-red-700',
  amex: 'from-blue-500 to-blue-700',
  discover: 'from-orange-400 to-orange-600',
};

const PaymentMethodsPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = useTenantRole();
  const { showError, showSuccess, showInfo } = useError();
  const confirmDialog = useConfirmDialog();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const canManage = can('canManageBilling');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await billingService.getPaymentMethods();
        setMethods(data);
      } catch (error) {
        showError(error);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetDefault = async (pm: PaymentMethod) => {
    if (pm.is_default || !canManage) return;
    try {
      setActionLoading(pm.id);
      const updated = await billingService.setDefaultPaymentMethod(pm.id);
      setMethods(updated);
      showSuccess(`${pm.card?.brand ?? 'Card'} •••• ${pm.card?.last4} is now your default payment method.`);
    } catch (error) {
      showError(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = (pm: PaymentMethod) => {
    if (pm.is_default) {
      showInfo('You cannot remove the default payment method. Set another card as default first.');
      return;
    }
    if (!canManage) return;

    confirmDialog.openDialog(
      async () => {
        try {
          setActionLoading(pm.id);
          await billingService.removePaymentMethod(pm.id);
          setMethods((prev) => prev.filter((p) => p.id !== pm.id));
          showSuccess('Payment method removed.');
        } catch (error) {
          showError(error);
        } finally {
          setActionLoading(null);
        }
      },
      {
        title: 'Remove Payment Method',
        message: `Remove ${pm.card?.brand ?? 'card'} •••• ${pm.card?.last4}? This action cannot be undone.`,
        variant: 'danger',
        confirmText: 'Remove',
      }
    );
  };

  if (loading) {
    return <Loading title="Loading Payment Methods" description="Fetching payment methods..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Methods"
        description="Manage cards and bank accounts for your subscription"
      >
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/tenant/billing')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Billing
          </Button>
          {canManage && (
            <Button variant="primary" onClick={() => showInfo('Stripe Elements integration will be added for adding new cards.')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Info */}
      <Alert variant="info">
        <div className="flex items-start gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Your payment information is securely stored by <strong>Stripe</strong>. We never see or store your full card number.
          </p>
        </div>
      </Alert>

      {/* Cards Grid */}
      {methods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((pm) => {
            const brand = pm.card?.brand ?? 'unknown';
            const gradient = brandColors[brand] || 'from-gray-700 to-gray-900';
            const isProcessing = actionLoading === pm.id;

            return (
              <div
                key={pm.id}
                className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                  pm.is_default ? 'border-blue-500 shadow-md shadow-blue-100' : 'border-gray-200'
                }`}
              >
                {/* Card Visual */}
                <div className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-10 h-7 bg-white/20 rounded flex items-center justify-center text-xs font-bold">
                      {brand.slice(0, 2).toUpperCase()}
                    </div>
                    {pm.is_default && (
                      <Badge color="blue" size="sm" className="bg-white/20 text-white border-0">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-mono tracking-widest mb-4">
                    •••• •••• •••• {pm.card?.last4}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-white/60 uppercase">Cardholder</p>
                      <p className="text-sm">{pm.billing_details?.name || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/60 uppercase">Expires</p>
                      <p className="text-sm">
                        {String(pm.card?.exp_month).padStart(2, '0')}/{pm.card?.exp_year}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Details & Actions */}
                <div className="p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{brand}</p>
                      <p className="text-xs text-gray-500 capitalize">{pm.card?.funding ?? 'card'} · {pm.card?.country}</p>
                    </div>
                    {pm.billing_details?.email && (
                      <p className="text-xs text-gray-400">{pm.billing_details.email}</p>
                    )}
                  </div>

                  {canManage && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      {!pm.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSetDefault(pm)}
                          isLoading={isProcessing}
                        >
                          <StarIcon className="h-4 w-4 mr-1" />
                          Set Default
                        </Button>
                      )}
                      {pm.is_default && (
                        <div className="flex-1 flex items-center justify-center text-sm text-blue-600 font-medium gap-1">
                          <StarIconSolid className="h-4 w-4" />
                          Default Method
                        </div>
                      )}
                      {!pm.is_default && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleRemove(pm)}
                          isLoading={isProcessing}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Widget title="" variant="default">
          <div className="text-center py-12">
            <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Payment Methods</h3>
            <p className="text-gray-500 mb-4">Add a payment method to start your subscription.</p>
            {canManage && (
              <Button variant="primary" onClick={() => showInfo('Stripe Elements integration coming soon.')}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            )}
          </div>
        </Widget>
      )}

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

export default PaymentMethodsPage;

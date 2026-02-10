/**
 * StoreBillingBadge
 *
 * Displays a colored badge showing the store's billing plan.
 * Per BILLING_API_DOCUMENTATION.md: each store has its own billing_plan (free/starter/pro).
 */

import React from 'react';
import { Badge } from '../ui';
import type { BillingPlan } from '../../tenants/tenantStore';

interface StoreBillingBadgeProps {
  plan?: BillingPlan;
  size?: 'sm' | 'md';
}

const planConfig: Record<string, { color: 'gray' | 'blue' | 'purple'; label: string }> = {
  free: { color: 'gray', label: 'Free' },
  starter: { color: 'blue', label: 'Starter' },
  pro: { color: 'purple', label: 'Pro' },
};

const StoreBillingBadge: React.FC<StoreBillingBadgeProps> = ({ plan = 'free', size = 'sm' }) => {
  const config = planConfig[plan] || planConfig.free;

  return (
    <Badge color={config.color} size={size}>
      {config.label}
    </Badge>
  );
};

export default StoreBillingBadge;

import React, { useState, useEffect } from 'react';
import { Widget, Badge, Loading, SearchAndFilter } from '../ui';
import { useTenantRole } from '../../hooks/useTenantRole';
import { useError } from '../../hooks/useError';
import { tenantAuditLogService } from '../../services/tenant-dashboard/tenantDashboardService';
import type { AuditLogEntry, AuditAction, AuditLogFilters } from '../../services/types/tenant-dashboard.types';
import {
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  XCircleIcon,
  UserMinusIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

// ── Action display config ────────────────────────────────────────────────────

interface ActionDisplayConfig {
  label: string;
  color: 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'gray' | 'orange';
  icon: React.ComponentType<{ className?: string }>;
}

const actionDisplayMap: Record<AuditAction, ActionDisplayConfig> = {
  store_created: { label: 'Store Created', color: 'green', icon: PlusIcon },
  store_deleted: { label: 'Store Deleted', color: 'red', icon: TrashIcon },
  store_deactivated: { label: 'Store Deactivated', color: 'yellow', icon: BuildingStorefrontIcon },
  store_activated: { label: 'Store Activated', color: 'green', icon: BuildingStorefrontIcon },
  user_invited: { label: 'User Invited', color: 'blue', icon: EnvelopeIcon },
  user_removed: { label: 'User Removed', color: 'red', icon: UserMinusIcon },
  user_role_changed: { label: 'Role Changed', color: 'purple', icon: ShieldCheckIcon },
  subscription_updated: { label: 'Subscription Updated', color: 'blue', icon: CreditCardIcon },
  subscription_canceled: { label: 'Subscription Canceled', color: 'red', icon: XCircleIcon },
  subscription_reactivated: { label: 'Subscription Reactivated', color: 'green', icon: ArrowPathIcon },
  plan_changed: { label: 'Plan Changed', color: 'orange', icon: CreditCardIcon },
  tenant_settings_updated: { label: 'Settings Updated', color: 'gray', icon: Cog6ToothIcon },
  billing_updated: { label: 'Billing Updated', color: 'blue', icon: CreditCardIcon },
};

const actionFilterOptions = [
  { id: 'store_created', label: 'Store Created' },
  { id: 'store_deleted', label: 'Store Deleted' },
  { id: 'store_deactivated', label: 'Store Deactivated' },
  { id: 'store_activated', label: 'Store Activated' },
  { id: 'user_invited', label: 'User Invited' },
  { id: 'user_removed', label: 'User Removed' },
  { id: 'user_role_changed', label: 'Role Changed' },
  { id: 'subscription_updated', label: 'Subscription Updated' },
  { id: 'subscription_canceled', label: 'Subscription Canceled' },
  { id: 'plan_changed', label: 'Plan Changed' },
  { id: 'tenant_settings_updated', label: 'Settings Updated' },
];

const AuditLog: React.FC = () => {
  const { can } = useTenantRole();
  const { showError } = useError();

  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const limit = 25;

  const canViewAuditLog = can('canViewAuditLog');

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const filters: AuditLogFilters = { page, limit };
      if (actionFilter) filters.action = actionFilter as AuditAction;

      const response = await tenantAuditLogService.getEntries(filters);
      setEntries(response.entries);
      setTotal(response.total);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canViewAuditLog) {
      fetchEntries();
    }
  }, [canViewAuditLog, page, actionFilter]);

  if (!canViewAuditLog) {
    return (
      <div className="text-center py-12">
        <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">You do not have permission to view the audit log.</p>
      </div>
    );
  }

  // Client-side search filtering (actor name/email, target name)
  const filteredEntries = entries.filter((entry) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      entry.actor_name.toLowerCase().includes(q) ||
      entry.actor_email.toLowerCase().includes(q) ||
      (entry.target_name && entry.target_name.toLowerCase().includes(q))
    );
  });

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const buildDescription = (entry: AuditLogEntry): string => {
    const parts: string[] = [];
    parts.push(entry.actor_name);

    switch (entry.action) {
      case 'store_created':
        parts.push(`created store "${entry.target_name || entry.target_id}"`);
        break;
      case 'store_deleted':
        parts.push(`deleted store "${entry.target_name || entry.target_id}"`);
        break;
      case 'store_deactivated':
        parts.push(`deactivated store "${entry.target_name || entry.target_id}"`);
        break;
      case 'store_activated':
        parts.push(`activated store "${entry.target_name || entry.target_id}"`);
        break;
      case 'user_invited':
        parts.push(`invited ${entry.target_name || entry.target_id} to the tenant`);
        break;
      case 'user_removed':
        parts.push(`removed ${entry.target_name || entry.target_id} from the tenant`);
        break;
      case 'user_role_changed':
        parts.push(`changed role of ${entry.target_name || entry.target_id}`);
        if (entry.details?.from && entry.details?.to) {
          parts.push(`from ${entry.details.from} to ${entry.details.to}`);
        }
        break;
      case 'subscription_updated':
        parts.push('updated the subscription');
        break;
      case 'subscription_canceled':
        parts.push('canceled the subscription');
        break;
      case 'subscription_reactivated':
        parts.push('reactivated the subscription');
        break;
      case 'plan_changed':
        parts.push('changed the subscription plan');
        if (entry.details?.from && entry.details?.to) {
          parts.push(`from ${entry.details.from} to ${entry.details.to}`);
        }
        break;
      case 'tenant_settings_updated':
        parts.push('updated tenant settings');
        break;
      case 'billing_updated':
        parts.push('updated billing information');
        break;
      default:
        parts.push(`performed ${entry.action}`);
    }

    return parts.join(' ');
  };

  if (loading) {
    return <Loading title="Loading Activity Log" description="Fetching audit entries..." />;
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by actor name, email, or target..."
        filterValue={actionFilter}
        onFilterChange={setActionFilter}
        filterOptions={actionFilterOptions}
        filterPlaceholder="All Actions"
      />

      {/* Log entries */}
      <Widget
        title={`Activity Log (${total})`}
        description="Tenant-level actions and changes"
        icon={ClipboardDocumentListIcon}
      >
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {entries.length === 0 ? 'No activity recorded yet.' : 'No entries match your search.'}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredEntries.map((entry, index) => {
              const config = actionDisplayMap[entry.action] || {
                label: entry.action,
                color: 'gray' as const,
                icon: ClipboardDocumentListIcon,
              };
              const ActionIcon = config.icon;

              return (
                <div
                  key={entry.id}
                  className={`flex items-start gap-4 py-4 px-2 ${
                    index < filteredEntries.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  {/* Timeline icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-${config.color}-100`}>
                    <ActionIcon className={`h-4 w-4 text-${config.color}-600`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge color={config.color} size="sm">{config.label}</Badge>
                      <span className="text-xs text-gray-400">{formatTimestamp(entry.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {buildDescription(entry)}
                    </p>
                    {entry.details && Object.keys(entry.details).length > 0 && (
                      <div className="mt-1 text-xs text-gray-400">
                        {Object.entries(entry.details).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key}: <strong>{value}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Simple pagination */}
        {total > limit && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= total}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Widget>
    </div>
  );
};

export default AuditLog;

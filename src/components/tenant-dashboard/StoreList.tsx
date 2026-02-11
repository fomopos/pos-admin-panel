import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Widget,
  Button,
  Badge,
  Alert,
  SearchAndFilter,
  ConfirmDialog,
  Loading,
} from '../ui';
import { useTenantRole } from '../../hooks/useTenantRole';
import { useError } from '../../hooks/useError';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useTenantStore, type Store } from '../../tenants/tenantStore';
import { tenantApiService } from '../../services/tenant/tenantApiService';
import {
  BuildingStorefrontIcon,
  PlusIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  GlobeAltIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { StoreBillingBadge, BillingSummary, ChangePlanModal, DowngradeBanner } from '../billing';

const storeStatusConfig: Record<string, { color: 'green' | 'gray' | 'yellow'; label: string }> = {
  active: { color: 'green', label: 'Active' },
  inactive: { color: 'gray', label: 'Inactive' },
  pending: { color: 'yellow', label: 'Pending' },
};

const StoreList: React.FC = () => {
  const navigate = useNavigate();
  const { can } = useTenantRole();
  const { showError, showInfo } = useError();
  const confirmDialog = useConfirmDialog();
  const { currentTenant, getCurrentTenantStores, fetchStoresForTenant } = useTenantStore();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Change plan modal state
  const [changePlanStore, setChangePlanStore] = useState<Store | null>(null);

  const canManageStores = can('canManageStores');

  // Callback when plan is changed via modal — refresh store list
  const handlePlanChanged = async () => {
    if (currentTenant?.id) {
      await fetchStoresForTenant(currentTenant.id);
      const freshStores = getCurrentTenantStores();
      setStores(freshStores);
    }
    setChangePlanStore(null);
  };

  // Load stores from Zustand (already fetched) or fetch from API
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);

      // First try Zustand cache
      const cachedStores = getCurrentTenantStores();
      if (cachedStores.length > 0) {
        setStores(cachedStores);
        setLoading(false);
        return;
      }

      // If not cached, fetch from API via tenant store
      if (currentTenant?.id) {
        await fetchStoresForTenant(currentTenant.id);
        const freshStores = getCurrentTenantStores();
        setStores(freshStores);
      }
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, getCurrentTenantStores, fetchStoresForTenant, showError]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.store_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeStoreCount = stores.filter((s) => s.status === 'active').length;

  const handleDeactivateStore = (store: Store) => {
    confirmDialog.openDialog(
      async () => {
        try {
          setActionLoading(store.store_id);
          // TODO: When backend supports it, call a deactivate endpoint
          // For now use the storeService to update status
          await tenantApiService.getStore(store.tenant_id, store.store_id);
          setStores((prev) =>
            prev.map((s) => (s.store_id === store.store_id ? { ...s, status: 'inactive' as const } : s))
          );
          showInfo(`Store "${store.store_name}" has been deactivated. Your seat count has been reduced.`);
        } catch (error) {
          showError(error);
        } finally {
          setActionLoading(null);
        }
      },
      {
        title: 'Deactivate Store',
        message: `Are you sure you want to deactivate "${store.store_name}"?\n\nThis will reduce your active seat count from ${activeStoreCount} to ${activeStoreCount - 1}, lowering your monthly billing.`,
        variant: 'warning',
        confirmText: 'Deactivate',
      }
    );
  };

  const handleActivateStore = (store: Store) => {
    confirmDialog.openDialog(
      async () => {
        try {
          setActionLoading(store.store_id);
          // TODO: When backend supports it, call an activate endpoint
          await tenantApiService.getStore(store.tenant_id, store.store_id);
          setStores((prev) =>
            prev.map((s) => (s.store_id === store.store_id ? { ...s, status: 'active' as const } : s))
          );
          showInfo(`Store "${store.store_name}" has been activated. Your seat count has been increased.`);
        } catch (error) {
          showError(error);
        } finally {
          setActionLoading(null);
        }
      },
      {
        title: 'Activate Store',
        message: `Activating "${store.store_name}" will increase your seat count from ${activeStoreCount} to ${activeStoreCount + 1}.\n\nThis will increase your monthly billing.`,
        variant: 'warning',
        confirmText: 'Activate',
      }
    );
  };

  const handleDeleteStore = (store: Store) => {
    confirmDialog.openDialog(
      async () => {
        try {
          setActionLoading(store.store_id);
          // TODO: Implement real delete endpoint — DELETE /v0/store/:storeId
          setStores((prev) => prev.filter((s) => s.store_id !== store.store_id));
          showInfo(`Store "${store.store_name}" has been permanently deleted.`);
        } catch (error) {
          showError(error);
        } finally {
          setActionLoading(null);
        }
      },
      {
        title: 'Delete Store',
        message: `Are you sure you want to permanently delete "${store.store_name}"?\n\nThis action cannot be undone. All store data, transactions, and settings will be lost.`,
        variant: 'danger',
        confirmText: 'Delete Permanently',
      }
    );
  };

  if (loading) {
    return <Loading title="Loading Stores" description="Fetching store list..." />;
  }

  return (
    <div className="space-y-6">
      {/* Billing impact notice */}
      <Alert variant="info">
        <div className="flex items-start gap-2">
          <CurrencyDollarIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Billing is based on number of active stores</p>
            <p className="text-sm text-blue-700 mt-1">
              You currently have <strong>{activeStoreCount} active store{activeStoreCount !== 1 ? 's' : ''}</strong>. Adding or activating a store increases your monthly cost. Deactivating or deleting a store reduces it.
            </p>
          </div>
        </div>
      </Alert>

      {/* Search & Filter */}
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search stores by name, city, or ID..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { id: 'active', label: 'Active' },
          { id: 'inactive', label: 'Inactive' },
          { id: 'pending', label: 'Pending' },
        ]}
        filterPlaceholder="All Statuses"
        actions={
          canManageStores ? (
            <Button variant="primary" size="sm" onClick={() => navigate('/create-store')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Store
            </Button>
          ) : undefined
        }
      />

      {/* Store Cards */}
      <Widget
        title={`Stores (${filteredStores.length})`}
        description="All stores under this tenant"
        icon={BuildingStorefrontIcon}
      >
        {filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <BuildingStorefrontIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {stores.length === 0 ? 'No stores yet. Create your first store to get started.' : 'No stores match your search criteria.'}
            </p>
            {canManageStores && stores.length === 0 && (
              <Button variant="primary" onClick={() => navigate('/create-store')}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create First Store
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredStores.map((store) => {
              const status = storeStatusConfig[store.status] || storeStatusConfig.active;
              const isActionLoading = actionLoading === store.store_id;

              return (
                <div
                  key={store.store_id}
                  className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{store.store_name}</h4>
                        <Badge color={status.color} size="sm">{status.label}</Badge>
                        <StoreBillingBadge plan={store.billing_plan} />
                        {store.pending_plan && store.downgrade_effective_at && (
                          <DowngradeBanner
                            storeId={store.store_id}
                            currentPlan={store.billing_plan || 'free'}
                            pendingPlan={store.pending_plan}
                            downgradeEffectiveAt={store.downgrade_effective_at}
                            onDowngradeCancelled={handlePlanChanged}
                            compact
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{store.store_id}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {store.address?.city && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-3 w-3" />
                            {store.address.city}{store.address.country ? `, ${store.address.country}` : ''}
                          </span>
                        )}
                        <span>{store.store_type} • {store.location_type}</span>
                        <span className="flex items-center gap-1">
                          <GlobeAltIcon className="h-3 w-3" />
                          <span className="uppercase">{store.currency}</span>
                        </span>
                        {store.timezone && (
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {store.timezone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canManageStores && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setChangePlanStore(store)}
                      >
                        <SparklesIcon className="h-3.5 w-3.5 mr-1" />
                        Plan
                      </Button>
                      {store.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateStore(store)}
                          disabled={isActionLoading}
                          isLoading={isActionLoading}
                        >
                          Deactivate
                        </Button>
                      )}
                      {store.status === 'inactive' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivateStore(store)}
                          disabled={isActionLoading}
                          isLoading={isActionLoading}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteStore(store)}
                        disabled={isActionLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Widget>

      {/* Billing Summary */}
      <BillingSummary stores={stores} />

      {/* Change Plan Modal */}
      {changePlanStore && (
        <ChangePlanModal
          isOpen={!!changePlanStore}
          onClose={() => setChangePlanStore(null)}
          storeId={changePlanStore.store_id}
          storeName={changePlanStore.store_name}
          currentPlan={changePlanStore.billing_plan || 'free'}
          pendingPlan={changePlanStore.pending_plan}
          downgradeEffectiveAt={changePlanStore.downgrade_effective_at}
          onPlanChanged={handlePlanChanged}
        />
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

export default StoreList;

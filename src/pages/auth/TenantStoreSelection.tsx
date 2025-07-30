import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BuildingOfficeIcon, BuildingStorefrontIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTenantStore } from '../../tenants/tenantStore';
import { authService } from '../../auth/authService';
import { tenantAccessService } from '../../services/tenant/tenantAccessService';
import Button from '../../components/ui/Button';
import { Loading } from '../../components/ui';
import CreateTenantForm from './CreateTenantForm';

const TenantStoreSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    tenants, 
    currentTenant, 
    currentStore, 
    fetchTenants, 
    fetchStoresForTenant,
    switchTenant, 
    switchStore,
    clearSelection,
    getCurrentTenantStores,
    isLoading 
  } = useTenantStore();

  // Helper function to safely capitalize status strings
  const capitalizeStatus = (status: string | undefined): string => {
    if (!status || typeof status !== 'string') {
      return 'Unknown';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  const [step, setStep] = useState<'tenant' | 'store' | 'create-tenant'>('tenant');
  const [loadingStores, setLoadingStores] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [shouldOfferTenantCreation, setShouldOfferTenantCreation] = useState(true);
  const [checkingTenantAccess, setCheckingTenantAccess] = useState(false);

  // Debug: Track component mount/unmount
  useEffect(() => {
    console.log('🎬 TenantStoreSelection component mounted');
    return () => {
      console.log('🎬 TenantStoreSelection component unmounted');
    };
  }, []);

  // Debug: Track state changes
  useEffect(() => {
    console.log('📊 TenantStoreSelection state change:', {
      step,
      hasInitialized,
      tenantCount: tenants.length,
      currentTenant: currentTenant ? currentTenant.id : null,
      currentStore: currentStore ? currentStore.store_id : null,
      isLoading,
      timestamp: new Date().toISOString()
    });
  }, [step, hasInitialized, tenants.length, currentTenant, currentStore, isLoading]);

  // Get intended destination from location state
  const intendedDestination = (location.state as any)?.from?.pathname || 
                             (location.state as any)?.intendedDestination || 
                             '/dashboard';

  useEffect(() => {
    const initializeSelection = async () => {
      if (hasInitialized) return;
      
      console.log('🔄 Initializing TenantStoreSelection');
      console.log('Current state before initialization:', {
        currentTenant: currentTenant ? currentTenant.id : null,
        currentStore: currentStore ? currentStore.store_id : null,
        tenantsLoaded: tenants.length > 0
      });
      
      // Always clear selections when arriving at this page
      // This forces the user to go through the proper flow
      clearSelection();
      
      // If we already have tenants loaded, skip the API call
      if (tenants.length > 0) {
        console.log('✅ Tenants already loaded, skipping fetchTenants call');
        setStep('tenant');
        setHasInitialized(true);
        return;
      }
      
      try {
        const user = await authService.getCurrentUser();
        console.log('👤 Current user for tenant fetch:', user);
        
        if (user?.email) {
          console.log('📞 Calling fetchTenants with email:', user.email);
          await fetchTenants(user.email, true); // Clear selections when fetching for initial selection
          console.log('✅ fetchTenants completed successfully');
        } else {
          console.warn('⚠️ No user email found, cannot fetch tenants');
        }
      } catch (error) {
        console.error('❌ Error during initialization:', error);
      }
      
      setStep('tenant');
      setHasInitialized(true);
      console.log('✅ Initialization complete');
    };
    
    initializeSelection();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove dependencies to prevent re-initialization

  // Separate effect to check for tenant creation offer after tenants are loaded
  useEffect(() => {
    const checkTenantCreationOffer = async () => {
      if (!hasInitialized || checkingTenantAccess) return;
      
      setCheckingTenantAccess(true);
      try {
        const shouldOffer = await tenantAccessService.shouldOfferTenantCreation();
        console.log('🔍 Should offer tenant creation:', shouldOffer);
        setShouldOfferTenantCreation(shouldOffer);
        
        // If no tenants found but user has super admin role, show tenant creation
        if (tenants.length === 0 && shouldOffer) {
          console.log('🏢 No tenants found but user has super admin role, offering tenant creation');
          setStep('create-tenant');
        }
      } catch (error) {
        console.error('❌ Error checking tenant access:', error);
        // Continue with normal flow even if access check fails
        setShouldOfferTenantCreation(false);
      } finally {
        setCheckingTenantAccess(false);
      }
    };
    
    checkTenantCreationOffer();
  }, [hasInitialized, tenants.length]);

  useEffect(() => {
    // Only redirect if user completes the selection flow properly
    // Add debugging to understand what's happening
    console.log('🔍 Navigation Effect:', {
      currentTenant: currentTenant ? currentTenant.id : null,
      currentStore: currentStore ? currentStore.store_id : null,
      intendedDestination,
      step,
      hasInitialized,
      timestamp: new Date().toISOString()
    });
    
    // Only navigate if we've initialized and have both selections
    if (hasInitialized && currentTenant && currentStore) {
      console.log('✅ Both tenant and store selected, navigating to:', intendedDestination);
      // Add a slightly longer delay to ensure state is definitely persisted
      const timer = setTimeout(() => {
        navigate(intendedDestination, { replace: true });
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [currentTenant, currentStore, navigate, intendedDestination, step, hasInitialized]);

  const handleTenantSelect = async (tenantId: string) => {
    setLoadingStores(true);
    
    try {
      // First switch to the selected tenant (now async with server selection)
      await switchTenant(tenantId);
      
      // Then fetch stores for this tenant
      console.log('🔄 Fetching stores for selected tenant:', tenantId);
      await fetchStoresForTenant(tenantId);
      
      // Debug: Log the stores data to see what we're getting
      const stores = getCurrentTenantStores();
      console.log('📦 Stores received for tenant:', {
        tenantId,
        storeCount: stores.length,
        stores: stores.map(store => ({
          store_id: store.store_id,
          store_name: store.store_name,
          status: store.status,
          location_type: store.location_type,
          description: store.description,
          hasNullValues: {
            store_name: store.store_name === null,
            status: store.status === null,
            location_type: store.location_type === null,
            description: store.description === null
          }
        }))
      });

      console.log('✅ Stores fetched successfully, moving to store selection');
      setStep('store');
    } catch (error) {
      console.error('❌ Error selecting tenant or fetching stores:', error);
    } finally {
      setLoadingStores(false);
    }
  };

  const handleStoreSelect = async (storeId: string) => {
    try {
      await switchStore(storeId);
      // Navigation will happen automatically via useEffect when currentStore is set
    } catch (error) {
      console.error('Failed to select store:', error);
      // The store switch might have failed, but currentStore might still be set from cache
      // Let the useEffect handle the navigation
    }
  };

  const handleBackToTenants = () => {
    console.log('🔙 Going back to tenant selection');
    setStep('tenant');
    // Clear only current selections without triggering refetch
    // We already have the tenants data, so just clear the current selections
    const { setCurrentTenant, setCurrentStore } = useTenantStore.getState();
    setCurrentTenant(null);
    setCurrentStore(null);
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate('/auth/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleCreateTenant = () => {
    console.log('🏢 User wants to create a new tenant');
    setStep('create-tenant');
  };

  const handleTenantCreated = async (tenantId: string) => {
    console.log('✅ Tenant created successfully:', tenantId);
    
    // Refresh tenants and go back to tenant selection
    try {
      const user = await authService.getCurrentUser();
      if (user?.email) {
        await fetchTenants(user.email, true);
      }
    } catch (error) {
      console.error('❌ Error refreshing tenants after creation:', error);
    }
    
    setStep('tenant');
  };

  const handleCancelTenantCreation = () => {
    console.log('❌ User cancelled tenant creation');
    setStep('tenant');
  };

  if (isLoading || checkingTenantAccess) {
    return (
      <Loading
        title={checkingTenantAccess ? "Checking Access" : "Loading Organizations"}
        description={checkingTenantAccess ? "Verifying your permissions..." : "Please wait while we fetch your organizations and stores..."}
        fullScreen={true}
        size="lg"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {step === 'create-tenant' ? 'Create Organization' : 
             step === 'tenant' ? 'Select Organization' : 'Select Store'}
          </h1>
          <p className="text-slate-500">
            {step === 'create-tenant' ? 'Set up a new organization for your POS system' :
             step === 'tenant' ? 'Choose the organization you want to manage' : 
             'Select a store within your organization'}
          </p>
        </div>

        {/* Step Indicator - Only show for tenant/store selection */}
        {step !== 'create-tenant' && (
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                step === 'tenant' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                <BuildingOfficeIcon className="h-5 w-5" />
                <span className="font-medium">Organization</span>
                {step !== 'tenant' && <span className="text-green-600">✓</span>}
              </div>
              <ChevronRightIcon className="h-5 w-5 text-slate-400" />
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                step === 'store' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
              }`}>
                <BuildingStorefrontIcon className="h-5 w-5" />
                <span className="font-medium">Store</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
          {step === 'create-tenant' ? (
            /* Tenant Creation */
            <CreateTenantForm 
              onSuccess={handleTenantCreated}
              onCancel={handleCancelTenantCreation}
            />
          ) : step === 'tenant' ? (
            /* Tenant Selection */
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Available Organizations</h2>
              
              {!tenants || tenants.length === 0 ? (
                <div className="text-center py-12">
                  <BuildingOfficeIcon className="h-16 w-16 text-slate-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">No Organizations Found</h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    {shouldOfferTenantCreation
                      ? "You don't have access to any organizations yet. Create a new organization to get started with your POS system."
                      : "You don't have access to any organizations. Please contact your administrator for access."
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {shouldOfferTenantCreation && (
                      <Button onClick={handleCreateTenant} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Organization
                      </Button>
                    )}
                    <Button onClick={handleSignOut} variant="outline">
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-slate-500">
                        Select an organization to manage
                      </p>
                    </div>
                    {shouldOfferTenantCreation && (
                      <Button onClick={handleCreateTenant} variant="outline" size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create New
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tenants.map((tenant) => {
                      // Add safety check for tenant object and required properties
                      if (!tenant || !tenant.id || !tenant.name) {
                        console.warn('Invalid tenant object found:', tenant);
                        return null;
                      }
                      
                      const storeCount = (tenant.stores || []).length;
                      
                      return (
                      <button
                        key={tenant.id}
                        onClick={() => handleTenantSelect(tenant.id)}
                        disabled={loadingStores}
                        className="text-left p-6 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">
                              {tenant.name}
                            </h3>
                            <p className="text-sm text-slate-500 mb-2">
                              {tenant.contact_email}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-slate-400">
                              <span className={`px-2 py-1 rounded-full ${
                                tenant.status === 'active' ? 'bg-green-100 text-green-700' :
                                tenant.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {capitalizeStatus(tenant.status)}
                              </span>
                              <span>{storeCount} store{storeCount !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                        </div>
                      </button>
                      );
                    })}
                    
                    {/* Add New Organization Card - Show only if user can create tenants */}
                    {shouldOfferTenantCreation && (
                      <button
                        onClick={handleCreateTenant}
                        className="text-left p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex flex-col items-center justify-center min-h-[140px]"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                          <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">Add New Organization</h3>
                        <p className="text-sm text-slate-500 text-center">
                          Create another organization to manage
                        </p>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Store Selection */
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {currentTenant?.name} - Select Store
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Choose the store you want to manage
                  </p>
                </div>
                <Button 
                  onClick={handleBackToTenants}
                  variant="outline"
                  size="sm"
                >
                  ← Back to Organizations
                </Button>
              </div>

              {getCurrentTenantStores().length === 0 ? (
                <div className="text-center py-12">
                  <BuildingStorefrontIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Stores Found</h3>
                  <p className="text-slate-500 mb-6">
                    This organization doesn't have any stores set up yet. Create your first store to get started.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => navigate('/create-store')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Create First Store
                    </Button>
                    <Button onClick={handleBackToTenants} variant="outline">
                      Choose Different Organization
                    </Button>
                    <Button onClick={handleSignOut} variant="outline">
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      const validStores = getCurrentTenantStores()
                        .filter(store => {
                          // Filter out stores with missing critical information
                          if (!store || !store.store_id) {
                            console.warn('Store missing store_id:', store);
                            return false;
                          }
                          // Allow stores even if store_name is null - we'll show fallback
                          return true;
                        });

                      if (validStores.length === 0) {
                        return (
                          <div className="col-span-full text-center py-12">
                            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No stores available</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Get started by creating your first store.
                            </p>
                            <div className="mt-6">
                              <button
                                onClick={() => navigate('/create-store')}
                                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                              >
                                Create Store
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return validStores.map((store) => (
                        <button
                          key={store.store_id}
                          onClick={() => handleStoreSelect(store.store_id)}
                          className="text-left p-6 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                {store.store_name || 'Unnamed Store'}
                              </h3>
                              {store.description && store.description.trim() && (
                                <p className="text-sm text-slate-500 mb-2">
                                  {store.description}
                                </p>
                              )}
                              <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400">
                                <span className={`px-2 py-1 rounded-full ${
                                  store.status === 'active' ? 'bg-green-100 text-green-700' :
                                  store.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {capitalizeStatus(store.status)}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                  {store.location_type || 'General'}
                                </span>
                                {store.address && (store.address.city || store.address.state) && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    {[store.address.city, store.address.state].filter(Boolean).join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                          </div>
                        </button>
                      ));
                    })()}
                    
                    {/* Add New Store Card */}
                    <button
                      onClick={() => navigate('/create-store')}
                      className="text-left p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex flex-col items-center justify-center min-h-[140px]"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">Add New Store</h3>
                      <p className="text-sm text-slate-500 text-center">
                        Create another store for this organization
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Need help? Contact support
            </p>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantStoreSelection;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  TableCellsIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { Button, PageHeader, Alert, EnhancedTabs, ConfirmDialog, Loading, Widget, DropdownSearch, InputTextField, InputTextArea } from '../components/ui';
import { EditableCard } from '../components/tax';
import { useDeleteConfirmDialog, useDiscardChangesDialog } from '../hooks/useConfirmDialog';
import { taxServices } from '../services/tax';
import type {
  TaxAuthority,
  TaxGroup,
  TaxRule,
  TaxConfiguration,
  CreateTaxConfigurationRequest
} from '../services/tax';

const TaxSettings: React.FC = () => {
  const { t } = useTranslation();
  const { currentTenant, currentStore } = useTenantStore();
  const [taxConfig, setTaxConfig] = useState<TaxConfiguration | null>(null);
  const [originalTaxConfig, setOriginalTaxConfig] = useState<TaxConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('authorities');
  const [editingItems, setEditingItems] = useState<Record<string, boolean>>({});

  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialog hooks
  const deleteDialog = useDeleteConfirmDialog();
  const discardDialog = useDiscardChangesDialog();

  // Fetch tax configuration using services
  useEffect(() => {
    const fetchTaxConfig = async () => {
      if (!currentTenant?.id) {
        console.warn('No tenant selected, cannot fetch tax configuration');
        setIsLoading(false);
        setFetchError('Please select a tenant to configure tax settings');
        return;
      }

      setIsLoading(true);
      setFetchError(null);
      setErrors({});
      
      console.log(`[API Call 1] Starting tax configuration fetch for tenant: ${currentTenant.id}`);
      
      try {
        // Use the real tax configuration service with tenant ID, store ID, and country
        const storeId = currentStore?.store_id || "*";
        const country = currentStore?.address?.country;
        
        const config = await taxServices.configuration.getTaxConfiguration(
          currentTenant.id, 
          storeId, 
          country
        );
        
        if (config) {
          console.log('[API Call 1] Tax configuration loaded successfully from API');
          setTaxConfig(config);
          setOriginalTaxConfig(JSON.parse(JSON.stringify(config))); // Deep clone
          setFetchError(null);
        } else {
          console.warn('[API Call 1] No tax configuration returned from API');
          setFetchError('No tax configuration found for this tenant. Please create a new configuration.');
          setTaxConfig(null);
        }
      } catch (error) {
        console.error('[API Call 1] Failed to fetch tax configuration:', error);
        
        // Check if this is a 404 (no configuration exists) or other error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          console.log('[API Call 1] 404 error - no tax configuration exists');
          setFetchError('No tax configuration found for this tenant. Please create a new configuration.');
          setTaxConfig(null);
        } else {
          console.error('[API Call 1] API error occurred:', errorMessage);
          setFetchError(`Failed to load tax configuration: ${errorMessage}`);
          setTaxConfig(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaxConfig();
  }, [currentTenant]);

  // Check for changes
  useEffect(() => {
    if (taxConfig && originalTaxConfig) {
      setHasChanges(JSON.stringify(taxConfig) !== JSON.stringify(originalTaxConfig));
    }
  }, [taxConfig, originalTaxConfig]);

  const tabs = [
    { id: 'authorities', name: t('taxSettings.tabs.authorities'), icon: BuildingOfficeIcon },
    { id: 'groups', name: t('taxSettings.tabs.groups'), icon: TableCellsIcon },
    { id: 'location', name: t('taxSettings.tabs.location'), icon: ClipboardDocumentListIcon },
    { id: 'settings', name: t('taxSettings.tabs.settings'), icon: Cog6ToothIcon },
  ];

  const handleFieldChange = (type: 'authority' | 'group' | 'location', itemIndex: number, field: string, value: any) => {
    if (!taxConfig) return;

    setTaxConfig(prev => {
      if (!prev) return prev;
      
      if (type === 'authority') {
        return {
          ...prev,
          authority: prev.authority?.map((auth, index) => {
            return index === itemIndex
              ? { 
                  ...auth, 
                  [field]: field === 'rounding_digit' ? (parseFloat(value) || 0) : value 
                }
              : auth;
          })
        };
      } else if (type === 'group') {
        return {
          ...prev,
          tax_group: prev.tax_group.map((group, index) => {
            return index === itemIndex
              ? { ...group, [field]: value }
              : group;
          })
        };
      } else if (type === 'location') {
        return {
          ...prev,
          tax_location: { ...prev.tax_location, [field]: value }
        };
      }
      return prev;
    });

    // Clear any existing errors for this field
    const errorKey = `${type}_${itemIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleRuleFieldChange = (groupId: string, ruleSeq: number, field: string, value: any) => {
    if (!taxConfig) return;

    setTaxConfig(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        tax_group: prev.tax_group.map(group =>
          group.tax_group_id === groupId
            ? {
                ...group,
                group_rule: group.group_rule.map(rule =>
                  rule.tax_rule_seq === ruleSeq
                    ? { 
                        ...rule, 
                        [field]: field === 'percentage' ? (parseFloat(value) || 0) : value 
                      }
                    : rule
                )
              }
            : group
        )
      };
    });

    // Clear any existing errors for this field
    const errorKey = `rule_${groupId}_${ruleSeq}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const toggleEdit = (type: string, id: string) => {
    const key = `${type}_${id}`;
    setEditingItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const addNewRule = (groupId: string) => {
    if (!taxConfig) return;

    const group = taxConfig.tax_group.find(g => g.tax_group_id === groupId);
    if (!group) return;

    const maxSeq = group.group_rule.length > 0 
      ? Math.max(...group.group_rule.map(r => r.tax_rule_seq))
      : 0;

    const newRule: TaxRule = {
      tax_rule_seq: maxSeq + 1,
      tax_authority_id: taxConfig.authority[0]?.authority_id || 'AUTH_DEFAULT',
      name: 'New Tax Rule',
      description: 'New tax rule description',
      tax_type_code: 'VAT',
      fiscal_tax_id: 'A',
      effective_datetime: null,
      expr_datetime: null,
      percentage: 0,
      amount: null
    };

    setTaxConfig(prev => ({
      ...prev!,
      tax_group: prev!.tax_group.map(g =>
        g.tax_group_id === groupId
          ? { ...g, group_rule: [...g.group_rule, newRule] }
          : g
      )
    }));

    // Set the new rule to editing mode
    setEditingItems(prev => ({
      ...prev,
      [`rule_${groupId}_${newRule.tax_rule_seq}`]: true
    }));
  };

  const deleteRule = (groupId: string, ruleSeq: number) => {
    if (!taxConfig) return;

    const group = taxConfig.tax_group.find(g => g.tax_group_id === groupId);
    const rule = group?.group_rule.find(r => r.tax_rule_seq === ruleSeq);
    const ruleName = rule ? rule.name : 'this tax rule';

    deleteDialog.openDeleteDialog(ruleName, () => {
      setTaxConfig(prev => ({
        ...prev!,
        tax_group: prev!.tax_group.map(group =>
          group.tax_group_id === groupId
            ? {
                ...group,
                group_rule: group.group_rule.filter(rule => rule.tax_rule_seq !== ruleSeq)
              }
            : group
        )
      }));

      // Remove from editing items
      const key = `rule_${groupId}_${ruleSeq}`;
      setEditingItems(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    });
  };

  const addNewItem = (type: 'authority' | 'group') => {
    if (!taxConfig) return;

    if (type === 'authority') {
      const newAuthority: TaxAuthority = {
        authority_id: `AUTH_${Date.now()}`,
        name: 'New Authority',
        rounding_code: 'HALF_UP',
        rounding_digit: 2
      };
      setTaxConfig(prev => ({
        ...prev!,
        authority: [...prev?.authority ?? [], newAuthority]
      }));
      setEditingItems(prev => ({
        ...prev,
        [`authority_${newAuthority.authority_id}`]: true
      }));
    } else if (type === 'group') {
      const newGroup: TaxGroup = {
        tax_group_id: `GROUP_${Date.now()}`,
        name: 'New Group',
        description: 'New tax group description',
        group_rule: []
      };
      setTaxConfig(prev => ({
        ...prev!,
        tax_group: [...prev?.tax_group ?? [], newGroup]
      }));
      setEditingItems(prev => ({
        ...prev,
        [`group_${newGroup.tax_group_id}`]: true
      }));
    }
  };

  const deleteItem = (type: 'authority' | 'group', id: string) => {
    if (!taxConfig) return;

    const itemName = type === 'authority' 
      ? taxConfig.authority.find(auth => auth.authority_id === id)?.name || 'this item'
      : taxConfig.tax_group.find(group => group.tax_group_id === id)?.name || 'this item';

    deleteDialog.openDeleteDialog(itemName, () => {
      if (type === 'authority') {
        setTaxConfig(prev => ({
          ...prev!,
          authority: prev!.authority.filter(auth => auth.authority_id !== id)
        }));
      } else if (type === 'group') {
        setTaxConfig(prev => ({
          ...prev!,
          tax_group: prev!.tax_group.filter(group => group.tax_group_id !== id)
        }));
      }

      // Remove from editing items
      const key = `${type}_${id}`;
      setEditingItems(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    });
  };

  const saveAllChanges = async () => {
    if (!taxConfig || !hasChanges || !currentTenant?.id) return;

    setIsSaving(true);
    setErrors({});
    setSuccessMessage(null);
    
    try {
      console.log('Saving tax configuration changes...');
      
      const requestData: CreateTaxConfigurationRequest = {
        authority: taxConfig.authority,
        tax_location: taxConfig.tax_location,
        tax_group: taxConfig.tax_group
      };

      let updatedConfig: TaxConfiguration;
      const storeId = currentStore?.store_id || "*";

      // Check if this is a new configuration or updating existing one
      if (originalTaxConfig) {
        console.log('Updating existing tax configuration');
        updatedConfig = await taxServices.configuration.updateTaxConfiguration(currentTenant.id, storeId, requestData);
        setSuccessMessage('Tax configuration updated successfully');
      } else {
        console.log('Creating new tax configuration');
        updatedConfig = await taxServices.configuration.createTaxConfiguration(currentTenant.id, storeId, requestData);
        setSuccessMessage('Tax configuration created successfully');
      }
      
      // Update both current and original config to reflect saved state
      setTaxConfig(updatedConfig);
      setOriginalTaxConfig(JSON.parse(JSON.stringify(updatedConfig)));
      setEditingItems({});
      setErrors({});
      setFetchError(null);
      
      console.log('Tax configuration saved successfully:', updatedConfig);
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
    } catch (error) {
      console.error('Failed to save tax configuration:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors({ submit: `Failed to save changes: ${errorMessage}` });
      setSuccessMessage(null);
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    discardDialog.openDiscardDialog(() => {
      if (originalTaxConfig) {
        // Restore to original configuration
        setTaxConfig(JSON.parse(JSON.stringify(originalTaxConfig)));
      } else {
        // For new configurations, clear the form
        setTaxConfig(null);
        setFetchError('No tax configuration available. Please reload the page to fetch data.');
      }
      
      setEditingItems({});
      setErrors({});
      setSuccessMessage(null);
    });
  };

  const getTotalTaxRate = (group: TaxGroup) => {
    return group.group_rule.reduce((total, rule) => total + rule.percentage, 0);
  };

  if (isLoading) {
    return (
      <Loading
        title={t('taxSettings.loading.title')}
        description={t('taxSettings.loading.description')}
        variant="primary"
      />
    );
  }

  if (fetchError && !taxConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('taxSettings.noConfiguration.title')}</h3>
          <p className="text-gray-500 mb-4">{fetchError}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('taxSettings.noConfiguration.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  if (!taxConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <ExclamationTriangleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('taxSettings.noTenant.title')}</h3>
          <p className="text-gray-500 mb-4">
            {currentTenant?.id 
              ? t('taxSettings.noTenant.tenantDescription')
              : t('taxSettings.noTenant.selectDescription')
            }
          </p>
          {!currentTenant?.id && (
            <Button 
              onClick={() => window.history.back()} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('taxSettings.noTenant.goBack')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <PageHeader
        title={t('taxSettings.title')}
        description={t('taxSettings.description')}
      >
        {/* Save/Discard Actions */}
        {hasChanges && (
          <div className="flex items-center space-x-3">
            <Button
              onClick={discardChanges}
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-100 bg-white"
            >
              <span>{t('taxSettings.discardChanges')}</span>
            </Button>
            <Button
              onClick={saveAllChanges}
              disabled={isSaving}
              size="sm"
              className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white disabled:bg-gray-400 shadow-sm"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('taxSettings.saving')}</span>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="h-4 w-4" />
                  <span>{t('taxSettings.saveAllChanges')}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </PageHeader>

      {/* Unsaved Changes Alert */}
      {hasChanges && (
        <Alert variant="warning" className="mb-4">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <div>
            <p className="font-medium">{t('taxSettings.unsavedChanges')}</p>
            <p className="text-sm opacity-90 mt-1">
              {t('taxSettings.unsavedDescription')}
            </p>
          </div>
        </Alert>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" className="mb-4">
          <CheckCircleIcon className="h-5 w-5" />
          {successMessage}
        </Alert>
      )}

      {/* Warning for sample data */}
      {fetchError && taxConfig && (
        <Alert variant="warning" className="mb-4">
          <ExclamationTriangleIcon className="h-5 w-5" />
          {fetchError}
        </Alert>
      )}

      {/* New tenant setup message */}
      {!originalTaxConfig && taxConfig && !fetchError && (
        <Alert variant="info" className="mb-4">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-bold">!</span>
            </div>
            <div>
              <p className="font-medium">Welcome! Setting up your tax configuration</p>
              <p className="text-sm opacity-90 mt-1">
                We've loaded a template configuration to get you started. 
                Review and modify the settings below, then save to create your tax configuration.
              </p>
            </div>
          </div>
        </Alert>
      )}

      {/* Tax Configuration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Widget
          title={t('taxSettings.stats.totalAuthorities')}
          icon={BuildingOfficeIcon}
          variant="primary"
          size="sm"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-900">{taxConfig?.authority?.length || 0}</p>
            <p className="text-sm text-blue-600 mt-1">{t('taxSettings.stats.authoritiesConfigured')}</p>
          </div>
        </Widget>
        
        <Widget
          title={t('taxSettings.stats.taxGroups')}
          icon={TableCellsIcon}
          variant="success"
          size="sm"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-green-900">{taxConfig?.tax_group?.length || 0}</p>
            <p className="text-sm text-green-600 mt-1">{t('taxSettings.stats.groupsWithRules')}</p>
          </div>
        </Widget>
        
        <Widget
          title={t('taxSettings.stats.taxLocation')}
          icon={ClipboardDocumentListIcon}
          variant="warning"
          size="sm"
        >
          <div className="text-center">
            <p className="text-lg font-bold text-amber-900">{taxConfig?.tax_location?.name || t('taxSettings.stats.notSet')}</p>
            <p className="text-sm text-amber-600 mt-1">{t('taxSettings.stats.currentLocation')}</p>
          </div>
        </Widget>
        
        <Widget
          title={t('taxSettings.stats.totalRules')}
          icon={CurrencyDollarIcon}
          variant="default"
          size="sm"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {taxConfig?.tax_group?.reduce((total, group) => total + (group?.group_rule?.length || 0), 0) || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">{t('taxSettings.stats.rulesDefined')}</p>
          </div>
        </Widget>
      </div>

      {/* Tab Navigation */}
      <EnhancedTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        allowOverflow={true}
      >
        {/* Tab Content */}
        {activeTab === 'authorities' && (
          <Widget
            title="Tax Authorities"
            description="Configure tax authorities that will apply taxes to your products"
            icon={BuildingOfficeIcon}
            variant="primary"
            className='overflow-visible'
            headerActions={
              <Button
                onClick={() => addNewItem('authority')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Authority
              </Button>
            }
          >
            <div className="space-y-4">
              {taxConfig?.authority?.map((authority, index) => {
                const isEditing = editingItems[`authority_${index}`];
                return (
                  <EditableCard
                    key={`auth-${index}`}
                    isEditing={isEditing}
                    onToggleEdit={() => toggleEdit('authority', index.toString())}
                    onDelete={() => deleteItem('authority', authority.authority_id)}
                  >
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputTextField
                            label="Authority ID"
                            value={authority.authority_id}
                            onChange={(value) => handleFieldChange('authority', index, 'authority_id', value)}
                            placeholder="e.g., CGST001"
                          />
                          <InputTextField
                            label="Authority Name"
                            value={authority.name}
                            onChange={(value) => handleFieldChange('authority', index, 'name', value)}
                            placeholder="e.g., Central GST"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DropdownSearch
                            label="Rounding Code"
                            value={authority.rounding_code}
                            onSelect={(option) => handleFieldChange('authority', index, 'rounding_code', option?.id)}
                            options={[
                              { id: 'HALF_UP', label: 'Half Up' },
                              { id: 'HALF_DOWN', label: 'Half Down' },
                              { id: 'UP', label: 'Up' },
                              { id: 'DOWN', label: 'Down' }
                            ]}
                            placeholder="Select rounding method"
                          />
                          <InputTextField
                            label="Rounding Digits"
                            type="number"
                            value={authority.rounding_digit.toString()}
                            onChange={(value) => handleFieldChange('authority', index, 'rounding_digit', value)}
                            placeholder="0-10"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{authority.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">ID: {authority.authority_id}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Rounding:</span>
                            <span className="font-medium">{authority.rounding_code}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Digits:</span>
                            <span className="font-medium">{authority.rounding_digit}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </EditableCard>
                );
              })}
              {(!taxConfig?.authority || taxConfig.authority.length === 0) && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Tax Authorities</h3>
                  <p className="text-gray-500 mb-4">Create your first tax authority to get started.</p>
                  <Button
                    onClick={() => addNewItem('authority')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Authority
                  </Button>
                </div>
              )}
            </div>
          </Widget>
        )}

          {activeTab === 'groups' && (
            <Widget
              title="Tax Groups"
              description="Organize tax rules into groups for easier management"
              icon={TableCellsIcon}
              variant="success"
              headerActions={
                <Button
                  onClick={() => addNewItem('group')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Group
                </Button>
              }
            >
              <div className="space-y-6">
                {taxConfig?.tax_group?.map((group, index) => {
                  const isEditing = editingItems[`group_${index}`];
                  return (
                    <EditableCard
                      key={`group-${index}`}
                      isEditing={isEditing}
                      onToggleEdit={() => toggleEdit('group', index.toString())}
                      onDelete={() => deleteItem('group', group.tax_group_id)}
                    >
                      <div className="space-y-4">
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputTextField
                                label="Tax Group ID"
                                value={group.tax_group_id}
                                onChange={(value) => handleFieldChange('group', index, 'tax_group_id', value)}
                                placeholder="e.g., TG001"
                              />
                              <InputTextField
                                label="Group Name"
                                value={group.name}
                                onChange={(value) => handleFieldChange('group', index, 'name', value)}
                                placeholder="e.g., Standard GST"
                              />
                            </div>
                            <InputTextArea
                              label="Description"
                              value={group.description}
                              onChange={(value) => handleFieldChange('group', index, 'description', value)}
                              placeholder="Enter group description"
                              rows={3}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                {getTotalTaxRate(group).toFixed(2)}% Total
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">ID: {group.tax_group_id}</p>
                            <p className="text-sm text-gray-600">{group.description}</p>
                          </>
                        )}

                        {/* Tax Rules Section */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-700">Tax Rules ({group.group_rule.length})</p>
                            <button
                              onClick={() => addNewRule(group.tax_group_id)}
                              className="px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-md text-sm font-medium transition-colors"
                            >
                              <PlusIcon className="h-3 w-3 inline mr-1" />
                              Add Rule
                            </button>
                          </div>
                          
                          {group.group_rule.length > 0 ? (
                            <div className="space-y-2">
                              {group.group_rule.map((rule) => {
                                const ruleKey = `rule_${group.tax_group_id}_${rule.tax_rule_seq}`;
                                const isRuleEditing = editingItems[ruleKey];
                                
                                return (
                                  <div key={rule.tax_rule_seq} className="p-3 bg-gray-50 rounded-lg border">
                                    {isRuleEditing ? (
                                      <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <InputTextField
                                            label="Name"
                                            value={rule.name}
                                            onChange={(value) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'name', value)}
                                            placeholder="Rule name"
                                          />
                                          <DropdownSearch
                                            label="Tax Authority"
                                            value={rule.tax_authority_id}
                                            onSelect={(option) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'tax_authority_id', option?.id)}
                                            options={taxConfig?.authority?.map(auth => ({
                                              id: auth.authority_id,
                                              label: auth.name
                                            })) || []}
                                            placeholder="Select authority"
                                          />
                                          <InputTextField
                                            label="Percentage (%)"
                                            type="number"
                                            value={rule.percentage.toString()}
                                            onChange={(value) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'percentage', value)}
                                            placeholder="0.00"
                                            step={0.01}
                                            min={0}
                                            max={100}
                                          />
                                          <DropdownSearch
                                            label="Tax Type Code"
                                            value={rule.tax_type_code}
                                            onSelect={(option) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'tax_type_code', option?.id)}
                                            options={[
                                              { 
                                                id: 'VAT', 
                                                label: 'VAT', 
                                                description: 'Value Added Tax - Tax applied at each stage of production/distribution' 
                                              },
                                              { 
                                                id: 'SALES', 
                                                label: 'SALES', 
                                                description: 'Sales Tax - Tax applied at the point of sale to the end consumer' 
                                              }
                                            ]}
                                            placeholder="Select tax type"
                                          />
                                        </div>
                                        <InputTextArea
                                          label="Description"
                                          value={rule.description}
                                          onChange={(value) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'description', value)}
                                          placeholder="Rule description"
                                          rows={2}
                                        />
                                        <div className="flex justify-end space-x-2">
                                          <button
                                            onClick={() => toggleEdit('rule', `${group.tax_group_id}_${rule.tax_rule_seq}`)}
                                            className="px-3 py-1 bg-green-100 text-green-600 hover:bg-green-200 rounded text-sm font-medium transition-colors"
                                          >
                                            <CheckCircleIcon className="h-3 w-3 inline mr-1" />
                                            Done
                                          </button>
                                          <button
                                            onClick={() => deleteRule(group.tax_group_id, rule.tax_rule_seq)}
                                            className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded text-sm font-medium transition-colors"
                                          >
                                            <TrashIcon className="h-3 w-3 inline mr-1" />
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">{rule.name}</span>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                              {rule.percentage}%
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Authority: {rule.tax_authority_id} | Type: {rule.tax_type_code}
                                          </div>
                                          <div className="text-xs text-gray-600 mt-1">{rule.description}</div>
                                        </div>
                                        <div className="flex space-x-1 ml-3">
                                          <button
                                            onClick={() => toggleEdit('rule', `${group.tax_group_id}_${rule.tax_rule_seq}`)}
                                            className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                          >
                                            <PencilIcon className="h-3 w-3" />
                                          </button>
                                          <button
                                            onClick={() => deleteRule(group.tax_group_id, rule.tax_rule_seq)}
                                            className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors"
                                          >
                                            <TrashIcon className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg border-2 border-dashed border-gray-200">
                              No tax rules configured. Click "Add Rule" to get started.
                            </div>
                          )}

                          {group.group_rule.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-blue-900">Total Tax Rate:</span>
                                <span className="font-bold text-blue-900">{getTotalTaxRate(group).toFixed(2)}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </EditableCard>
                  );
                })}
                {(!taxConfig?.tax_group || taxConfig.tax_group.length === 0) && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <TableCellsIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Tax Groups</h3>
                    <p className="text-gray-500 mb-4">Create your first tax group to organize your tax rules.</p>
                    <Button
                      onClick={() => addNewItem('group')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Group
                    </Button>
                  </div>
                )}
              </div>
            </Widget>
          )}

          {activeTab === 'location' && (
            <Widget
              title="Tax Location"
              description="Configure the primary tax location for your store"
              icon={ClipboardDocumentListIcon}
              variant="warning"
            >
              <EditableCard
                isEditing={editingItems[`location_0`] || false}
                onToggleEdit={() => toggleEdit('location', '0')}
                showDeleteButton={false}
              >
                {editingItems[`location_0`] ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputTextField
                        label="Tax Location ID"
                        value={taxConfig?.tax_location?.tax_loc_id || ''}
                        onChange={() => {}} // Read-only field
                        disabled
                        className="bg-gray-50"
                      />
                      <InputTextField
                        label="Location Name"
                        value={taxConfig?.tax_location?.name || ''}
                        onChange={(value) => handleFieldChange('location', 0, 'name', value)}
                        placeholder="e.g., Main Store"
                      />
                    </div>
                    <InputTextArea
                      label="Description"
                      value={taxConfig?.tax_location?.description || ''}
                      onChange={(value) => handleFieldChange('location', 0, 'description', value)}
                      placeholder="Enter location description"
                      rows={3}
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{taxConfig?.tax_location?.name || 'Not Set'}</h3>
                    <p className="text-sm text-gray-500 mb-2">ID: {taxConfig?.tax_location?.tax_loc_id || 'Not Set'}</p>
                    <p className="text-sm text-gray-600">{taxConfig?.tax_location?.description || 'No description'}</p>
                  </>
                )}
              </EditableCard>
            </Widget>
          )}

          {activeTab === 'settings' && (
            <Widget
              title="General Settings"
              description="Additional tax configuration settings and preferences"
              icon={Cog6ToothIcon}
              variant="default"
            >
              <div className="text-center py-12">
                <Cog6ToothIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Panel</h3>
                <p className="text-gray-500">Additional tax configuration settings will be available here.</p>
              </div>
            </Widget>
          )}
      </EnhancedTabs>

      {/* Error Display */}
      {errors.submit && (
        <Alert variant="error">
          {errors.submit}
        </Alert>
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={deleteDialog.dialogState.isOpen}
        onClose={deleteDialog.closeDialog}
        onConfirm={deleteDialog.handleConfirm}
        title={deleteDialog.dialogState.title}
        message={deleteDialog.dialogState.message}
        confirmText={deleteDialog.dialogState.confirmText}
        cancelText={deleteDialog.dialogState.cancelText}
        variant={deleteDialog.dialogState.variant}
        isLoading={deleteDialog.dialogState.isLoading}
      />

      <ConfirmDialog
        isOpen={discardDialog.dialogState.isOpen}
        onClose={discardDialog.closeDialog}
        onConfirm={discardDialog.handleConfirm}
        title={discardDialog.dialogState.title}
        message={discardDialog.dialogState.message}
        confirmText={discardDialog.dialogState.confirmText}
        cancelText={discardDialog.dialogState.cancelText}
        variant={discardDialog.dialogState.variant}
        isLoading={discardDialog.dialogState.isLoading}
      />
    </div>
  );
};

export default TaxSettings;

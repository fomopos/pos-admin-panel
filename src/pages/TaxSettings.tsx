import React, { useState, useEffect } from 'react';
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
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { Button, Input, Card, PageHeader, Alert, EnhancedTabs } from '../components/ui';
import { taxServices } from '../services/tax';
import type {
  TaxAuthority,
  TaxGroup,
  TaxRule,
  TaxConfiguration
} from '../services/tax';

const TaxSettings: React.FC = () => {
  const { currentTenant } = useTenantStore();
  const [taxConfig, setTaxConfig] = useState<TaxConfiguration | null>(null);
  const [originalTaxConfig, setOriginalTaxConfig] = useState<TaxConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('authorities');
  const [editingItems, setEditingItems] = useState<Record<string, boolean>>({});

  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch tax configuration using services
  useEffect(() => {
    const fetchTaxConfig = async () => {
      if (!currentTenant?.id) {
        console.warn('No tenant selected, cannot fetch tax configuration');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Use the real tax configuration service with tenant ID
        const config = await taxServices.configuration.getTaxConfiguration(currentTenant.id);
        setTaxConfig(config);
        setOriginalTaxConfig(JSON.parse(JSON.stringify(config))); // Deep clone
      } catch (error) {
        console.error('Failed to fetch tax configuration:', error);
        // If no tax configuration exists, try to use mock data for initial setup
        try {
          const mockConfig = await taxServices.configuration.getMockTaxConfiguration();
          setTaxConfig(mockConfig);
          setOriginalTaxConfig(JSON.parse(JSON.stringify(mockConfig)));
        } catch (mockError) {
          console.error('Failed to fetch mock tax configuration:', mockError);
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
    { id: 'authorities', name: 'Tax Authorities', icon: BuildingOfficeIcon },
    { id: 'groups', name: 'Tax Groups', icon: TableCellsIcon },
    { id: 'location', name: 'Tax Location', icon: ClipboardDocumentListIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
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
    if (!taxConfig || !window.confirm('Are you sure you want to delete this tax rule?')) return;

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
    if (!taxConfig || !window.confirm('Are you sure you want to delete this item?')) return;
    
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
  };

  const saveAllChanges = async () => {
    if (!taxConfig || !hasChanges || !currentTenant?.id) return;

    setIsSaving(true);
    try {
      const requestData = {
        authority: taxConfig.authority,
        tax_location: taxConfig.tax_location,
        tax_group: taxConfig.tax_group
      };

      // Check if this is a new configuration or updating existing one
      if (originalTaxConfig) {
        await taxServices.configuration.updateTaxConfiguration(currentTenant.id, requestData);
      } else {
        await taxServices.configuration.createTaxConfiguration(currentTenant.id, requestData);
      }
      
      // Update the original config to reflect saved state
      setOriginalTaxConfig(JSON.parse(JSON.stringify(taxConfig)));
      setEditingItems({});
      
      // Show success message (you could use a toast notification here)
      console.log('Tax configuration saved successfully');
    } catch (error) {
      console.error('Failed to save tax configuration:', error);
      setErrors({ submit: 'Failed to save changes. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    if (!originalTaxConfig || !window.confirm('Are you sure you want to discard all changes?')) return;
    
    setTaxConfig(JSON.parse(JSON.stringify(originalTaxConfig)));
    setEditingItems({});
    setErrors({});
  };

  const getTotalTaxRate = (group: TaxGroup) => {
    return group.group_rule.reduce((total, rule) => total + rule.percentage, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!taxConfig) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tax configuration found</h3>
        <p className="text-gray-500">Please contact your administrator to set up tax configuration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <PageHeader
        title="Tax Settings"
        description="Configure tax authorities, groups, and locations"
      >
        {/* Save/Discard Actions */}
        {hasChanges && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-900">You have unsaved changes</h3>
                <p className="text-xs text-amber-700 mt-1">Don't forget to save your modifications before leaving this page.</p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <Button
                onClick={discardChanges}
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-100 bg-white"
              >
                <span>Discard Changes</span>
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4" />
                    <span>Save All Changes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </PageHeader>

      {/* Tax Configuration Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Authorities</p>
              <p className="text-3xl font-bold text-blue-900">{taxConfig?.authority?.length || 0}</p>
            </div>
            <BuildingOfficeIcon className="h-12 w-12 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Tax Groups</p>
              <p className="text-3xl font-bold text-green-900">{taxConfig?.tax_group?.length || 0}</p>
            </div>
            <TableCellsIcon className="h-12 w-12 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Tax Location</p>
              <p className="text-lg font-bold text-purple-900">{taxConfig?.tax_location?.name || 'Not Set'}</p>
            </div>
            <ClipboardDocumentListIcon className="h-12 w-12 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Rules</p>
              <p className="text-3xl font-bold text-orange-900">
                {taxConfig?.tax_group?.reduce((total, group) => total + (group?.group_rule?.length || 0), 0) || 0}
              </p>
            </div>
            <CurrencyDollarIcon className="h-12 w-12 text-orange-500" />
          </div>
        </Card>
      </div> */}

      {/* Tab Navigation */}
      <EnhancedTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {/* Tab Content */}
        {activeTab === 'authorities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tax Authorities</h2>
                <Button
                  onClick={() => addNewItem('authority')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Authority
                </Button>
              </div>
              
              <div className="space-y-4">
                {taxConfig?.authority?.map((authority, index) => {
                  const isEditing = editingItems[`authority_${index}`];
                  return (
                    <Card key={`auth-${index}`} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                  label="Authority ID"
                                  value={authority.authority_id}
                                  onChange={(e) => handleFieldChange('authority', index, 'authority_id', e.target.value)}
                                  placeholder="e.g., CGST001"
                                />
                                <Input
                                  label="Authority Name"
                                  value={authority.name}
                                  onChange={(e) => handleFieldChange('authority', index, 'name', e.target.value)}
                                  placeholder="e.g., Central GST"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Rounding Code</label>
                                  <select
                                    value={authority.rounding_code}
                                    onChange={(e) => handleFieldChange('authority', index, 'rounding_code', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="HALF_UP">Half Up</option>
                                    <option value="HALF_DOWN">Half Down</option>
                                    <option value="UP">Up</option>
                                    <option value="DOWN">Down</option>
                                  </select>
                                </div>
                                <Input
                                  label="Rounding Digits"
                                  type="number"
                                  value={authority.rounding_digit.toString()}
                                  onChange={(e) => handleFieldChange('authority', index, 'rounding_digit', e.target.value)}
                                  min="0"
                                  max="10"
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
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => toggleEdit('authority', index.toString())}
                            className={`p-2 rounded-lg transition-colors ${
                              isEditing 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {isEditing ? (
                              <CheckCircleIcon className="h-4 w-4" />
                            ) : (
                              <PencilIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteItem('authority', authority.authority_id)}
                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tax Groups</h2>
                <Button
                  onClick={() => addNewItem('group')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Group
                </Button>
              </div>
              
              <div className="space-y-4">
                {taxConfig?.tax_group?.map((group, index) => {
                  const isEditing = editingItems[`group_${index}`];
                  return (
                    <Card key={`group-${index}`} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                  label="Tax Group ID"
                                  value={group.tax_group_id}
                                  onChange={(e) => handleFieldChange('group', index, 'tax_group_id', e.target.value)}
                                  placeholder="e.g., TG001"
                                />
                                <Input
                                  label="Group Name"
                                  value={group.name}
                                  onChange={(e) => handleFieldChange('group', index, 'name', e.target.value)}
                                  placeholder="e.g., Standard GST"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                  value={group.description}
                                  onChange={(e) => handleFieldChange('group', index, 'description', e.target.value)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter group description"
                                />
                              </div>
                              
                              {/* Tax Rules Management in Edit Mode */}
                              <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-sm font-semibold text-gray-900">Tax Rules ({group.group_rule.length})</h4>
                                  <button
                                    onClick={() => addNewRule(group.tax_group_id)}
                                    className="px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-md text-sm font-medium transition-colors"
                                  >
                                    <PlusIcon className="h-4 w-4 inline mr-1" />
                                    Add Rule
                                  </button>
                                </div>
                                
                                {group.group_rule.length > 0 ? (
                                  <div className="space-y-3">
                                    {group.group_rule.map((rule) => {
                                      const ruleKey = `rule_${group.tax_group_id}_${rule.tax_rule_seq}`;
                                      const isRuleEditing = editingItems[ruleKey];
                                      
                                      return (
                                        <div key={rule.tax_rule_seq} className="p-4 bg-white border border-gray-200 rounded-lg">
                                          {isRuleEditing ? (
                                            <div className="space-y-3">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                                  <Input
                                                    value={rule.name}
                                                    onChange={(e) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'name', e.target.value)}
                                                    placeholder="Rule name"
                                                    className="text-sm"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-xs font-medium text-gray-700 mb-1">Tax Authority</label>
                                                  <select
                                                    value={rule.tax_authority_id}
                                                    onChange={(e) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'tax_authority_id', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                  >
                                                    {taxConfig?.authority?.map(auth => (
                                                      <option key={auth.authority_id} value={auth.authority_id}>
                                                        {auth.name}
                                                      </option>
                                                    ))}
                                                  </select>
                                                </div>
                                                <div>
                                                  <label className="block text-xs font-medium text-gray-700 mb-1">Percentage (%)</label>
                                                  <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={rule.percentage}
                                                    onChange={(e) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'percentage', e.target.value)}
                                                    placeholder="0.00"
                                                    className="text-sm"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-xs font-medium text-gray-700 mb-1">Tax Type Code</label>
                                                  <Input
                                                    value={rule.tax_type_code}
                                                    onChange={(e) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'tax_type_code', e.target.value)}
                                                    placeholder="VAT"
                                                    className="text-sm"
                                                  />
                                                </div>
                                              </div>
                                              <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                                <textarea
                                                  value={rule.description}
                                                  onChange={(e) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'description', e.target.value)}
                                                  rows={2}
                                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="Rule description"
                                                />
                                              </div>
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
                                  <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    No tax rules configured yet.<br />
                                    <span className="text-blue-600 font-medium">Click "Add Rule" to create your first tax rule.</span>
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
                          ) : (
                            <>
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                  {getTotalTaxRate(group).toFixed(2)}% Total
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">ID: {group.tax_group_id}</p>
                              <p className="text-sm text-gray-600">{group.description}</p>
                              
                              {/* Tax Rules Section */}
                              <div className="mt-4">
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
                                                <div>
                                                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                                  <Input
                                                    value={rule.name}
                                                    onChange={(e) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'name', e.target.value)}
                                                    placeholder="Rule name"
                                                    className="text-sm"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-xs font-medium text-gray-700 mb-1">Tax Authority</label>
                                                  <select
                                                    value={rule.tax_authority_id}
                                                    onChange={(e) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'tax_authority_id', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                  >
                                                    {taxConfig?.authority?.map(auth => (
                                                      <option key={auth.authority_id} value={auth.authority_id}>
                                                        {auth.name}
                                                      </option>
                                                    ))}
                                                  </select>
                                                </div>
                                                <div>
                                                  <label className="block text-xs font-medium text-gray-700 mb-1">Percentage (%)</label>
                                                  <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={rule.percentage}
                                                    onChange={(e) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'percentage', e.target.value)}
                                                    placeholder="0.00"
                                                    className="text-sm"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-xs font-medium text-gray-700 mb-1">Tax Type Code</label>
                                                  <Input
                                                    value={rule.tax_type_code}
                                                    onChange={(e) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'tax_type_code', e.target.value)}
                                                    placeholder="VAT"
                                                    className="text-sm"
                                                  />
                                                </div>
                                              </div>
                                              <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                                <textarea
                                                  value={rule.description}
                                                  onChange={(e) => handleRuleFieldChange(group.tax_group_id, rule.tax_rule_seq, 'description', e.target.value)}
                                                  rows={2}
                                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="Rule description"
                                                />
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
                                          
                                          {isRuleEditing && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end space-x-2">
                                              <button
                                                onClick={() => toggleEdit('rule', `${group.tax_group_id}_${rule.tax_rule_seq}`)}
                                                className="px-3 py-1 bg-green-100 text-green-600 hover:bg-green-200 rounded text-sm font-medium transition-colors"
                                              >
                                                <CheckCircleIcon className="h-3 w-3 inline mr-1" />
                                                Done
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-gray-500 text-sm">
                                    No tax rules configured. Click "Add Rule" to get started.
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => toggleEdit('group', index.toString())}
                            className={`p-2 rounded-lg transition-colors ${
                              isEditing 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {isEditing ? (
                              <CheckCircleIcon className="h-4 w-4" />
                            ) : (
                              <PencilIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteItem('group', group.tax_group_id)}
                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tax Location</h2>
              </div>
              
              <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {editingItems[`location_0`] ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Tax Location ID"
                            value={taxConfig?.tax_location?.tax_loc_id || ''}
                            disabled
                            className="bg-gray-50"
                          />
                          <Input
                            label="Location Name"
                            value={taxConfig?.tax_location?.name || ''}
                            onChange={(e) => handleFieldChange('location', 0, 'name', e.target.value)}
                            placeholder="e.g., Main Store"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={taxConfig?.tax_location?.description || ''}
                            onChange={(e) => handleFieldChange('location', 0, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter location description"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{taxConfig?.tax_location?.name || 'Not Set'}</h3>
                        <p className="text-sm text-gray-500 mb-2">ID: {taxConfig?.tax_location?.tax_loc_id || 'Not Set'}</p>
                        <p className="text-sm text-gray-600">{taxConfig?.tax_location?.description || 'No description'}</p>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => toggleEdit('location', '0')}
                      className={`p-2 rounded-lg transition-colors ${
                        editingItems[`location_0`]
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {editingItems[`location_0`] ? (
                        <CheckCircleIcon className="h-4 w-4" />
                      ) : (
                        <PencilIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
              </div>
              
              <Card className="p-6 border border-gray-200 rounded-xl">
                <div className="text-center py-12">
                  <Cog6ToothIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Panel</h3>
                  <p className="text-gray-500">Additional tax configuration settings will be available here.</p>
                </div>
              </Card>
            </div>
          )}
      </EnhancedTabs>

      {/* Error Display */}
      {errors.submit && (
        <Alert variant="error">
          {errors.submit}
        </Alert>
      )}
    </div>
  );
};

export default TaxSettings;

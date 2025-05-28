import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  TableCellsIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { taxServices } from '../services/tax';
import type {
  TaxAuthority,
  TaxGroup,
  TaxConfiguration
} from '../services/tax';

const TaxSettings: React.FC = () => {
  const { currentTenant } = useTenantStore();
  const [taxConfig, setTaxConfig] = useState<TaxConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('authorities');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'authority' | 'group' | 'location'>('authority');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch tax configuration using services
  useEffect(() => {
    const fetchTaxConfig = async () => {
      setIsLoading(true);
      
      try {
        // Use the tax configuration service
        const config = await taxServices.configuration.getMockTaxConfiguration();
        setTaxConfig(config);
      } catch (error) {
        console.error('Failed to fetch tax configuration:', error);
        setTaxConfig(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaxConfig();
  }, [currentTenant]);

  const tabs = [
    { id: 'authorities', name: 'Tax Authorities', icon: BuildingOfficeIcon },
    { id: 'groups', name: 'Tax Groups', icon: TableCellsIcon },
    { id: 'location', name: 'Tax Location', icon: ClipboardDocumentListIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === 'percentage' || name === 'rounding_digit' || name === 'tax_rule_seq' || name === 'amount'
        ? parseFloat(value) || 0 
        : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formType === 'authority') {
      if (!formData.authority_id) newErrors.authority_id = 'Authority ID is required';
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.rounding_code) newErrors.rounding_code = 'Rounding code is required';
      if (formData.rounding_digit === undefined || formData.rounding_digit < 0) {
        newErrors.rounding_digit = 'Rounding digit must be 0 or greater';
      }
    } else if (formType === 'group') {
      if (!formData.tax_group_id) newErrors.tax_group_id = 'Tax Group ID is required';
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.description) newErrors.description = 'Description is required';
    } else if (formType === 'location') {
      if (!formData.tax_loc_id) newErrors.tax_loc_id = 'Tax Location ID is required';
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.description) newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !taxConfig) return;
    
    try {
      if (formType === 'authority') {
        if (editingItem) {
          setTaxConfig(prev => ({
            ...prev!,
            authority: prev!.authority.map(auth =>
              auth.authority_id === editingItem.authority_id
                ? { ...auth, ...formData }
                : auth
            )
          }));
        } else {
          setTaxConfig(prev => ({
            ...prev!,
            authority: [...prev!.authority, formData as TaxAuthority]
          }));
        }
      } else if (formType === 'group') {
        if (editingItem) {
          setTaxConfig(prev => ({
            ...prev!,
            tax_group: prev!.tax_group.map(group =>
              group.tax_group_id === editingItem.tax_group_id
                ? { ...group, ...formData }
                : group
            )
          }));
        } else {
          const newGroup: TaxGroup = {
            ...formData,
            group_rule: []
          };
          setTaxConfig(prev => ({
            ...prev!,
            tax_group: [...prev!.tax_group, newGroup]
          }));
        }
      } else if (formType === 'location') {
        setTaxConfig(prev => ({
          ...prev!,
          tax_location: { ...prev!.tax_location, ...formData }
        }));
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Error saving tax configuration:', error);
    }
  };

  const handleEdit = (type: 'authority' | 'group' | 'location', item: any) => {
    setFormType(type);
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (type: 'authority' | 'group', id: string) => {
    if (!taxConfig) return;
    
    if (window.confirm('Are you sure you want to delete this item?')) {
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
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({});
    setErrors({});
  };

  const handleAddNew = (type: 'authority' | 'group' | 'location') => {
    setFormType(type);
    setEditingItem(null);
    setFormData({
      rounding_code: 'HALF_UP',
      rounding_digit: 2,
      tax_type_code: 'VAT'
    });
    setShowForm(true);
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
              <TableCellsIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tax Settings</h1>
              <p className="text-gray-600 mt-1">Configure tax authorities, groups, and locations</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => handleAddNew(activeTab === 'authorities' ? 'authority' : activeTab === 'groups' ? 'group' : 'location')}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              disabled={activeTab === 'location' || activeTab === 'settings'}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add {activeTab === 'authorities' ? 'Authority' : activeTab === 'groups' ? 'Group' : 'Item'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tax Configuration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-2xl mb-4">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Tax Authorities</p>
              <p className="text-3xl font-bold text-gray-900">{taxConfig.authority.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-2xl mb-4">
                <TableCellsIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Tax Groups</p>
              <p className="text-3xl font-bold text-gray-900">{taxConfig.tax_group.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-2xl mb-4">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Tax Rules</p>
              <p className="text-3xl font-bold text-gray-900">
                {taxConfig.tax_group.reduce((total, group) => total + group.group_rule.length, 0)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-2xl mb-4">
                <CheckCircleIcon className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
              <p className="text-lg font-bold text-green-600">Active</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-1 mx-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'authorities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tax Authorities</h2>
                <Button
                  onClick={() => handleAddNew('authority')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Authority
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taxConfig.authority.map((authority) => (
                  <Card key={authority.authority_id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{authority.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">ID: {authority.authority_id}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Rounding:</span>
                            <span className="font-medium">{authority.rounding_code}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Digits:</span>
                            <span className="font-medium">{authority.rounding_digit}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => handleEdit('authority', authority)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('authority', authority.authority_id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tax Groups</h2>
                <Button
                  onClick={() => handleAddNew('group')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Group
                </Button>
              </div>
              
              <div className="space-y-4">
                {taxConfig.tax_group.map((group) => (
                  <Card key={group.tax_group_id} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {(getTotalTaxRate(group) * 100).toFixed(1)}% Total
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">ID: {group.tax_group_id}</p>
                        <p className="text-sm text-gray-600">{group.description}</p>
                      </div>
                      <div className="flex space-x-1 ml-4">
                        <button
                          onClick={() => handleEdit('group', group)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('group', group.tax_group_id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {group.group_rule.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Tax Rules</h4>
                        <div className="space-y-2">
                          {group.group_rule.map((rule) => (
                            <div key={rule.tax_rule_seq} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-900">{rule.name}</span>
                                  <span className="text-xs text-gray-500">({rule.tax_authority_id})</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{rule.description}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-semibold text-gray-900">
                                  {(rule.percentage * 100).toFixed(2)}%
                                </span>
                                <p className="text-xs text-gray-500">Fiscal: {rule.fiscal_tax_id}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tax Location</h2>
                <Button
                  onClick={() => handleEdit('location', taxConfig.tax_location)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Location
                </Button>
              </div>
              
              <Card className="p-6 border border-gray-200 rounded-xl">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{taxConfig.tax_location.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">ID: {taxConfig.tax_location.tax_loc_id}</p>
                    <p className="text-gray-600">{taxConfig.tax_location.description}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Tax Configuration Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border border-gray-200 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tenant ID:</span>
                      <span className="font-medium">{taxConfig.tenant_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Store ID:</span>
                      <span className="font-medium">{taxConfig.store_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">{new Date(taxConfig.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Updated:</span>
                      <span className="font-medium">{new Date(taxConfig.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 border border-gray-200 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Tax Calculation:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Auto-update:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Enabled
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Last Sync:</span>
                      <span className="text-sm font-medium text-gray-900">Just now</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <TaxFormModal
          formType={formType}
          editingItem={editingItem}
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

// Tax Form Modal Component
const TaxFormModal: React.FC<{
  formType: 'authority' | 'group' | 'location';
  editingItem: any;
  formData: any;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}> = ({ formType, editingItem, formData, errors, onInputChange, onSubmit, onClose }) => {
  const getModalTitle = () => {
    if (formType === 'authority') return editingItem ? 'Edit Tax Authority' : 'Add Tax Authority';
    if (formType === 'group') return editingItem ? 'Edit Tax Group' : 'Add Tax Group';
    return 'Edit Tax Location';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{getModalTitle()}</h2>
              <p className="text-green-100 mt-1">
                {formType === 'authority' && 'Configure tax authority settings'}
                {formType === 'group' && 'Set up tax group configuration'}
                {formType === 'location' && 'Update tax location information'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-6">
            {formType === 'authority' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Authority ID"
                    name="authority_id"
                    value={formData.authority_id || ''}
                    onChange={onInputChange}
                    error={errors.authority_id}
                    required
                    placeholder="e.g., IN-CGST"
                    disabled={!!editingItem}
                  />
                  <Input
                    label="Authority Name"
                    name="name"
                    value={formData.name || ''}
                    onChange={onInputChange}
                    error={errors.name}
                    required
                    placeholder="e.g., Central GST"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Rounding Code</label>
                    <select
                      name="rounding_code"
                      value={formData.rounding_code || 'HALF_UP'}
                      onChange={onInputChange}
                      className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      <option value="HALF_UP">Half Up</option>
                      <option value="HALF_DOWN">Half Down</option>
                      <option value="UP">Up</option>
                      <option value="DOWN">Down</option>
                    </select>
                  </div>
                  <Input
                    label="Rounding Digits"
                    name="rounding_digit"
                    type="number"
                    value={formData.rounding_digit || ''}
                    onChange={onInputChange}
                    error={errors.rounding_digit}
                    required
                    min="0"
                    max="10"
                    placeholder="2"
                  />
                </div>
              </>
            )}

            {formType === 'group' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Tax Group ID"
                    name="tax_group_id"
                    value={formData.tax_group_id || ''}
                    onChange={onInputChange}
                    error={errors.tax_group_id}
                    required
                    placeholder="e.g., GST-STANDARD"
                    disabled={!!editingItem}
                  />
                  <Input
                    label="Group Name"
                    name="name"
                    value={formData.name || ''}
                    onChange={onInputChange}
                    error={errors.name}
                    required
                    placeholder="e.g., Standard GST"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={onInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter group description"
                  />
                  {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                </div>
              </>
            )}

            {formType === 'location' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Tax Location ID"
                    name="tax_loc_id"
                    value={formData.tax_loc_id || ''}
                    onChange={onInputChange}
                    error={errors.tax_loc_id}
                    required
                    placeholder="e.g., STORE-001"
                    disabled={!!editingItem}
                  />
                  <Input
                    label="Location Name"
                    name="name"
                    value={formData.name || ''}
                    onChange={onInputChange}
                    error={errors.name}
                    required
                    placeholder="e.g., Main Store"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={onInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter location description"
                  />
                  {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxSettings;

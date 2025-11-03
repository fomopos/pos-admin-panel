import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { reasonCodeApiService } from '../services/reason-code/reasonCodeApiService';
import { 
  PageHeader, 
  Button, 
  ConfirmDialog, 
  Modal, 
  Badge, 
  MultipleDropdownSearch,
  DropdownSearch,
} from '../components/ui';
import type { MultipleDropdownSearchOption } from '../components/ui/MultipleDropdownSearch';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import { PropertyCheckbox } from '../components/ui/PropertyCheckbox';
import type { ReasonCode } from '../types/reasonCode';
import useTenantStore from '../tenants/tenantStore';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { useError } from '../hooks/useError';

const ReasonCodes: React.FC = () => {
  const [reasonCodes, setReasonCodes] = useState<ReasonCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | ''>('');
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReasonCode, setEditingReasonCode] = useState<ReasonCode | null>(null);
  const { currentTenant, currentStore } = useTenantStore();

  // Error handling hooks
  const { showError, showApiError, showSuccess } = useError();

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  const loadReasonCodes = useCallback(async () => {
    if (!currentTenant?.id || !currentStore?.store_id) {
      showError('Missing tenant or store information');
      return;
    }

    try {
      setLoading(true);
      const result = await reasonCodeApiService.getReasonCodes({
        store_id: currentStore?.store_id,
      });
      setReasonCodes(result.reason_codes || []);
    } catch (error) {
      console.error('Failed to load reason codes:', error);
      showApiError('Failed to load reason codes. Please try again.', undefined, '/v0/reason-code');
      setReasonCodes([]);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, currentStore?.store_id, showError, showApiError]);

  useEffect(() => {
    if (currentTenant?.id && currentStore?.store_id) {
      loadReasonCodes();
    }
  }, [currentTenant?.id, currentStore?.store_id, loadReasonCodes]);

  const handleDelete = async (code: string) => {
    const reasonCode = reasonCodes.find(rc => rc.code === code);
    if (!reasonCode) {
      showError('Reason code not found');
      return;
    }

    deleteDialog.openDeleteDialog(
      reasonCode.code,
      async () => {
        try {
          await reasonCodeApiService.deleteReasonCode(
            reasonCode.tenant_id, 
            reasonCode.store_id, 
            reasonCode.code
          );
          showSuccess('Reason code deleted successfully!');
          await loadReasonCodes();
        } catch (error) {
          console.error('Failed to delete reason code:', error);
          showApiError('Failed to delete reason code. Please try again.', undefined, '/v0/reason-code');
        }
      }
    );
  };

  const handleEdit = (reasonCode: ReasonCode) => {
    setEditingReasonCode(reasonCode);
    setIsFormModalOpen(true);
  };

  const handleCreate = () => {
    setEditingReasonCode(null);
    setIsFormModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormModalOpen(false);
    setEditingReasonCode(null);
  };

  const handleFormSuccess = async () => {
    setIsFormModalOpen(false);
    setEditingReasonCode(null);
    await loadReasonCodes();
  };

  const filteredReasonCodes = (reasonCodes || []).filter(reasonCode => {
    const matchesSearch = reasonCode.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reasonCode.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || reasonCode.categories.includes(selectedCategory);
    const matchesStatus = !selectedStatus || 
                         (selectedStatus === 'active' ? reasonCode.active : !reasonCode.active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'operational': 'bg-blue-100 text-blue-800',
      'financial': 'bg-green-100 text-green-800',
      'item-related': 'bg-purple-100 text-purple-800',
      'transaction': 'bg-yellow-100 text-yellow-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['other'];
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reason Codes"
        description="Manage reason codes for discounts, returns, voids, and other transactions"
      >
        <Button onClick={handleCreate}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Reason Code
        </Button>
      </PageHeader>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reason codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Categories</option>
                <option value="operational">Operational</option>
                <option value="financial">Financial</option>
                <option value="item-related">Item Related</option>
                <option value="transaction">Transaction</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'active' | 'inactive' | '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reason Codes Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading reason codes...</p>
          </div>
        ) : filteredReasonCodes.length === 0 ? (
          <div className="p-8 text-center">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reason codes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new reason code.
            </p>
            <div className="mt-6">
              <Button onClick={handleCreate}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Reason Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requires Comment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReasonCodes.map((reasonCode) => (
                  <tr key={reasonCode.code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{reasonCode.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{reasonCode.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {reasonCode.categories.map((category) => (
                          <span
                            key={category}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(category)}`}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reasonCode.parent_code || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge color={reasonCode.req_cmt ? 'blue' : 'gray'}>
                        {reasonCode.req_cmt ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge color={reasonCode.active ? 'green' : 'gray'}>
                        {reasonCode.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(reasonCode)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(reasonCode.code)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <ReasonCodeFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        reasonCode={editingReasonCode}
      />

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
};

// Form Modal Component
interface ReasonCodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reasonCode: ReasonCode | null;
}

const ReasonCodeFormModal: React.FC<ReasonCodeFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reasonCode,
}) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    categories: [] as string[],
    parent_code: null as string | null,
    req_cmt: false,
    sort_order: 0,
    active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentTenant, currentStore } = useTenantStore();
  const { showError, showApiError, showSuccess } = useError();

  // Category options for MultipleDropdownSearch
  const categoryOptions: MultipleDropdownSearchOption[] = [
    { id: 'operational', label: 'Operational' },
    { id: 'financial', label: 'Financial' },
    { id: 'item-related', label: 'Item Related' },
    { id: 'transaction', label: 'Transaction' },
    { id: 'other', label: 'Other' },
  ];

  // Parent code options (all other reason codes)
  const [parentCodeOptions, setParentCodeOptions] = useState<DropdownSearchOption[]>([]);

  // Load parent code options
  useEffect(() => {
    const loadParentCodes = async () => {
      if (!currentTenant?.id || !currentStore?.store_id) return;
      
      try {
        const result = await reasonCodeApiService.getReasonCodes({
          store_id: currentStore.store_id,
        });
        const options: DropdownSearchOption[] = (result.reason_codes || [])
          .filter(rc => rc.code !== reasonCode?.code) // Exclude current code
          .map(rc => ({
            id: rc.code,
            label: `${rc.code} - ${rc.description}`,
          }));
        setParentCodeOptions(options);
      } catch (error) {
        console.error('Failed to load parent codes:', error);
      }
    };

    if (isOpen) {
      loadParentCodes();
    }
  }, [isOpen, currentTenant?.id, currentStore?.store_id, reasonCode]);

  useEffect(() => {
    if (reasonCode) {
      setFormData({
        code: reasonCode.code,
        description: reasonCode.description,
        categories: reasonCode.categories,
        parent_code: reasonCode.parent_code,
        req_cmt: reasonCode.req_cmt,
        sort_order: reasonCode.sort_order || 0,
        active: reasonCode.active,
      });
    } else {
      setFormData({
        code: '',
        description: '',
        categories: [],
        parent_code: null,
        req_cmt: false,
        sort_order: 0,
        active: true,
      });
    }
  }, [reasonCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentTenant?.id || !currentStore?.store_id) {
      showError('Missing tenant or store information');
      return;
    }

    if (!formData.code.trim()) {
      showError('Code is required');
      return;
    }

    if (!formData.description.trim()) {
      showError('Description is required');
      return;
    }

    if (formData.categories.length === 0) {
      showError('At least one category must be selected');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (reasonCode) {
        // Update existing reason code
        await reasonCodeApiService.updateReasonCode(
          currentTenant.id,
          currentStore.store_id,
          reasonCode.code,
          formData
        );
        showSuccess('Reason code updated successfully!');
      } else {
        // Create new reason code
        await reasonCodeApiService.createReasonCode(
          currentTenant.id,
          currentStore.store_id,
          formData
        );
        showSuccess('Reason code created successfully!');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save reason code:', error);
      showApiError(
        `Failed to ${reasonCode ? 'update' : 'create'} reason code. Please try again.`,
        undefined,
        '/v0/reason-code'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reasonCode ? 'Edit Reason Code' : 'Create Reason Code'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Code */}
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., DISC10, RET01"
            disabled={isSubmitting || !!reasonCode}
            required
          />
          {reasonCode && (
            <p className="text-xs text-gray-500 mt-1">Code cannot be changed after creation</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a clear description"
            rows={3}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Categories - MultipleDropdownSearch */}
        <div>
          <MultipleDropdownSearch
            label="Categories"
            values={formData.categories}
            options={categoryOptions}
            onSelect={(selectedValues: string[]) => setFormData(prev => ({ ...prev, categories: selectedValues }))}
            placeholder="Select categories"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Parent Code - DropdownSearch */}
        <div>
          <DropdownSearch
            label="Parent Code"
            value={formData.parent_code || undefined}
            options={parentCodeOptions}
            onSelect={(option: DropdownSearchOption | null) => 
              setFormData(prev => ({ ...prev, parent_code: option?.id || null }))
            }
            placeholder="Select parent reason code"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Link this reason code to a parent for hierarchical organization
          </p>
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-1">
            Sort Order
          </label>
          <input
            type="number"
            id="sort_order"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            disabled={isSubmitting}
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lower numbers appear first in lists
          </p>
        </div>

        {/* Require Comment - PropertyCheckbox */}
        <PropertyCheckbox
          title="Require Comment"
          description="When enabled, users must provide a comment when using this reason code"
          checked={formData.req_cmt}
          onChange={(checked) => setFormData(prev => ({ ...prev, req_cmt: checked }))}
          disabled={isSubmitting}
        />

        {/* Active Toggle - PropertyCheckbox */}
        <PropertyCheckbox
          title="Active"
          description="Only active reason codes can be used in transactions"
          checked={formData.active}
          onChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
          disabled={isSubmitting}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (reasonCode ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReasonCodes;

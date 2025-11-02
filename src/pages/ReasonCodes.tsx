import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { reasonCodeApiService } from '../services/reason-code/reasonCodeApiService';
import { PageHeader, Button, ConfirmDialog, Modal, Badge } from '../components/ui';
import type { ReasonCode, ReasonCodeCategory } from '../types/reasonCode';
import useTenantStore from '../tenants/tenantStore';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { useError } from '../hooks/useError';

const ReasonCodes: React.FC = () => {
  const [reasonCodes, setReasonCodes] = useState<ReasonCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReasonCodeCategory | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | ''>('');
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReasonCode, setEditingReasonCode] = useState<ReasonCode | null>(null);
  const { currentTenant, currentStore } = useTenantStore();

  // Error handling hooks
  const { showError, showApiError, showSuccess } = useError();

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  useEffect(() => {
    if (currentTenant?.id && currentStore?.store_id) {
      loadReasonCodes();
    }
  }, [currentTenant?.id, currentStore?.store_id]);

  const loadReasonCodes = async () => {
    if (!currentTenant?.id || !currentStore?.store_id) {
      showError('Missing tenant or store information');
      return;
    }

    try {
      setLoading(true);
      const result = await reasonCodeApiService.getReasonCodes({
        tenant_id: currentTenant?.id,
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
  };

  const handleDelete = async (reasonCodeId: string) => {
    const reasonCode = reasonCodes.find(rc => rc.reason_code_id === reasonCodeId);
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
            reasonCode.reason_code_id
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

  const getCategoryColor = (category: ReasonCodeCategory): string => {
    const colors: Record<ReasonCodeCategory, string> = {
      'DISCOUNT': 'bg-green-100 text-green-800',
      'RETURN': 'bg-red-100 text-red-800',
      'VOID': 'bg-yellow-100 text-yellow-800',
      'TRANSACTION': 'bg-blue-100 text-blue-800',
      'PROMOTION': 'bg-purple-100 text-purple-800',
      'OTHER': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['OTHER'];
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
                onChange={(e) => setSelectedCategory(e.target.value as ReasonCodeCategory | '')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Categories</option>
                <option value="DISCOUNT">Discount</option>
                <option value="RETURN">Return</option>
                <option value="VOID">Void</option>
                <option value="TRANSACTION">Transaction</option>
                <option value="PROMOTION">Promotion</option>
                <option value="OTHER">Other</option>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReasonCodes.map((reasonCode) => (
                  <tr key={reasonCode.reason_code_id} className="hover:bg-gray-50">
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
                          onClick={() => handleDelete(reasonCode.reason_code_id)}
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
    categories: [] as ReasonCodeCategory[],
    active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentTenant, currentStore } = useTenantStore();
  const { showError, showApiError, showSuccess } = useError();

  useEffect(() => {
    if (reasonCode) {
      setFormData({
        code: reasonCode.code,
        description: reasonCode.description,
        categories: reasonCode.categories,
        active: reasonCode.active,
      });
    } else {
      setFormData({
        code: '',
        description: '',
        categories: [],
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
          reasonCode.reason_code_id,
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

  const toggleCategory = (category: ReasonCodeCategory) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const allCategories: ReasonCodeCategory[] = ['DISCOUNT', 'RETURN', 'VOID', 'TRANSACTION', 'PROMOTION', 'OTHER'];

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
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., DISC10, RET01"
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a clear description"
            rows={3}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {allCategories.map((category) => (
              <label
                key={category}
                className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  disabled={isSubmitting}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            disabled={isSubmitting}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
          />
          <label htmlFor="active" className="ml-2 text-sm text-gray-700">
            Active
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : reasonCode ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReasonCodes;

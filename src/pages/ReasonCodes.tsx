import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
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
  AdvancedSearchFilter,
  DataTable,
} from '../components/ui';
import type { MultipleDropdownSearchOption } from '../components/ui/MultipleDropdownSearch';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import type { FilterConfig } from '../components/ui/AdvancedSearchFilter';
import type { Column } from '../components/ui/DataTable';
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
      'PRICE_CHANGE': 'blue',
      'LINE_ITEM_DISCOUNT': 'purple',
      'TRANSACTION_DISCOUNT': 'purple',
      'VOID_LINE_ITEM': 'red',
      'VOID_TRANSACTION': 'red',
      'SUSPEND_TRANSACTION': 'yellow',
      'RETURN_ITEM': 'orange',
      'REFUND': 'orange',
      'OVERRIDE': 'indigo',
      'CANCEL_RECEIPT': 'red',
      'OPEN_CASH_DRAWER': 'gray',
      'NO_SALE': 'gray',
      'PRICE_OVERRIDE': 'blue',
      'TAX_EXEMPT': 'green',
      'INVENTORY_ADJUSTMENT': 'cyan',
      'CUSTOMER_COMPLAINT': 'pink',
      'DISCOUNT_OVERRIDE': 'purple',
      'REPRINT_RECEIPT': 'gray',
      'EXCHANGE_ITEM': 'orange',
      'MANUAL_ENTRY': 'slate',
    };
    return colors[category] || 'gray';
  };

  // Filter configuration for AdvancedSearchFilter
  const filterConfigs: FilterConfig[] = [
    {
      key: 'category',
      label: 'Category',
      type: 'dropdown',
      options: [
        { id: 'PRICE_CHANGE', label: 'Price Change' },
        { id: 'LINE_ITEM_DISCOUNT', label: 'Line Item Discount' },
        { id: 'TRANSACTION_DISCOUNT', label: 'Transaction Discount' },
        { id: 'VOID_LINE_ITEM', label: 'Void Line Item' },
        { id: 'VOID_TRANSACTION', label: 'Void Transaction' },
        { id: 'SUSPEND_TRANSACTION', label: 'Suspend Transaction' },
        { id: 'RETURN_ITEM', label: 'Return Item' },
        { id: 'REFUND', label: 'Refund' },
        { id: 'OVERRIDE', label: 'Manager Override' },
        { id: 'CANCEL_RECEIPT', label: 'Cancel Receipt' },
        { id: 'OPEN_CASH_DRAWER', label: 'Open Cash Drawer' },
        { id: 'NO_SALE', label: 'No Sale' },
        { id: 'PRICE_OVERRIDE', label: 'Price Override' },
        { id: 'TAX_EXEMPT', label: 'Tax Exempt' },
        { id: 'INVENTORY_ADJUSTMENT', label: 'Inventory Adjustment' },
        { id: 'CUSTOMER_COMPLAINT', label: 'Customer Complaint' },
        { id: 'DISCOUNT_OVERRIDE', label: 'Discount Override' },
        { id: 'REPRINT_RECEIPT', label: 'Reprint Receipt' },
        { id: 'EXCHANGE_ITEM', label: 'Exchange Item' },
        { id: 'MANUAL_ENTRY', label: 'Manual Entry' }
      ],
      value: selectedCategory
    },
    {
      key: 'status',
      label: 'Status',
      type: 'dropdown',
      options: [
        { id: 'active', label: 'Active' },
        { id: 'inactive', label: 'Inactive' }
      ],
      value: selectedStatus
    }
  ];

  // Handle filter changes from AdvancedSearchFilter
  const handleFilterChange = (key: string, value: any) => {
    if (key === 'category') {
      setSelectedCategory(value as string);
    } else if (key === 'status') {
      setSelectedStatus(value as 'active' | 'inactive' | '');
    }
  };

  // Active filters for badge display
  const activeFilters: Array<{ key: string; label: string; value: string; onRemove: () => void }> = [];
  
  if (searchTerm) {
    activeFilters.push({
      key: 'search',
      label: 'Search',
      value: searchTerm,
      onRemove: () => setSearchTerm('')
    });
  }
  
  if (selectedCategory) {
    const categoryLabel = filterConfigs[0].options?.find(opt => opt.id === selectedCategory)?.label || selectedCategory;
    activeFilters.push({
      key: 'category',
      label: 'Category',
      value: categoryLabel,
      onRemove: () => setSelectedCategory('')
    });
  }
  
  if (selectedStatus) {
    const statusLabel = filterConfigs[1].options?.find(opt => opt.id === selectedStatus)?.label || selectedStatus;
    activeFilters.push({
      key: 'status',
      label: 'Status',
      value: statusLabel,
      onRemove: () => setSelectedStatus('')
    });
  }

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
  };

  // DataTable columns configuration
  const columns: Column<ReasonCode>[] = [
    {
      key: 'code',
      title: 'Code',
      sortable: true,
      render: (_value, item) => (
        <div className="flex items-center">
          <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900">{item.code}</span>
        </div>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      sortable: true,
      render: (value) => <div className="text-sm text-gray-900">{value}</div>,
    },
    {
      key: 'categories',
      title: 'Categories',
      render: (_value, item) => (
        <div className="flex flex-wrap gap-1">
          {item.categories.map((category) => (
            <Badge key={category} color={getCategoryColor(category) as any} size='sm'>
              {category.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'parent_code',
      title: 'Parent Code',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-500">{value || '-'}</span>
      ),
    },
    {
      key: 'req_cmt',
      title: 'Requires Comment',
      sortable: true,
      render: (value) => (
        <Badge color={value ? 'blue' : 'gray'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'active',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <Badge color={value ? 'green' : 'gray'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'code',
      title: 'Actions',
      render: (_value, item) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.code);
            }}
            className="text-red-600 hover:text-red-900"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
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
      <AdvancedSearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchLabel="Search Reason code"
        searchPlaceholder="Search by code or description..."
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
        totalResults={reasonCodes.length}
        filteredResults={filteredReasonCodes.length}
        showResultsCount={true}
        onClearAll={handleClearAllFilters}
      />

      {/* Reason Codes Table */}
      <DataTable
        data={filteredReasonCodes}
        columns={columns}
        loading={loading}
        searchable={false}
        pagination={true}
        pageSize={25}
        emptyState={
          <div className="text-center py-8">
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
        }
        onRowClick={(item) => handleEdit(item)}
      />

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
  { id: 'PRICE_CHANGE', label: 'Price Change', description: 'Reason required when changing the price of an item manually' },
  { id: 'LINE_ITEM_DISCOUNT', label: 'Line Item Discount', description: 'Reason required when applying a discount to a specific item' },
  { id: 'TRANSACTION_DISCOUNT', label: 'Transaction Discount', description: 'Reason required when applying a discount to the full transaction' },
  { id: 'VOID_LINE_ITEM', label: 'Void Line Item', description: 'Reason required when removing or voiding an item from the bill' },
  { id: 'VOID_TRANSACTION', label: 'Void Transaction', description: 'Reason required when voiding or cancelling an entire transaction' },
  { id: 'SUSPEND_TRANSACTION', label: 'Suspend Transaction', description: 'Reason required when suspending a transaction to hold temporarily' },
  { id: 'RETURN_ITEM', label: 'Return Item', description: 'Reason required when returning an item purchased earlier' },
  { id: 'REFUND', label: 'Refund', description: 'Reason required when issuing a refund to the customer' },
  { id: 'OVERRIDE', label: 'Manager Override', description: 'Reason required when an action needs managerial authorization' },
  { id: 'CANCEL_RECEIPT', label: 'Cancel Receipt', description: 'Reason required when cancelling a generated receipt' },
  { id: 'OPEN_CASH_DRAWER', label: 'Open Cash Drawer', description: 'Reason required when opening cash drawer without sale' },
  { id: 'NO_SALE', label: 'No Sale', description: 'Reason required when performing a no-sale operation' },
  { id: 'PRICE_OVERRIDE', label: 'Price Override', description: 'Reason required when overriding a system price or promotion' },
  { id: 'TAX_EXEMPT', label: 'Tax Exempt', description: 'Reason required when applying tax exemption to sale' },
  { id: 'INVENTORY_ADJUSTMENT', label: 'Inventory Adjustment', description: 'Reason required when adjusting stock manually' },
  { id: 'CUSTOMER_COMPLAINT', label: 'Customer Complaint', description: 'Reason required for actions taken due to customer complaint' },
  { id: 'DISCOUNT_OVERRIDE', label: 'Discount Override', description: 'Reason required when overriding a discount rule' },
  { id: 'REPRINT_RECEIPT', label: 'Reprint Receipt', description: 'Reason required when reprinting a receipt for auditing' },
  { id: 'EXCHANGE_ITEM', label: 'Exchange Item', description: 'Reason required when exchanging an item for another' },
  { id: 'MANUAL_ENTRY', label: 'Manual Entry', description: 'Reason required when item is entered manually without scan' }
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

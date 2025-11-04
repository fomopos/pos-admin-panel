import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Modal, Button, DropdownSearch, InputTextField } from '../ui';
import type { DropdownSearchOption } from '../ui/DropdownSearch';

export interface AdvancedFilterState {
  // Date filters
  dateFilter: string;
  customDateRange: { start: string; end: string };
  
  // Status filters
  statusFilter: string;
  paymentStatusFilter: string;
  paymentMethodFilter: string;
  
  // Amount filters
  amountRangeFilter: { min: string; max: string };
  
  // Other filters
  cashierFilter: string;
}

export interface AdvancedFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilterState;
  onApply: (filters: AdvancedFilterState) => void;
  onClear: () => void;
  cashierOptions?: DropdownSearchOption[];
  showCashierFilter?: boolean;
}

const DATE_FILTER_OPTIONS: DropdownSearchOption[] = [
  { id: 'today', label: 'Today', icon: '📅' },
  { id: 'week', label: 'This Week', icon: '📆' },
  { id: 'month', label: 'This Month', icon: '🗓️' },
  { id: 'year', label: 'This Year', icon: '📊' },
  { id: 'custom', label: 'Custom Range', icon: '🎯' },
  { id: 'all', label: 'All Time', icon: '♾️' }
];

const STATUS_OPTIONS: DropdownSearchOption[] = [
  { id: 'all', label: 'All Status', icon: '📋' },
  { id: 'completed', label: 'Completed', icon: '✅' },
  { id: 'new', label: 'New', icon: '🆕' },
  { id: 'suspended', label: 'Suspended', icon: '⏸️' },
  { id: 'cancelled', label: 'Cancelled', icon: '❌' },
  { id: 'cancel_orphaned', label: 'Cancel Orphaned', icon: '🚫' }
];

const PAYMENT_STATUS_OPTIONS: DropdownSearchOption[] = [
  { id: 'all', label: 'All Payment Status', icon: '💳' },
  { id: 'paid', label: 'Paid', icon: '✅' },
  { id: 'pending', label: 'Pending', icon: '⏳' },
  { id: 'partial', label: 'Partial', icon: '⚠️' },
  { id: 'refunded', label: 'Refunded', icon: '↩️' }
];

const PAYMENT_METHOD_OPTIONS: DropdownSearchOption[] = [
  { id: 'all', label: 'All Methods', icon: '💰' },
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'card', label: 'Card', icon: '💳' },
  { id: 'digital_wallet', label: 'Digital Wallet', icon: '📱' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' }
];

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  isOpen,
  onClose,
  filters,
  onApply,
  onClear,
  cashierOptions = [],
  showCashierFilter = true
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFilterState>(filters);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (field: keyof AdvancedFilterState, value: string | { min: string; max: string } | { start: string; end: string }) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedFilterChange = (
    parent: keyof AdvancedFilterState,
    field: string,
    value: string
  ) => {
    const currentParent = localFilters[parent];
    if (typeof currentParent === 'object' && currentParent !== null && !Array.isArray(currentParent)) {
      setLocalFilters(prev => ({
        ...prev,
        [parent]: {
          ...currentParent,
          [field]: value
        }
      }));
    }
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  const handleCancel = () => {
    // Reset to original filters
    setLocalFilters(filters);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Advanced Filters"
      size="lg"
      footer={
        <div className="flex justify-between w-full">
          <Button
            variant="outline"
            onClick={handleClear}
            className="border-gray-300"
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApply}
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Date Filters Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <CalendarIcon className="h-5 w-5" />
            <h3 className="text-sm uppercase tracking-wide">Date Range</h3>
          </div>
          
          <DropdownSearch
            label="Date Filter"
            options={DATE_FILTER_OPTIONS}
            value={localFilters.dateFilter}
            onSelect={(option) => option && handleFilterChange('dateFilter', option.id)}
            placeholder="Select date range"
          />

          {localFilters.dateFilter === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-blue-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={localFilters.customDateRange.start}
                  onChange={(e) => handleNestedFilterChange('customDateRange', 'start', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={localFilters.customDateRange.end}
                  onChange={(e) => handleNestedFilterChange('customDateRange', 'end', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Filters Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <CheckCircleIcon className="h-5 w-5" />
            <h3 className="text-sm uppercase tracking-wide">Status</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DropdownSearch
              label="Transaction Status"
              options={STATUS_OPTIONS}
              value={localFilters.statusFilter}
              onSelect={(option) => option && handleFilterChange('statusFilter', option.id)}
              placeholder="Select status"
            />

            <DropdownSearch
              label="Payment Status"
              options={PAYMENT_STATUS_OPTIONS}
              value={localFilters.paymentStatusFilter}
              onSelect={(option) => option && handleFilterChange('paymentStatusFilter', option.id)}
              placeholder="Select payment status"
            />
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <CreditCardIcon className="h-5 w-5" />
            <h3 className="text-sm uppercase tracking-wide">Payment</h3>
          </div>
          
          <DropdownSearch
            label="Payment Method"
            options={PAYMENT_METHOD_OPTIONS}
            value={localFilters.paymentMethodFilter}
            onSelect={(option) => option && handleFilterChange('paymentMethodFilter', option.id)}
            placeholder="Select payment method"
          />
        </div>

        {/* Amount Range Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <CurrencyDollarIcon className="h-5 w-5" />
            <h3 className="text-sm uppercase tracking-wide">Amount Range</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputTextField
              label="Minimum Amount"
              type="number"
              value={localFilters.amountRangeFilter.min}
              onChange={(value) => handleNestedFilterChange('amountRangeFilter', 'min', value)}
              placeholder="$0.00"
            />
            <InputTextField
              label="Maximum Amount"
              type="number"
              value={localFilters.amountRangeFilter.max}
              onChange={(value) => handleNestedFilterChange('amountRangeFilter', 'max', value)}
              placeholder="$999.99"
            />
          </div>
        </div>

        {/* Cashier Filter Section */}
        {showCashierFilter && cashierOptions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <FunnelIcon className="h-5 w-5" />
              <h3 className="text-sm uppercase tracking-wide">Other Filters</h3>
            </div>
            
            <DropdownSearch
              label="Cashier"
              options={[
                { id: 'all', label: 'All Cashiers', icon: '👥' },
                ...cashierOptions
              ]}
              value={localFilters.cashierFilter}
              onSelect={(option) => option && handleFilterChange('cashierFilter', option.id)}
              placeholder="Select cashier"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AdvancedFilter;

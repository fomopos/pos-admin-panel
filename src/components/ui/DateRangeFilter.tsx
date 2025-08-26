import React, { useState } from 'react';
import type { TimePeriod, CustomDateRange } from '../../services/dashboard/dashboardMetricsService';

interface DateRangeFilterProps {
  currentPeriod: TimePeriod;
  customDateRange?: CustomDateRange;
  onPeriodChange: (period: TimePeriod, customRange?: CustomDateRange) => void;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  currentPeriod,
  customDateRange,
  onPeriodChange,
  className = ''
}) => {
  const [showCustom, setShowCustom] = useState(currentPeriod === 'custom');
  const [customStart, setCustomStart] = useState(customDateRange?.startDate || '');
  const [customEnd, setCustomEnd] = useState(customDateRange?.endDate || '');

  const predefinedPeriods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ] as const;

  const handlePeriodChange = (period: TimePeriod) => {
    if (period === 'custom') {
      setShowCustom(true);
      // Don't call onPeriodChange until custom dates are set
    } else {
      setShowCustom(false);
      onPeriodChange(period);
    }
  };

  const handleCustomRangeApply = () => {
    if (customStart && customEnd) {
      const customRange: CustomDateRange = {
        startDate: customStart,
        endDate: customEnd
      };
      onPeriodChange('custom', customRange);
    }
  };

  const isCustomRangeValid = () => {
    if (!customStart || !customEnd) return false;
    const start = new Date(customStart);
    const end = new Date(customEnd);
    return start <= end;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Period Selector */}
      <div className="flex flex-wrap gap-2">
        {predefinedPeriods.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handlePeriodChange(value)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPeriod === value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Inputs */}
      {showCustom && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Custom Date Range</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                max={customEnd || undefined}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={customStart || undefined}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowCustom(false);
                setCustomStart('');
                setCustomEnd('');
                onPeriodChange('month'); // Default back to month
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCustomRangeApply}
              disabled={!isCustomRangeValid()}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isCustomRangeValid()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Apply Range
            </button>
          </div>

          {/* Validation Message */}
          {customStart && customEnd && !isCustomRangeValid() && (
            <p className="text-xs text-red-600">
              Start date must be before or equal to end date
            </p>
          )}
        </div>
      )}

      {/* Current Range Display */}
      {currentPeriod === 'custom' && customDateRange && (
        <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-md">
          <span className="font-medium">Selected Range:</span> {customDateRange.startDate} to {customDateRange.endDate}
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;

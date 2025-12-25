/**
 * Payment Terminal Configuration Form Component
 * 
 * Form for configuring payment terminals.
 * 
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import React from 'react';
import { DropdownSearch, PropertyCheckbox } from '../../ui';
import { PAYMENT_PROVIDERS } from '../../../constants/hardware.options';
import type { PaymentConfig } from '../../../types/hardware.types';

interface PaymentConfigFormProps {
  config: Partial<PaymentConfig>;
  onChange: (config: PaymentConfig) => void;
  errors?: Record<string, string>;
}

/**
 * PaymentConfigForm - Configuration form for payment terminals
 * 
 * @example
 * ```tsx
 * <PaymentConfigForm
 *   config={{ provider: 'stripe', sandbox_mode: false }}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const PaymentConfigForm: React.FC<PaymentConfigFormProps> = ({
  config,
  onChange,
  errors = {}
}) => {
  const handleFieldChange = <K extends keyof PaymentConfig>(
    field: K,
    value: PaymentConfig[K]
  ) => {
    onChange({
      provider: config.provider || 'stripe',
      ...config,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Payment Provider"
          options={PAYMENT_PROVIDERS}
          value={config.provider || ''}
          onSelect={(option) => option && handleFieldChange('provider', option.id)}
          placeholder="Select provider"
          displayValue={(option) => option ? option.label : 'Select provider'}
          required
          error={errors['payment_config.provider']}
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Payment Options</h4>
        <PropertyCheckbox
          title="Sandbox Mode"
          description="Use test/sandbox environment for payment processing"
          checked={config.sandbox_mode || false}
          onChange={(checked) => handleFieldChange('sandbox_mode', checked)}
        />
        {config.sandbox_mode && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              ⚠️ Sandbox mode is enabled. No real transactions will be processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentConfigForm;

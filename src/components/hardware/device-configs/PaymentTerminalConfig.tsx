import React from 'react';
import type { PaymentTerminalConfig as TerminalConfig } from '../../../types/hardware-new.types';
import {
  DropdownSearch,
  InputTextField,
  PropertyCheckbox
} from '../../ui';
import { PAYMENT_PROVIDERS } from '../../../constants/hardwareOptions';

interface PaymentTerminalConfigProps {
  config: TerminalConfig;
  onChange: (config: TerminalConfig) => void;
  errors?: Record<string, string>;
}

/**
 * PaymentTerminalConfig - Configuration form for payment terminals
 * 
 * Handles payment terminal settings including:
 * - Payment provider (Stripe, PAX, Verifone, Ingenico, Clover)
 * - SDK version for provider integration
 * - Sandbox/test mode for development
 * - Device pairing requirements
 * - Cloud vs local processing mode
 * 
 * Payment terminals handle card-present transactions including credit/debit
 * cards, contactless payments (NFC), chip (EMV), and magnetic stripe.
 * 
 * @example
 * ```tsx
 * <PaymentTerminalConfig
 *   config={device.device_config as PaymentTerminalConfig}
 *   onChange={(newConfig) => handleDeviceConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
const PaymentTerminalConfig: React.FC<PaymentTerminalConfigProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof TerminalConfig, value: string | boolean | null) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Payment Provider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Payment Provider"
          options={PAYMENT_PROVIDERS}
          value={config.provider || ''}
          onSelect={(option) => option && handleFieldChange('provider', option.id)}
          placeholder="Select payment provider"
          displayValue={(option) => option ? option.label : 'Select payment provider'}
          error={errors['payment_terminal_config.provider']}
        />

        <InputTextField
          label="SDK Version"
          value={config.sdk_version || ''}
          onChange={(value) => handleFieldChange('sdk_version', value || null)}
          placeholder="e.g., 2.15.0 or latest"
          error={errors['payment_terminal_config.sdk_version']}
        />
      </div>

      {/* Terminal Settings */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Terminal Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCheckbox
            title="Sandbox Mode"
            description="Use test mode for development (no real transactions)"
            checked={config.sandbox_mode || false}
            onChange={(checked) => handleFieldChange('sandbox_mode', checked)}
          />

          <PropertyCheckbox
            title="Requires Pairing"
            description="Device must be paired with terminal before use"
            checked={config.requires_pairing || false}
            onChange={(checked) => handleFieldChange('requires_pairing', checked)}
          />

          <PropertyCheckbox
            title="Cloud Mode"
            description="Use cloud-based payment processing"
            checked={config.cloud_mode || false}
            onChange={(checked) => handleFieldChange('cloud_mode', checked)}
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-amber-900 mb-2">Payment Terminal Configuration Notes</h5>
        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
          <li><strong>Provider:</strong> Choose payment processor (check with your payment gateway provider)</li>
          <li><strong>SDK Version:</strong> Specify provider SDK version or use "latest" (provider-dependent)</li>
          <li><strong>Sandbox Mode:</strong> ALWAYS enable for testing - disables real charges</li>
          <li><strong>Pairing:</strong> Some terminals (PAX, Verifone) require one-time pairing with POS</li>
          <li><strong>Cloud Mode:</strong> Sends transactions to cloud for processing (requires internet)</li>
          <li><strong>Security:</strong> Never log card data - use tokenization and comply with PCI DSS</li>
        </ul>
      </div>

      {/* Provider-Specific Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Provider-Specific Notes</h5>
        <div className="space-y-2 text-sm text-blue-800">
          <div>
            <p className="font-semibold">Stripe Terminal:</p>
            <p className="ml-2">Cloud mode recommended, supports Verifone P400/WisePad 3, BBPOS WisePOS E</p>
          </div>
          <div>
            <p className="font-semibold">PAX:</p>
            <p className="ml-2">Requires pairing, local processing, SDK version critical</p>
          </div>
          <div>
            <p className="font-semibold">Verifone:</p>
            <p className="ml-2">Supports both cloud and local, requires Verifone SDK</p>
          </div>
          <div>
            <p className="font-semibold">Clover:</p>
            <p className="ml-2">Cloud-only, integrated with Clover POS ecosystem</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTerminalConfig;

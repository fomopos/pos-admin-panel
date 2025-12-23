import React from 'react';
import type { AIDLConfig } from '../../../types/hardware-new.types';
import { InputTextField } from '../../ui';

interface AIDLConfigFormProps {
  config: AIDLConfig;
  onChange: (config: AIDLConfig) => void;
  errors?: Record<string, string>;
}

/**
 * AIDLConfigForm - Configuration form for Android AIDL service connections
 * 
 * Handles Android AIDL binding settings including:
 * - Package name (required for service discovery)
 * - Service name (the AIDL service class)
 * - Interface descriptor (AIDL interface definition)
 * - Bind permissions (security requirements)
 * 
 * Used for integrating with Android POS devices and peripherals that expose
 * AIDL interfaces (e.g., Sunmi, PAX, custom Android devices).
 * 
 * @example
 * ```tsx
 * <AIDLConfigForm
 *   config={device.connection_config as AIDLConfig}
 *   onChange={(newConfig) => handleConnectionConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const AIDLConfigForm: React.FC<AIDLConfigFormProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof AIDLConfig, value: string | null) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Package and Service */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Package Name"
          value={config.package_name || ''}
          onChange={(value) => handleFieldChange('package_name', value || null)}
          placeholder="com.sunmi.peripheral"
          error={errors['aidl_config.package_name']}
          required
        />

        <InputTextField
          label="Service Name"
          value={config.service_name || ''}
          onChange={(value) => handleFieldChange('service_name', value || null)}
          placeholder="woyou.aidlservice.jiuiv5.IWoyouService"
          error={errors['aidl_config.service_name']}
          required
        />
      </div>

      {/* Interface and Permissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputTextField
          label="Interface Descriptor"
          value={config.interface_desc || ''}
          onChange={(value) => handleFieldChange('interface_desc', value || null)}
          placeholder="woyou.aidlservice.jiuiv5.IWoyouService"
          error={errors['aidl_config.interface_desc']}
        />

        <InputTextField
          label="Bind Permissions"
          value={config.bind_permissions || ''}
          onChange={(value) => handleFieldChange('bind_permissions', value || null)}
          placeholder="com.sunmi.permission.BIND_SERVICE"
          error={errors['aidl_config.bind_permissions']}
        />
      </div>

      {/* Common AIDL Examples */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-purple-900 mb-2">Common AIDL Configurations</h5>
        <div className="space-y-3 text-sm text-purple-800">
          <div>
            <p className="font-semibold">Sunmi Printer:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Package: <code className="bg-purple-100 px-1 rounded">com.sunmi.peripheral</code></li>
              <li>Service: <code className="bg-purple-100 px-1 rounded">woyou.aidlservice.jiuiv5.IWoyouService</code></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">PAX AIDL:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Package: <code className="bg-purple-100 px-1 rounded">com.pax.market.api</code></li>
              <li>Service: <code className="bg-purple-100 px-1 rounded">com.pax.market.api.IPaxMarketAPI</code></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Custom Device:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Package: Your app package (e.g., <code className="bg-purple-100 px-1 rounded">com.yourcompany.pos</code>)</li>
              <li>Service: Your AIDL interface implementation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">AIDL Configuration Notes</h5>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Interface descriptor typically matches the service name</li>
          <li>Check device manufacturer documentation for exact package/service names</li>
          <li>Some devices require explicit permissions in AndroidManifest.xml</li>
          <li>AIDL connections require Android 4.0+ (API level 14)</li>
        </ul>
      </div>
    </div>
  );
};

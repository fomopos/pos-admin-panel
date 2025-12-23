import React from 'react';
import type { SerialConfig } from '../../../types/hardware-new.types';
import { InputTextField, DropdownSearch } from '../../ui';
import {
  BAUD_RATES,
  DATA_BITS,
  STOP_BITS,
  PARITY_OPTIONS,
  FLOW_CONTROL_OPTIONS,
} from '../../../constants/hardwareOptions';

interface SerialConfigFormProps {
  config: SerialConfig;
  onChange: (config: SerialConfig) => void;
  errors?: Record<string, string>;
}

/**
 * SerialConfigForm - Configuration form for Serial/RS232 connections
 * 
 * Handles serial port configuration including:
 * - Baud rate (communication speed)
 * - Data bits, stop bits, parity (framing)
 * - Flow control (RTS/CTS, XON/XOFF)
 * - Packet terminator (end-of-message marker)
 * 
 * Used for RS232, USB-to-Serial adapters, and RFC2217 network serial.
 * 
 * @example
 * ```tsx
 * <SerialConfigForm
 *   config={device.connection_config as SerialConfig}
 *   onChange={(newConfig) => handleConnectionConfigChange(newConfig)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const SerialConfigForm: React.FC<SerialConfigFormProps> = ({
  config,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof SerialConfig, value: string | number | null) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Serial Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Baud Rate"
          options={BAUD_RATES}
          value={config.baud_rate?.toString() || ''}
          onSelect={(option) => option && handleFieldChange('baud_rate', parseInt(option.id))}
          placeholder="Select baud rate"
          error={errors['serial_config.baud_rate']}
          displayValue={(option) => option ? option.label : 'Select baud rate'}
        />

        <DropdownSearch
          label="Data Bits"
          options={DATA_BITS}
          value={config.data_bits?.toString() || ''}
          onSelect={(option) => option && handleFieldChange('data_bits', parseInt(option.id))}
          placeholder="Select data bits"
          error={errors['serial_config.data_bits']}
          displayValue={(option) => option ? option.label : 'Select data bits'}
        />
      </div>

      {/* Stop Bits and Parity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Stop Bits"
          options={STOP_BITS}
          value={config.stop_bits?.toString() || ''}
          onSelect={(option) => option && handleFieldChange('stop_bits', parseFloat(option.id))}
          placeholder="Select stop bits"
          error={errors['serial_config.stop_bits']}
          displayValue={(option) => option ? option.label : 'Select stop bits'}
        />

        <DropdownSearch
          label="Parity"
          options={PARITY_OPTIONS}
          value={config.parity || ''}
          onSelect={(option) => option && handleFieldChange('parity', option.id as 'none' | 'even' | 'odd')}
          placeholder="Select parity"
          error={errors['serial_config.parity']}
          displayValue={(option) => option ? option.label : 'Select parity'}
        />
      </div>

      {/* Flow Control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSearch
          label="Flow Control"
          options={FLOW_CONTROL_OPTIONS}
          value={config.flow_control || ''}
          onSelect={(option) => option && handleFieldChange('flow_control', option.id)}
          placeholder="Select flow control"
          error={errors['serial_config.flow_control']}
          displayValue={(option) => option ? option.label : 'Select flow control'}
        />

        <InputTextField
          label="Packet Terminator"
          value={config.packet_terminator || ''}
          onChange={(value) => handleFieldChange('packet_terminator', value || null)}
          placeholder="\\r\\n (CRLF)"
          error={errors['serial_config.packet_terminator']}
        />
      </div>

      {/* Common Configurations */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-green-900 mb-2">Common Serial Configurations</h5>
        <div className="space-y-2 text-sm text-green-800">
          <div>
            <p className="font-semibold">Receipt Printers (ESC/POS):</p>
            <p className="ml-2">9600 baud, 8 data bits, 1 stop bit, no parity, no flow control</p>
          </div>
          <div>
            <p className="font-semibold">Label Printers (ZPL):</p>
            <p className="ml-2">9600 or 19200 baud, 8 data bits, 1 stop bit, no parity, XON/XOFF flow control</p>
          </div>
          <div>
            <p className="font-semibold">Payment Terminals:</p>
            <p className="ml-2">115200 baud, 8 data bits, 1 stop bit, no parity, hardware flow control</p>
          </div>
          <div>
            <p className="font-semibold">Barcode Scanners:</p>
            <p className="ml-2">9600 baud, 8 data bits, 1 stop bit, no parity, no flow control, CR terminator</p>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Serial Port Configuration Notes</h5>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Baud Rate:</strong> Communication speed - must match device setting exactly</li>
          <li><strong>Data Bits:</strong> Usually 7 or 8 bits per character (8 is most common)</li>
          <li><strong>Stop Bits:</strong> Signal end of character (1 is standard, 2 for slower devices)</li>
          <li><strong>Parity:</strong> Error checking - usually "None" for modern devices</li>
          <li><strong>Flow Control:</strong> Prevents data overflow - "Hardware" for fast devices, "Software" for compatibility</li>
          <li><strong>Packet Terminator:</strong> Common values: \\r (CR), \\n (LF), \\r\\n (CRLF)</li>
        </ul>
      </div>
    </div>
  );
};

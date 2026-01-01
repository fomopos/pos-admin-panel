/**
 * Hardware Device Card Component
 * 
 * Displays a hardware device with its configuration, connection info, and actions.
 * Updated for new API specification with simplified device types.
 * 
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import React from 'react';
import {
  PrinterIcon,
  QrCodeIcon,
  WifiIcon,
  CpuChipIcon,
  SignalIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  ClockIcon,
  CreditCardIcon,
  ScaleIcon,
  InboxIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import type { HardwareDevice, DeviceType, DeviceRole, ConnectionType, PrinterMode } from '../../types/hardware.types';
import { getRoleDisplayInfo } from '../../constants/hardware.options';

interface HardwareDeviceCardProps {
  device: HardwareDevice;
  onEdit: (device: HardwareDevice) => void;
  onDelete: (deviceId: string) => void;
  onToggle?: () => void;
  onTest?: (deviceId: string) => void;
  showActions?: boolean;
  className?: string;
}

/**
 * HardwareDeviceCard - Displays hardware device information
 */
const HardwareDeviceCard: React.FC<HardwareDeviceCardProps> = ({
  device,
  onEdit,
  onDelete,
  onToggle,
  onTest,
  showActions = true,
  className = ''
}) => {
  // Get device type icon
  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case 'printer':
        return PrinterIcon;
      case 'scanner':
        return QrCodeIcon;
      case 'payment_terminal':
        return CreditCardIcon;
      case 'scale':
        return ScaleIcon;
      case 'cash_drawer':
        return InboxIcon;
      case 'display':
        return ComputerDesktopIcon;
      default:
        return CpuChipIcon;
    }
  };

  // Get connection type icon
  const getConnectionIcon = (connectionType: ConnectionType) => {
    switch (connectionType) {
      case 'network':
        return WifiIcon;
      case 'usb':
        return CpuChipIcon;
      case 'bluetooth':
        return SignalIcon;
      default:
        return CpuChipIcon;
    }
  };

  // Get enabled/disabled styling
  const getStatusConfig = (enabled?: boolean) => {
    if (enabled === false) {
      return {
        icon: XCircleIcon,
        className: 'text-gray-500 bg-gray-50 border border-gray-200',
        label: 'Disabled'
      };
    }
    return {
      icon: CheckCircleIcon,
      className: 'text-green-600 bg-green-50 border border-green-200',
      label: 'Enabled'
    };
  };

  // Get role badge styling
  const getRoleBadgeConfig = (role: DeviceRole) => {
    const roleInfo = getRoleDisplayInfo(role);
    const colorStyles: Record<string, string> = {
      green: 'text-green-700 bg-green-100 border-green-300',
      amber: 'text-amber-700 bg-amber-100 border-amber-300',
      orange: 'text-orange-700 bg-orange-100 border-orange-300',
      blue: 'text-blue-700 bg-blue-100 border-blue-300',
      purple: 'text-purple-700 bg-purple-100 border-purple-300',
      cyan: 'text-cyan-700 bg-cyan-100 border-cyan-300',
      gray: 'text-gray-700 bg-gray-100 border-gray-300'
    };
    return {
      ...roleInfo,
      className: colorStyles[roleInfo.color] || colorStyles.gray
    };
  };

  // Format device type for display
  const formatDeviceType = (type: DeviceType, printerMode?: PrinterMode): string => {
    if (type === 'printer' && printerMode) {
      switch (printerMode) {
        case 'thermal':
          return 'Thermal Printer';
        case 'label':
          return 'Label Printer';
        case 'document':
          return 'Document Printer';
      }
    }
    
    switch (type) {
      case 'printer':
        return 'Printer';
      case 'scanner':
        return 'Barcode Scanner';
      case 'payment_terminal':
        return 'Payment Terminal';
      case 'scale':
        return 'Scale';
      case 'cash_drawer':
        return 'Cash Drawer';
      case 'display':
        return 'Display';
      default:
        // Fallback for unknown types
        return String(type).replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
  };

  // Get connection details string
  const getConnectionDetails = (): string => {
    switch (device.connection_type) {
      case 'network':
        if (device.network_config?.ip_address) {
          return `${device.network_config.ip_address}:${device.network_config.port || 9100}`;
        }
        return 'Network';
      case 'bluetooth':
        if (device.bluetooth_config?.mac_address) {
          return `BT: ${device.bluetooth_config.mac_address}`;
        }
        if (device.bluetooth_config?.device_name) {
          return device.bluetooth_config.device_name;
        }
        return 'Bluetooth';
      case 'usb':
        if (device.usb_config?.vendor_id && device.usb_config?.product_id) {
          const vid = device.usb_config.vendor_id.toString(16).toUpperCase().padStart(4, '0');
          const pid = device.usb_config.product_id.toString(16).toUpperCase().padStart(4, '0');
          return `USB: ${vid}:${pid}`;
        }
        return 'USB';
      default:
        // Fallback for unknown connection types
        return String(device.connection_type).toUpperCase();
    }
  };

  // Get printer-specific info
  const getPrinterInfo = (): string | null => {
    if (device.type !== 'printer' || !device.printer_config) return null;
    
    const parts: string[] = [];
    
    if (device.printer_config.mode) {
      parts.push(device.printer_config.mode.charAt(0).toUpperCase() + device.printer_config.mode.slice(1));
    }
    
    if (device.printer_config.paper) {
      parts.push(device.printer_config.paper);
    }
    
    if (device.printer_config.kitchens && device.printer_config.kitchens.length > 0) {
      parts.push(`KOT: ${device.printer_config.kitchens.join(', ')}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : null;
  };

  // Get device-specific badges
  const getFeatureBadges = () => {
    const badges: { label: string; icon: string }[] = [];
    
    if (device.type === 'printer' && device.printer_config) {
      if (device.printer_config.cut) badges.push({ label: 'Auto-cut', icon: '✂️' });
      if (device.printer_config.drawer) badges.push({ label: 'Drawer', icon: '🗃️' });
      if (device.printer_config.auto) badges.push({ label: 'Auto-print', icon: '🖨️' });
      if (device.printer_config.zpl) badges.push({ label: 'ZPL', icon: '🏷️' });
    }
    
    if (device.type === 'scanner' && device.scanner_config?.beep_on_scan) {
      badges.push({ label: 'Beep', icon: '🔔' });
    }
    
    if (device.type === 'payment_terminal' && device.payment_config?.sandbox_mode) {
      badges.push({ label: 'Sandbox', icon: '🧪' });
    }
    
    return badges;
  };

  const DeviceIcon = getDeviceIcon(device.type);
  const ConnectionIcon = getConnectionIcon(device.connection_type);
  const statusConfig = getStatusConfig(device.enabled);
  const StatusIcon = statusConfig.icon;
  const printerInfo = getPrinterInfo();
  const featureBadges = getFeatureBadges();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* Device Icon */}
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                device.enabled !== false ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <DeviceIcon className="w-5 h-5" />
              </div>
            </div>

            {/* Device Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {device.name || device.id}
                </h3>
                {/* Role Badge */}
                {device.role && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeConfig(device.role).className}`}>
                    <span className="mr-1">{getRoleBadgeConfig(device.role).icon}</span>
                    {getRoleBadgeConfig(device.role).label}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDeviceType(device.type, device.printer_config?.mode)}
              </p>
              {printerInfo && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {printerInfo}
                </p>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          {showActions && (
            <div className="flex items-center space-x-1">
              {onTest && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTest(device.id)}
                  className="px-2 py-1 h-8"
                  title="Test Device"
                >
                  <PlayIcon className="w-4 h-4" />
                </Button>
              )}
              {onToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="px-2 py-1 h-8"
                  title={device.enabled ? 'Disable Device' : 'Enable Device'}
                >
                  {device.enabled ? (
                    <XCircleIcon className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(device)}
                className="px-2 py-1 h-8"
                title="Edit Device"
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(device.id)}
                className="px-2 py-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete Device"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Status</span>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </div>
        </div>

        {/* Connection */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Connection</span>
          <div className="flex items-center space-x-2 text-xs text-gray-700">
            <ConnectionIcon className="w-3 h-3" />
            <span className="font-mono">{getConnectionDetails()}</span>
          </div>
        </div>

        {/* Device-specific info */}
        {device.type === 'scale' && device.scale_config && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Unit</span>
            <span className="text-xs text-gray-700">
              {device.scale_config.unit?.toUpperCase()} ({device.scale_config.decimal_places || 2} decimals)
            </span>
          </div>
        )}

        {device.type === 'payment_terminal' && device.payment_config && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Provider</span>
            <span className="text-xs text-gray-700 capitalize">
              {device.payment_config.provider}
            </span>
          </div>
        )}

        {device.type === 'display' && device.display_config && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Display Size</span>
            <span className="text-xs text-gray-700">
              {device.display_config.line_count} × {device.display_config.chars_per_line} chars
            </span>
          </div>
        )}

        {/* Feature Badges */}
        {featureBadges.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Features</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {featureBadges.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  title={badge.label}
                >
                  <span className="mr-1">{badge.icon}</span>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Terminal ID */}
        {device.terminal_id && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500">Terminal</span>
            <span className="text-xs text-gray-700 font-mono">{device.terminal_id}</span>
          </div>
        )}

        {/* Timestamps */}
        {device.created_at && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500 flex items-center">
              <ClockIcon className="w-3 h-3 mr-1" />
              Created
            </span>
            <span className="text-xs text-gray-700">
              {new Date(device.created_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Named export for new imports
export { HardwareDeviceCard as DeviceCard };

// Default export for backward compatibility
export default HardwareDeviceCard;

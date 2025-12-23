import React from 'react';
import {
  PrinterIcon,
  QrCodeIcon,
  WifiIcon,
  CpuChipIcon,
  SignalIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  ClockIcon,
  CreditCardIcon,
  ScaleIcon,
  TagIcon,
  InboxIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import type { HardwareDevice, DeviceStatus, DeviceType } from '../../types/hardware-new.types';

interface HardwareDeviceCardProps {
  device: HardwareDevice;
  onEdit: (device: HardwareDevice) => void;
  onDelete: (deviceId: string) => void;
  onTest: (deviceId: string) => void;
  showActions?: boolean;
  className?: string;
}

const HardwareDeviceCard: React.FC<HardwareDeviceCardProps> = ({
  device,
  onEdit,
  onDelete,
  onTest,
  showActions = true,
  className = ''
}) => {
  // Get device type icon
  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case 'thermal_printer':
      case 'kot_printer':
      case 'network_printer':
        return PrinterIcon;
      case 'barcode_scanner':
        return QrCodeIcon;
      case 'payment_terminal':
        return CreditCardIcon;
      case 'scale':
        return ScaleIcon;
      case 'label_printer':
        return TagIcon;
      case 'cash_drawer':
        return InboxIcon;
      default:
        return CpuChipIcon;
    }
  };

  // Get connection type icon
  const getConnectionIcon = (connectionType: string) => {
    switch (connectionType) {
      case 'network':
        return WifiIcon;
      case 'usb':
        return CpuChipIcon;
      case 'bluetooth':
        return SignalIcon;
      case 'serial':
        return LinkIcon;
      case 'aidl':
        return CpuChipIcon;
      case 'cloud_print':
      case 'local_print':
      case 'sdk':
      case 'driver':
        return LinkIcon;
      default:
        return CpuChipIcon;
    }
  };

  // Get status styling
  const getStatusConfig = (status?: DeviceStatus | null) => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircleIcon,
          className: 'text-green-600 bg-green-50 border border-green-200',
          label: 'Connected'
        };
      case 'disconnected':
        return {
          icon: XCircleIcon,
          className: 'text-gray-500 bg-gray-50 border border-gray-200',
          label: 'Disconnected'
        };
      case 'degraded':
        return {
          icon: ExclamationTriangleIcon,
          className: 'text-yellow-600 bg-yellow-50 border border-yellow-200',
          label: 'Degraded'
        };
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          className: 'text-red-600 bg-red-50 border border-red-200',
          label: 'Error'
        };
      default:
        return {
          icon: XCircleIcon,
          className: 'text-gray-400 bg-gray-50 border border-gray-200',
          label: 'Unknown'
        };
    }
  };

  // Format device type for display
  const formatDeviceType = (type: DeviceType) => {
    switch (type) {
      case 'thermal_printer':
        return 'Thermal Printer';
      case 'kot_printer':
        return 'Kitchen KOT Printer';
      case 'network_printer':
        return 'Network Printer';
      case 'barcode_scanner':
        return 'Barcode Scanner';
      case 'payment_terminal':
        return 'Payment Terminal';
      case 'scale':
        return 'Scale';
      case 'label_printer':
        return 'Label Printer';
      case 'cash_drawer':
        return 'Cash Drawer';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Get connection details
  const getConnectionDetails = () => {
    if (device.connection_type === 'network' && device.connection_config) {
      const config = device.connection_config as any;
      if (config.ip_address) {
        return `${config.ip_address}${config.port ? `:${config.port}` : ''}`;
      }
    }
    if (device.connection_type === 'bluetooth' && device.connection_config) {
      const config = device.connection_config as any;
      if (config.mac_address) {
        return `BT: ${config.mac_address}`;
      }
    }
    if (device.connection_type === 'usb' && device.connection_config) {
      const config = device.connection_config as any;
      if (config.vendor_id && config.product_id) {
        return `USB: ${config.vendor_id}:${config.product_id}`;
      }
    }
    return device.connection_type.toUpperCase();
  };

  // Get capabilities badges
  const getCapabilitiesBadges = () => {
    if (!device.capabilities) return [];
    const badges = [];
    if (device.capabilities.can_print) badges.push({ label: 'Print', icon: '🖨️' });
    if (device.capabilities.can_scan) badges.push({ label: 'Scan', icon: '📷' });
    if (device.capabilities.can_accept_payment) badges.push({ label: 'Payment', icon: '💳' });
    if (device.capabilities.can_weigh) badges.push({ label: 'Weigh', icon: '⚖️' });
    if (device.capabilities.can_open_drawer) badges.push({ label: 'Drawer', icon: '🗃️' });
    return badges;
  };

  const DeviceIcon = getDeviceIcon(device.device_type || 'printer');
  const ConnectionIcon = getConnectionIcon(device.connection_type);
  const statusConfig = getStatusConfig(device.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* Device Icon */}
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                device.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <DeviceIcon className="w-5 h-5" />
              </div>
            </div>

            {/* Device Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {device.name}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDeviceType(device.device_type || 'printer')}
              </p>
              {device.model && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {device.model}
                </p>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          {showActions && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => device.device_id && onTest(device.device_id)}
                className="px-2 py-1 h-8"
                title="Test Device"
              >
                <PlayIcon className="w-4 h-4" />
              </Button>
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
                onClick={() => device.device_id && onDelete(device.device_id)}
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
          <div className="flex items-center space-x-2">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </div>
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

        {/* Capabilities */}
        {getCapabilitiesBadges().length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Capabilities</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {getCapabilitiesBadges().map((badge) => (
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

        {/* Location */}
        {device.location && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Location</span>
            <span className="text-xs text-gray-700">{device.location}</span>
          </div>
        )}

        {/* Description */}
        {device.description && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600 line-clamp-2">{device.description}</p>
          </div>
        )}

        {/* Last Online */}
        {device.last_online && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500 flex items-center">
              <ClockIcon className="w-3 h-3 mr-1" />
              Last Online
            </span>
            <span className="text-xs text-gray-700">
              {new Date(device.last_online).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HardwareDeviceCard;

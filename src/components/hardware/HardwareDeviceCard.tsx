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
  PlayIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import type { HardwareDevice, HardwareStatus } from '../../types/hardware';

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
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'thermal_printer':
      case 'kitchen_printer':
        return PrinterIcon;
      case 'scanner':
        return QrCodeIcon;
      default:
        return PrinterIcon;
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
      default:
        return CpuChipIcon;
    }
  };

  // Get status styling
  const getStatusConfig = (status: HardwareStatus = 'unknown') => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircleIcon,
          className: 'text-green-600 bg-green-50',
          label: 'Connected'
        };
      case 'disconnected':
        return {
          icon: XCircleIcon,
          className: 'text-gray-500 bg-gray-50',
          label: 'Disconnected'
        };
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          className: 'text-red-600 bg-red-50',
          label: 'Error'
        };
      default:
        return {
          icon: XCircleIcon,
          className: 'text-gray-400 bg-gray-50',
          label: 'Unknown'
        };
    }
  };

  // Format device type for display
  const formatDeviceType = (type: string) => {
    switch (type) {
      case 'thermal_printer':
        return 'Thermal Printer';
      case 'kitchen_printer':
        return 'Kitchen KOT Printer';
      case 'scanner':
        return 'Barcode Scanner';
      case 'cash_drawer':
        return 'Cash Drawer';
      case 'customer_display':
        return 'Customer Display';
      case 'scale':
        return 'Scale';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Get connection details
  const getConnectionDetails = () => {
    if (device.connection_type === 'network' && 'ip_address' in device && device.ip_address) {
      return `${device.ip_address}${device.port ? `:${device.port}` : ''}`;
    }
    if (device.connection_type === 'usb') {
      return 'USB Connection';
    }
    if (device.connection_type === 'bluetooth') {
      return 'Bluetooth Connection';
    }
    if (device.connection_type === 'serial') {
      return 'Serial Connection';
    }
    return device.connection_type.toUpperCase();
  };

  const DeviceIcon = getDeviceIcon(device.type);
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
                {!device.enabled && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Disabled
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDeviceType(device.type)}
              </p>
            </div>
          </div>

          {/* Actions Menu */}
          {showActions && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTest(device.id)}
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
            <span>{getConnectionDetails()}</span>
          </div>
        </div>

        {/* Device-specific info */}
        {device.type === 'thermal_printer' && 'paper_size' in device && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Paper Size</span>
            <span className="text-xs text-gray-700">
              {device.paper_size?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        )}

        {device.type === 'kitchen_printer' && 'kitchen_sections' in device && device.kitchen_sections && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Sections</span>
            <div className="flex flex-wrap gap-1">
              {device.kitchen_sections.slice(0, 2).map((section) => (
                <span
                  key={section}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700"
                >
                  {section.replace('_', ' ')}
                </span>
              ))}
              {device.kitchen_sections.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{device.kitchen_sections.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {device.type === 'scanner' && 'scan_mode' in device && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Scan Mode</span>
            <span className="text-xs text-gray-700">
              {device.scan_mode?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        )}

        {/* Last Connected */}
        {device.last_connected && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Last Connected</span>
            <span className="text-xs text-gray-700">
              {new Date(device.last_connected).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HardwareDeviceCard;

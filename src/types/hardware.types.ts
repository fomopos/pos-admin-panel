/**
 * Hardware Configuration Types - New API Specification
 * 
 * This file contains TypeScript type definitions matching the POS Hardware Devices API
 * for hardware device management.
 * 
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

// ============================================================================
// TYPE DEFINITIONS - Core Device Classification
// ============================================================================

/**
 * DeviceType - Hardware device categories per API spec
 */
export type DeviceType =
  | 'printer'
  | 'scanner'
  | 'cash_drawer'
  | 'scale'
  | 'payment_terminal'
  | 'display';

/**
 * ConnectionType - Transport layer type (simplified per API spec)
 */
export type ConnectionType = 'usb' | 'network' | 'bluetooth';

/**
 * PrinterMode - Printer operation modes
 */
export type PrinterMode = 'thermal' | 'label' | 'document';

/**
 * PaperSize - Supported paper sizes
 */
export type PaperSize = '80mm' | '58mm' | 'a4' | 'a5' | 'letter' | '4x6';

/**
 * CharacterEncoding - Supported character encodings
 */
export type CharacterEncoding = 'utf8' | 'gbk';

/**
 * WeightUnit - Supported weight units
 */
export type WeightUnit = 'kg' | 'lb' | 'g';

// ============================================================================
// CONNECTION CONFIGURATIONS
// ============================================================================

/**
 * NetworkConfig - TCP/IP network device configuration
 */
export interface NetworkConfig {
  /** IP address of the device */
  ip_address: string;
  
  /** Port number */
  port: number;
}

/**
 * BluetoothConfig - Bluetooth device configuration
 */
export interface BluetoothConfig {
  /** MAC address of the Bluetooth device */
  mac_address: string;
  
  /** Device name for discovery */
  device_name?: string;
  
  /** Bluetooth service UUID */
  service_uuid?: string;
}

/**
 * USBConfig - USB device configuration
 */
export interface USBConfig {
  /** USB Vendor ID */
  vendor_id: number;
  
  /** USB Product ID */
  product_id: number;
  
  /** Platform-specific USB device path */
  usb_path?: string;
}

// ============================================================================
// DEVICE-SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * PrinterConfig - Unified printer configuration for all printer modes
 */
export interface PrinterConfig {
  /** Printer mode: thermal, label, document */
  mode: PrinterMode;
  
  /** Paper size: 80mm, 58mm, a4, a5, letter, 4x6 */
  paper?: PaperSize;
  
  /** Custom label width in mm (for custom label sizes) */
  width?: number;
  
  /** Custom label height in mm (for custom label sizes) */
  height?: number;
  
  /** Auto-print when document ready */
  auto?: boolean;
  
  /** Number of copies */
  copies?: number;
  
  /** Character encoding: utf8, gbk */
  encoding?: CharacterEncoding;
  
  /** Auto-cut paper (thermal) */
  cut?: boolean;
  
  /** Open cash drawer after print (thermal) */
  drawer?: boolean;
  
  /** Kitchen sections for KOT routing */
  kitchens?: string[];
  
  /** Supports ZPL commands (label) */
  zpl?: boolean;
}

/**
 * ScannerConfig - Barcode scanner configuration
 */
export interface ScannerConfig {
  /** Prefix to add before scanned data */
  prefix?: string;
  
  /** Suffix to add after scanned data (e.g., "\r\n") */
  suffix?: string;
  
  /** Beep on successful scan */
  beep_on_scan?: boolean;
}

/**
 * PaymentConfig - Payment terminal configuration
 */
export interface PaymentConfig {
  /** Payment provider: stripe, pax, verifone */
  provider: string;
  
  /** Use sandbox/test mode */
  sandbox_mode?: boolean;
}

/**
 * ScaleConfig - Weight scale configuration
 */
export interface ScaleConfig {
  /** Weight unit: kg, lb */
  unit: WeightUnit;
  
  /** Number of decimal places */
  decimal_places?: number;
}

/**
 * DrawerConfig - Cash drawer configuration
 */
export interface DrawerConfig {
  /** ESC/POS command to open drawer */
  open_command?: string;
}

/**
 * DisplayConfig - Customer display / KDS configuration
 */
export interface DisplayConfig {
  /** Number of display lines */
  line_count?: number;
  
  /** Characters per line */
  chars_per_line?: number;
}

// ============================================================================
// MAIN HARDWARE DEVICE INTERFACE
// ============================================================================

/**
 * HardwareDevice - Complete hardware device configuration per API spec
 */
export interface HardwareDevice {
  /** Unique device ID (required - UUID or custom ID) */
  id: string;
  
  /** Human-readable device name */
  name?: string;
  
  /** Device type: printer, scanner, cash_drawer, scale, payment_terminal, display */
  type: DeviceType;
  
  /** Connection method: usb, network, bluetooth */
  connection_type: ConnectionType;
  
  /** Terminal ID this device is assigned to (optional - links to specific terminal) */
  terminal_id?: string;
  
  /** Device enabled/disabled state */
  enabled?: boolean;
  
  // ===== Connection Configurations (exactly one based on connection_type) =====
  
  /** Network connection configuration (for connection_type: "network") */
  network_config?: NetworkConfig;
  
  /** Bluetooth connection configuration (for connection_type: "bluetooth") */
  bluetooth_config?: BluetoothConfig;
  
  /** USB connection configuration (for connection_type: "usb") */
  usb_config?: USBConfig;
  
  // ===== Device Configurations (exactly one based on type) =====
  
  /** Printer configuration (for type: "printer") */
  printer_config?: PrinterConfig;
  
  /** Scanner configuration (for type: "scanner") */
  scanner_config?: ScannerConfig;
  
  /** Payment terminal configuration (for type: "payment_terminal") */
  payment_config?: PaymentConfig;
  
  /** Scale configuration (for type: "scale") */
  scale_config?: ScaleConfig;
  
  /** Cash drawer configuration (for type: "cash_drawer") */
  drawer_config?: DrawerConfig;
  
  /** Display configuration (for type: "display") */
  display_config?: DisplayConfig;
  
  // ===== Timestamps =====
  
  /** Device creation timestamp */
  created_at?: string;
  
  /** Last update timestamp */
  updated_at?: string;
}

// ============================================================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

/**
 * CreateHardwareDTO - DTO for creating a new hardware device
 */
export interface CreateHardwareDTO {
  id: string;
  name?: string;
  type: DeviceType;
  connection_type: ConnectionType;
  terminal_id?: string;
  enabled?: boolean;
  network_config?: NetworkConfig;
  bluetooth_config?: BluetoothConfig;
  usb_config?: USBConfig;
  printer_config?: PrinterConfig;
  scanner_config?: ScannerConfig;
  payment_config?: PaymentConfig;
  scale_config?: ScaleConfig;
  drawer_config?: DrawerConfig;
  display_config?: DisplayConfig;
}

/**
 * UpdateHardwareDTO - DTO for updating an existing hardware device (partial updates supported)
 */
export interface UpdateHardwareDTO {
  name?: string;
  enabled?: boolean;
  connection_type?: ConnectionType;
  network_config?: NetworkConfig | null;
  bluetooth_config?: BluetoothConfig | null;
  usb_config?: USBConfig | null;
  printer_config?: PrinterConfig;
  scanner_config?: ScannerConfig;
  payment_config?: PaymentConfig;
  scale_config?: ScaleConfig;
  drawer_config?: DrawerConfig;
  display_config?: DisplayConfig;
}

/**
 * HardwareListResponse - API response for listing devices
 */
export interface HardwareListResponse {
  hardware: HardwareDevice[];
  next?: string | null;
}

/**
 * HardwareQueryParams - Query parameters for listing devices
 */
export interface HardwareQueryParams {
  terminal_id?: string;
  type?: DeviceType;
  limit?: number;
  next?: string;
}

// ============================================================================
// API ERROR RESPONSES
// ============================================================================

/**
 * HardwareApiError - API error response structure
 */
export interface HardwareApiError {
  code: string;
  message: string;
}

// ============================================================================
// TYPE GUARDS & UTILITIES
// ============================================================================

/**
 * Type guard to check if a device is a printer
 */
export function isPrinterDevice(device: HardwareDevice): boolean {
  return device.type === 'printer';
}

/**
 * Type guard to check if a device is a scanner
 */
export function isScannerDevice(device: HardwareDevice): boolean {
  return device.type === 'scanner';
}

/**
 * Type guard to check if a device uses network connection
 */
export function usesNetworkConnection(device: HardwareDevice): boolean {
  return device.connection_type === 'network';
}

/**
 * Type guard to check if a device uses Bluetooth connection
 */
export function usesBluetoothConnection(device: HardwareDevice): boolean {
  return device.connection_type === 'bluetooth';
}

/**
 * Type guard to check if a device uses USB connection
 */
export function usesUSBConnection(device: HardwareDevice): boolean {
  return device.connection_type === 'usb';
}

/**
 * Get the connection config for a device based on its connection type
 */
export function getConnectionConfig(device: HardwareDevice): NetworkConfig | BluetoothConfig | USBConfig | undefined {
  switch (device.connection_type) {
    case 'network':
      return device.network_config;
    case 'bluetooth':
      return device.bluetooth_config;
    case 'usb':
      return device.usb_config;
  }
}

/**
 * Get the device config for a device based on its type
 */
export function getDeviceConfig(device: HardwareDevice): PrinterConfig | ScannerConfig | PaymentConfig | ScaleConfig | DrawerConfig | DisplayConfig | undefined {
  switch (device.type) {
    case 'printer':
      return device.printer_config;
    case 'scanner':
      return device.scanner_config;
    case 'payment_terminal':
      return device.payment_config;
    case 'scale':
      return device.scale_config;
    case 'cash_drawer':
      return device.drawer_config;
    case 'display':
      return device.display_config;
  }
}

/**
 * Validate that device has correct connection config for its connection type
 */
export function validateConnectionConfig(device: HardwareDevice): boolean {
  switch (device.connection_type) {
    case 'network':
      return !!device.network_config?.ip_address && !!device.network_config?.port;
    case 'bluetooth':
      return !!device.bluetooth_config?.mac_address;
    case 'usb':
      return !!device.usb_config?.vendor_id && !!device.usb_config?.product_id;
    default:
      return false;
  }
}

/**
 * Validate that device has correct device config for its type
 */
export function validateDeviceConfig(device: HardwareDevice): boolean {
  switch (device.type) {
    case 'printer':
      return !!device.printer_config?.mode;
    case 'scanner':
      return !!device.scanner_config;
    case 'payment_terminal':
      return !!device.payment_config?.provider;
    case 'scale':
      return !!device.scale_config?.unit;
    case 'cash_drawer':
      return !!device.drawer_config;
    case 'display':
      return !!device.display_config;
    default:
      return false;
  }
}

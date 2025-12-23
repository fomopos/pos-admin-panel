/**
 * Hardware Configuration Types - New Backend Specification
 * 
 * This file contains TypeScript type definitions matching the Go backend specification
 * for hardware device management. It includes hierarchical device classification,
 * modular connection configurations, capabilities, and comprehensive device configs.
 * 
 * @see docs/HARDWARE_CONFIGURATION_MIGRATION_PLAN.md
 */

// ============================================================================
// TYPE DEFINITIONS - Core Device Classification
// ============================================================================

/**
 * DeviceType - High-level device categories (extended with subtypes for UI compatibility)
 */
export type DeviceType =
  | 'printer'
  | 'scanner'
  | 'cash_drawer'
  | 'label_printer'
  | 'scale'
  | 'payment_terminal'
  | 'kds'
  | 'customer_display'
  // UI compatibility - subtype aliases
  | 'thermal_printer'
  | 'kot_printer'
  | 'network_printer'
  | 'barcode_scanner';

/**
 * DeviceSubType - Fine-grained device classification
 */
export type DeviceSubType =
  | 'thermal_printer'
  | 'kitchen_printer'
  | 'network_printer'
  | 'barcode_scanner'
  | 'magstripe_reader'
  | 'rfid_reader'
  | 'fiscal_printer';

/**
 * DeviceStatus - Connection and health state
 */
export type DeviceStatus =
  | 'connected'
  | 'disconnected'
  | 'degraded'
  | 'error';

/**
 * ConnectionType - Transport layer type
 */
export type ConnectionType =
  | 'usb'
  | 'network'
  | 'bluetooth'
  | 'bluetooth_le'
  | 'aidl'
  | 'http'
  | 'websocket'
  | 'nfc'
  | 'serial';

// ============================================================================
// CONNECTION CONFIGURATIONS
// ============================================================================

/**
 * NetworkConfig - TCP/IP/HTTP/WebSocket device configuration
 */
export interface NetworkConfig {
  /** IP address of the device */
  ip_address?: string | null;
  
  /** Port number */
  port?: number | null;
  
  /** Protocol type: raw, ipp, lpr, http, ws, rfc2217 */
  protocol?: string | null;
  
  /** Connection timeout in milliseconds */
  connect_timeout_ms?: number | null;
  
  /** Read timeout in milliseconds */
  read_timeout_ms?: number | null;
  
  /** Write timeout in milliseconds */
  write_timeout_ms?: number | null;
  
  /** Heartbeat command as raw bytes (ESC/POS, etc.) */
  heartbeat_command?: number[] | null;
  
  /** Expected heartbeat response bytes */
  expected_heartbeat_response?: number[] | null;
  
  /** Use mDNS for device discovery */
  use_mdns?: boolean | null;
}

/**
 * BluetoothConfig - Classic Bluetooth and SPP configuration
 */
export interface BluetoothConfig {
  /** MAC address of the Bluetooth device */
  mac_address?: string | null;
  
  /** Device name for discovery */
  device_name?: string | null;
  
  /** Bluetooth service UUID */
  service_uuid?: string | null;
  
  /** Whether device is paired */
  paired?: boolean | null;
  
  /** Automatically reconnect on connection loss */
  auto_reconnect?: boolean | null;
  
  /** Received Signal Strength Indicator (RSSI) */
  rssi?: number | null;
}

/**
 * USBConfig - HID and generic USB device configuration
 */
export interface USBConfig {
  /** USB Vendor ID */
  vendor_id?: number | null;
  
  /** USB Product ID */
  product_id?: number | null;
  
  /** Platform-specific USB device path */
  usb_path?: string | null;
  
  /** HID usage page */
  usage_page?: number | null;
  
  /** HID usage */
  usage?: number | null;
}

/**
 * AIDLConfig - Android AIDL service binding configuration
 */
export interface AIDLConfig {
  /** Android package name */
  package_name?: string | null;
  
  /** Service name within the package */
  service_name?: string | null;
  
  /** AIDL interface descriptor */
  interface_desc?: string | null;
  
  /** Required bind permissions */
  bind_permissions?: string | null;
}

/**
 * SerialConfig - USB-Serial and RFC2217 configuration
 */
export interface SerialConfig {
  /** Baud rate (e.g., 9600, 115200) */
  baud_rate?: number | null;
  
  /** Data bits (5, 6, 7, 8) */
  data_bits?: number | null;
  
  /** Stop bits (1, 1.5, 2) */
  stop_bits?: number | null;
  
  /** Parity: none, even, odd */
  parity?: 'none' | 'even' | 'odd' | null;
  
  /** Flow control: none, hardware, software */
  flow_control?: string | null;
  
  /** Packet terminator (e.g., CR, LF, CRLF) */
  packet_terminator?: string | null;
}

// ============================================================================
// CAPABILITIES
// ============================================================================

/**
 * Capabilities - Device feature flags and supported formats
 */
export interface Capabilities {
  /** Device can print */
  can_print?: boolean | null;
  
  /** Device can open cash drawer */
  can_open_drawer?: boolean | null;
  
  /** Device can scan barcodes/QR codes */
  can_scan?: boolean | null;
  
  /** Device can accept payments */
  can_accept_payment?: boolean | null;
  
  /** Device can weigh items */
  can_weigh?: boolean | null;
  
  /** Supports ESC/POS commands */
  supports_escpos?: boolean | null;
  
  /** Supports ZPL (Zebra Programming Language) */
  supports_zpl?: boolean | null;
  
  /** Has paper cutter */
  supports_cutter?: boolean | null;
  
  /** Supported document/image formats */
  supported_formats?: string[] | null;
  
  /** Supported barcode symbologies */
  supported_symbologies?: string[] | null;
  
  /** Maximum resolution (e.g., "1200x1200 dpi") */
  max_resolution?: string | null;
}

// ============================================================================
// DEVICE-SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * ThermalPrinterConfig - Receipt printer configuration
 */
export interface ThermalPrinterConfig {
  /** Paper size: thermal_58mm, thermal_80mm */
  paper_size?: string | null;
  
  /** Auto-print receipts */
  auto_print?: boolean | null;
  
  /** Number of copies to print */
  print_copies?: number | null;
  
  /** Cut paper after printing */
  cut_paper?: boolean | null;
  
  /** Open cash drawer after printing */
  open_drawer?: boolean | null;
  
  /** Character encoding: utf8, ascii, windows1252 */
  character_encoding?: string | null;
  
  /** Print density (0-255) */
  density?: number | null;
  
  /** Character set */
  charset?: string | null;
}

/**
 * KotPrinterConfig - Kitchen Order Ticket printer configuration
 */
export interface KotPrinterConfig {
  /** Paper size: thermal_58mm, thermal_80mm */
  paper_size?: string | null;
  
  /** Print header with restaurant info */
  print_header?: boolean | null;
  
  /** Print timestamp on tickets */
  print_timestamp?: boolean | null;
  
  /** Print order number */
  print_order_number?: boolean | null;
  
  /** Print table information */
  print_table_info?: boolean | null;
  
  /** Automatically cut paper */
  auto_cut?: boolean | null;
  
  /** Character encoding: utf8, ascii, windows1252 */
  character_encoding?: string | null;
  
  /** Kitchen sections this printer serves */
  kitchen_sections?: string[] | null;
}

/**
 * NetworkPrinterConfig - Standard office network printer configuration
 */
export interface NetworkPrinterConfig {
  /** Paper size: A4, Letter, Legal, etc. */
  paper_size?: string | null;
  
  /** Paper orientation: portrait, landscape */
  paper_orientation?: string | null;
  
  /** Print quality: draft, normal, high, photo */
  print_quality?: string | null;
  
  /** Color mode: color, monochrome, grayscale */
  color_mode?: string | null;
  
  /** Enable duplex (double-sided) printing */
  duplex_printing?: boolean | null;
  
  /** Number of copies to print */
  print_copies?: number | null;
  
  /** Supported document formats */
  supported_formats?: string[] | null;
  
  /** Maximum resolution */
  max_resolution?: string | null;
  
  /** Paper tray capacity */
  tray_capacity?: number | null;
  
  /** Automatic paper size detection */
  auto_paper_detection?: boolean | null;
  
  /** Protocol: raw, ipp, lpr */
  protocol?: string | null;
}

/**
 * BarcodeScannerConfig - Barcode/QR code scanner configuration
 */
export interface BarcodeScannerConfig {
  /** Prefix to add before scanned data */
  prefix?: string | null;
  
  /** Suffix to add after scanned data */
  suffix?: string | null;
  
  /** Minimum barcode length */
  min_length?: number | null;
  
  /** Maximum barcode length */
  max_length?: number | null;
  
  /** Scan mode: trigger, continuous, presentation */
  scan_mode?: string | null;
  
  /** Beep on successful scan */
  beep_on_scan?: boolean | null;
  
  /** Supported barcode types */
  decode_types?: string[] | null;
  
  /** Continuous scan interval in milliseconds */
  continuous_scan_interval_ms?: number | null;
}

/**
 * PaymentTerminalConfig - Payment terminal configuration
 */
export interface PaymentTerminalConfig {
  /** Use sandbox/test mode */
  sandbox_mode?: boolean | null;
  
  /** Payment provider: stripe, pax, verifone */
  provider?: string | null;
  
  /** SDK version */
  sdk_version?: string | null;
  
  /** Requires device pairing */
  requires_pairing?: boolean | null;
  
  /** Use cloud-based processing */
  cloud_mode?: boolean | null;
}

/**
 * ScaleConfig - Weight scale configuration
 */
export interface ScaleConfig {
  /** Weight unit: kg, g, lb */
  unit?: string | null;
  
  /** Time to stabilize reading in milliseconds */
  stabilize_time_ms?: number | null;
  
  /** Number of decimal places */
  decimal_places?: number | null;
}

/**
 * LabelPrinterConfig - Label printer configuration
 */
export interface LabelPrinterConfig {
  /** Supported label widths in mm */
  supported_label_widths?: number[] | null;
  
  /** Maximum label length in mm */
  max_length_mm?: number | null;
  
  /** Supports ZPL (Zebra Programming Language) */
  supports_zpl?: boolean | null;
}

// ============================================================================
// MAIN HARDWARE DEVICE INTERFACE
// ============================================================================

/**
 * HardwareDevice - Complete hardware device configuration
 */
export interface HardwareDevice {
  // ===== Primary Identifiers =====
  /** Unique device ID (UUID) */
  id: string;
  
  /** Device-specific unique identifier (MAC address, USB path, IP:port, etc.) */
  device_unique_id?: string | null;
  
  /** Human-readable device name */
  name?: string | null;
  
  /** High-level device type */
  type: DeviceType;
  
  /** Specific device subtype */
  subtype?: DeviceSubType | null;
  
  // ===== Vendor & Model Metadata =====
  /** Device vendor/manufacturer */
  vendor?: string | null;
  
  /** Device model number/name */
  model?: string | null;
  
  /** Firmware version */
  firmware?: string | null;
  
  /** Hardware revision */
  hardware_rev?: string | null;
  
  // ===== Association =====
  /** Store ID this device belongs to */
  store_id?: string | null;
  
  /** Terminal ID this device is assigned to */
  terminal_id?: string | null;
  
  // ===== Connection Configuration =====
  /** Connection transport type */
  connection_type: ConnectionType;
  
  /** Network connection configuration */
  network_config?: NetworkConfig | null;
  
  /** Bluetooth connection configuration */
  bluetooth_config?: BluetoothConfig | null;
  
  /** USB connection configuration */
  usb_config?: USBConfig | null;
  
  /** AIDL connection configuration (Android) */
  aidl_config?: AIDLConfig | null;
  
  /** Serial connection configuration */
  serial_config?: SerialConfig | null;
  
  // ===== Capabilities =====
  /** Device capabilities and supported features */
  capabilities?: Capabilities | null;
  
  /** Vendor-specific features (key-value pairs) */
  vendor_features?: Record<string, string> | null;
  
  // ===== Device-Specific Configuration =====
  /** Thermal printer configuration */
  thermal_config?: ThermalPrinterConfig | null;
  
  /** Kitchen printer configuration */
  kot_config?: KotPrinterConfig | null;
  
  /** Network printer configuration */
  network_printer?: NetworkPrinterConfig | null;
  
  /** Barcode scanner configuration */
  scanner_config?: BarcodeScannerConfig | null;
  
  /** Payment terminal configuration */
  payment_config?: PaymentTerminalConfig | null;
  
  /** Scale configuration */
  scale_config?: ScaleConfig | null;
  
  /** Label printer configuration */
  label_config?: LabelPrinterConfig | null;
  
  // ===== Status & Diagnostics =====
  /** Device enabled/disabled state */
  enabled?: boolean | null;
  
  /** Current device status */
  status?: DeviceStatus | null;
  
  /** Last successful connection timestamp */
  last_connected?: Date | string | null;
  
  /** Last time device was seen/detected */
  last_seen?: Date | string | null;
  
  /** Last health check timestamp */
  last_health_check?: Date | string | null;
  
  /** Connection latency in milliseconds */
  connection_latency_ms?: number | null;
  
  /** Signal strength (RSSI for wireless connections) */
  signal_strength?: number | null;
  
  // ===== Discovery & Lifecycle =====
  /** How device was discovered: mdns, udp_broadcast, bt_scan, usb_hotplug, manual */
  discovery_method?: string | null;
  
  /** First time device was detected */
  first_seen_at?: Date | string | null;
  
  /** Device creation timestamp */
  created_at: Date | string;
  
  /** Last update timestamp */
  updated_at: Date | string;
  
  /** Additional notes about the device */
  notes?: string | null;
  
  // ===== UI Compatibility Aliases (for frontend components) =====
  /** Alias for 'id' field */
  device_id?: string;
  
  /** Alias for 'type' field */
  device_type?: DeviceType;
  
  /** Alias for 'vendor' field */
  manufacturer?: string | null;
  
  /** Alias for 'firmware' field */
  firmware_version?: string | null;
  
  /** Alias for 'notes' field */
  description?: string | null;
  
  /** Physical location of device */
  location?: string | null;
  
  /** Serial number */
  serial_number?: string | null;
  
  /** Alias for 'last_seen' field */
  last_online?: Date | string | null;
  
  /** Generic connection config (union of all connection types) */
  connection_config?: NetworkConfig | BluetoothConfig | USBConfig | AIDLConfig | SerialConfig | null;
  
  /** Generic device config (union of all device configs) */
  device_config?: ThermalPrinterConfig | KotPrinterConfig | NetworkPrinterConfig | BarcodeScannerConfig | PaymentTerminalConfig | ScaleConfig | LabelPrinterConfig | null;
}

// ============================================================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

/**
 * CreateHardwareDTO - DTO for creating a new hardware device
 */
export interface CreateHardwareDTO {
  id?: string | null;
  device_unique_id?: string | null;
  name?: string | null;
  type: DeviceType;
  subtype?: DeviceSubType | null;
  vendor?: string | null;
  model?: string | null;
  connection_type: ConnectionType;
  network_config?: NetworkConfig | null;
  bluetooth_config?: BluetoothConfig | null;
  usb_config?: USBConfig | null;
  aidl_config?: AIDLConfig | null;
  serial_config?: SerialConfig | null;
  capabilities?: Capabilities | null;
  thermal_config?: ThermalPrinterConfig | null;
  kot_config?: KotPrinterConfig | null;
  network_printer?: NetworkPrinterConfig | null;
  scanner_config?: BarcodeScannerConfig | null;
  payment_config?: PaymentTerminalConfig | null;
  scale_config?: ScaleConfig | null;
  label_config?: LabelPrinterConfig | null;
  store_id?: string | null;
  terminal_id?: string | null;
  enabled?: boolean | null;
  test_mode?: boolean | null;
  notes?: string | null;
}

/**
 * UpdateHardwareDTO - DTO for updating an existing hardware device
 */
export interface UpdateHardwareDTO {
  device_unique_id?: string | null;
  name?: string | null;
  subtype?: DeviceSubType | null;
  vendor?: string | null;
  model?: string | null;
  firmware?: string | null;
  hardware_rev?: string | null;
  connection_type?: ConnectionType | null;
  network_config?: NetworkConfig | null;
  bluetooth_config?: BluetoothConfig | null;
  usb_config?: USBConfig | null;
  aidl_config?: AIDLConfig | null;
  serial_config?: SerialConfig | null;
  capabilities?: Capabilities | null;
  vendor_features?: Record<string, string> | null;
  thermal_config?: ThermalPrinterConfig | null;
  kot_config?: KotPrinterConfig | null;
  network_printer?: NetworkPrinterConfig | null;
  scanner_config?: BarcodeScannerConfig | null;
  payment_config?: PaymentTerminalConfig | null;
  scale_config?: ScaleConfig | null;
  label_config?: LabelPrinterConfig | null;
  store_id?: string | null;
  terminal_id?: string | null;
  enabled?: boolean | null;
  status?: DeviceStatus | null;
  notes?: string | null;
}

/**
 * HardwareDeviceResponse - API response for device operations
 */
export interface HardwareDeviceResponse {
  message: string;
  device: HardwareDevice;
}

/**
 * HardwareDeviceListResponse - API response for listing devices
 */
export interface HardwareDeviceListResponse {
  devices: HardwareDevice[];
  total: number;
  page?: number | null;
  page_size?: number | null;
  has_more?: boolean | null;
}

/**
 * HardwareTestRequest - Request to test device connection
 */
export interface HardwareTestRequest {
  device_id: string;
  test_type: 'connection' | 'print_test' | 'scan_test' | 'display_test' | 'payment_test' | 'weigh_test';
  test_data?: any;
}

/**
 * HardwareTestResponse - Response from device test
 */
export interface HardwareTestResponse {
  device_id: string;
  test_type: string;
  success: boolean;
  message: string;
  response_time_ms?: number | null;
  error_code?: string | null;
  diagnostic_data?: any;
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
 * Type guard to check if a device uses wireless connection
 */
export function usesWirelessConnection(device: HardwareDevice): boolean {
  const wirelessTypes: ConnectionType[] = ['bluetooth', 'bluetooth_le', 'nfc'];
  return wirelessTypes.includes(device.connection_type);
}

// Hardware Configuration Types
export type HardwareConnectionType = 'usb' | 'network' | 'bluetooth' | 'serial';
export type HardwareStatus = 'connected' | 'disconnected' | 'error' | 'unknown';

// Base hardware device interface
export interface BaseHardwareDevice {
  id: string;
  name: string;
  enabled: boolean;
  status?: HardwareStatus;
  last_connected?: string;
  created_at?: string;
  updated_at?: string;
}

// Thermal Printer Configuration
export interface ThermalPrinterConfig extends BaseHardwareDevice {
  type: 'thermal_printer';
  printer_model?: string;
  connection_type: HardwareConnectionType;
  ip_address?: string;
  port?: number;
  paper_size: 'thermal_58mm' | 'thermal_80mm' | 'a4' | 'letter';
  auto_print: boolean;
  print_copies: number;
  cut_paper: boolean;
  open_drawer: boolean;
  character_encoding: 'utf8' | 'ascii' | 'windows1252';
  test_mode: boolean;
}

// Kitchen KOT Printer Configuration
export interface KitchenPrinterConfig extends BaseHardwareDevice {
  type: 'kitchen_printer';
  printer_model?: string;
  connection_type: HardwareConnectionType;
  ip_address?: string;
  port?: number;
  paper_size: 'thermal_58mm' | 'thermal_80mm';
  print_header: boolean;
  print_timestamp: boolean;
  print_order_number: boolean;
  print_table_info: boolean;
  auto_cut: boolean;
  character_encoding: 'utf8' | 'ascii' | 'windows1252';
  kitchen_sections: string[]; // e.g., ['hot_kitchen', 'cold_kitchen', 'bar']
}

// Scanner Configuration
export interface ScannerConfig extends BaseHardwareDevice {
  type: 'scanner';
  scanner_model?: string;
  connection_type: HardwareConnectionType;
  prefix?: string;
  suffix?: string;
  min_length: number;
  max_length: number;
  scan_mode: 'manual' | 'continuous' | 'trigger';
  beep_on_scan: boolean;
  decode_types: string[]; // e.g., ['CODE128', 'EAN13', 'QR_CODE']
}

// Cash Drawer Configuration
export interface CashDrawerConfig extends BaseHardwareDevice {
  type: 'cash_drawer';
  connection_type: HardwareConnectionType;
  auto_open: boolean;
  trigger_event: 'sale_complete' | 'payment_received' | 'manual';
  open_duration: number; // seconds
}

// Customer Display Configuration
export interface CustomerDisplayConfig extends BaseHardwareDevice {
  type: 'customer_display';
  display_model?: string;
  connection_type: HardwareConnectionType;
  display_type: 'lcd' | 'led' | 'oled';
  character_set: 'ascii' | 'utf8';
  welcome_message: string;
  show_total: boolean;
  show_change: boolean;
  brightness: number; // 1-10
}

// Scale Configuration
export interface ScaleConfig extends BaseHardwareDevice {
  type: 'scale';
  scale_model?: string;
  connection_type: HardwareConnectionType;
  unit: 'kg' | 'lb' | 'g';
  precision: number; // decimal places
  tare_weight: number;
  auto_zero: boolean;
}

// Union type for all hardware devices
export type HardwareDevice = 
  | ThermalPrinterConfig
  | KitchenPrinterConfig 
  | ScannerConfig
  | CashDrawerConfig
  | CustomerDisplayConfig
  | ScaleConfig;

// Hardware configuration levels
export interface StoreHardwareConfig {
  store_id: string;
  devices: HardwareDevice[];
  default_settings: {
    auto_detect_devices: boolean;
    device_timeout: number; // seconds
    retry_attempts: number;
    log_level: 'debug' | 'info' | 'warn' | 'error';
  };
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface TerminalHardwareConfig {
  terminal_id: string;
  store_id: string;
  devices: HardwareDevice[];
  overrides: {
    [deviceId: string]: Partial<HardwareDevice>;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// Hardware configuration request/response types
export interface CreateHardwareConfigRequest {
  tenant_id: string;
  store_id: string;
  terminal_id?: string; // Optional for store-level config
  devices: Omit<HardwareDevice, 'id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateHardwareConfigRequest {
  devices: HardwareDevice[];
  default_settings?: StoreHardwareConfig['default_settings'];
}

export interface HardwareConfigResponse {
  store_config: StoreHardwareConfig;
  terminal_configs: TerminalHardwareConfig[];
}

// Hardware test/connection types
export interface HardwareTestRequest {
  device_id: string;
  test_type: 'connection' | 'print_test' | 'scan_test' | 'display_test';
  test_data?: any;
}

export interface HardwareTestResponse {
  device_id: string;
  test_type: string;
  success: boolean;
  message: string;
  response_time?: number;
  error_code?: string;
}

// Hardware status monitoring
export interface HardwareStatusUpdate {
  device_id: string;
  status: HardwareStatus;
  message?: string;
  timestamp: string;
}

// Dropdown options for hardware forms
export interface HardwareOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

// Error types
export interface HardwareError {
  code: string;
  message: string;
  device_id?: string;
  timestamp: string;
}

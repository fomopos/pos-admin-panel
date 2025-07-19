// Hardware Device Types based on API Specification
export type DeviceType = 'thermal_printer' | 'kitchen_printer' | 'scanner' | 'cash_drawer' | 'label_printer' | 'network_printer';
export type ConnectionType = 'usb' | 'network' | 'bluetooth';
export type DeviceStatus = 'connected' | 'disconnected' | 'error';

// Paper sizes for thermal printers
export type ThermalPaperSize = 'thermal_80mm' | 'thermal_58mm';

// Paper sizes for network printers
export type NetworkPaperSize = 'A4' | 'A5' | 'Letter' | 'Legal' | 'A3' | 'B4' | 'B5' | 'Executive';

// Paper orientations
export type PaperOrientation = 'portrait' | 'landscape';

// Print quality options
export type PrintQuality = 'draft' | 'normal' | 'high' | 'photo';

// Color modes
export type ColorMode = 'color' | 'monochrome' | 'grayscale';

// Scan modes
export type ScanMode = 'manual' | 'automatic';

// Character encodings
export type CharacterEncoding = 'utf8' | 'ascii';

// Barcode decode types
export type BarcodeDecodeType = 'CODE128' | 'EAN13' | 'UPC' | 'QR_CODE' | 'CODE39' | 'PDF417';

export type LabelSize = '62x100mm' | '62x150mm' | '102x150mm' | '102x200mm' | '58x40mm' | '76x51mm';
export type PrintDensity = '203dpi' | '300dpi' | '600dpi';
export type PrintSpeed = '50mm/s' | '100mm/s' | '150mm/s' | '200mm/s';

// Kitchen sections
export type KitchenSection = 'hot_kitchen' | 'cold_kitchen' | 'grill' | 'fryer' | 'salad_station' | 'bakery' | 'bar' | 'dessert_station';

// Cash Drawer Configuration
export interface CashDrawerConfig {
  drawer_model: string;
  ip_address?: string;
  port?: number;
  auto_open: boolean;
  monitor_status: boolean;
  alert_on_open: boolean;
  open_timeout: number;
  pulse_duration: number;
  pulse_strength: number;
}

// Label Printer Configuration
export interface LabelPrinterConfig {
  printer_model: string;
  ip_address?: string;
  port?: number;
  label_size: LabelSize;
  print_density: PrintDensity;
  print_speed: PrintSpeed;
  character_encoding: CharacterEncoding;
  auto_cut: boolean;
  print_copies: number;
  calibration_enabled: boolean;
}

// Thermal Printer Configuration
export interface ThermalPrinterConfig {
  printer_model: string;
  ip_address?: string;
  port?: number;
  paper_size: ThermalPaperSize;
  auto_print: boolean;
  print_copies: number;
  cut_paper: boolean;
  open_drawer: boolean;
  character_encoding: CharacterEncoding;
}

// Kitchen/KOT Printer Configuration
export interface KotPrinterConfig {
  printer_model: string;
  ip_address?: string;
  port?: number;
  paper_size: ThermalPaperSize;
  print_header: boolean;
  print_timestamp: boolean;
  print_order_number: boolean;
  print_table_info: boolean;
  auto_cut: boolean;
  character_encoding: CharacterEncoding;
  kitchen_sections: KitchenSection[];
}

// Network Printer Configuration
export interface NetworkPrinterConfig {
  printer_model: string;
  ip_address?: string;
  port?: number;
  paper_size: NetworkPaperSize;
  paper_orientation: PaperOrientation;
  print_quality: PrintQuality;
  color_mode: ColorMode;
  duplex_printing: boolean;
  print_copies: number;
  character_encoding: CharacterEncoding;
  supported_formats: string[];
  max_resolution: string;
  tray_capacity: number;
  auto_paper_detection: boolean;
}

// Barcode Scanner Configuration
export interface BarcodeScannerConfig {
  scanner_model: string;
  prefix: string;
  suffix: string;
  min_length: number;
  max_length: number;
  scan_mode: ScanMode;
  beep_on_scan: boolean;
  decode_types: BarcodeDecodeType[];
}

// Main Hardware Device Interface
export interface HardwareDevice {
  hardware_id: string; // Updated field name to match API response
  tenant_id: string;   // Added tenant_id field
  store_id: string;
  name: string;
  type: DeviceType;
  enabled: boolean;
  status: DeviceStatus;
  connection_type: ConnectionType;
  test_mode: boolean;
  terminal_id?: string;
  last_connected: string; // ISO 8601 timestamp
  
  // Device-specific configurations (only one will be populated based on type)
  thermal_printer: Partial<ThermalPrinterConfig> | null;
  kot_printer: Partial<KotPrinterConfig> | null;
  network_printer: Partial<NetworkPrinterConfig> | null;
  barcode_scanner: Partial<BarcodeScannerConfig> | null;
  cash_drawer: Partial<CashDrawerConfig> | null;
  label_printer: Partial<LabelPrinterConfig> | null;
  
  // Additional API fields
  properties?: any;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by?: string | null;
}

// API Response for getting hardware devices with pagination
export interface HardwareDeviceListResponse {
  hardware: HardwareDevice[];
  has_more: boolean;
  next_token?: string;
}

// Create Device Request
export interface CreateHardwareDeviceRequest {
  id: string;
  name: string;
  type: DeviceType;
  enabled: boolean;
  status: DeviceStatus;
  connection_type: ConnectionType;
  test_mode: boolean;
  store_id: string;
  terminal_id: string | null;
  last_connected: string;
  thermal_printer: Partial<ThermalPrinterConfig> | null;
  kot_printer: Partial<KotPrinterConfig> | null;
  network_printer: Partial<NetworkPrinterConfig> | null;
  barcode_scanner: Partial<BarcodeScannerConfig> | null;
  cash_drawer: Partial<CashDrawerConfig> | null;
  label_printer: Partial<LabelPrinterConfig> | null;
}

// Update Device Request
export interface UpdateHardwareDeviceRequest {
  status?: DeviceStatus;
  enabled?: boolean;
  thermal_printer?: Partial<ThermalPrinterConfig> | null;
  kot_printer?: Partial<KotPrinterConfig> | null;
  network_printer?: Partial<NetworkPrinterConfig> | null;
  barcode_scanner?: Partial<BarcodeScannerConfig> | null;
  cash_drawer?: Partial<CashDrawerConfig> | null;
  label_printer?: Partial<LabelPrinterConfig> | null;
}

// API Response interfaces
export interface HardwareDeviceResponse {
  message: string;
  id: string;
}

export interface DeleteHardwareDeviceResponse {
  message: string;
}

// Hardware Options for dropdowns
export interface HardwareOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

// Printer Models by Type
export const THERMAL_PRINTER_MODELS: HardwareOption[] = [
  { id: 'epson_tm_t88v', label: 'Epson TM-T88V', value: 'epson_tm_t88v' },
  { id: 'epson_tm_t20', label: 'Epson TM-T20', value: 'epson_tm_t20' },
  { id: 'star_tsp143', label: 'Star TSP143', value: 'star_tsp143' },
  { id: 'citizen_ct_s310', label: 'Citizen CT-S310', value: 'citizen_ct_s310' }
];

export const KITCHEN_PRINTER_MODELS: HardwareOption[] = [
  { id: 'star_tsp143', label: 'Star TSP143', value: 'star_tsp143' },
  { id: 'epson_tm_t88v', label: 'Epson TM-T88V', value: 'epson_tm_t88v' },
  { id: 'bixolon_srp_350', label: 'Bixolon SRP-350', value: 'bixolon_srp_350' }
];

export const NETWORK_PRINTER_MODELS: HardwareOption[] = [
  { id: 'hp_laserjet_pro_m404dn', label: 'HP LaserJet Pro M404dn', value: 'hp_laserjet_pro_m404dn' },
  { id: 'canon_pixma_g7020', label: 'Canon PIXMA G7020', value: 'canon_pixma_g7020' },
  { id: 'epson_workforce_pro', label: 'Epson WorkForce Pro', value: 'epson_workforce_pro' },
  { id: 'brother_hl_l2350dw', label: 'Brother HL-L2350DW', value: 'brother_hl_l2350dw' }
];

export const SCANNER_MODELS: HardwareOption[] = [
  { id: 'symbol_ls2208', label: 'Symbol LS2208', value: 'symbol_ls2208' },
  { id: 'honeywell_1900g', label: 'Honeywell 1900g', value: 'honeywell_1900g' },
  { id: 'zebra_ds2208', label: 'Zebra DS2208', value: 'zebra_ds2208' },
  { id: 'datalogic_quickscan', label: 'Datalogic QuickScan', value: 'datalogic_quickscan' }
];

export const CASH_DRAWER_MODELS: HardwareOption[] = [
  { id: 'star_smd2', label: 'Star SMD2', value: 'star_smd2' },
  { id: 'epson_dk_5', label: 'Epson DK-5', value: 'epson_dk_5' },
  { id: 'posiflex_cr4000', label: 'Posiflex CR4000', value: 'posiflex_cr4000' },
  { id: 'bixolon_bc_170', label: 'Bixolon BC-170', value: 'bixolon_bc_170' }
];

export const LABEL_PRINTER_MODELS: HardwareOption[] = [
  { id: 'zebra_zd410', label: 'Zebra ZD410', value: 'zebra_zd410' },
  { id: 'datamax_e4205', label: 'Datamax E-4205', value: 'datamax_e4205' },
  { id: 'brother_ql700', label: 'Brother QL-700', value: 'brother_ql700' },
  { id: 'dymo_labelwriter_450', label: 'DYMO LabelWriter 450', value: 'dymo_labelwriter_450' }
];

// Kitchen Sections Options
export const KITCHEN_SECTIONS: HardwareOption[] = [
  { id: 'hot_kitchen', label: 'Hot Kitchen', value: 'hot_kitchen' },
  { id: 'cold_kitchen', label: 'Cold Kitchen', value: 'cold_kitchen' },
  { id: 'grill', label: 'Grill', value: 'grill' },
  { id: 'fryer', label: 'Fryer', value: 'fryer' },
  { id: 'salad_station', label: 'Salad Station', value: 'salad_station' },
  { id: 'bakery', label: 'Bakery', value: 'bakery' },
  { id: 'bar', label: 'Bar', value: 'bar' },
  { id: 'dessert_station', label: 'Dessert Station', value: 'dessert_station' }
];

// Paper Size Options
export const THERMAL_PAPER_SIZES: HardwareOption[] = [
  { id: 'thermal_80mm', label: '80mm Thermal', value: 'thermal_80mm' },
  { id: 'thermal_58mm', label: '58mm Thermal', value: 'thermal_58mm' }
];

export const NETWORK_PAPER_SIZES: HardwareOption[] = [
  { id: 'A4', label: 'A4', value: 'A4' },
  { id: 'A5', label: 'A5', value: 'A5' },
  { id: 'Letter', label: 'Letter', value: 'Letter' },
  { id: 'Legal', label: 'Legal', value: 'Legal' },
  { id: 'A3', label: 'A3', value: 'A3' },
  { id: 'B4', label: 'B4', value: 'B4' },
  { id: 'B5', label: 'B5', value: 'B5' },
  { id: 'Executive', label: 'Executive', value: 'Executive' }
];

export const LABEL_SIZES: HardwareOption[] = [
  { id: '62x100mm', label: '62x100mm', value: '62x100mm' },
  { id: '62x150mm', label: '62x150mm', value: '62x150mm' },
  { id: '102x150mm', label: '102x150mm', value: '102x150mm' },
  { id: '102x200mm', label: '102x200mm', value: '102x200mm' },
  { id: '58x40mm', label: '58x40mm', value: '58x40mm' },
  { id: '76x51mm', label: '76x51mm', value: '76x51mm' }
];

export const PRINT_DENSITIES: HardwareOption[] = [
  { id: '203dpi', label: '203 DPI', value: '203dpi' },
  { id: '300dpi', label: '300 DPI', value: '300dpi' },
  { id: '600dpi', label: '600 DPI', value: '600dpi' }
];

export const PRINT_SPEEDS: HardwareOption[] = [
  { id: '50mm/s', label: '50 mm/s', value: '50mm/s' },
  { id: '100mm/s', label: '100 mm/s', value: '100mm/s' },
  { id: '150mm/s', label: '150 mm/s', value: '150mm/s' },
  { id: '200mm/s', label: '200 mm/s', value: '200mm/s' }
];

// Connection Types
export const CONNECTION_TYPES: HardwareOption[] = [
  { id: 'usb', label: 'USB', value: 'usb', icon: '🔌' },
  { id: 'network', label: 'Network (TCP/IP)', value: 'network', icon: '🌐' },
  { id: 'bluetooth', label: 'Bluetooth', value: 'bluetooth', icon: '📶' }
];

// Device Types
export const DEVICE_TYPES: HardwareOption[] = [
  { id: 'thermal_printer', label: 'Receipt Printer', value: 'thermal_printer', icon: '🖨️' },
  { id: 'kitchen_printer', label: 'Kitchen Printer (KOT)', value: 'kitchen_printer', icon: '👨‍🍳' },
  { id: 'network_printer', label: 'Network Printer', value: 'network_printer', icon: '🖨️' },
  { id: 'scanner', label: 'Barcode Scanner', value: 'scanner', icon: '📷' },
  { id: 'cash_drawer', label: 'Cash Drawer', value: 'cash_drawer', icon: '💰' },
  { id: 'label_printer', label: 'Label Printer', value: 'label_printer', icon: '🏷️' }
];

// Barcode Types
export const BARCODE_DECODE_TYPES: HardwareOption[] = [
  { id: 'CODE128', label: 'Code 128', value: 'CODE128' },
  { id: 'EAN13', label: 'EAN-13', value: 'EAN13' },
  { id: 'UPC', label: 'UPC', value: 'UPC' },
  { id: 'QR_CODE', label: 'QR Code', value: 'QR_CODE' },
  { id: 'CODE39', label: 'Code 39', value: 'CODE39' },
  { id: 'PDF417', label: 'PDF417', value: 'PDF417' }
];

// Default configurations for new devices
export const getDefaultDeviceConfig = (type: DeviceType): Partial<HardwareDevice> => {
  const baseConfig = {
    enabled: true,
    status: 'disconnected' as DeviceStatus,
    connection_type: 'network' as ConnectionType,
    test_mode: false,
    last_connected: new Date().toISOString(),
    thermal_printer: {},
    kot_printer: {},
    network_printer: {},
    barcode_scanner: {},
    cash_drawer: {},
    label_printer: {}
  };

  switch (type) {
    case 'thermal_printer':
      return {
        ...baseConfig,
        thermal_printer: {
          printer_model: 'epson_tm_t88v',
          paper_size: 'thermal_80mm' as ThermalPaperSize,
          auto_print: true,
          print_copies: 1,
          cut_paper: true,
          open_drawer: true,
          character_encoding: 'utf8' as CharacterEncoding,
          port: 9100
        }
      };
    
    case 'kitchen_printer':
      return {
        ...baseConfig,
        kot_printer: {
          printer_model: 'star_tsp143',
          paper_size: 'thermal_80mm' as ThermalPaperSize,
          print_header: true,
          print_timestamp: true,
          print_order_number: true,
          print_table_info: true,
          auto_cut: true,
          character_encoding: 'utf8' as CharacterEncoding,
          kitchen_sections: ['hot_kitchen'] as KitchenSection[],
          port: 9100
        }
      };
    
    case 'network_printer':
      return {
        ...baseConfig,
        network_printer: {
          printer_model: 'hp_laserjet_pro_m404dn',
          paper_size: 'A4' as NetworkPaperSize,
          paper_orientation: 'portrait' as PaperOrientation,
          print_quality: 'normal' as PrintQuality,
          color_mode: 'monochrome' as ColorMode,
          duplex_printing: false,
          print_copies: 1,
          character_encoding: 'utf8' as CharacterEncoding,
          supported_formats: ['PDF', 'JPEG', 'PNG', 'TXT'],
          max_resolution: '1200x1200 dpi',
          tray_capacity: 250,
          auto_paper_detection: true,
          port: 9100
        }
      };
    
    case 'scanner':
      return {
        ...baseConfig,
        connection_type: 'usb' as ConnectionType,
        barcode_scanner: {
          scanner_model: 'symbol_ls2208',
          prefix: '',
          suffix: '\r\n',
          min_length: 8,
          max_length: 20,
          scan_mode: 'manual' as ScanMode,
          beep_on_scan: true,
          decode_types: ['CODE128', 'EAN13', 'UPC', 'QR_CODE'] as BarcodeDecodeType[]
        }
      };
    
    case 'cash_drawer':
      return {
        ...baseConfig,
        connection_type: 'usb' as ConnectionType,
        cash_drawer: {
          drawer_model: 'standard_drawer',
          auto_open: true,
          monitor_status: true,
          alert_on_open: true,
          open_timeout: 3000,
          pulse_duration: 100,
          pulse_strength: 100
        }
      };
    
    case 'label_printer':
      return {
        ...baseConfig,
        label_printer: {
          printer_model: 'brother_ql_820nwb',
          label_size: '62x100mm' as LabelSize,
          print_density: '203dpi' as PrintDensity,
          print_speed: '100mm/s' as PrintSpeed,
          character_encoding: 'utf8' as CharacterEncoding,
          auto_cut: true,
          print_copies: 1,
          calibration_enabled: true
        }
      };
    
    default:
      return baseConfig;
  }
};

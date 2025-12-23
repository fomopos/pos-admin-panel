/**
 * Hardware Configuration Options & Constants
 * 
 * Centralized dropdown options, device models, and configuration presets
 * for hardware device management.
 * 
 * @see src/types/hardware-new.types.ts
 * @see docs/HARDWARE_CONFIGURATION_MIGRATION_PLAN.md
 */

import type { DeviceType, DeviceSubType, ConnectionType } from '../types/hardware-new.types';

// ============================================================================
// OPTION INTERFACE
// ============================================================================

export interface HardwareOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

// ============================================================================
// DEVICE TYPES & SUBTYPES
// ============================================================================

/**
 * High-level device types with icons and descriptions
 */
export const DEVICE_TYPES: HardwareOption[] = [
  {
    id: 'printer',
    label: 'Printer',
    value: 'printer',
    icon: '🖨️',
    description: 'Receipt, kitchen, or office printers'
  },
  {
    id: 'scanner',
    label: 'Scanner',
    value: 'scanner',
    icon: '📷',
    description: 'Barcode, QR code, or RFID scanners'
  },
  {
    id: 'cash_drawer',
    label: 'Cash Drawer',
    value: 'cash_drawer',
    icon: '💰',
    description: 'Cash drawer for POS terminals'
  },
  {
    id: 'label_printer',
    label: 'Label Printer',
    value: 'label_printer',
    icon: '🏷️',
    description: 'Product label and sticker printers'
  },
  {
    id: 'scale',
    label: 'Scale',
    value: 'scale',
    icon: '⚖️',
    description: 'Weight scales for products'
  },
  {
    id: 'payment_terminal',
    label: 'Payment Terminal',
    value: 'payment_terminal',
    icon: '💳',
    description: 'Card payment and PIN entry devices'
  },
  {
    id: 'kds',
    label: 'Kitchen Display System',
    value: 'kds',
    icon: '📺',
    description: 'Kitchen display screens'
  },
  {
    id: 'customer_display',
    label: 'Customer Display',
    value: 'customer_display',
    icon: '🖥️',
    description: 'Customer-facing displays'
  }
];

/**
 * Device subtypes by parent device type
 */
export const DEVICE_SUBTYPES: Record<DeviceType, HardwareOption[]> = {
  // UI compatibility aliases (map to empty since they are the actual types now)
  thermal_printer: [],
  kot_printer: [],
  network_printer: [],
  barcode_scanner: [],
  
  // Original parent types
  printer: [
    {
      id: 'thermal_printer',
      label: 'Thermal Receipt Printer',
      value: 'thermal_printer',
      icon: '🧾',
      description: 'Receipt printer with thermal printing'
    },
    {
      id: 'kitchen_printer',
      label: 'Kitchen Printer (KOT)',
      value: 'kitchen_printer',
      icon: '👨‍🍳',
      description: 'Kitchen order ticket printer'
    },
    {
      id: 'network_printer',
      label: 'Network Printer',
      value: 'network_printer',
      icon: '🖨️',
      description: 'Standard office network printer'
    },
    {
      id: 'fiscal_printer',
      label: 'Fiscal Printer',
      value: 'fiscal_printer',
      icon: '📜',
      description: 'Tax-compliant fiscal printer'
    }
  ],
  scanner: [
    {
      id: 'barcode_scanner',
      label: 'Barcode Scanner',
      value: 'barcode_scanner',
      icon: '📊',
      description: '1D/2D barcode scanner'
    },
    {
      id: 'magstripe_reader',
      label: 'Magnetic Stripe Reader',
      value: 'magstripe_reader',
      icon: '💳',
      description: 'Credit card magstripe reader'
    },
    {
      id: 'rfid_reader',
      label: 'RFID Reader',
      value: 'rfid_reader',
      icon: '📡',
      description: 'RFID tag reader'
    }
  ],
  cash_drawer: [],
  label_printer: [],
  scale: [],
  payment_terminal: [],
  kds: [],
  customer_display: []
};

// ============================================================================
// CONNECTION TYPES
// ============================================================================

/**
 * Connection/transport types with icons and descriptions
 */
export const CONNECTION_TYPES: HardwareOption[] = [
  {
    id: 'usb',
    label: 'USB',
    value: 'usb',
    icon: '🔌',
    description: 'Direct USB connection'
  },
  {
    id: 'network',
    label: 'Network (TCP/IP)',
    value: 'network',
    icon: '🌐',
    description: 'Ethernet or Wi-Fi network connection'
  },
  {
    id: 'bluetooth',
    label: 'Bluetooth Classic',
    value: 'bluetooth',
    icon: '📶',
    description: 'Classic Bluetooth connection'
  },
  {
    id: 'bluetooth_le',
    label: 'Bluetooth Low Energy',
    value: 'bluetooth_le',
    icon: '📡',
    description: 'Bluetooth LE (BLE) connection'
  },
  {
    id: 'aidl',
    label: 'AIDL (Android)',
    value: 'aidl',
    icon: '🤖',
    description: 'Android AIDL service binding'
  },
  {
    id: 'http',
    label: 'HTTP',
    value: 'http',
    icon: '🌍',
    description: 'HTTP/HTTPS protocol'
  },
  {
    id: 'websocket',
    label: 'WebSocket',
    value: 'websocket',
    icon: '🔄',
    description: 'WebSocket connection'
  },
  {
    id: 'nfc',
    label: 'NFC',
    value: 'nfc',
    icon: '📳',
    description: 'Near Field Communication'
  },
  {
    id: 'serial',
    label: 'Serial (RS-232)',
    value: 'serial',
    icon: '🔗',
    description: 'Serial port connection'
  }
];

// ============================================================================
// DEVICE STATUS OPTIONS
// ============================================================================

export const DEVICE_STATUS_OPTIONS: HardwareOption[] = [
  {
    id: 'connected',
    label: 'Connected',
    value: 'connected',
    icon: '✅',
    description: 'Device is connected and operational'
  },
  {
    id: 'disconnected',
    label: 'Disconnected',
    value: 'disconnected',
    icon: '❌',
    description: 'Device is not connected'
  },
  {
    id: 'degraded',
    label: 'Degraded',
    value: 'degraded',
    icon: '⚠️',
    description: 'Device has issues but still operational'
  },
  {
    id: 'error',
    label: 'Error',
    value: 'error',
    icon: '🚫',
    description: 'Device has encountered an error'
  }
];

// ============================================================================
// NETWORK PROTOCOLS
// ============================================================================

export const NETWORK_PROTOCOLS: HardwareOption[] = [
  {
    id: 'raw',
    label: 'Raw TCP',
    value: 'raw',
    description: 'Raw TCP socket connection'
  },
  {
    id: 'ipp',
    label: 'IPP (Internet Printing Protocol)',
    value: 'ipp',
    description: 'Standard printing protocol'
  },
  {
    id: 'lpr',
    label: 'LPR (Line Printer Remote)',
    value: 'lpr',
    description: 'Unix line printer protocol'
  },
  {
    id: 'http',
    label: 'HTTP/HTTPS',
    value: 'http',
    description: 'Web-based protocol'
  },
  {
    id: 'ws',
    label: 'WebSocket',
    value: 'ws',
    description: 'WebSocket protocol'
  },
  {
    id: 'rfc2217',
    label: 'RFC2217 (Telnet)',
    value: 'rfc2217',
    description: 'Serial over network'
  }
];

// ============================================================================
// DEVICE MODELS
// ============================================================================

export const THERMAL_PRINTER_MODELS: HardwareOption[] = [
  { id: 'epson_tm_t88v', label: 'Epson TM-T88V', value: 'epson_tm_t88v', description: 'Popular thermal receipt printer' },
  { id: 'epson_tm_t88vi', label: 'Epson TM-T88VI', value: 'epson_tm_t88vi', description: 'Latest Epson thermal printer' },
  { id: 'epson_tm_t20', label: 'Epson TM-T20', value: 'epson_tm_t20', description: 'Entry-level thermal printer' },
  { id: 'star_tsp143', label: 'Star TSP143', value: 'star_tsp143', description: 'Compact thermal printer' },
  { id: 'star_tsp650', label: 'Star TSP650', value: 'star_tsp650', description: 'High-speed thermal printer' },
  { id: 'citizen_ct_s310', label: 'Citizen CT-S310', value: 'citizen_ct_s310', description: 'Reliable thermal printer' },
  { id: 'bixolon_srp_350', label: 'Bixolon SRP-350', value: 'bixolon_srp_350', description: 'Affordable thermal printer' }
];

export const KITCHEN_PRINTER_MODELS: HardwareOption[] = [
  { id: 'star_tsp143', label: 'Star TSP143', value: 'star_tsp143', description: 'Compact kitchen printer' },
  { id: 'epson_tm_t88v', label: 'Epson TM-T88V', value: 'epson_tm_t88v', description: 'Heavy-duty kitchen printer' },
  { id: 'bixolon_srp_350', label: 'Bixolon SRP-350', value: 'bixolon_srp_350', description: 'Durable kitchen printer' },
  { id: 'star_sp700', label: 'Star SP700', value: 'star_sp700', description: 'Impact kitchen printer' }
];

export const NETWORK_PRINTER_MODELS: HardwareOption[] = [
  { id: 'hp_laserjet_pro_m404dn', label: 'HP LaserJet Pro M404dn', value: 'hp_laserjet_pro_m404dn', description: 'Professional laser printer' },
  { id: 'canon_pixma_g7020', label: 'Canon PIXMA G7020', value: 'canon_pixma_g7020', description: 'Color inkjet printer' },
  { id: 'epson_workforce_pro', label: 'Epson WorkForce Pro', value: 'epson_workforce_pro', description: 'Business inkjet printer' },
  { id: 'brother_hl_l2350dw', label: 'Brother HL-L2350DW', value: 'brother_hl_l2350dw', description: 'Compact laser printer' },
  { id: 'hp_officejet_pro', label: 'HP OfficeJet Pro', value: 'hp_officejet_pro', description: 'All-in-one printer' }
];

export const SCANNER_MODELS: HardwareOption[] = [
  { id: 'symbol_ls2208', label: 'Symbol LS2208', value: 'symbol_ls2208', description: 'Handheld barcode scanner' },
  { id: 'honeywell_1900g', label: 'Honeywell 1900g', value: 'honeywell_1900g', description: 'High-performance scanner' },
  { id: 'zebra_ds2208', label: 'Zebra DS2208', value: 'zebra_ds2208', description: 'Digital scanner' },
  { id: 'datalogic_quickscan', label: 'Datalogic QuickScan', value: 'datalogic_quickscan', description: 'Fast scanning' },
  { id: 'honeywell_xenon_1900', label: 'Honeywell Xenon 1900', value: 'honeywell_xenon_1900', description: 'Rugged scanner' }
];

export const CASH_DRAWER_MODELS: HardwareOption[] = [
  { id: 'star_smd2', label: 'Star SMD2', value: 'star_smd2', description: 'Standard cash drawer' },
  { id: 'epson_dk_5', label: 'Epson DK-5', value: 'epson_dk_5', description: 'Heavy-duty drawer' },
  { id: 'posiflex_cr4000', label: 'Posiflex CR4000', value: 'posiflex_cr4000', description: 'Compact cash drawer' },
  { id: 'bixolon_bc_170', label: 'Bixolon BC-170', value: 'bixolon_bc_170', description: 'Budget cash drawer' },
  { id: 'apg_vasario', label: 'APG Vasario', value: 'apg_vasario', description: 'Premium cash drawer' }
];

export const LABEL_PRINTER_MODELS: HardwareOption[] = [
  { id: 'zebra_zd410', label: 'Zebra ZD410', value: 'zebra_zd410', description: 'Compact label printer' },
  { id: 'zebra_zd620', label: 'Zebra ZD620', value: 'zebra_zd620', description: 'Advanced label printer' },
  { id: 'brother_ql700', label: 'Brother QL-700', value: 'brother_ql700', description: 'Fast label printer' },
  { id: 'brother_ql820nwb', label: 'Brother QL-820NWB', value: 'brother_ql820nwb', description: 'Wireless label printer' },
  { id: 'dymo_labelwriter_450', label: 'DYMO LabelWriter 450', value: 'dymo_labelwriter_450', description: 'Desktop label printer' },
  { id: 'datamax_e4205', label: 'Datamax E-4205', value: 'datamax_e4205', description: 'Industrial label printer' }
];

export const SCALE_MODELS: HardwareOption[] = [
  { id: 'cas_ap1', label: 'CAS AP-1', value: 'cas_ap1', description: 'Retail scale' },
  { id: 'mettler_toledo', label: 'Mettler Toledo', value: 'mettler_toledo', description: 'Professional scale' },
  { id: 'ohaus_navigator', label: 'Ohaus Navigator', value: 'ohaus_navigator', description: 'Heavy-duty scale' },
  { id: 'avery_weigh_tronix', label: 'Avery Weigh-Tronix', value: 'avery_weigh_tronix', description: 'Industrial scale' }
];

export const PAYMENT_TERMINAL_MODELS: HardwareOption[] = [
  { id: 'stripe_s700', label: 'Stripe S700', value: 'stripe_s700', description: 'Stripe smart terminal' },
  { id: 'pax_a920', label: 'PAX A920', value: 'pax_a920', description: 'Android payment terminal' },
  { id: 'verifone_vx520', label: 'Verifone VX520', value: 'verifone_vx520', description: 'Countertop terminal' },
  { id: 'ingenico_move5000', label: 'Ingenico Move/5000', value: 'ingenico_move5000', description: 'Portable terminal' },
  { id: 'clover_flex', label: 'Clover Flex', value: 'clover_flex', description: 'Handheld terminal' }
];

// ============================================================================
// PAPER SIZES
// ============================================================================

export const THERMAL_PAPER_SIZES: HardwareOption[] = [
  { id: 'thermal_58mm', label: '58mm (2.25")', value: 'thermal_58mm', description: 'Narrow receipt paper' },
  { id: 'thermal_80mm', label: '80mm (3.15")', value: 'thermal_80mm', description: 'Standard receipt paper' }
];

export const NETWORK_PAPER_SIZES: HardwareOption[] = [
  { id: 'A4', label: 'A4', value: 'A4', description: '210 × 297 mm' },
  { id: 'A5', label: 'A5', value: 'A5', description: '148 × 210 mm' },
  { id: 'Letter', label: 'Letter', value: 'Letter', description: '8.5 × 11 inches' },
  { id: 'Legal', label: 'Legal', value: 'Legal', description: '8.5 × 14 inches' },
  { id: 'A3', label: 'A3', value: 'A3', description: '297 × 420 mm' },
  { id: 'B4', label: 'B4', value: 'B4', description: '250 × 353 mm' },
  { id: 'B5', label: 'B5', value: 'B5', description: '176 × 250 mm' },
  { id: 'Executive', label: 'Executive', value: 'Executive', description: '7.25 × 10.5 inches' }
];

// ============================================================================
// LABEL SIZES
// ============================================================================

export const LABEL_SIZES: HardwareOption[] = [
  { id: '62x100mm', label: '62 × 100mm', value: '62x100mm', description: 'Small product label' },
  { id: '62x150mm', label: '62 × 150mm', value: '62x150mm', description: 'Medium product label' },
  { id: '102x150mm', label: '102 × 150mm', value: '102x150mm', description: 'Large shipping label' },
  { id: '102x200mm', label: '102 × 200mm', value: '102x200mm', description: 'Extra large label' },
  { id: '58x40mm', label: '58 × 40mm', value: '58x40mm', description: 'Tiny price label' },
  { id: '76x51mm', label: '76 × 51mm', value: '76x51mm', description: 'Address label' }
];

// ============================================================================
// CHARACTER ENCODINGS
// ============================================================================

export const CHARACTER_ENCODINGS: HardwareOption[] = [
  { id: 'utf8', label: 'UTF-8', value: 'utf8', description: 'Unicode (recommended)' },
  { id: 'ascii', label: 'ASCII', value: 'ascii', description: 'Basic ASCII characters' },
  { id: 'windows1252', label: 'Windows-1252', value: 'windows1252', description: 'Western European' }
];

// ============================================================================
// SCAN MODES
// ============================================================================

export const SCAN_MODES: HardwareOption[] = [
  { id: 'trigger', label: 'Trigger', value: 'trigger', description: 'Manual trigger press' },
  { id: 'continuous', label: 'Continuous', value: 'continuous', description: 'Auto-scan continuously' },
  { id: 'presentation', label: 'Presentation', value: 'presentation', description: 'Auto-detect presentation' }
];

// ============================================================================
// BARCODE TYPES
// ============================================================================

export const BARCODE_DECODE_TYPES: HardwareOption[] = [
  { id: 'CODE128', label: 'Code 128', value: 'CODE128', description: 'High-density barcode' },
  { id: 'EAN13', label: 'EAN-13', value: 'EAN13', description: 'International product code' },
  { id: 'UPC', label: 'UPC-A', value: 'UPC', description: 'Universal product code' },
  { id: 'QR_CODE', label: 'QR Code', value: 'QR_CODE', description: '2D matrix barcode' },
  { id: 'CODE39', label: 'Code 39', value: 'CODE39', description: 'Alphanumeric barcode' },
  { id: 'PDF417', label: 'PDF417', value: 'PDF417', description: '2D stacked barcode' },
  { id: 'DATAMATRIX', label: 'Data Matrix', value: 'DATAMATRIX', description: '2D matrix code' },
  { id: 'AZTEC', label: 'Aztec', value: 'AZTEC', description: '2D matrix code' }
];

// ============================================================================
// KITCHEN SECTIONS
// ============================================================================

export const KITCHEN_SECTIONS: HardwareOption[] = [
  { id: 'hot_kitchen', label: 'Hot Kitchen', value: 'hot_kitchen', description: 'Main cooking area' },
  { id: 'cold_kitchen', label: 'Cold Kitchen', value: 'cold_kitchen', description: 'Salads and cold items' },
  { id: 'grill', label: 'Grill Station', value: 'grill', description: 'Grilling area' },
  { id: 'fryer', label: 'Fryer Station', value: 'fryer', description: 'Deep frying area' },
  { id: 'salad_station', label: 'Salad Station', value: 'salad_station', description: 'Salad preparation' },
  { id: 'bakery', label: 'Bakery', value: 'bakery', description: 'Baking area' },
  { id: 'bar', label: 'Bar', value: 'bar', description: 'Beverage station' },
  { id: 'dessert_station', label: 'Dessert Station', value: 'dessert_station', description: 'Desserts and pastries' }
];

// ============================================================================
// PRINT QUALITY OPTIONS
// ============================================================================

export const PRINT_QUALITY_OPTIONS: HardwareOption[] = [
  { id: 'draft', label: 'Draft', value: 'draft', description: 'Fast, lower quality' },
  { id: 'normal', label: 'Normal', value: 'normal', description: 'Standard quality' },
  { id: 'high', label: 'High', value: 'high', description: 'High quality, slower' },
  { id: 'photo', label: 'Photo', value: 'photo', description: 'Best quality for images' }
];

export const COLOR_MODES: HardwareOption[] = [
  { id: 'color', label: 'Color', value: 'color', description: 'Full color printing' },
  { id: 'monochrome', label: 'Monochrome', value: 'monochrome', description: 'Black and white only' },
  { id: 'grayscale', label: 'Grayscale', value: 'grayscale', description: 'Shades of gray' }
];

export const PAPER_ORIENTATIONS: HardwareOption[] = [
  { id: 'portrait', label: 'Portrait', value: 'portrait', description: 'Vertical orientation' },
  { id: 'landscape', label: 'Landscape', value: 'landscape', description: 'Horizontal orientation' }
];

// ============================================================================
// SERIAL PORT OPTIONS
// ============================================================================

export const BAUD_RATES: HardwareOption[] = [
  { id: '9600', label: '9600', value: '9600' },
  { id: '19200', label: '19200', value: '19200' },
  { id: '38400', label: '38400', value: '38400' },
  { id: '57600', label: '57600', value: '57600' },
  { id: '115200', label: '115200', value: '115200' }
];

export const DATA_BITS: HardwareOption[] = [
  { id: '5', label: '5', value: '5' },
  { id: '6', label: '6', value: '6' },
  { id: '7', label: '7', value: '7' },
  { id: '8', label: '8', value: '8' }
];

export const STOP_BITS: HardwareOption[] = [
  { id: '1', label: '1', value: '1' },
  { id: '1.5', label: '1.5', value: '1.5' },
  { id: '2', label: '2', value: '2' }
];

export const PARITY_OPTIONS: HardwareOption[] = [
  { id: 'none', label: 'None', value: 'none', description: 'No parity bit' },
  { id: 'even', label: 'Even', value: 'even', description: 'Even parity' },
  { id: 'odd', label: 'Odd', value: 'odd', description: 'Odd parity' }
];

export const FLOW_CONTROL_OPTIONS: HardwareOption[] = [
  { id: 'none', label: 'None', value: 'none', description: 'No flow control' },
  { id: 'hardware', label: 'Hardware (RTS/CTS)', value: 'hardware', description: 'Hardware flow control' },
  { id: 'software', label: 'Software (XON/XOFF)', value: 'software', description: 'Software flow control' }
];

// ============================================================================
// PAYMENT PROVIDERS
// ============================================================================

export const PAYMENT_PROVIDERS: HardwareOption[] = [
  { id: 'stripe', label: 'Stripe', value: 'stripe', description: 'Stripe payment processing' },
  { id: 'pax', label: 'PAX', value: 'pax', description: 'PAX terminals' },
  { id: 'verifone', label: 'Verifone', value: 'verifone', description: 'Verifone terminals' },
  { id: 'ingenico', label: 'Ingenico', value: 'ingenico', description: 'Ingenico terminals' },
  { id: 'clover', label: 'Clover', value: 'clover', description: 'Clover POS system' }
];

// ============================================================================
// WEIGHT UNITS
// ============================================================================

export const WEIGHT_UNITS: HardwareOption[] = [
  { id: 'kg', label: 'Kilograms (kg)', value: 'kg', description: 'Metric system' },
  { id: 'g', label: 'Grams (g)', value: 'g', description: 'Metric system (small items)' },
  { id: 'lb', label: 'Pounds (lb)', value: 'lb', description: 'Imperial system' }
];

// ============================================================================
// LABEL PRINT SETTINGS
// ============================================================================

export const PRINT_DENSITIES: HardwareOption[] = [
  { id: '203dpi', label: '203 DPI', value: '203dpi', description: 'Standard resolution' },
  { id: '300dpi', label: '300 DPI', value: '300dpi', description: 'High resolution' },
  { id: '600dpi', label: '600 DPI', value: '600dpi', description: 'Ultra-high resolution' }
];

export const PRINT_SPEEDS: HardwareOption[] = [
  { id: '50mm/s', label: '50 mm/s', value: '50mm/s', description: 'Slow, highest quality' },
  { id: '100mm/s', label: '100 mm/s', value: '100mm/s', description: 'Normal speed' },
  { id: '150mm/s', label: '150 mm/s', value: '150mm/s', description: 'Fast' },
  { id: '200mm/s', label: '200 mm/s', value: '200mm/s', description: 'Very fast' }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get device models by device type or subtype
 */
export function getDeviceModelsByType(type: DeviceType | DeviceSubType): HardwareOption[] {
  const modelMap: Record<string, HardwareOption[]> = {
    thermal_printer: THERMAL_PRINTER_MODELS,
    kitchen_printer: KITCHEN_PRINTER_MODELS,
    network_printer: NETWORK_PRINTER_MODELS,
    printer: THERMAL_PRINTER_MODELS, // Default to thermal for generic printer
    scanner: SCANNER_MODELS,
    barcode_scanner: SCANNER_MODELS,
    cash_drawer: CASH_DRAWER_MODELS,
    label_printer: LABEL_PRINTER_MODELS,
    scale: SCALE_MODELS,
    payment_terminal: PAYMENT_TERMINAL_MODELS
  };

  return modelMap[type] || [];
}

/**
 * Get connection types suitable for a device type
 */
export function getConnectionTypesForDevice(deviceType: DeviceType): HardwareOption[] {
  const connectionMap: Record<DeviceType, ConnectionType[]> = {
    // UI compatibility aliases
    thermal_printer: ['usb', 'network', 'bluetooth', 'serial'],
    kot_printer: ['usb', 'network', 'bluetooth', 'serial'],
    network_printer: ['usb', 'network', 'bluetooth', 'serial'],
    barcode_scanner: ['usb', 'bluetooth', 'bluetooth_le', 'serial'],
    
    // Original types
    printer: ['usb', 'network', 'bluetooth', 'serial'],
    scanner: ['usb', 'bluetooth', 'bluetooth_le', 'serial'],
    cash_drawer: ['usb', 'network', 'serial'],
    label_printer: ['usb', 'network', 'bluetooth'],
    scale: ['usb', 'serial', 'network'],
    payment_terminal: ['usb', 'network', 'bluetooth', 'aidl'],
    kds: ['network', 'http', 'websocket'],
    customer_display: ['usb', 'network', 'serial']
  };

  const validTypes = connectionMap[deviceType] || [];
  return CONNECTION_TYPES.filter(ct => validTypes.includes(ct.value as ConnectionType));
}

/**
 * Get default port for a protocol
 */
export function getDefaultPortForProtocol(protocol: string): number {
  const portMap: Record<string, number> = {
    raw: 9100,
    ipp: 631,
    lpr: 515,
    http: 80,
    https: 443,
    ws: 80,
    wss: 443,
    rfc2217: 2217
  };

  return portMap[protocol] || 9100;
}

/**
 * Hardware Configuration Options & Constants
 * 
 * Centralized dropdown options, device models, and configuration presets
 * for hardware device management per the new API specification.
 * 
 * @see src/types/hardware.types.ts
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import type { DeviceType, ConnectionType, PrinterMode, PaperSize, WeightUnit } from '../types/hardware.types';

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
// DEVICE TYPES (per API spec - 6 types only)
// ============================================================================

/**
 * Device types per API specification
 */
export const DEVICE_TYPES: HardwareOption[] = [
  {
    id: 'printer',
    label: 'Printer',
    value: 'printer',
    icon: '🖨️',
    description: 'Receipt, kitchen, label, or document printers'
  },
  {
    id: 'scanner',
    label: 'Scanner',
    value: 'scanner',
    icon: '📷',
    description: 'Barcode scanners'
  },
  {
    id: 'cash_drawer',
    label: 'Cash Drawer',
    value: 'cash_drawer',
    icon: '💰',
    description: 'Cash drawers'
  },
  {
    id: 'scale',
    label: 'Scale',
    value: 'scale',
    icon: '⚖️',
    description: 'Weighing scales'
  },
  {
    id: 'payment_terminal',
    label: 'Payment Terminal',
    value: 'payment_terminal',
    icon: '💳',
    description: 'Card payment terminals'
  },
  {
    id: 'display',
    label: 'Display',
    value: 'display',
    icon: '🖥️',
    description: 'Customer-facing displays, KDS screens'
  }
];

// ============================================================================
// CONNECTION TYPES (per API spec - 3 types only)
// ============================================================================

/**
 * Connection types per API specification
 */
export const CONNECTION_TYPES: HardwareOption[] = [
  {
    id: 'usb',
    label: 'USB',
    value: 'usb',
    icon: '🔌',
    description: 'USB connected devices'
  },
  {
    id: 'network',
    label: 'Network',
    value: 'network',
    icon: '🌐',
    description: 'TCP/IP network connected devices'
  },
  {
    id: 'bluetooth',
    label: 'Bluetooth',
    value: 'bluetooth',
    icon: '📶',
    description: 'Bluetooth connected devices'
  }
];

// ============================================================================
// PRINTER MODES (per API spec)
// ============================================================================

/**
 * Printer modes per API specification
 */
export const PRINTER_MODES: HardwareOption[] = [
  {
    id: 'thermal',
    label: 'Thermal Receipt Printer',
    value: 'thermal',
    icon: '🧾',
    description: 'ESC/POS thermal printers for receipts and kitchen orders'
  },
  {
    id: 'label',
    label: 'Label Printer',
    value: 'label',
    icon: '🏷️',
    description: 'Label/barcode printers (ZPL compatible)'
  },
  {
    id: 'document',
    label: 'Document Printer',
    value: 'document',
    icon: '📄',
    description: 'A4/Letter document printers'
  }
];

// ============================================================================
// PAPER SIZES (per API spec)
// ============================================================================

/**
 * Paper sizes for thermal printers
 */
export const THERMAL_PAPER_SIZES: HardwareOption[] = [
  { id: '80mm', label: '80mm (3.15")', value: '80mm', description: 'Standard receipt paper' },
  { id: '58mm', label: '58mm (2.25")', value: '58mm', description: 'Narrow receipt paper' }
];

/**
 * Paper sizes for document printers
 */
export const DOCUMENT_PAPER_SIZES: HardwareOption[] = [
  { id: 'a4', label: 'A4', value: 'a4', description: '210 × 297 mm' },
  { id: 'a5', label: 'A5', value: 'a5', description: '148 × 210 mm' },
  { id: 'letter', label: 'Letter', value: 'letter', description: '8.5 × 11 inches' }
];

/**
 * Paper sizes for label printers
 */
export const LABEL_PAPER_SIZES: HardwareOption[] = [
  { id: '4x6', label: '4x6 inches', value: '4x6', description: 'Standard shipping label' }
];

/**
 * Get paper sizes based on printer mode
 */
export function getPaperSizesForMode(mode: PrinterMode): HardwareOption[] {
  switch (mode) {
    case 'thermal':
      return THERMAL_PAPER_SIZES;
    case 'document':
      return DOCUMENT_PAPER_SIZES;
    case 'label':
      return LABEL_PAPER_SIZES;
    default:
      return THERMAL_PAPER_SIZES;
  }
}

// ============================================================================
// CHARACTER ENCODINGS
// ============================================================================

export const CHARACTER_ENCODINGS: HardwareOption[] = [
  { id: 'utf8', label: 'UTF-8', value: 'utf8', description: 'Unicode (recommended)' },
  { id: 'gbk', label: 'GBK', value: 'gbk', description: 'Chinese character encoding' }
];

// ============================================================================
// WEIGHT UNITS
// ============================================================================

export const WEIGHT_UNITS: HardwareOption[] = [
  { id: 'kg', label: 'Kilograms (kg)', value: 'kg', description: 'Metric system' },
  { id: 'lb', label: 'Pounds (lb)', value: 'lb', description: 'Imperial system' }
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
// KITCHEN SECTIONS
// ============================================================================

export const KITCHEN_SECTIONS: HardwareOption[] = [
  { id: 'hot_kitchen', label: 'Hot Kitchen', value: 'hot_kitchen', description: 'Main cooking area' },
  { id: 'cold_kitchen', label: 'Cold Kitchen', value: 'cold_kitchen', description: 'Salads and cold items' },
  { id: 'grill', label: 'Grill Station', value: 'grill', description: 'Grilling area' },
  { id: 'fryer', label: 'Fryer Station', value: 'fryer', description: 'Deep frying area' },
  { id: 'salad', label: 'Salad Station', value: 'salad', description: 'Salad preparation' },
  { id: 'bakery', label: 'Bakery', value: 'bakery', description: 'Baking area' },
  { id: 'bar', label: 'Bar', value: 'bar', description: 'Beverage station' },
  { id: 'dessert', label: 'Dessert Station', value: 'dessert', description: 'Desserts and pastries' }
];

// ============================================================================
// DEVICE MODELS BY TYPE
// ============================================================================

export const PRINTER_MODELS: HardwareOption[] = [
  { id: 'epson_tm_t88v', label: 'Epson TM-T88V', value: 'epson_tm_t88v', description: 'Popular thermal receipt printer' },
  { id: 'epson_tm_t88vi', label: 'Epson TM-T88VI', value: 'epson_tm_t88vi', description: 'Latest Epson thermal printer' },
  { id: 'epson_tm_t20', label: 'Epson TM-T20', value: 'epson_tm_t20', description: 'Entry-level thermal printer' },
  { id: 'star_tsp143', label: 'Star TSP143', value: 'star_tsp143', description: 'Compact thermal printer' },
  { id: 'star_tsp650', label: 'Star TSP650', value: 'star_tsp650', description: 'High-speed thermal printer' },
  { id: 'star_sm_l200', label: 'Star SM-L200', value: 'star_sm_l200', description: 'Mobile receipt printer' },
  { id: 'citizen_ct_s310', label: 'Citizen CT-S310', value: 'citizen_ct_s310', description: 'Reliable thermal printer' },
  { id: 'bixolon_srp_350', label: 'Bixolon SRP-350', value: 'bixolon_srp_350', description: 'Affordable thermal printer' },
  { id: 'zebra_zd410', label: 'Zebra ZD410', value: 'zebra_zd410', description: 'Compact label printer' },
  { id: 'zebra_zd620', label: 'Zebra ZD620', value: 'zebra_zd620', description: 'Advanced label printer' },
  { id: 'brother_ql820nwb', label: 'Brother QL-820NWB', value: 'brother_ql820nwb', description: 'Wireless label printer' }
];

export const SCANNER_MODELS: HardwareOption[] = [
  { id: 'symbol_ls2208', label: 'Symbol LS2208', value: 'symbol_ls2208', description: 'Handheld barcode scanner' },
  { id: 'honeywell_1900g', label: 'Honeywell 1900g', value: 'honeywell_1900g', description: 'High-performance scanner' },
  { id: 'zebra_ds2208', label: 'Zebra DS2208', value: 'zebra_ds2208', description: 'Digital scanner' },
  { id: 'datalogic_quickscan', label: 'Datalogic QuickScan', value: 'datalogic_quickscan', description: 'Fast scanning' },
  { id: 'socket_mobile_s700', label: 'Socket Mobile S700', value: 'socket_mobile_s700', description: 'Wireless Bluetooth scanner' }
];

export const CASH_DRAWER_MODELS: HardwareOption[] = [
  { id: 'star_smd2', label: 'Star SMD2', value: 'star_smd2', description: 'Standard cash drawer' },
  { id: 'epson_dk_5', label: 'Epson DK-5', value: 'epson_dk_5', description: 'Heavy-duty drawer' },
  { id: 'posiflex_cr4000', label: 'Posiflex CR4000', value: 'posiflex_cr4000', description: 'Compact cash drawer' },
  { id: 'apg_vasario', label: 'APG Vasario', value: 'apg_vasario', description: 'Premium cash drawer' }
];

export const SCALE_MODELS: HardwareOption[] = [
  { id: 'cas_ap1', label: 'CAS AP-1', value: 'cas_ap1', description: 'Retail scale' },
  { id: 'mettler_toledo', label: 'Mettler Toledo', value: 'mettler_toledo', description: 'Professional scale' },
  { id: 'ohaus_navigator', label: 'Ohaus Navigator', value: 'ohaus_navigator', description: 'Heavy-duty scale' }
];

export const PAYMENT_TERMINAL_MODELS: HardwareOption[] = [
  { id: 'stripe_s700', label: 'Stripe S700', value: 'stripe_s700', description: 'Stripe smart terminal' },
  { id: 'stripe_reader_m2', label: 'Stripe Reader M2', value: 'stripe_reader_m2', description: 'Mobile card reader' },
  { id: 'pax_a920', label: 'PAX A920', value: 'pax_a920', description: 'Android payment terminal' },
  { id: 'verifone_vx520', label: 'Verifone VX520', value: 'verifone_vx520', description: 'Countertop terminal' },
  { id: 'clover_flex', label: 'Clover Flex', value: 'clover_flex', description: 'Handheld terminal' }
];

export const DISPLAY_MODELS: HardwareOption[] = [
  { id: 'customer_display_2x20', label: 'VFD Display (2×20)', value: 'customer_display_2x20', description: '2-line, 20 character display' },
  { id: 'customer_display_4x20', label: 'VFD Display (4×20)', value: 'customer_display_4x20', description: '4-line, 20 character display' },
  { id: 'kds_tablet', label: 'KDS Tablet', value: 'kds_tablet', description: 'Kitchen display tablet' }
];

/**
 * Get device models by device type
 */
export function getDeviceModelsByType(type: DeviceType): HardwareOption[] {
  const modelMap: Record<DeviceType, HardwareOption[]> = {
    printer: PRINTER_MODELS,
    scanner: SCANNER_MODELS,
    cash_drawer: CASH_DRAWER_MODELS,
    scale: SCALE_MODELS,
    payment_terminal: PAYMENT_TERMINAL_MODELS,
    display: DISPLAY_MODELS
  };

  return modelMap[type] || [];
}

// ============================================================================
// CONNECTION TYPE MAPPING
// ============================================================================

/**
 * Get valid connection types for a device type
 */
export function getConnectionTypesForDevice(deviceType: DeviceType): HardwareOption[] {
  const connectionMap: Record<DeviceType, ConnectionType[]> = {
    printer: ['usb', 'network', 'bluetooth'],
    scanner: ['usb', 'bluetooth'],
    cash_drawer: ['usb', 'network'],
    scale: ['usb', 'network'],
    payment_terminal: ['usb', 'network', 'bluetooth'],
    display: ['usb', 'network']
  };

  const validTypes = connectionMap[deviceType] || ['usb', 'network', 'bluetooth'];
  return CONNECTION_TYPES.filter(ct => validTypes.includes(ct.value as ConnectionType));
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

import type { CharacterEncoding, PrinterConfig } from '../types/hardware.types';

/**
 * Get default printer config based on mode
 */
export function getDefaultPrinterConfig(mode: PrinterMode): PrinterConfig {
  switch (mode) {
    case 'thermal':
      return {
        mode: 'thermal' as PrinterMode,
        paper: '80mm' as PaperSize,
        auto: true,
        copies: 1,
        cut: true,
        drawer: false,
        encoding: 'utf8' as CharacterEncoding
      };
    case 'label':
      return {
        mode: 'label' as PrinterMode,
        paper: '4x6' as PaperSize,
        zpl: true
      };
    case 'document':
      return {
        mode: 'document' as PrinterMode,
        paper: 'a4' as PaperSize,
        copies: 1
      };
    default:
      return {
        mode: 'thermal' as PrinterMode,
        paper: '80mm' as PaperSize
      };
  }
}

/**
 * Get default scanner config
 */
export function getDefaultScannerConfig() {
  return {
    prefix: '',
    suffix: '\r\n',
    beep_on_scan: true
  };
}

/**
 * Get default payment config
 */
export function getDefaultPaymentConfig() {
  return {
    provider: 'stripe',
    sandbox_mode: false
  };
}

/**
 * Get default scale config
 */
export function getDefaultScaleConfig() {
  return {
    unit: 'kg' as WeightUnit,
    decimal_places: 2
  };
}

/**
 * Get default drawer config
 */
export function getDefaultDrawerConfig() {
  return {
    open_command: 'ESC p 0 50 250'
  };
}

/**
 * Get default display config
 */
export function getDefaultDisplayConfig() {
  return {
    line_count: 2,
    chars_per_line: 20
  };
}

/**
 * Get default network config
 */
export function getDefaultNetworkConfig() {
  return {
    ip_address: '',
    port: 9100
  };
}

/**
 * Get default Bluetooth config
 */
export function getDefaultBluetoothConfig() {
  return {
    mac_address: '',
    device_name: '',
    service_uuid: '00001101-0000-1000-8000-00805F9B34FB'
  };
}

/**
 * Get default USB config
 */
export function getDefaultUSBConfig() {
  return {
    vendor_id: 0,
    product_id: 0,
    usb_path: ''
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate IP address format
 */
export function isValidIPAddress(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

/**
 * Validate MAC address format
 */
export function isValidMACAddress(mac: string): boolean {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
}

/**
 * Validate port number
 */
export function isValidPort(port: number): boolean {
  return port > 0 && port <= 65535;
}

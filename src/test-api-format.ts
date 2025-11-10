// Test script to verify API request format matches expected structure
import type { CreateHardwareDeviceRequest } from './types/hardware-api';

// Example request that matches the API format shown in the user's request
const exampleKitchenPrinterRequest: CreateHardwareDeviceRequest = {
  id: "kitchen_printer_001",
  name: "Main Kitchen Printer",
  type: "kitchen_printer",
  enabled: true,
  status: "connected",
  connection_type: "network",
  test_mode: false,
  store_id: "store_001",
  terminal_id: null,
  last_connected: "2025-01-15T10:25:00Z",
  thermal_printer: null,
  kot_printer: {
    printer_model: "star_tsp143",
    ip_address: "192.168.1.101",
    port: 9100,
    paper_size: "thermal_80mm",
    print_header: true,
    print_timestamp: true,
    print_order_number: true,
    print_table_info: true,
    auto_cut: true,
    character_encoding: "utf8",
    kitchen_sections: ["hot_kitchen", "grill"]
  },
  network_printer: null,
  barcode_scanner: null,
  cash_drawer: null,
  label_printer: null
};

console.log('Example API request format:', JSON.stringify(exampleKitchenPrinterRequest, null, 2));

// Example thermal printer request
const exampleThermalPrinterRequest: CreateHardwareDeviceRequest = {
  id: "thermal_printer_001",
  name: "Main Receipt Printer",
  type: "thermal_printer",
  enabled: true,
  status: "connected",
  connection_type: "network",
  test_mode: false,
  store_id: "store_001",
  terminal_id: "terminal_001",
  last_connected: "2025-01-15T10:25:00Z",
  thermal_printer: {
    printer_model: "epson_tm_t88v",
    ip_address: "192.168.1.100",
    port: 9100,
    paper_size: "thermal_80mm",
    auto_print: true,
    print_copies: 1,
    cut_paper: true,
    open_drawer: true,
    character_encoding: "utf8"
  },
  kot_printer: null,
  network_printer: null,
  barcode_scanner: null,
  cash_drawer: null,
  label_printer: null
};

console.log('Example thermal printer request:', JSON.stringify(exampleThermalPrinterRequest, null, 2));

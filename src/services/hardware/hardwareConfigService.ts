import { apiClient } from '../api';
import type {
  HardwareDevice,
  StoreHardwareConfig,
  TerminalHardwareConfig,
  HardwareConfigResponse,
  UpdateHardwareConfigRequest,
  HardwareTestRequest,
  HardwareTestResponse,
  HardwareOption
} from '../../types/hardware';

export class HardwareConfigService {
  private readonly basePath = '/v0/tenant';

  /**
   * Get hardware configuration for a store and its terminals
   */
  async getHardwareConfig(
    tenantId: string, 
    storeId: string
  ): Promise<HardwareConfigResponse> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}/hardware`;
      const response = await apiClient.get<HardwareConfigResponse>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch hardware config:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get store-level hardware configuration
   */
  async getStoreHardwareConfig(
    tenantId: string, 
    storeId: string
  ): Promise<StoreHardwareConfig> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}/hardware/store`;
      const response = await apiClient.get<StoreHardwareConfig>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch store hardware config:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get terminal-specific hardware configuration
   */
  async getTerminalHardwareConfig(
    tenantId: string, 
    storeId: string, 
    terminalId: string
  ): Promise<TerminalHardwareConfig> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}/hardware/terminal/${terminalId}`;
      const response = await apiClient.get<TerminalHardwareConfig>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch terminal hardware config:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update store-level hardware configuration
   */
  async updateStoreHardwareConfig(
    tenantId: string,
    storeId: string,
    data: UpdateHardwareConfigRequest
  ): Promise<StoreHardwareConfig> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}/hardware/store`;
      const response = await apiClient.patch<StoreHardwareConfig>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update store hardware config:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update terminal-specific hardware configuration
   */
  async updateTerminalHardwareConfig(
    tenantId: string,
    storeId: string,
    terminalId: string,
    data: UpdateHardwareConfigRequest
  ): Promise<TerminalHardwareConfig> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}/hardware/terminal/${terminalId}`;
      const response = await apiClient.patch<TerminalHardwareConfig>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update terminal hardware config:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create new hardware device configuration
   */
  async createHardwareDevice(
    tenantId: string,
    storeId: string,
    terminalId: string | null,
    device: Omit<HardwareDevice, 'id' | 'created_at' | 'updated_at'>
  ): Promise<HardwareDevice> {
    try {
      const endpoint = terminalId 
        ? `${this.basePath}/${tenantId}/store/${storeId}/hardware/terminal/${terminalId}/device`
        : `${this.basePath}/${tenantId}/store/${storeId}/hardware/store/device`;
      
      const response = await apiClient.post<HardwareDevice>(endpoint, device);
      return response.data;
    } catch (error) {
      console.error('Failed to create hardware device:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update hardware device configuration
   */
  async updateHardwareDevice(
    tenantId: string,
    storeId: string,
    terminalId: string | null,
    deviceId: string,
    device: Partial<HardwareDevice>
  ): Promise<HardwareDevice> {
    try {
      const endpoint = terminalId 
        ? `${this.basePath}/${tenantId}/store/${storeId}/hardware/terminal/${terminalId}/device/${deviceId}`
        : `${this.basePath}/${tenantId}/store/${storeId}/hardware/store/device/${deviceId}`;
      
      const response = await apiClient.patch<HardwareDevice>(endpoint, device);
      return response.data;
    } catch (error) {
      console.error('Failed to update hardware device:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete hardware device configuration
   */
  async deleteHardwareDevice(
    tenantId: string,
    storeId: string,
    terminalId: string | null,
    deviceId: string
  ): Promise<void> {
    try {
      const endpoint = terminalId 
        ? `${this.basePath}/${tenantId}/store/${storeId}/hardware/terminal/${terminalId}/device/${deviceId}`
        : `${this.basePath}/${tenantId}/store/${storeId}/hardware/store/device/${deviceId}`;
      
      await apiClient.delete(endpoint);
    } catch (error) {
      console.error('Failed to delete hardware device:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Test hardware device connection
   */
  async testHardwareDevice(
    tenantId: string,
    storeId: string,
    terminalId: string | null,
    testRequest: HardwareTestRequest
  ): Promise<HardwareTestResponse> {
    try {
      const endpoint = terminalId 
        ? `${this.basePath}/${tenantId}/store/${storeId}/hardware/terminal/${terminalId}/test`
        : `${this.basePath}/${tenantId}/store/${storeId}/hardware/store/test`;
      
      const response = await apiClient.post<HardwareTestResponse>(endpoint, testRequest);
      return response.data;
    } catch (error) {
      console.error('Failed to test hardware device:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get available hardware options for dropdowns
   */
  getHardwareOptions(): Record<string, HardwareOption[]> {
    return {
      connection_types: [
        { id: 'usb', label: 'USB', value: 'usb', icon: '🔌', description: 'Direct USB connection' },
        { id: 'network', label: 'Network (Ethernet/WiFi)', value: 'network', icon: '🌐', description: 'TCP/IP network connection' },
        { id: 'bluetooth', label: 'Bluetooth', value: 'bluetooth', icon: '📶', description: 'Wireless Bluetooth connection' },
        { id: 'serial', label: 'Serial (RS232)', value: 'serial', icon: '🔗', description: 'Serial port connection' }
      ],
      paper_sizes: [
        { id: 'thermal_58mm', label: '58mm Thermal', value: 'thermal_58mm', description: 'Standard 58mm thermal paper' },
        { id: 'thermal_80mm', label: '80mm Thermal', value: 'thermal_80mm', description: 'Wide 80mm thermal paper' },
        { id: 'a4', label: 'A4', value: 'a4', description: 'Standard A4 paper size' },
        { id: 'letter', label: 'Letter', value: 'letter', description: 'US Letter paper size' }
      ],
      printer_models: [
        { id: 'epson_tm_t88v', label: 'Epson TM-T88V', value: 'epson_tm_t88v', description: 'Epson TM-T88V Thermal Printer' },
        { id: 'star_tsp143', label: 'Star TSP143', value: 'star_tsp143', description: 'Star TSP143 Thermal Printer' },
        { id: 'bixolon_srp350', label: 'Bixolon SRP-350', value: 'bixolon_srp350', description: 'Bixolon SRP-350 Thermal Printer' },
        { id: 'citizen_ct_s310', label: 'Citizen CT-S310', value: 'citizen_ct_s310', description: 'Citizen CT-S310 Thermal Printer' }
      ],
      scanner_models: [
        { id: 'symbol_ls2208', label: 'Symbol LS2208', value: 'symbol_ls2208', description: 'Symbol LS2208 Handheld Scanner' },
        { id: 'honeywell_1900', label: 'Honeywell 1900', value: 'honeywell_1900', description: 'Honeywell Xenon 1900 Scanner' },
        { id: 'datalogic_qd2430', label: 'Datalogic QD2430', value: 'datalogic_qd2430', description: 'Datalogic QuickScan QD2430' },
        { id: 'zebra_ds2208', label: 'Zebra DS2208', value: 'zebra_ds2208', description: 'Zebra DS2208 Digital Scanner' }
      ],
      scan_modes: [
        { id: 'manual', label: 'Manual Trigger', value: 'manual', description: 'Manual trigger activation' },
        { id: 'continuous', label: 'Continuous Scan', value: 'continuous', description: 'Continuous scanning mode' },
        { id: 'trigger', label: 'Auto Trigger', value: 'trigger', description: 'Automatic trigger detection' }
      ],
      character_encodings: [
        { id: 'utf8', label: 'UTF-8', value: 'utf8', description: 'Unicode UTF-8 encoding' },
        { id: 'ascii', label: 'ASCII', value: 'ascii', description: 'Standard ASCII encoding' },
        { id: 'windows1252', label: 'Windows-1252', value: 'windows1252', description: 'Windows-1252 encoding' }
      ],
      kitchen_sections: [
        { id: 'hot_kitchen', label: 'Hot Kitchen', value: 'hot_kitchen', description: 'Main hot food preparation area' },
        { id: 'cold_kitchen', label: 'Cold Kitchen', value: 'cold_kitchen', description: 'Cold food and salad preparation' },
        { id: 'bar', label: 'Bar', value: 'bar', description: 'Beverage and cocktail station' },
        { id: 'grill', label: 'Grill Station', value: 'grill', description: 'Grilling and BBQ station' },
        { id: 'fryer', label: 'Fryer Station', value: 'fryer', description: 'Deep frying station' },
        { id: 'bakery', label: 'Bakery', value: 'bakery', description: 'Baking and pastry section' }
      ]
    };
  }

  /**
   * Get mock hardware configuration for development
   */
  async getMockHardwareConfig(): Promise<HardwareConfigResponse> {
    return {
      store_config: {
        store_id: 'store_456',
        devices: [
          {
            id: 'thermal_printer_001',
            name: 'Main Receipt Printer',
            type: 'thermal_printer',
            enabled: true,
            status: 'connected',
            printer_model: 'epson_tm_t88v',
            connection_type: 'network',
            ip_address: '192.168.1.100',
            port: 9100,
            paper_size: 'thermal_80mm',
            auto_print: true,
            print_copies: 1,
            cut_paper: true,
            open_drawer: true,
            character_encoding: 'utf8',
            test_mode: false,
            last_connected: '2025-01-15T10:30:00Z'
          },
          {
            id: 'kitchen_printer_001',
            name: 'Main Kitchen Printer',
            type: 'kitchen_printer',
            enabled: true,
            status: 'connected',
            printer_model: 'star_tsp143',
            connection_type: 'network',
            ip_address: '192.168.1.101',
            port: 9100,
            paper_size: 'thermal_80mm',
            print_header: true,
            print_timestamp: true,
            print_order_number: true,
            print_table_info: true,
            auto_cut: true,
            character_encoding: 'utf8',
            kitchen_sections: ['hot_kitchen', 'grill'],
            last_connected: '2025-01-15T10:25:00Z'
          },
          {
            id: 'scanner_001',
            name: 'Main Barcode Scanner',
            type: 'scanner',
            enabled: true,
            status: 'connected',
            scanner_model: 'symbol_ls2208',
            connection_type: 'usb',
            prefix: '',
            suffix: '\r\n',
            min_length: 8,
            max_length: 20,
            scan_mode: 'manual',
            beep_on_scan: true,
            decode_types: ['CODE128', 'EAN13', 'UPC', 'QR_CODE'],
            last_connected: '2025-01-15T10:20:00Z'
          }
        ],
        default_settings: {
          auto_detect_devices: true,
          device_timeout: 30,
          retry_attempts: 3,
          log_level: 'info'
        },
        created_at: '2025-01-15T08:00:00Z',
        updated_at: '2025-01-15T10:30:00Z',
        created_by: 'admin',
        updated_by: 'store_manager'
      },
      terminal_configs: [
        {
          terminal_id: 'terminal_001',
          store_id: 'store_456',
          devices: [
            {
              id: 'thermal_printer_terminal_001',
              name: 'Register 1 Receipt Printer',
              type: 'thermal_printer',
              enabled: true,
              status: 'connected',
              printer_model: 'citizen_ct_s310',
              connection_type: 'usb',
              paper_size: 'thermal_58mm',
              auto_print: true,
              print_copies: 1,
              cut_paper: true,
              open_drawer: false,
              character_encoding: 'utf8',
              test_mode: false,
              last_connected: '2025-01-15T10:35:00Z'
            }
          ],
          overrides: {},
          created_at: '2025-01-15T09:00:00Z',
          updated_at: '2025-01-15T10:35:00Z',
          created_by: 'admin',
          updated_by: 'terminal_operator'
        }
      ]
    };
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred while processing hardware configuration request');
  }
}

export const hardwareConfigService = new HardwareConfigService();

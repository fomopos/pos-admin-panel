/**
 * Hardware API Service - New API Specification
 * 
 * API service for hardware device management using the new backend specification.
 * Handles CRUD operations for POS hardware devices.
 * 
 * @see src/types/hardware.types.ts
 * @see docs/api/HARDWARE_API_SPECIFIACTIONS.md
 */

import { apiClient } from '../api';
import type {
  HardwareDevice,
  CreateHardwareDTO,
  UpdateHardwareDTO,
  HardwareListResponse,
  HardwareQueryParams,
  DeviceType
} from '../../types/hardware.types';

export class HardwareService {
  /**
   * Get the base path for hardware API
   * Note: tenant_id is extracted from JWT token, not in URL
   */
  private getBasePath(storeId: string): string {
    return `/v0/store/${storeId}/config/hardware`;
  }

  /**
   * Get all hardware devices for a store
   * 
   * @param storeId - Store ID
   * @param params - Optional query parameters
   * @returns List of hardware devices with pagination
   */
  async getAllDevices(
    storeId: string,
    params?: HardwareQueryParams
  ): Promise<HardwareListResponse> {
    try {
      const endpoint = this.getBasePath(storeId);
      const queryParams: Record<string, string | number> = {};
      
      if (params?.terminal_id) {
        queryParams.terminal_id = params.terminal_id;
      }
      if (params?.type) {
        queryParams.type = params.type;
      }
      if (params?.limit) {
        queryParams.limit = params.limit;
      }
      if (params?.next) {
        queryParams.next = params.next;
      }

      const response = await apiClient.get<HardwareListResponse>(endpoint, { params: queryParams });
      return {
        hardware: response.data.hardware || [],
        next: response.data.next || null
      };
    } catch (error) {
      console.error('Failed to fetch hardware devices:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a single hardware device by ID
   * 
   * @param storeId - Store ID
   * @param hardwareId - Hardware device ID
   * @returns Hardware device
   */
  async getDevice(storeId: string, hardwareId: string): Promise<HardwareDevice> {
    try {
      const endpoint = `${this.getBasePath(storeId)}/${hardwareId}`;
      const response = await apiClient.get<HardwareDevice>(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch hardware device ${hardwareId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new hardware device
   * 
   * @param storeId - Store ID
   * @param data - Device creation data
   * @returns Created hardware device
   */
  async createDevice(storeId: string, data: CreateHardwareDTO): Promise<HardwareDevice> {
    try {
      const endpoint = this.getBasePath(storeId);
      
      // Validate and prepare request data
      const requestData = this.prepareCreateRequest(data);
      
      const response = await apiClient.post<HardwareDevice>(endpoint, requestData);
      return response.data;
    } catch (error) {
      console.error('Failed to create hardware device:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing hardware device (partial updates supported)
   * 
   * @param storeId - Store ID
   * @param hardwareId - Hardware device ID
   * @param data - Device update data
   * @returns Success message
   */
  async updateDevice(
    storeId: string,
    hardwareId: string,
    data: UpdateHardwareDTO
  ): Promise<{ message: string }> {
    try {
      const endpoint = `${this.getBasePath(storeId)}/${hardwareId}`;
      
      // Clean and prepare update data
      const requestData = this.cleanRequestData(data);
      
      const response = await apiClient.put<{ message: string }>(endpoint, requestData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update hardware device ${hardwareId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a hardware device
   * 
   * @param storeId - Store ID
   * @param hardwareId - Hardware device ID
   * @returns Success message
   */
  async deleteDevice(storeId: string, hardwareId: string): Promise<{ message: string }> {
    try {
      const endpoint = `${this.getBasePath(storeId)}/${hardwareId}`;
      const response = await apiClient.delete<{ message: string }>(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete hardware device ${hardwareId}:`, error);
      throw this.handleError(error);
    }
  }

  // ============================================================================
  // FILTERING HELPERS
  // ============================================================================

  /**
   * Get devices filtered by terminal
   */
  async getDevicesByTerminal(storeId: string, terminalId: string): Promise<HardwareDevice[]> {
    const response = await this.getAllDevices(storeId, { terminal_id: terminalId });
    return response.hardware;
  }

  /**
   * Get devices filtered by type
   */
  async getDevicesByType(storeId: string, type: DeviceType): Promise<HardwareDevice[]> {
    const response = await this.getAllDevices(storeId, { type });
    return response.hardware;
  }

  /**
   * Get store-level devices (no terminal_id)
   */
  getStoreLevelDevices(devices: HardwareDevice[]): HardwareDevice[] {
    return devices.filter(d => !d.terminal_id);
  }

  /**
   * Get terminal-level devices
   */
  getTerminalLevelDevices(devices: HardwareDevice[], terminalId: string): HardwareDevice[] {
    return devices.filter(d => d.terminal_id === terminalId);
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Prepare create request - validates required fields and structure
   */
  private prepareCreateRequest(data: CreateHardwareDTO): CreateHardwareDTO {
    // Validate required fields
    if (!data.id) {
      throw new Error('Device ID is required');
    }
    if (!data.type) {
      throw new Error('Device type is required');
    }
    if (!data.connection_type) {
      throw new Error('Connection type is required');
    }

    // Validate connection config matches connection type
    this.validateConnectionConfig(data);

    // Validate device config matches device type
    this.validateDeviceConfig(data);

    // Clean and return
    return this.cleanRequestData(data) as CreateHardwareDTO;
  }

  /**
   * Validate that connection config matches connection type
   */
  private validateConnectionConfig(data: CreateHardwareDTO | UpdateHardwareDTO): void {
    const connectionType = data.connection_type;
    
    if (connectionType === 'network') {
      if (!data.network_config?.ip_address || !data.network_config?.port) {
        throw new Error('Network config requires ip_address and port');
      }
    } else if (connectionType === 'bluetooth') {
      if (!data.bluetooth_config?.mac_address) {
        throw new Error('Bluetooth config requires mac_address');
      }
    } else if (connectionType === 'usb') {
      if (!data.usb_config?.vendor_id || !data.usb_config?.product_id) {
        throw new Error('USB config requires vendor_id and product_id');
      }
    }
  }

  /**
   * Validate that device config matches device type
   */
  private validateDeviceConfig(data: CreateHardwareDTO): void {
    const type = data.type;
    
    if (type === 'printer' && !data.printer_config?.mode) {
      throw new Error('Printer config requires mode (thermal, label, or document)');
    }
    if (type === 'payment_terminal' && !data.payment_config?.provider) {
      throw new Error('Payment config requires provider');
    }
    if (type === 'scale' && !data.scale_config?.unit) {
      throw new Error('Scale config requires unit (kg or lb)');
    }
  }

  /**
   * Remove undefined/null values from request data
   */
  private cleanRequestData<T extends Record<string, any>>(data: T): Partial<T> {
    const cleaned: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleanedNested = this.cleanRequestData(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    
    return cleaned as Partial<T>;
  }

  /**
   * Handle API errors with proper error messages
   */
  private handleError(error: any): Error {
    // Handle structured API error responses
    if (error.response?.data?.code) {
      const code = error.response.data.code;
      const message = error.response.data.message || code;
      
      switch (code) {
        case 'VALIDATION_ERROR':
          return new Error(`Validation Error: ${message}`);
        case 'NOT_FOUND':
          return new Error('Hardware device not found');
        case 'CONFLICT':
          return new Error('Hardware device with this ID already exists');
        default:
          return new Error(message);
      }
    }
    
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('An unexpected error occurred while processing hardware device request');
  }
}

// Export singleton instance
export const hardwareService = new HardwareService();

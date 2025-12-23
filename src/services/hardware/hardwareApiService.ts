/**
 * Hardware API Service - New Backend Specification
 * 
 * API service for hardware device management using the new backend specification.
 * Handles CRUD operations, device testing, and type transformations.
 * 
 * @see src/types/hardware-new.types.ts
 * @see docs/HARDWARE_CONFIGURATION_MIGRATION_PLAN.md
 */

import { apiClient } from '../api';
import type {
  HardwareDevice,
  CreateHardwareDTO,
  UpdateHardwareDTO,
  HardwareDeviceResponse,
  HardwareDeviceListResponse,
  HardwareTestRequest,
  HardwareTestResponse,
  DeviceType,
  DeviceStatus
} from '../../types/hardware-new.types';

export class HardwareApiService {
  private readonly basePath = '/v0/tenant';

  /**
   * Get all hardware devices for a store
   * 
   * @param tenantId - Tenant ID
   * @param storeId - Store ID
   * @param terminalId - Optional terminal ID to filter by
   * @returns List of hardware devices
   */
  async getHardwareDevices(
    tenantId: string,
    storeId: string,
    terminalId?: string | null
  ): Promise<HardwareDevice[]> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}/hardware`;
      const params: Record<string, string> = {};
      
      if (terminalId) {
        params.terminal_id = terminalId;
      }

      const response = await apiClient.get<HardwareDeviceListResponse>(endpoint, { params });
      return this.transformDeviceList(response.data.devices || []);
    } catch (error) {
      console.error('Failed to fetch hardware devices:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a single hardware device by ID
   * 
   * @param tenantId - Tenant ID
   * @param storeId - Store ID
   * @param deviceId - Device ID
   * @returns Hardware device
   */
  async getHardwareDevice(
    tenantId: string,
    storeId: string,
    deviceId: string
  ): Promise<HardwareDevice> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}/hardware/${deviceId}`;
      const response = await apiClient.get<HardwareDeviceResponse>(endpoint);
      return this.transformDevice(response.data.device);
    } catch (error) {
      console.error(`Failed to fetch hardware device ${deviceId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new hardware device
   * 
   * @param tenantId - Tenant ID
   * @param storeId - Store ID
   * @param data - Device creation data
   * @returns Created hardware device
   */
  async createHardwareDevice(
    tenantId: string,
    storeId: string,
    data: CreateHardwareDTO
  ): Promise<HardwareDevice> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}/hardware`;
      
      // Transform data to match backend expectations
      const requestData = this.prepareCreateRequest(data, storeId);
      
      const response = await apiClient.post<HardwareDeviceResponse>(endpoint, requestData);
      return this.transformDevice(response.data.device);
    } catch (error) {
      console.error('Failed to create hardware device:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing hardware device
   * 
   * @param tenantId - Tenant ID
   * @param storeId - Store ID
   * @param deviceId - Device ID
   * @param data - Device update data
   * @returns Updated hardware device
   */
  async updateHardwareDevice(
    tenantId: string,
    storeId: string,
    deviceId: string,
    data: UpdateHardwareDTO
  ): Promise<HardwareDevice> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}/hardware/${deviceId}`;
      
      // Transform data to match backend expectations
      const requestData = this.prepareUpdateRequest(data);
      
      const response = await apiClient.patch<HardwareDeviceResponse>(endpoint, requestData);
      return this.transformDevice(response.data.device);
    } catch (error) {
      console.error(`Failed to update hardware device ${deviceId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a hardware device
   * 
   * @param tenantId - Tenant ID
   * @param storeId - Store ID
   * @param deviceId - Device ID
   */
  async deleteHardwareDevice(
    tenantId: string,
    storeId: string,
    deviceId: string
  ): Promise<void> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}/hardware/${deviceId}`;
      await apiClient.delete(endpoint);
    } catch (error) {
      console.error(`Failed to delete hardware device ${deviceId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Test hardware device connection
   * 
   * @param tenantId - Tenant ID
   * @param storeId - Store ID
   * @param deviceId - Device ID
   * @param testRequest - Test request details
   * @returns Test response
   */
  async testHardwareDevice(
    tenantId: string,
    storeId: string,
    deviceId: string,
    testRequest: HardwareTestRequest
  ): Promise<HardwareTestResponse> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}/hardware/${deviceId}/test`;
      const response = await apiClient.post<HardwareTestResponse>(endpoint, testRequest);
      return response.data;
    } catch (error) {
      console.error(`Failed to test hardware device ${deviceId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Filter devices by type
   */
  filterDevicesByType(devices: HardwareDevice[], deviceType: DeviceType): HardwareDevice[] {
    return devices.filter(device => device.type === deviceType);
  }

  /**
   * Filter devices by status
   */
  filterDevicesByStatus(devices: HardwareDevice[], status: DeviceStatus): HardwareDevice[] {
    return devices.filter(device => device.status === status);
  }

  /**
   * Filter devices by terminal
   */
  filterDevicesByTerminal(devices: HardwareDevice[], terminalId: string): HardwareDevice[] {
    return devices.filter(device => device.terminal_id === terminalId);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Transform device from API response to internal format
   */
  private transformDevice(device: any): HardwareDevice {
    return {
      ...device,
      // Ensure dates are Date objects
      last_connected: device.last_connected ? new Date(device.last_connected) : null,
      last_seen: device.last_seen ? new Date(device.last_seen) : null,
      last_health_check: device.last_health_check ? new Date(device.last_health_check) : null,
      first_seen_at: device.first_seen_at ? new Date(device.first_seen_at) : null,
      created_at: new Date(device.created_at),
      updated_at: new Date(device.updated_at),
    };
  }

  /**
   * Transform device list from API response
   */
  private transformDeviceList(devices: any[]): HardwareDevice[] {
    return devices.map(device => this.transformDevice(device));
  }

  /**
   * Prepare create request data
   */
  private prepareCreateRequest(data: CreateHardwareDTO, storeId: string): any {
    const requestData: any = {
      ...data,
      store_id: data.store_id || storeId,
      // Generate ID if not provided
      id: data.id || this.generateDeviceId(),
      // Ensure enabled defaults to true
      enabled: data.enabled !== undefined ? data.enabled : true,
    };

    // Remove undefined/null values to avoid backend validation issues
    return this.cleanRequestData(requestData);
  }

  /**
   * Prepare update request data
   */
  private prepareUpdateRequest(data: UpdateHardwareDTO): any {
    // Remove undefined values
    return this.cleanRequestData(data);
  }

  /**
   * Remove null/undefined values from request data
   */
  private cleanRequestData(data: any): any {
    const cleaned: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        // Handle nested objects
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
    
    return cleaned;
  }

  /**
   * Generate a unique device ID
   */
  private generateDeviceId(): string {
    return `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.response?.data?.slug) {
      // Handle structured API error responses
      const slug = error.response.data.slug;
      const details = error.response.data.details;
      
      if (details && Object.keys(details).length > 0) {
        const fieldErrors = Object.entries(details)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        return new Error(`${slug} - ${fieldErrors}`);
      }
      
      return new Error(slug);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred while processing hardware device request');
  }
}

// Export a singleton instance
export const hardwareApiService = new HardwareApiService();

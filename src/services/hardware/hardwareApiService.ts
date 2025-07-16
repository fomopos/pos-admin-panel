import { apiClient } from '../api';
import type { 
  HardwareDevice, 
  CreateHardwareDeviceRequest, 
  UpdateHardwareDeviceRequest,
  HardwareDeviceResponse,
  DeleteHardwareDeviceResponse
} from '../../types/hardware-api';

export class HardwareApiService {
  /**
   * Get all hardware devices for a store
   */
  async getHardwareDevices(
    tenantId: string, 
    storeId: string, 
    params?: {
      terminal_id?: string;
      type?: string;
    }
  ): Promise<HardwareDevice[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.terminal_id) queryParams.append('terminal_id', params.terminal_id);
      if (params?.type) queryParams.append('type', params.type);
      
      const queryString = queryParams.toString();
      const url = `/${tenantId}/store/${storeId}/config/hardware${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<HardwareDevice[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching hardware devices:', error);
      throw error;
    }
  }

  /**
   * Get a specific hardware device by ID
   */
  async getHardwareDevice(
    tenantId: string, 
    storeId: string, 
    deviceId: string
  ): Promise<HardwareDevice> {
    try {
      const url = `/${tenantId}/store/${storeId}/config/hardware/${deviceId}`;
      const response = await apiClient.get<HardwareDevice>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching hardware device:', error);
      throw error;
    }
  }

  /**
   * Create a new hardware device
   */
  async createHardwareDevice(
    tenantId: string,
    storeId: string,
    deviceData: CreateHardwareDeviceRequest
  ): Promise<HardwareDeviceResponse> {
    try {
      const url = `/${tenantId}/store/${storeId}/config/hardware`;
      const response = await apiClient.post<HardwareDeviceResponse>(url, deviceData);
      return response.data;
    } catch (error) {
      console.error('Error creating hardware device:', error);
      throw error;
    }
  }

  /**
   * Update an existing hardware device
   */
  async updateHardwareDevice(
    tenantId: string,
    storeId: string,
    deviceId: string,
    updates: UpdateHardwareDeviceRequest
  ): Promise<HardwareDeviceResponse> {
    try {
      const url = `/${tenantId}/store/${storeId}/config/hardware/${deviceId}`;
      const response = await apiClient.put<HardwareDeviceResponse>(url, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating hardware device:', error);
      throw error;
    }
  }

  /**
   * Delete a hardware device
   */
  async deleteHardwareDevice(
    tenantId: string,
    storeId: string,
    deviceId: string
  ): Promise<DeleteHardwareDeviceResponse> {
    try {
      const url = `/${tenantId}/store/${storeId}/config/hardware/${deviceId}`;
      const response = await apiClient.delete<DeleteHardwareDeviceResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error deleting hardware device:', error);
      throw error;
    }
  }

  /**
   * Test a hardware device connection
   */
  async testHardwareDevice(
    tenantId: string,
    storeId: string,
    deviceId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const url = `/${tenantId}/store/${storeId}/config/hardware/${deviceId}/test`;
      const response = await apiClient.post<{ success: boolean; message: string }>(url);
      return response.data;
    } catch (error) {
      console.error('Error testing hardware device:', error);
      throw error;
    }
  }

  /**
   * Get hardware devices for store level (no terminal_id)
   */
  async getStoreHardwareDevices(
    tenantId: string,
    storeId: string
  ): Promise<HardwareDevice[]> {
    return this.getHardwareDevices(tenantId, storeId);
  }

  /**
   * Get hardware devices for a specific terminal
   */
  async getTerminalHardwareDevices(
    tenantId: string,
    storeId: string,
    terminalId: string
  ): Promise<HardwareDevice[]> {
    return this.getHardwareDevices(tenantId, storeId, { terminal_id: terminalId });
  }

  /**
   * Get hardware devices by type
   */
  async getHardwareDevicesByType(
    tenantId: string,
    storeId: string,
    deviceType: string,
    terminalId?: string
  ): Promise<HardwareDevice[]> {
    const params: { type: string; terminal_id?: string } = { type: deviceType };
    if (terminalId) params.terminal_id = terminalId;
    
    return this.getHardwareDevices(tenantId, storeId, params);
  }
}

// Export a singleton instance
export const hardwareApiService = new HardwareApiService();

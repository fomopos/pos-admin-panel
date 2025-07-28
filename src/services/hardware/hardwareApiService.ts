import { apiClient } from '../api';
import type { 
  HardwareDevice, 
  HardwareDeviceListResponse,
  CreateHardwareDeviceRequest, 
  UpdateHardwareDeviceRequest,
  HardwareDeviceResponse,
  DeleteHardwareDeviceResponse
} from '../../types/hardware-api';

export class HardwareApiService {
  /**
   * Get all hardware devices for a store with pagination support
   */
  async getHardwareDevices(
    storeId: string, 
    params?: {
      terminal_id?: string;
      type?: string;
      limit?: number;
      next_token?: string;
    }
  ): Promise<HardwareDevice[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.terminal_id) queryParams.append('terminal_id', params.terminal_id);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.next_token) queryParams.append('next_token', params.next_token);
      
      const queryString = queryParams.toString();
      const url = `/v0/store/${storeId}/config/hardware${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<HardwareDeviceListResponse>(url);
      
      // Handle case when no hardware devices exist
      if (!response.data || !response.data.hardware) {
        return [];
      }
      
      // Return just the hardware array from the response
      return response.data.hardware;
    } catch (error: any) {
      console.error('Error fetching hardware devices:', error);
      
      // If it's a 404 or similar "not found" error, return empty array
      if (error?.response?.status === 404 || error?.response?.status === 204) {
        return [];
      }
      
      throw error;
    }
  }

  /**
   * Get all hardware devices with pagination handling (fetches all pages)
   */
  async getAllHardwareDevices(
    storeId: string, 
    params?: {
      terminal_id?: string;
      type?: string;
    }
  ): Promise<HardwareDevice[]> {
    try {
      let allDevices: HardwareDevice[] = [];
      let nextToken: string | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        const queryParams = new URLSearchParams();
        if (params?.terminal_id) queryParams.append('terminal_id', params.terminal_id);
        if (params?.type) queryParams.append('type', params.type);
        queryParams.append('limit', '50'); // Fetch in batches of 50
        if (nextToken) queryParams.append('next_token', nextToken);
        
        const queryString = queryParams.toString();
        const url = `/v0/store/${storeId}/config/hardware?${queryString}`;
        
        const response = await apiClient.get<HardwareDeviceListResponse>(url);
        
        // Handle case when no hardware devices exist
        if (!response.data || !response.data.hardware) {
          return [];
        }
        
        allDevices = allDevices.concat(response.data.hardware);
        hasMore = response.data.has_more;
        nextToken = response.data.next_token;
      }

      return allDevices;
    } catch (error: any) {
      console.error('Error fetching all hardware devices:', error);
      
      // If it's a 404 or similar "not found" error, return empty array
      if (error?.response?.status === 404 || error?.response?.status === 204) {
        return [];
      }
      
      throw error;
    }
  }

  /**
   * Get a specific hardware device by ID
   */
  async getHardwareDevice(
    storeId: string, 
    deviceId: string
  ): Promise<HardwareDevice> {
    try {
      const url = `/v0/store/${storeId}/config/hardware/${deviceId}`;
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
    storeId: string,
    deviceData: CreateHardwareDeviceRequest
  ): Promise<HardwareDeviceResponse> {
    try {
      const url = `/v0/store/${storeId}/config/hardware`;
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
    storeId: string,
    deviceId: string,
    updates: UpdateHardwareDeviceRequest
  ): Promise<HardwareDeviceResponse> {
    try {
      const url = `/v0/store/${storeId}/config/hardware/${deviceId}`;
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
    storeId: string,
    deviceId: string
  ): Promise<DeleteHardwareDeviceResponse> {
    try {
      const url = `/v0/store/${storeId}/config/hardware/${deviceId}`;
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
    storeId: string,
    deviceId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const url = `/v0/store/${storeId}/config/hardware/${deviceId}/test`;
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
    storeId: string
  ): Promise<HardwareDevice[]> {
    return this.getHardwareDevices(storeId);
  }

  /**
   * Get hardware devices for a specific terminal
   */
  async getTerminalHardwareDevices(
    storeId: string,
    terminalId: string
  ): Promise<HardwareDevice[]> {
    return this.getHardwareDevices(storeId, { terminal_id: terminalId });
  }

  /**
   * Get hardware devices by type
   */
  async getHardwareDevicesByType(
    storeId: string,
    deviceType: string,
    terminalId?: string
  ): Promise<HardwareDevice[]> {
    const params: { type: string; terminal_id?: string } = { type: deviceType };
    if (terminalId) params.terminal_id = terminalId;
    
    return this.getHardwareDevices(storeId, params);
  }
}

// Export a singleton instance
export const hardwareApiService = new HardwareApiService();

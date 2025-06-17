import { apiClient } from '../api';
import type { StoreDetails } from '../types/store.types';

/**
 * Store Service for managing store data
 * Handles CRUD operations for store information
 */
export class StoreService {
  private readonly basePath = '/v0/tenant';

  /**
   * Get store details by tenant and store ID
   */
  async getStoreDetails(tenantId: string, storeId: string): Promise<StoreDetails> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}`;
      const response = await apiClient.get<StoreDetails>(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch store details for ${tenantId}/${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Update store details
   */
  async updateStoreDetails(tenantId: string, storeId: string, data: Partial<StoreDetails>): Promise<StoreDetails> {
    try {
      const endpoint = `${this.basePath}/${tenantId}/store/${storeId}`;
      const response = await apiClient.put<StoreDetails>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update store details for ${tenantId}/${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Convert store timings to business hours format
   */
  convertTimingsToBusinessHours(timings: Record<string, string>): Array<{ day: string; is_open: boolean; open_time: string; close_time: string }> {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map(day => {
      const timing = timings[day];
      if (!timing || timing === 'closed') {
        return {
          day,
          is_open: false,
          open_time: '09:00',
          close_time: '18:00'
        };
      }

      const [openTime, closeTime] = timing.split('-');
      return {
        day,
        is_open: true,
        open_time: openTime,
        close_time: closeTime
      };
    });
  }

  /**
   * Convert business hours to store timings format
   */
  convertBusinessHoursToTimings(businessHours: Array<{ day: string; is_open: boolean; open_time: string; close_time: string }>): Record<string, string> {
    const timings: Record<string, string> = {};
    
    businessHours.forEach(hours => {
      if (hours.is_open) {
        timings[hours.day] = `${hours.open_time}-${hours.close_time}`;
      } else {
        timings[hours.day] = 'closed';
      }
    });

    return timings;
  }

  /**
   * Convert StoreDetails to StoreInformation format for compatibility
   */
  convertToStoreInformation(storeDetails: StoreDetails): any {
    return {
      store_name: storeDetails.store_name,
      business_name: storeDetails.legal_entity_name || storeDetails.store_name,
      registration_number: storeDetails.legal_entity_id,
      tax_number: '', // Not available in current API
      address: {
        street1: storeDetails.address.address1,
        street2: storeDetails.address.address2,
        city: storeDetails.address.city,
        state: storeDetails.address.state,
        postal_code: storeDetails.address.postal_code,
        country: storeDetails.address.country
      },
      contact_info: {
        phone: storeDetails.telephone1 || '',
        email: storeDetails.email || '',
        website: '', // Not available in current API
        fax: '' // Not available in current API
      },
      business_hours: this.convertTimingsToBusinessHours(storeDetails.store_timing),
      timezone: storeDetails.locale,
      logo_url: '', // Not available in current API
      description: storeDetails.description
    };
  }

  /**
   * Convert StoreInformation back to StoreDetails format for API updates
   */
  convertFromStoreInformation(storeInfo: any, originalDetails: StoreDetails): Partial<StoreDetails> {
    return {
      store_name: storeInfo.store_name,
      description: storeInfo.description,
      address: {
        address1: storeInfo.address.street1,
        address2: storeInfo.address.street2,
        address3: originalDetails.address.address3,
        address4: originalDetails.address.address4,
        city: storeInfo.address.city,
        state: storeInfo.address.state,
        district: originalDetails.address.district,
        area: originalDetails.address.area,
        postal_code: storeInfo.address.postal_code,
        country: storeInfo.address.country,
        county: originalDetails.address.county
      },
      locale: storeInfo.timezone,
      telephone1: storeInfo.contact_info.phone,
      email: storeInfo.contact_info.email,
      legal_entity_name: storeInfo.business_name,
      store_timing: this.convertBusinessHoursToTimings(storeInfo.business_hours)
    };
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.response?.status === 404) {
      return new Error('Store not found');
    }
    if (error.response?.status === 403) {
      return new Error('Insufficient permissions to access store');
    }
    return new Error(error.message || 'An unexpected error occurred');
  }

  /**
   * Get mock store details for development/testing
   */
  async getMockStoreDetails(): Promise<StoreDetails> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      tenant_id: "2711",
      store_id: "10001",
      status: "active",
      store_name: "Spice Garden",
      description: "A fine dining restaurant offering traditional Indian cuisine",
      location_type: "restaurant",
      store_type: "f&b",
      address: {
        address1: "45 MG Road",
        address2: "Opposite Central Mall",
        address3: "Royal Towers",
        address4: "Ground Floor",
        city: "Bengaluru",
        state: "Karnataka",
        district: "Bangalore Urban",
        area: "MG Road",
        postal_code: "560001",
        country: "India",
        county: "Bangalore"
      },
      locale: "en-IN",
      currency: "INR",
      latitude: "12.9716",
      longitude: "77.5946",
      telephone1: "+918067891234",
      telephone2: "+918067896789",
      telephone3: "+918067899012",
      telephone4: "+918067893456",
      email: "info@spicegarden.in",
      legal_entity_id: "LE-IN-45678",
      legal_entity_name: "Spice Garden Hospitality Pvt. Ltd.",
      store_timing: {
        "Friday": "12:00-23:30",
        "Holidays": "12:00-22:00",
        "Monday": "12:00-23:00",
        "Saturday": "12:00-23:30",
        "Sunday": "12:00-22:00",
        "Thursday": "12:00-23:00",
        "Tuesday": "12:00-23:00",
        "Wednesday": "12:00-23:00"
      },
      terminals: {
        "101": {
          terminal_id: "101",
          device_id: "2D4FB4B7-4D4B-5CC0-8B4A-331AB1AACD2C",
          status: "active",
          platform: "macOS",
          model: "Mac15,10",
          arch: "arm64",
          name: "Pratyush's MacBook Pro"
        },
        "102": {
          terminal_id: "102",
          device_id: "57B32ED7-204C-428F-8BF0-0A237866F20F",
          status: "active",
          platform: "ios",
          model: "iPhone",
          arch: "18.5",
          name: "iPhone"
        },
        "103": {
          terminal_id: "103",
          device_id: "{DDE6A06F-8AF8-40AA-957D-EDF42F2387D1}",
          status: "active",
          platform: "windows",
          model: "Windows 11 Pro",
          arch: "26100.1.amd64fre.ge_release.240331-1435",
          name: "UtkarshX86"
        },
        "104": {
          terminal_id: "104",
          device_id: "1019C443-5A11-41FC-9706-897DD52355A4",
          status: "active",
          platform: "ios",
          model: "iPhone",
          arch: "18.5",
          name: "iPhone"
        }
      },
      properties: null,
      created_at: "2025-06-05T13:24:19.055068+04:00",
      create_user_id: "Y8Z4UL",
      updated_at: "2025-06-05T13:24:19.05507+04:00",
      update_user_id: undefined
    };
  }
}

// Create singleton instance
export const storeService = new StoreService();

import { apiClient } from '../api';
import type { StoreDetails } from '../types/store.types';

/**
 * Store Service for managing store data
 * Handles CRUD operations for store information
 */
export class StoreService {
  private readonly basePath = '/v0/store';

  /**
   * Get store details by store ID
   */
  async getStoreDetails(storeId: string): Promise<StoreDetails> {
    try {
      const endpoint = `${this.basePath}/${storeId}`;
      const response = await apiClient.get<StoreDetails>(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch store details for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Update store details
   */
  async updateStoreDetails(storeId: string, data: Partial<StoreDetails>): Promise<StoreDetails> {
    try {
      const endpoint = `${this.basePath}/${storeId}`;
      const response = await apiClient.put<StoreDetails>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update store details for store ${storeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Convert store timings to business hours format
   */
  convertTimingsToBusinessHours(timings: Record<string, string> | null | undefined): Array<{ day: string; is_open: boolean; open_time: string; close_time: string }> {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map(day => {
      const timing = timings?.[day];
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
      // Basic store information
      store_id: storeDetails.store_id,
      tenant_id: storeDetails.tenant_id,
      store_name: storeDetails.store_name,
      business_name: storeDetails.legal_entity_name || storeDetails.store_name,
      description: storeDetails.description,
      status: storeDetails.status,
      
      // Store classification
      location_type: storeDetails.location_type,
      store_type: storeDetails.store_type,
      
      // Legal entity information
      registration_number: storeDetails.legal_entity_id,
      legal_entity_id: storeDetails.legal_entity_id,
      legal_entity_name: storeDetails.legal_entity_name,
      tax_number: '', // Not available in current API
      
      // Complete address information
      address: {
        street1: storeDetails.address.address1,
        street2: storeDetails.address.address2,
        street3: storeDetails.address.address3,
        street4: storeDetails.address.address4,
        city: storeDetails.address.city,
        state: storeDetails.address.state,
        district: storeDetails.address.district,
        area: storeDetails.address.area,
        postal_code: storeDetails.address.postal_code,
        country: this.normalizeCountryValue(storeDetails.address.country || ''),
        county: storeDetails.address.county
      },
      
      // Geographic coordinates
      latitude: storeDetails.latitude,
      longitude: storeDetails.longitude,
      
      // Contact information with all phone numbers
      contact_info: {
        phone: storeDetails.telephone1 || '',
        phone2: storeDetails.telephone2 || '',
        phone3: storeDetails.telephone3 || '',
        phone4: storeDetails.telephone4 || '',
        telephone1: storeDetails.telephone1,
        telephone2: storeDetails.telephone2,
        telephone3: storeDetails.telephone3,
        telephone4: storeDetails.telephone4,
        email: storeDetails.email || '',
        website: '', // Not available in current API
        fax: '' // Not available in current API
      },
      
      // Regional settings
      locale: storeDetails.locale,
      currency: storeDetails.currency,
      timezone: storeDetails.timezone,

      // Business hours
      business_hours: this.convertTimingsToBusinessHours(storeDetails.store_timing),
      store_timing: storeDetails.store_timing,
      
      // Terminal information
      terminals: storeDetails.terminals,
      
      // Metadata
      properties: storeDetails.properties,
      created_at: storeDetails.created_at,
      create_user_id: storeDetails.create_user_id,
      updated_at: storeDetails.updated_at,
      update_user_id: storeDetails.update_user_id,
      
      // Legacy fields
      logo_url: '' // Not available in current API
    };
  }

  /**
   * Convert StoreInformation back to StoreDetails format for API updates
   */
  convertFromStoreInformation(storeInfo: any, originalDetails: StoreDetails): Partial<StoreDetails> {
    // Extract phone numbers using utility method
    const phoneNumbers = this.extractPhoneNumbers(storeInfo.contact_info);
    
    return {
      // Basic store information
      store_name: this.getSafeValue(storeInfo.store_name, originalDetails.store_name) || '',
      description: this.getSafeValue(storeInfo.description, originalDetails.description),
      status: this.getSafeValue(storeInfo.status, originalDetails.status) || 'active',
      
      // Store classification
      location_type: this.getSafeValue(storeInfo.location_type, originalDetails.location_type) || '',
      store_type: this.getSafeValue(storeInfo.store_type, originalDetails.store_type) || '',
      
      // Legal entity information
      legal_entity_id: this.getSafeValue(
        storeInfo.legal_entity_id || storeInfo.registration_number, 
        originalDetails.legal_entity_id
      ),
      legal_entity_name: this.getSafeValue(
        storeInfo.legal_entity_name || storeInfo.business_name, 
        originalDetails.legal_entity_name
      ),
      
      // Complete address information
      address: {
        address1: this.getSafeValue(storeInfo.address?.street1, originalDetails.address.address1) || '',
        address2: this.getSafeValue(storeInfo.address?.street2, originalDetails.address.address2),
        address3: this.getSafeValue(storeInfo.address?.street3, originalDetails.address.address3),
        address4: this.getSafeValue(storeInfo.address?.street4, originalDetails.address.address4),
        city: this.getSafeValue(storeInfo.address?.city, originalDetails.address.city) || '',
        state: this.getSafeValue(storeInfo.address?.state, originalDetails.address.state) || '',
        district: this.getSafeValue(storeInfo.address?.district, originalDetails.address.district),
        area: this.getSafeValue(storeInfo.address?.area, originalDetails.address.area),
        postal_code: this.getSafeValue(storeInfo.address?.postal_code, originalDetails.address.postal_code) || '',
        country: this.normalizeCountryValue(this.getSafeValue(storeInfo.address?.country, originalDetails.address.country) || ''),
        county: this.getSafeValue(storeInfo.address?.county, originalDetails.address.county)
      },
      
      // Geographic coordinates
      latitude: this.getSafeValue(storeInfo.latitude, originalDetails.latitude),
      longitude: this.getSafeValue(storeInfo.longitude, originalDetails.longitude),
      
      // Regional settings
      locale: this.getSafeValue(storeInfo.locale, originalDetails.locale) || 'en-US',
      timezone: this.getSafeValue(storeInfo.timezone, originalDetails.timezone) || 'UTC',
      currency: this.getSafeValue(storeInfo.currency, originalDetails.currency) || 'USD',
      
      // Contact information with all phone numbers
      telephone1: phoneNumbers.telephone1 || originalDetails.telephone1,
      telephone2: phoneNumbers.telephone2 || originalDetails.telephone2,
      telephone3: phoneNumbers.telephone3 || originalDetails.telephone3,
      telephone4: phoneNumbers.telephone4 || originalDetails.telephone4,
      email: this.getSafeValue(storeInfo.contact_info?.email, originalDetails.email),
      
      // Business hours
      store_timing: storeInfo.business_hours 
        ? this.convertBusinessHoursToTimings(storeInfo.business_hours)
        : (storeInfo.store_timing || originalDetails.store_timing),
      
      // Terminal information (preserve existing)
      terminals: storeInfo.terminals || originalDetails.terminals,
      
      // Properties (preserve existing)
      properties: storeInfo.properties || originalDetails.properties
    };
  }

  /**
   * Safely get a value or fallback to original value
   */
  private getSafeValue<T>(newValue: T | undefined | null, originalValue: T | undefined): T | undefined {
    if (newValue !== undefined && newValue !== null && newValue !== '') {
      return newValue;
    }
    return originalValue;
  }

  /**
   * Convert phone numbers array to individual telephone fields
   */
  private extractPhoneNumbers(contactInfo: any): {
    telephone1?: string;
    telephone2?: string;
    telephone3?: string;
    telephone4?: string;
  } {
    return {
      telephone1: contactInfo?.phone || contactInfo?.telephone1,
      telephone2: contactInfo?.phone2 || contactInfo?.telephone2,
      telephone3: contactInfo?.phone3 || contactInfo?.telephone3,
      telephone4: contactInfo?.phone4 || contactInfo?.telephone4
    };
  }

  /**
   * Validate store information before conversion
   */
  validateStoreInformation(storeInfo: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!storeInfo.store_name?.trim()) {
      errors.push('Store name is required');
    }
    
    if (!storeInfo.address?.street1?.trim()) {
      errors.push('Primary address is required');
    }
    
    if (!storeInfo.address?.city?.trim()) {
      errors.push('City is required');
    }
    
    if (!storeInfo.address?.country?.trim()) {
      errors.push('Country is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    // Check if it's already our structured ApiError
    if (error.name === 'ApiError') {
      return error;
    }
    
    // Handle HTTP response errors that might have the new error format
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Check if it has the new structured format
      if (errorData.code && errorData.slug && errorData.message) {
        const { ApiError } = require('../api');
        return new ApiError(
          errorData.message,
          errorData.code,
          errorData.slug,
          errorData.details
        );
      }
      
      // Fallback to legacy format
      if (errorData.message) {
        return new Error(errorData.message);
      }
    }
    
    // Handle specific HTTP status codes
    if (error.response?.status === 404) {
      const { ApiError } = require('../api');
      return new ApiError('Store not found', 1002, 'STORE_NOT_FOUND');
    }
    if (error.response?.status === 403) {
      const { ApiError } = require('../api');
      return new ApiError('Insufficient permissions to access store', 1003, 'ACCESS_DENIED');
    }
    
    // Default error handling
    return new Error(error.message || 'An unexpected error occurred');
  }

  /**
   * Get mapping of fields between StoreInformation and StoreDetails formats
   */
  getFieldMapping(): Record<string, string[]> {
    return {
      basic: [
        'store_id', 'tenant_id', 'store_name', 'description', 'status'
      ],
      classification: [
        'location_type', 'store_type'
      ],
      legal: [
        'legal_entity_id', 'legal_entity_name', 'registration_number'
      ],
      address: [
        'address1/street1', 'address2/street2', 'address3/street3', 'address4/street4',
        'city', 'state', 'district', 'area', 'postal_code', 'country', 'county'
      ],
      contact: [
        'telephone1/phone', 'telephone2/phone2', 'telephone3/phone3', 'telephone4/phone4',
        'email'
      ],
      geographic: [
        'latitude', 'longitude'
      ],
      regional: [
        'locale', 'timezone', 'currency'
      ],
      business_hours: [
        'store_timing', 'business_hours'
      ],
      system: [
        'terminals', 'properties', 'created_at', 'create_user_id', 'updated_at', 'update_user_id'
      ]
    };
  }

  /**
   * Update store details with validation and comprehensive field mapping
   */
  async updateStoreWithValidation(
    storeId: string, 
    storeInfo: any
  ): Promise<{ success: boolean; data?: StoreDetails; errors?: string[] }> {
    try {
      // Validate the store information first
      const validation = this.validateStoreInformation(storeInfo);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Get current store details for fallback values
      const currentDetails = await this.getStoreDetails(storeId);
      
      // Convert store information to API format
      const updateData = this.convertFromStoreInformation(storeInfo, currentDetails);
      
      // Update the store
      const updatedStore = await this.updateStoreDetails(storeId, updateData);
      
      return {
        success: true,
        data: updatedStore
      };
    } catch (error) {
      console.error('Failed to update store with validation:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  /**
   * Utility to normalize country value to country code
   * Handles migration from country names to country codes
   */
  private normalizeCountryValue = (countryValue: string): string => {
    if (!countryValue) return '';
    
    // If it's already a 2-letter country code, return as-is
    if (countryValue.length === 2 && /^[A-Z]{2}$/.test(countryValue)) {
      return countryValue;
    }
    
    // If it's a country name, convert to country code
    // Import the conversion utility
    try {
      const { getCountryCodeFromName } = require('../../utils/locationUtils');
      return getCountryCodeFromName(countryValue);
    } catch (error) {
      console.warn('Could not convert country name to code:', countryValue, error);
      return countryValue; // Return original value as fallback
    }
  };
}

// Create singleton instance
export const storeService = new StoreService();

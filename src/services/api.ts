// Base API configuration and utilities
import { authService } from '../auth/authService';
import { useTenantStore } from '../tenants/tenantStore';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Development mode flag - set to true to use mock data instead of real API calls
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
  import.meta.env.NODE_ENV === 'development';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiErrorResponse {
  code: number;
  slug: string;
  message: string;
  details?: Record<string, string>;
}

export class ApiError extends Error {
  public code?: number;
  public slug?: string;
  public details?: Record<string, string>;

  constructor(message: string, code?: number, slug?: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.slug = slug;
    this.details = details;
  }

  /**
   * Format error for user display
   */
  public getDisplayMessage(): string {
    if (this.details && Object.keys(this.details).length > 0) {
      const fieldErrors = Object.entries(this.details)
        .map(([field, error]) => `${field}: ${error}`)
        .join('\n');
      return `${this.message}\n\n${fieldErrors}`;
    }
    return this.message;
  }

  /**
   * Get validation errors as key-value pairs
   */
  public getValidationErrors(): Record<string, string> {
    return this.details || {};
  }
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add authentication token if available
    const token = await authService.getAccessToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Add tenant ID header if available (exclude endpoints that don't need tenant context)
    const excludedEndpoints = [
      // '/v0/tenant', // Used to fetch user's available tenants before selection
      '/auth/', // Authentication endpoints
      '/health', // Health check endpoints
    ];
    
    const shouldIncludeTenantHeader = !excludedEndpoints.some(excluded => endpoint.includes(excluded));
    const tenantStore = useTenantStore.getState();
    
    if (shouldIncludeTenantHeader && tenantStore.currentTenant?.id) {
      config.headers = {
        ...config.headers,
        'x-tenant-id': tenantStore.currentTenant.id,
      };
    }

    if ('/v0/tenant' === endpoint) {
      config.headers = {
        ...config.headers,
        'x-tenant-id': tenantStore.currentTenant?.id || '',
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({
          code: response.status,
          slug: 'UNKNOWN_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: {}
        }));
        
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.code || response.status,
          errorData.slug || 'UNKNOWN_ERROR',
          errorData.details || {}
        );
      }

      const data = await response.json();
      
      // Check if the response is already in the expected format
      // Some APIs return data directly, others wrap it in a response object
      if (data && typeof data === 'object' && 'data' in data) {
        return data;
      } else {
        // Wrap direct data in ApiResponse format
        return {
          data: data,
          success: true,
          message: 'Success'
        };
      }
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      
      // If it's already an ApiError, re-throw it
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Re-throw other errors wrapped in ApiError
      throw new ApiError(
        error instanceof Error ? error.message : 'Network request failed',
        0,
        'NETWORK_ERROR',
        { endpoint: endpoint, originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: options?.headers,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: options?.headers,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers: options?.headers,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create a default API client instance
export const apiClient = new ApiClient();

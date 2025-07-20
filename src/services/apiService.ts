import type { AppError } from '../types/error';
import { createApiError, createNetworkError } from '../utils/errorUtils';
import { useErrorHandler } from './errorHandler';
import { useTenantStore } from '../tenants/tenantStore';

/**
 * Enhanced fetch wrapper with automatic error handling
 */
export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  suppressErrorToast?: boolean;
  errorContext?: Record<string, any>;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
}

/**
 * Enhanced API service with built-in error handling
 */
class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor(baseUrl: string = '', defaultTimeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Set default headers
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Add authorization header
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization header
   */
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Enhanced fetch with error handling
   */
  private async enhancedFetch<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = 0,
      retryDelay = 1000,
      suppressErrorToast = false,
      errorContext = {},
      headers = {},
      ...fetchOptions
    } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    
    // Set up timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...(headers as Record<string, string>),
    };

    // Add tenant ID header if available (exclude endpoints that don't need tenant context)
    const excludedEndpoints = [
      '/v0/tenant', // Used to fetch user's available tenants before selection
      '/auth/', // Authentication endpoints
      '/health', // Health check endpoints
    ];
    
    const shouldIncludeTenantHeader = !excludedEndpoints.some(excluded => endpoint.includes(excluded));
    const tenantStore = useTenantStore.getState();
    
    if (shouldIncludeTenantHeader && tenantStore.currentTenant?.id) {
      requestHeaders['x-tenant-id'] = tenantStore.currentTenant.id;
    }

    const requestOptions: RequestInit = {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
    };

    try {
      console.log(`🌐 API Request: ${requestOptions.method || 'GET'} ${url}`);
      
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.createApiErrorFromResponse(response, url, requestOptions.method);
      }

      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      console.log(`✅ API Success: ${requestOptions.method || 'GET'} ${url}`);

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        url: response.url,
      };

    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort error (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = createNetworkError(
          `Request timed out after ${timeout}ms`,
          navigator.onLine,
          true,
          {
            details: { url, method: requestOptions.method, timeout, ...errorContext }
          }
        );

        if (!suppressErrorToast) {
          useErrorHandler.getState().handleError(timeoutError);
        }
        throw timeoutError;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = createNetworkError(
          'Network request failed',
          navigator.onLine,
          false,
          {
            details: { url, method: requestOptions.method, ...errorContext },
            originalError: error
          }
        );

        if (!suppressErrorToast) {
          useErrorHandler.getState().handleError(networkError);
        }
        throw networkError;
      }

      // Re-throw AppError instances
      if (error && typeof error === 'object' && 'id' in error) {
        if (!suppressErrorToast) {
          useErrorHandler.getState().handleError(error);
        }
        throw error;
      }

      // Handle unknown errors
      const unknownError = createApiError(
        error instanceof Error ? error.message : 'Unknown API error',
        undefined,
        url,
        requestOptions.method,
        {
          details: { ...errorContext },
          originalError: error instanceof Error ? error : undefined
        }
      );

      if (!suppressErrorToast) {
        useErrorHandler.getState().handleError(unknownError);
      }
      throw unknownError;
    }
  }

  /**
   * Create API error from response
   */
  private async createApiErrorFromResponse(
    response: Response,
    url: string,
    method: string = 'GET'
  ): Promise<AppError> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: any = {};

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.error || errorMessage;
        errorDetails = errorBody;
      } else {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }
    } catch {
      // If we can't parse the error body, use the default message
    }

    return createApiError(
      errorMessage,
      response.status,
      url,
      method,
      {
        details: errorDetails,
        requestId: response.headers.get('x-request-id') || undefined
      }
    );
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.enhancedFetch<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.enhancedFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.enhancedFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.enhancedFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.enhancedFetch<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Upload file
   */
  async upload<T>(endpoint: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    const { headers = {}, ...restOptions } = options || {};
    
    // Remove Content-Type header for FormData (browser will set it automatically with boundary)
    const uploadHeaders = { ...headers } as Record<string, string>;
    delete uploadHeaders['Content-Type'];

    return this.enhancedFetch<T>(endpoint, {
      ...restOptions,
      method: 'POST',
      headers: uploadHeaders,
      body: formData,
    });
  }

  /**
   * Download file
   */
  async download(endpoint: string, filename?: string, options?: ApiRequestOptions): Promise<void> {
    const response = await this.enhancedFetch<Blob>(endpoint, {
      ...options,
      headers: {
        ...options?.headers,
        'Accept': 'application/octet-stream',
      },
    });

    // Create download link
    const blob = response.data;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `download_${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Create default API service instance
export const apiService = new ApiService(
  import.meta.env.VITE_API_BASE_URL || 'https://api.dev.pocketterminal.com'
);

export default ApiService;

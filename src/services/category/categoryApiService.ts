// Category API service for real backend integration
import { apiClient, ApiError, USE_MOCK_DATA, API_BASE_URL } from '../api';
import { useErrorHandler } from '../errorHandler';

// Types for Category API integration (matching backend schema)
import type { EnhancedCategory } from '../../types/category';

export interface CategoryApiResponse {
  category_id: string;
  name: string;
  description: string | null;
  parent_category_id: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  icon_url: string | null;
  image_url: string | null;
  color?: string | null;
  display_on_main_screen: boolean | null;
  tags: string[];
  properties: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  create_user_id: string;
  update_user_id: string | null;
}

// Request payload for creating categories
export interface CreateCategoryRequest {
  category_id?: string; // Optional for creation, will be generated if not provided
  name: string;
  description?: string;
  parent_category_id?: string;
  sort_order?: number;
  is_active?: boolean;
  icon_url?: string;
  image_url?: string;
  color?: string;
  display_on_main_screen?: boolean;
  tags?: string[];
  properties?: Record<string, any>;
}

// Request payload for batch creating categories
export interface BatchCreateCategoriesRequest {
  categories: CreateCategoryRequest[];
}

// Response for getting categories
export interface CategoriesApiResponse {
  categories: CategoryApiResponse[];
  total_count: number;
}

// Response for batch operations
export interface BatchOperationResponse {
  success: boolean;
  created_count: number;
  failed_count: number;
  errors: string[];
}

// Query parameters for filtering categories
export interface CategoryQueryParams {
  tenant_id?: string;
  store_id?: string;
  parent_category_id?: string;
  is_active?: boolean;
  include_children?: boolean;
  sort_by?: 'name' | 'sort_order' | 'created_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

class CategoryApiService {
  private readonly basePath = `/v0/tenant/`;

  /**
   * Get all categories for a tenant/store
   */
  async getCategories(params?: CategoryQueryParams): Promise<EnhancedCategory[]> {
    try {
      console.log('📂 Fetching categories with params:', params);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Using mock categories data');
        const mockData = this.getMockCategories();
        return mockData.categories.map(this.mapToEnhancedCategory);
      }

      const path = `${this.basePath}${params?.tenant_id}/store/${params?.store_id}/category`;

      // Real API call - expecting response format: { categories: CategoryApiResponse[] }
      const response = await apiClient.get<{ categories: CategoryApiResponse[] }>(path, {});
      
      console.log('✅ Successfully fetched categories from API:', response.data);
      return response.data.categories.map(this.mapToEnhancedCategory);
      
    } catch (error) {
      const appError = this.handleError(error, 'Failed to fetch categories');
      console.error('❌ Error fetching categories from API:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Map CategoryApiResponse to EnhancedCategory
   */
  private mapToEnhancedCategory(apiCategory: CategoryApiResponse): EnhancedCategory {
    return {
      ...apiCategory,
      color: apiCategory.color || undefined,
      // Add computed properties if needed
      productCount: 0,
      children: [],
      level: 0
    };
  }

  /**
   * Get a specific category by ID
   */
  async getCategoryById(categoryId: string, params?: CategoryQueryParams): Promise<CategoryApiResponse> {
    try {
      console.log('📂 Fetching category by ID:', categoryId);
      
      if (USE_MOCK_DATA) {
        const mockData = this.getMockCategories();
        const category = mockData.categories.find(c => c.category_id === categoryId);
        if (!category) {
          throw new ApiError(`Category not found: ${categoryId}`, 1101, 'CATEGORY_NOT_FOUND');
        }
        return category;
      }

      const path = `${this.basePath}${params?.tenant_id}/store/${params?.store_id}/category/${categoryId}`;

      // Real API call
      const response = await apiClient.get<CategoryApiResponse>(path, {});
      return response.data;
      
    } catch (error) {
      const appError = this.handleError(error, `Failed to fetch category: ${categoryId}`);
      console.error('❌ Error fetching category:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryRequest, params?: { tenant_id?: string; store_id?: string }): Promise<CategoryApiResponse> {
    try {
      console.log('📂 Creating new category:', data);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Mock data mode - simulating category creation');
        // Simulate creation in mock mode
        const newCategory: CategoryApiResponse = {
          category_id: data.category_id || Date.now().toString(),
          name: data.name,
          description: data.description || '',
          parent_category_id: data.parent_category_id || null,
          sort_order: data.sort_order || 0,
          is_active: data.is_active !== false,
          icon_url: data.icon_url || null,
          image_url: data.image_url || null,
          color: data.color || null,
          display_on_main_screen: data.display_on_main_screen !== false,
          tags: data.tags || [],
          properties: data.properties || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          create_user_id: 'mock-user',
          update_user_id: null
        };
        return newCategory;
      }

      const path = `${this.basePath}${params?.tenant_id}/store/${params?.store_id}/category`;

      // Real API call - single category creation
      const response = await apiClient.post<CategoryApiResponse>(path, data, {
        headers: undefined,
      });
      
      console.log('✅ Successfully created category:', response.data);
      return response.data;
      
    } catch (error) {
      const appError = this.handleError(error, 'Failed to create category');
      console.error('❌ Error creating category:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Batch create categories
   */
  async addBatch(data: BatchCreateCategoriesRequest, params?: { tenant_id?: string; store_id?: string }): Promise<BatchOperationResponse> {
    try {
      console.log('📂 Batch creating categories:', data);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Mock data mode - simulating batch creation');
        return {
          success: true,
          created_count: data.categories.length,
          failed_count: 0,
          errors: []
        };
      }

      const path = `${this.basePath}${params?.tenant_id}/store/${params?.store_id}/category/bulk`;

      // Real API call to addBatch endpoint
      const response = await apiClient.post<BatchOperationResponse>(path, data, {
        headers: undefined
      });
      
      console.log('✅ Successfully batch created categories:', response.data);
      return response.data;
      
    } catch (error) {
      const appError = this.handleError(error, 'Failed to batch create categories');
      console.error('❌ Error batch creating categories:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(categoryId: string, data: Partial<CreateCategoryRequest>, params?: { tenant_id?: string; store_id?: string }): Promise<CategoryApiResponse> {
    try {
      console.log('📂 Updating category:', categoryId, data);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Mock data mode - simulating category update');
        const existingCategory = await this.getCategoryById(categoryId);
        return {
          ...existingCategory,
          ...data,
          updated_at: new Date().toISOString(),
          update_user_id: 'mock-user'
        } as CategoryApiResponse;
      }

      const path = `${this.basePath}${params?.tenant_id}/store/${params?.store_id}/category/${categoryId}`;

      // Real API call
      const response = await apiClient.put<CategoryApiResponse>(path, data, {
        headers: params?.tenant_id ? { 'X-Tenant-Id': params.tenant_id } : undefined
      });
      
      console.log('✅ Successfully updated category:', response.data);
      return response.data;
      
    } catch (error) {
      const appError = this.handleError(error, `Failed to update category: ${categoryId}`);
      console.error('❌ Error updating category:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string, params?: { tenant_id?: string; store_id?: string }): Promise<void> {
    try {
      console.log('📂 Deleting category:', categoryId);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Mock data mode - simulating category deletion');
        return;
      }

      const path = `/v1/tenant/${params?.tenant_id}/store/${params?.store_id}/category/${categoryId}`;

      // Real API call
      await apiClient.delete(path);
      
      console.log('✅ Successfully deleted category:', categoryId);
      
    } catch (error) {
      const appError = this.handleError(error, `Failed to delete category: ${categoryId}`);
      console.error('❌ Error deleting category:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Get category hierarchy (parent-child relationships)
   */
  async getCategoryHierarchy(params?: CategoryQueryParams): Promise<EnhancedCategory[]> {
    try {
      console.log('📂 Fetching category hierarchy');
      
      const response = await this.getCategories(params);
      
      // Build hierarchy from flat list
      const categories = response; // response is already EnhancedCategory[]
      const rootCategories: EnhancedCategory[] = [];
      
      categories.forEach((category: EnhancedCategory) => {
        if (!category.parent_category_id) {
          rootCategories.push(category);
        }
      });
      
      return rootCategories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      
    } catch (error) {
      const appError = this.handleError(error, 'Failed to fetch category hierarchy');
      console.error('❌ Error fetching category hierarchy:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Upload category icon
   */
  async uploadCategoryIcon(categoryId: string, file: File, params?: { tenant_id?: string; store_id?: string }): Promise<{ icon_url: string }> {
    try {
      console.log('📂 Uploading category icon for:', categoryId);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Mock data mode - simulating icon upload');
        return { icon_url: `https://mock-cdn.example.com/icons/${categoryId}_${file.name}` };
      }

      const formData = new FormData();
      formData.append('icon', file);
      
      const response = await fetch(`${API_BASE_URL}${this.basePath}/${categoryId}/icon`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(params?.tenant_id && { 'X-Tenant-Id': params.tenant_id })
        }
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Successfully uploaded category icon:', result);
      return result;
      
    } catch (error) {
      const appError = this.handleError(error, `Failed to upload icon for category: ${categoryId}`);
      console.error('❌ Error uploading category icon:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Upload category image
   */
  async uploadCategoryImage(categoryId: string, file: File, params?: { tenant_id?: string; store_id?: string }): Promise<{ image_url: string }> {
    try {
      console.log('📂 Uploading category image for:', categoryId);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Mock data mode - simulating image upload');
        return { image_url: `https://mock-cdn.example.com/images/${categoryId}_${file.name}` };
      }

      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_BASE_URL}${this.basePath}/${categoryId}/image`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(params?.tenant_id && { 'X-Tenant-Id': params.tenant_id })
        }
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Successfully uploaded category image:', result);
      return result;
      
    } catch (error) {
      const appError = this.handleError(error, `Failed to upload image for category: ${categoryId}`);
      console.error('❌ Error uploading category image:', appError);
      
      // Display error to user
      useErrorHandler.getState().handleError(appError);
      
      // Re-throw so calling code can handle if needed
      throw appError;
    }
  }

  /**
   * Get mock categories data (for development/fallback)
   */
  private getMockCategories(): CategoriesApiResponse {
    const mockCategories: CategoryApiResponse[] = [
      {
        category_id: '1',
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        parent_category_id: null,
        sort_order: 1,
        is_active: true,
        display_on_main_screen: true,
        tags: ['electronics', 'technology', 'gadgets'],
        icon_url: 'https://example.com/icons/electronics.svg',
        image_url: null,
        color: '#3B82F6',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T14:30:00Z',
        create_user_id: 'user-123',
        update_user_id: null,
        properties: {}
      },
      {
        category_id: '2',
        name: 'Clothing',
        description: 'Apparel and fashion items',
        parent_category_id: null,
        sort_order: 2,
        is_active: true,
        display_on_main_screen: true,
        tags: ['clothing', 'fashion', 'apparel'],
        icon_url: 'https://example.com/icons/clothing.svg',
        image_url: null,
        color: '#10B981',
        created_at: '2024-01-08T09:00:00Z',
        updated_at: '2024-01-12T16:45:00Z',
        create_user_id: 'user-123',
        update_user_id: null,
        properties: {}
      },
      {
        category_id: '3',
        name: 'Food & Beverages',
        description: 'Food items and drinks',
        parent_category_id: null,
        sort_order: 3,
        is_active: true,
        display_on_main_screen: true,
        tags: ['food', 'beverages', 'drinks'],
        icon_url: 'https://example.com/icons/food.svg',
        image_url: null,
        color: '#F59E0B',
        created_at: '2024-01-05T11:30:00Z',
        updated_at: '2024-01-14T12:15:00Z',
        create_user_id: 'user-123',
        update_user_id: null,
        properties: {}
      },
      {
        category_id: '4',
        name: 'Men\'s Clothing',
        description: 'Clothing items for men',
        parent_category_id: '2',
        sort_order: 1,
        is_active: true,
        display_on_main_screen: false,
        tags: ['mens', 'clothing', 'fashion'],
        icon_url: null,
        image_url: null,
        color: '#06B6D4',
        created_at: '2024-01-08T10:00:00Z',
        updated_at: '2024-01-12T17:00:00Z',
        create_user_id: 'user-123',
        update_user_id: null,
        properties: {}
      },
      {
        category_id: '5',
        name: 'Books',
        description: 'Books and educational materials',
        parent_category_id: null,
        sort_order: 4,
        is_active: false,
        display_on_main_screen: false,
        tags: ['books', 'education', 'reading'],
        icon_url: 'https://example.com/icons/books.svg',
        image_url: null,
        color: '#8B5CF6',
        created_at: '2024-01-03T15:20:00Z',
        updated_at: '2024-01-10T08:30:00Z',
        create_user_id: 'user-123',
        update_user_id: null,
        properties: {}
      }
    ];

    return {
      categories: mockCategories,
      total_count: mockCategories.length
    };
  }

  /**
   * Handle API errors consistently and display to user
   */
  private handleError(error: any, userMessage?: string): ApiError {
    const appError = this.createApiError(error, userMessage);
    
    // Log the error details
    console.error('🚨 Category API Error:', {
      message: appError.message,
      code: appError.code,
      slug: appError.slug,
      details: appError.details
    });
    
    return appError;
  }

  /**
   * Create structured ApiError from various error types
   */
  private createApiError(error: any, userMessage?: string): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    
    // Handle HTTP response errors that might have the new error format
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Check if it has the new structured format
      if (errorData.code && errorData.slug && errorData.message) {
        return new ApiError(
          userMessage || errorData.message,
          errorData.code,
          errorData.slug,
          errorData.details
        );
      }
    }
    
    // Fallback error handling
    return new ApiError(
      userMessage || (error instanceof Error ? error.message : 'Category operation failed'),
      1100,
      'CATEGORY_ERROR',
      { originalError: error?.message || 'Unknown error' }
    );
  }
}

// Export singleton instance
export const categoryApiService = new CategoryApiService();

// Export for convenience
export default categoryApiService;

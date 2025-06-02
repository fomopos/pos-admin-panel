// Category API service for real backend integration
import { apiClient, ApiError, USE_MOCK_DATA, API_BASE_URL } from '../api';

// Types for Category API integration (matching backend schema)
import type { EnhancedCategory } from '../../types/category';

export interface CategoryApiResponse {
  category_id: string;
  name: string;
  description: string;
  parent_category_id?: string;
  sort_order: number;
  is_active: boolean;
  icon_url?: string;
  image_url?: string;
  display_on_main_screen: boolean;
  tags: string[];
  properties?: Record<string, any>;
  created_at: string;
  updated_at: string;
  create_user_id: string;
  update_user_id?: string;
}

// Request payload for creating categories
export interface CreateCategoryRequest {
  name: string;
  description: string;
  parent_category_id?: string;
  sort_order?: number;
  is_active?: boolean;
  icon_url?: string;
  image_url?: string;
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
  private readonly basePath = '/categories';

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

      // Real API call
      const response = await apiClient.get<CategoriesApiResponse>(this.basePath, params);
      
      console.log('✅ Successfully fetched categories from API:', response.data);
      return response.data.categories.map(this.mapToEnhancedCategory);
      
    } catch (error) {
      console.error('❌ Error fetching categories from API:', error);
      
      // Fallback to mock data on API failure
      console.log('📝 Falling back to mock categories data');
      const mockData = this.getMockCategories();
      return mockData.categories.map(this.mapToEnhancedCategory);
    }
  }

  /**
   * Map CategoryApiResponse to EnhancedCategory
   */
  private mapToEnhancedCategory(apiCategory: CategoryApiResponse): EnhancedCategory {
    return {
      ...apiCategory,
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
          throw new ApiError(`Category not found: ${categoryId}`, 'CATEGORY_NOT_FOUND');
        }
        return category;
      }

      // Real API call
      const response = await apiClient.get<CategoryApiResponse>(`${this.basePath}/${categoryId}`, params);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error fetching category:', error);
      throw new ApiError(`Category not found: ${categoryId}`, 'CATEGORY_NOT_FOUND');
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
          category_id: Date.now().toString(),
          name: data.name,
          description: data.description,
          parent_category_id: data.parent_category_id,
          sort_order: data.sort_order || 0,
          is_active: data.is_active !== false,
          icon_url: data.icon_url,
          image_url: data.image_url,
          display_on_main_screen: data.display_on_main_screen !== false,
          tags: data.tags || [],
          properties: data.properties,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          create_user_id: 'mock-user',
          update_user_id: 'mock-user'
        };
        return newCategory;
      }

      // Real API call
      const response = await apiClient.post<CategoryApiResponse>(this.basePath, data, {
        headers: params?.tenant_id ? { 'X-Tenant-Id': params.tenant_id } : undefined
      });
      
      console.log('✅ Successfully created category:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error creating category:', error);
      throw this.handleError(error);
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

      // Real API call to addBatch endpoint
      const response = await apiClient.post<BatchOperationResponse>(`${this.basePath}/addBatch`, data, {
        headers: params?.tenant_id ? { 'X-Tenant-Id': params.tenant_id } : undefined
      });
      
      console.log('✅ Successfully batch created categories:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error batch creating categories:', error);
      throw this.handleError(error);
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

      // Real API call
      const response = await apiClient.put<CategoryApiResponse>(`${this.basePath}/${categoryId}`, data, {
        headers: params?.tenant_id ? { 'X-Tenant-Id': params.tenant_id } : undefined
      });
      
      console.log('✅ Successfully updated category:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error updating category:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string, _params?: { tenant_id?: string; store_id?: string }): Promise<void> {
    try {
      console.log('📂 Deleting category:', categoryId);
      
      if (USE_MOCK_DATA) {
        console.log('📝 Mock data mode - simulating category deletion');
        return;
      }

      // Real API call
      await apiClient.delete(`${this.basePath}/${categoryId}`);
      
      console.log('✅ Successfully deleted category:', categoryId);
      
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get category hierarchy (parent-child relationships)
   */
  async getCategoryHierarchy(params?: CategoryQueryParams): Promise<CategoryApiResponse[]> {
    try {
      console.log('📂 Fetching category hierarchy');
      
      const response = await this.getCategories(params);
      
      // Build hierarchy from flat list
      const categories = response; // response is already EnhancedCategory[]
      const rootCategories: CategoryApiResponse[] = [];
      
      categories.forEach((category: EnhancedCategory) => {
        if (!category.parent_category_id) {
          rootCategories.push(category);
        }
      });
      
      return rootCategories.sort((a, b) => a.sort_order - b.sort_order);
      
    } catch (error) {
      console.error('❌ Error fetching category hierarchy:', error);
      throw this.handleError(error);
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
      console.error('❌ Error uploading category icon:', error);
      throw this.handleError(error);
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
      console.error('❌ Error uploading category image:', error);
      throw this.handleError(error);
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
        sort_order: 1,
        is_active: true,
        display_on_main_screen: true,
        tags: ['electronics', 'technology', 'gadgets'],
        icon_url: 'https://example.com/icons/electronics.svg',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T14:30:00Z',
        create_user_id: 'user-123',
        properties: { color: '#3B82F6' }
      },
      {
        category_id: '2',
        name: 'Clothing',
        description: 'Apparel and fashion items',
        sort_order: 2,
        is_active: true,
        display_on_main_screen: true,
        tags: ['clothing', 'fashion', 'apparel'],
        icon_url: 'https://example.com/icons/clothing.svg',
        created_at: '2024-01-08T09:00:00Z',
        updated_at: '2024-01-12T16:45:00Z',
        create_user_id: 'user-123',
        properties: { color: '#10B981' }
      },
      {
        category_id: '3',
        name: 'Food & Beverages',
        description: 'Food items and drinks',
        sort_order: 3,
        is_active: true,
        display_on_main_screen: true,
        tags: ['food', 'beverages', 'drinks'],
        icon_url: 'https://example.com/icons/food.svg',
        created_at: '2024-01-05T11:30:00Z',
        updated_at: '2024-01-14T12:15:00Z',
        create_user_id: 'user-123',
        properties: { color: '#F59E0B' }
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
        created_at: '2024-01-08T10:00:00Z',
        updated_at: '2024-01-12T17:00:00Z',
        create_user_id: 'user-123',
        properties: { color: '#06B6D4' }
      },
      {
        category_id: '5',
        name: 'Books',
        description: 'Books and educational materials',
        sort_order: 4,
        is_active: false,
        display_on_main_screen: false,
        tags: ['books', 'education', 'reading'],
        icon_url: 'https://example.com/icons/books.svg',
        created_at: '2024-01-03T15:20:00Z',
        updated_at: '2024-01-10T08:30:00Z',
        create_user_id: 'user-123',
        properties: { color: '#8B5CF6' }
      }
    ];

    return {
      categories: mockCategories,
      total_count: mockCategories.length
    };
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    
    return new ApiError(
      error instanceof Error ? error.message : 'Category operation failed',
      'CATEGORY_ERROR',
      { originalError: error }
    );
  }
}

// Export singleton instance
export const categoryApiService = new CategoryApiService();

// Export for convenience
export default categoryApiService;

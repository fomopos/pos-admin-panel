// Hook for managing category cache and lookups
import { useState, useEffect, useCallback } from 'react';
import { categoryCacheService } from '../services/category/categoryCache';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import type { EnhancedCategory } from '../types/category';

interface UseCategoriesOptions {
  tenantId?: string;
  storeId?: string;
  autoLoad?: boolean;
}

interface UseCategoriesReturn {
  // Category options for dropdowns
  categoryOptions: DropdownSearchOption[];
  
  // Raw category data
  categories: EnhancedCategory[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Functions
  getCategoryName: (categoryId: string) => Promise<string>;
  getCategoryNames: (categoryIds: string[]) => Promise<Record<string, string>>;
  refreshCategories: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Custom hook for managing categories with caching
 */
export const useCategories = (options: UseCategoriesOptions = {}): UseCategoriesReturn => {
  const { tenantId, storeId, autoLoad = true } = options;
  
  const [categoryOptions, setCategoryOptions] = useState<DropdownSearchOption[]>([]);
  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  const loadCategories = useCallback(async () => {
    if (!tenantId || !storeId) {
      setCategoryOptions([]);
      setCategories([]);
      return;
    }

    // Check if we already have cached data before making API call
    try {
      const cachedOptions = await categoryCacheService.getCategoryOptions(tenantId, storeId);
      const cachedCategories = await categoryCacheService.getAllCategories(tenantId, storeId);
      
      // If we got data without loading, don't show loading state
      const hasExistingData = cachedOptions.length > 0;
      if (!hasExistingData) {
        setIsLoading(true);
      }
      
      setError(null);
      setCategoryOptions(cachedOptions);
      setCategories(cachedCategories);
      
      if (!hasExistingData) {
        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      setError(errorMessage);
      console.error('Failed to load categories:', err);
      setIsLoading(false);
    }
  }, [tenantId, storeId]);

  // Auto-load categories when tenant/store changes
  useEffect(() => {
    if (autoLoad && tenantId && storeId) {
      loadCategories();
    }
  }, [autoLoad, tenantId, storeId, loadCategories]);

  // Listen to cache changes to automatically refresh React state
  useEffect(() => {
    const unsubscribe = categoryCacheService.subscribe((event) => {
      // Only refresh for create, update, delete operations - not for load operations
      if (event.type !== 'load' && tenantId && storeId && event.tenantId === tenantId && event.storeId === storeId) {
        console.log(`[useCategories] Cache event ${event.type} for category ${event.categoryId}, refreshing React state`);
        
        // For individual operations, we could be smarter and just update the specific item
        // But for simplicity, reload all categories from cache (no API call needed)
        (async () => {
          try {
            const cachedOptions = await categoryCacheService.getCategoryOptions(tenantId, storeId);
            const cachedCategories = await categoryCacheService.getAllCategories(tenantId, storeId);
            
            setCategoryOptions(cachedOptions);
            setCategories(cachedCategories);
          } catch (err) {
            console.error('Failed to refresh categories from cache:', err);
          }
        })();
      }
    });

    return unsubscribe;
  }, [tenantId, storeId]);

  // Get single category name
  const getCategoryName = useCallback(async (categoryId: string): Promise<string> => {
    if (!tenantId || !storeId) return categoryId;

    try {
      return await categoryCacheService.getCategoryName(tenantId, storeId, categoryId);
    } catch (err) {
      console.error('Failed to get category name:', err);
      return categoryId; // Fallback to ID
    }
  }, [tenantId, storeId]);

  // Get multiple category names
  const getCategoryNames = useCallback(async (categoryIds: string[]): Promise<Record<string, string>> => {
    if (!tenantId || !storeId) {
      // Return IDs as names when tenant/store not available
      return categoryIds.reduce((acc, id) => ({ ...acc, [id]: id }), {});
    }

    try {
      return await categoryCacheService.getCategoryNames(tenantId, storeId, categoryIds);
    } catch (err) {
      console.error('Failed to get category names:', err);
      // Fallback: return IDs as names
      return categoryIds.reduce((acc, id) => ({ ...acc, [id]: id }), {});
    }
  }, [tenantId, storeId]);

  // Refresh categories (bypass cache)
  const refreshCategories = useCallback(async () => {
    if (!tenantId || !storeId) return;

    // Clear cache for this store
    categoryCacheService.invalidateStore(tenantId, storeId);
    
    // Reload categories
    await loadCategories();
  }, [tenantId, storeId, loadCategories]);

  // Clear all cache
  const clearCache = useCallback(() => {
    categoryCacheService.clearAll();
    setCategoryOptions([]);
    setCategories([]);
  }, []);

  return {
    categoryOptions,
    categories,
    isLoading,
    error,
    getCategoryName,
    getCategoryNames,
    refreshCategories,
    clearCache
  };
};

export default useCategories;

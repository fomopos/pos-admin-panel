// Category Cache Service for efficient category name lookups
import { categoryApiService } from './categoryApiService';
import type { EnhancedCategory } from '../../types/category';

interface CategoryCacheItem {
  category: EnhancedCategory;
  timestamp: number;
}

interface CategoryCache {
  [key: string]: CategoryCacheItem; // key format: `${tenantId}:${storeId}:${categoryId}`
}

type CacheChangeType = 'create' | 'update' | 'delete' | 'load';

interface CacheChangeEvent {
  type: CacheChangeType;
  tenantId: string;
  storeId: string;
  categoryId?: string;
}

class CategoryCacheService {
  private cache: CategoryCache = {};
  private fullCacheKeys = new Set<string>(); // track which tenant:store combinations have full cache
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes — reduced from 5 to lower staleness risk
  private listeners = new Set<(event: CacheChangeEvent) => void>(); // Cache change listeners

  /**
   * Subscribe to cache changes
   */
  subscribe(listener: (event: CacheChangeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of cache changes
   */
  private notifyListeners(event: CacheChangeEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  /**
   * Generate cache key for a category
   */
  private getCategoryKey(tenantId: string, storeId: string, categoryId: string): string {
    return `${tenantId}:${storeId}:${categoryId}`;
  }

  /**
   * Generate cache key for full category list
   */
  private getFullCacheKey(tenantId: string, storeId: string): string {
    return `${tenantId}:${storeId}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(item: CategoryCacheItem): boolean {
    return Date.now() - item.timestamp < this.CACHE_DURATION;
  }

  /**
   * Get category name by ID from cache or API
   */
  async getCategoryName(tenantId: string, storeId: string, categoryId: string): Promise<string> {
    if (!categoryId) return '';

    const key = this.getCategoryKey(tenantId, storeId, categoryId);
    const cached = this.cache[key];

    // Return from cache if valid
    if (cached && this.isValid(cached)) {
      return cached.category.name;
    }

    try {
      // Fetch from API if not in cache or expired
      const category = await categoryApiService.getCategoryById(categoryId, {
        tenant_id: tenantId,
        store_id: storeId
      });

      // Cache the result
      this.cache[key] = {
        category: {
          ...category,
          color: category.color || undefined,
          productCount: 0,
          children: [],
          level: 0
        },
        timestamp: Date.now()
      };

      return category.name;
    } catch (error) {
      console.error('Failed to fetch category:', categoryId, error);
      return categoryId; // Fallback to ID if fetch fails
    }
  }

  /**
   * Get multiple category names by IDs (bulk operation)
   */
  async getCategoryNames(tenantId: string, storeId: string, categoryIds: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const uncachedIds: string[] = [];

    // Check cache for each category
    for (const categoryId of categoryIds) {
      if (!categoryId) continue;

      const key = this.getCategoryKey(tenantId, storeId, categoryId);
      const cached = this.cache[key];

      if (cached && this.isValid(cached)) {
        result[categoryId] = cached.category.name;
      } else {
        uncachedIds.push(categoryId);
      }
    }

    // Fetch uncached categories from API
    if (uncachedIds.length > 0) {
      try {
        // If we need many categories, it's more efficient to fetch all categories
        // and cache them rather than making individual API calls
        if (uncachedIds.length > 3) {
          await this.preloadAllCategories(tenantId, storeId);
          
          // Now get the names from cache
          for (const categoryId of uncachedIds) {
            const key = this.getCategoryKey(tenantId, storeId, categoryId);
            const cached = this.cache[key];
            if (cached) {
              result[categoryId] = cached.category.name;
            } else {
              result[categoryId] = categoryId; // Fallback
            }
          }
        } else {
          // For few categories, fetch individually
          const promises = uncachedIds.map(async (categoryId) => {
            try {
              const name = await this.getCategoryName(tenantId, storeId, categoryId);
              result[categoryId] = name;
            } catch (error) {
              console.error('Failed to fetch category:', categoryId, error);
              result[categoryId] = categoryId; // Fallback
            }
          });
          
          await Promise.allSettled(promises);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback: use IDs as names
        for (const categoryId of uncachedIds) {
          result[categoryId] = categoryId;
        }
      }
    }

    return result;
  }

  /**
   * Preload all categories for a store into cache
   */
  async preloadAllCategories(tenantId: string, storeId: string): Promise<EnhancedCategory[]> {
    const fullCacheKey = this.getFullCacheKey(tenantId, storeId);
    
    try {
      const categories = await categoryApiService.getCategories({
        tenant_id: tenantId,
        store_id: storeId
      });

      const timestamp = Date.now();

      // Cache all categories
      for (const category of categories) {
        const key = this.getCategoryKey(tenantId, storeId, category.category_id);
        this.cache[key] = {
          category,
          timestamp
        };
      }

      // Mark this tenant:store combination as fully cached
      this.fullCacheKeys.add(fullCacheKey);

      return categories;
    } catch (error) {
      console.error('Failed to preload categories:', error);
      throw error;
    }
  }

  /**
   * Get category options for dropdown (cached)
   */
  async getCategoryOptions(tenantId: string, storeId: string): Promise<Array<{ id: string; label: string; description?: string; data?: EnhancedCategory }>> {
    const fullCacheKey = this.getFullCacheKey(tenantId, storeId);
    
    try {
      // Check if we already have a full cache that's still valid
      if (this.fullCacheKeys.has(fullCacheKey)) {
        // Get a sample category to check if the cache is still valid
        const cachedEntries = Object.keys(this.cache)
          .filter(key => key.startsWith(`${tenantId}:${storeId}:`))
          .map(key => this.cache[key])
          .filter(item => item && this.isValid(item));
        
        // If we have valid cached entries, use them
        if (cachedEntries.length > 0) {
          console.log('✅ Using cached categories for dropdown options');
          return cachedEntries
            .map(item => item.category)
            .filter(category => category.is_active !== false)
            .map(category => ({
              id: category.category_id,
              label: category.name,
              description: category.description || undefined,
              data: category
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
        } else {
          // Cache has expired, remove the full cache marker
          this.fullCacheKeys.delete(fullCacheKey);
        }
      }
      
      // Cache is empty or expired, fetch from API
      console.log('📂 Fetching categories from API for dropdown options');
      const categories = await this.preloadAllCategories(tenantId, storeId);
      
      return categories
        .filter(category => category.is_active !== false)
        .map(category => ({
          id: category.category_id,
          label: category.name,
          description: category.description || undefined,
          data: category
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
      console.error('Failed to get category options:', error);
      return [];
    }
  }

  /**
   * Get all categories for a store (with caching)
   */
  async getAllCategories(tenantId: string, storeId: string): Promise<EnhancedCategory[]> {
    console.log(`[CategoryCache] Getting all categories for ${tenantId}:${storeId}`);
    
    // Check if we have valid cached data
    const fullCacheKey = this.getFullCacheKey(tenantId, storeId);
    const hasFullCache = this.fullCacheKeys.has(fullCacheKey);
    
    if (hasFullCache) {
      // Check if any cached categories are expired
      const prefix = `${tenantId}:${storeId}:`;
      const now = Date.now();
      const cachedCategories = Object.entries(this.cache)
        .filter(([key]) => key.startsWith(prefix))
        .map(([_, item]) => ({ item, expired: now - item.timestamp >= this.CACHE_DURATION }));
      
      if (cachedCategories.length > 0 && cachedCategories.every(({ expired }) => !expired)) {
        console.log(`[CategoryCache] Cache hit - returning ${cachedCategories.length} cached categories`);
        return cachedCategories.map(({ item }) => item.category);
      }
    }

    // Need to fetch from API
    await this.preloadAllCategories(tenantId, storeId);
    
    // Return the fresh data
    const prefix = `${tenantId}:${storeId}:`;
    const categories = Object.entries(this.cache)
      .filter(([key]) => key.startsWith(prefix))
      .map(([_, item]) => item.category);
      
    console.log(`[CategoryCache] Returning ${categories.length} categories from fresh cache`);
    return categories;
  }

  /**
   * Refresh a single category from the API
   */
  async refreshCategory(tenantId: string, storeId: string, categoryId: string): Promise<EnhancedCategory | null> {
    try {
      console.log(`[CategoryCache] Refreshing category ${categoryId} from API`);
      
      const apiCategory = await categoryApiService.getCategoryById(categoryId, {
        tenant_id: tenantId,
        store_id: storeId
      });
      
      if (apiCategory) {
        const enhancedCategory: EnhancedCategory = {
          ...apiCategory,
          color: apiCategory.color || undefined,
          productCount: 0,
          children: [],
          level: 0
        };
        
        // Update cache with fresh data
        this.addOrUpdateCategory(tenantId, storeId, enhancedCategory);
        return enhancedCategory;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to refresh category ${categoryId}:`, error);
      return null;
    }
  }

  /**
   * Add or update a category in cache
   */
  addOrUpdateCategory(tenantId: string, storeId: string, category: EnhancedCategory, isNew: boolean = false): void {
    const key = this.getCategoryKey(tenantId, storeId, category.category_id);
    const now = Date.now();
    
    this.cache[key] = {
      category,
      timestamp: now
    };
    
    console.log(`[CategoryCache] ${isNew ? 'Added' : 'Updated'} category ${category.category_id} in cache`);
    this.notifyListeners({
      type: isNew ? 'create' : 'update',
      tenantId,
      storeId,
      categoryId: category.category_id
    });
  }

  /**
   * Remove a category from cache
   */
  removeCategory(tenantId: string, storeId: string, categoryId: string): void {
    const key = this.getCategoryKey(tenantId, storeId, categoryId);
    delete this.cache[key];
    
    console.log(`[CategoryCache] Removed category ${categoryId} from cache`);
    this.notifyListeners({
      type: 'delete',
      tenantId,
      storeId,
      categoryId
    });
  }

  /**
   * Invalidate cache for a specific category
   */
  invalidateCategory(tenantId: string, storeId: string, categoryId: string): void {
    const key = this.getCategoryKey(tenantId, storeId, categoryId);
    delete this.cache[key];
  }

  /**
   * Invalidate all categories for a store
   */
  invalidateStore(tenantId: string, storeId: string): void {
    const prefix = `${tenantId}:${storeId}:`;
    const fullCacheKey = this.getFullCacheKey(tenantId, storeId);

    // Remove individual category caches
    Object.keys(this.cache).forEach(key => {
      if (key.startsWith(prefix)) {
        delete this.cache[key];
      }
    });

    // Remove full cache marker
    this.fullCacheKeys.delete(fullCacheKey);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache = {};
    this.fullCacheKeys.clear();
  }

  /**
   * Get cache statistics (for debugging)
   */
  getCacheStats(): { totalEntries: number; validEntries: number; expiredEntries: number } {
    const entries = Object.values(this.cache);
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(item => now - item.timestamp < this.CACHE_DURATION).length,
      expiredEntries: entries.filter(item => now - item.timestamp >= this.CACHE_DURATION).length
    };
  }
}

// Export singleton instance
export const categoryCacheService = new CategoryCacheService();
export default categoryCacheService;

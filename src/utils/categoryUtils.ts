// Category utility functions
import type { EnhancedCategory, CategoryNode } from '../types/category';

/**
 * Utility class for category-related operations
 */
export class CategoryUtils {
  /**
   * Get the full path of a category including its parent hierarchy
   * @param category - The category to get path for
   * @param allCategories - All available categories
   * @returns String representing the category path
   */
  static getCategoryPath(category: CategoryNode | EnhancedCategory, allCategories: EnhancedCategory[]): string {
    if (!category) return '';
    
    const path: string[] = [];
    let currentCategory: EnhancedCategory | undefined = category as EnhancedCategory;
    
    // Build path by traversing up the hierarchy
    while (currentCategory) {
      path.unshift(currentCategory.name);
      
      if (currentCategory.parent_category_id) {
        currentCategory = allCategories.find(c => c.category_id === currentCategory!.parent_category_id);
      } else {
        break;
      }
    }
    
    return path.join(' > ');
  }

  /**
   * Build a hierarchical tree structure from flat category list
   * @param categories - Flat list of categories
   * @returns Hierarchical tree structure
   */
  static buildCategoryTree(categories: EnhancedCategory[]): EnhancedCategory[] {
    const categoryMap = new Map<string, EnhancedCategory>();
    const rootCategories: EnhancedCategory[] = [];

    // Create a map for quick lookup and initialize children arrays
    categories.forEach(category => {
      categoryMap.set(category.category_id, { ...category, children: [] });
    });

    // Build the tree structure
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.category_id)!;
      
      if (category.parent_category_id) {
        const parent = categoryMap.get(category.parent_category_id);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(categoryWithChildren);
          categoryWithChildren.level = (parent.level || 0) + 1;
        }
      } else {
        categoryWithChildren.level = 0;
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories.sort((a, b) => a.sort_order - b.sort_order);
  }

  /**
   * Get all descendants of a category
   * @param categoryId - ID of the parent category
   * @param allCategories - All available categories
   * @returns Array of descendant categories
   */
  static getCategoryDescendants(categoryId: string, allCategories: EnhancedCategory[]): EnhancedCategory[] {
    const descendants: EnhancedCategory[] = [];
    const directChildren = allCategories.filter(c => c.parent_category_id === categoryId);
    
    directChildren.forEach(child => {
      descendants.push(child);
      // Recursively get children of children
      descendants.push(...this.getCategoryDescendants(child.category_id, allCategories));
    });
    
    return descendants;
  }

  /**
   * Get all ancestors of a category
   * @param categoryId - ID of the category
   * @param allCategories - All available categories
   * @returns Array of ancestor categories from root to immediate parent
   */
  static getCategoryAncestors(categoryId: string, allCategories: EnhancedCategory[]): EnhancedCategory[] {
    const ancestors: EnhancedCategory[] = [];
    let currentCategory = allCategories.find(c => c.category_id === categoryId);
    
    while (currentCategory?.parent_category_id) {
      const parent = allCategories.find(c => c.category_id === currentCategory!.parent_category_id);
      if (parent) {
        ancestors.unshift(parent); // Add to beginning to maintain order
        currentCategory = parent;
      } else {
        break;
      }
    }
    
    return ancestors;
  }

  /**
   * Check if a category is a descendant of another category
   * @param childId - ID of the potential child category
   * @param parentId - ID of the potential parent category
   * @param allCategories - All available categories
   * @returns True if childId is a descendant of parentId
   */
  static isCategoryDescendant(childId: string, parentId: string, allCategories: EnhancedCategory[]): boolean {
    const descendants = this.getCategoryDescendants(parentId, allCategories);
    return descendants.some(d => d.category_id === childId);
  }

  /**
   * Get the root category of a category hierarchy
   * @param categoryId - ID of the category
   * @param allCategories - All available categories
   * @returns The root category
   */
  static getRootCategory(categoryId: string, allCategories: EnhancedCategory[]): EnhancedCategory | null {
    let currentCategory = allCategories.find(c => c.category_id === categoryId);
    
    while (currentCategory?.parent_category_id) {
      const parent = allCategories.find(c => c.category_id === currentCategory!.parent_category_id);
      if (parent) {
        currentCategory = parent;
      } else {
        break;
      }
    }
    
    return currentCategory || null;
  }

  /**
   * Get category breadcrumb trail
   * @param categoryId - ID of the category
   * @param allCategories - All available categories
   * @returns Array of categories from root to target category
   */
  static getCategoryBreadcrumb(categoryId: string, allCategories: EnhancedCategory[]): EnhancedCategory[] {
    const breadcrumb: EnhancedCategory[] = [];
    const category = allCategories.find(c => c.category_id === categoryId);
    
    if (!category) return breadcrumb;
    
    const ancestors = this.getCategoryAncestors(categoryId, allCategories);
    breadcrumb.push(...ancestors, category);
    
    return breadcrumb;
  }

  /**
   * Filter categories by search term
   * @param categories - Categories to search through
   * @param searchTerm - Search term
   * @returns Filtered categories
   */
  static searchCategories(categories: EnhancedCategory[], searchTerm: string): EnhancedCategory[] {
    if (!searchTerm.trim()) return categories;
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    return categories.filter(category => 
      category.name.toLowerCase().includes(normalizedSearch) ||
      category.description.toLowerCase().includes(normalizedSearch) ||
      category.tags.some(tag => tag.toLowerCase().includes(normalizedSearch))
    );
  }

  /**
   * Get categories by level
   * @param categories - All categories
   * @param level - Level to filter by (0 = root level)
   * @returns Categories at the specified level
   */
  static getCategoriesByLevel(categories: EnhancedCategory[], level: number): EnhancedCategory[] {
    return categories.filter(category => (category.level || 0) === level);
  }

  /**
   * Count total products in a category including subcategories
   * @param categoryId - ID of the category
   * @param allCategories - All available categories
   * @returns Total product count including subcategories
   */
  static getTotalProductCount(categoryId: string, allCategories: EnhancedCategory[]): number {
    const category = allCategories.find(c => c.category_id === categoryId);
    if (!category) return 0;
    
    const descendants = this.getCategoryDescendants(categoryId, allCategories);
    return (category.productCount || 0) + descendants.reduce((sum, desc) => sum + (desc.productCount || 0), 0);
  }

  /**
   * Validate category hierarchy (prevent circular references)
   * @param categoryId - ID of the category being edited
   * @param parentId - ID of the proposed parent
   * @param allCategories - All available categories
   * @returns True if the hierarchy is valid
   */
  static validateCategoryHierarchy(categoryId: string, parentId: string, allCategories: EnhancedCategory[]): boolean {
    if (categoryId === parentId) return false; // Can't be parent of itself
    
    // Check if proposed parent is a descendant of the category
    return !this.isCategoryDescendant(parentId, categoryId, allCategories);
  }
}

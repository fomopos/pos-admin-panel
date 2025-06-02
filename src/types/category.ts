// Enhanced Category interfaces for the POS Admin Panel
// Aligns with API specification and modern category management needs

export interface EnhancedCategory {
  // Core identification
  category_id: string;
  name: string;
  description: string;
  
  // Hierarchy support
  parent_category_id?: string;
  sort_order: number;
  
  // Status and visibility
  is_active: boolean;
  display_on_main_screen: boolean;
  
  // Media assets
  icon_url?: string;
  image_url?: string;
  
  // Categorization and search
  tags: string[];
  
  // Extensible properties
  properties?: {
    color?: string;
    theme?: string;
    tax_category?: string;
    seasonal?: boolean;
    featured?: boolean;
    [key: string]: any;
  };
  
  // Metadata
  created_at: string;
  updated_at: string;
  create_user_id: string;
  update_user_id?: string;
  
  // UI helpers (computed)
  productCount?: number;
  children?: EnhancedCategory[];
  level?: number;
}

// Form data interface for creating/editing categories
export interface CategoryFormData {
  name: string;
  description: string;
  parent_category_id?: string;
  sort_order?: number;
  is_active: boolean;
  display_on_main_screen: boolean;
  icon_url?: string;
  image_url?: string;
  tags: string[];
  properties?: {
    color?: string;
    theme?: string;
    tax_category?: string;
    seasonal?: boolean;
    featured?: boolean;
    [key: string]: any;
  };
}

// Template interface for quick category creation
export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
  defaultTags: string[];
  defaultProperties?: Record<string, any>;
  properties?: Record<string, any>;
}

// Category hierarchy node for tree display
export interface CategoryNode extends EnhancedCategory {
  children: CategoryNode[];
  depth: number;
  hasChildren: boolean;
  isExpanded?: boolean;
}

// Category statistics
export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  rootCategories: number;
  avgProductsPerCategory: number;
  categoriesWithProducts: number;
  categoriesWithoutProducts: number;
}

// Validation rules for categories
export interface CategoryValidationRules {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern?: RegExp;
  };
  description: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  tags: {
    maxCount: number;
    maxTagLength: number;
  };
  sort_order: {
    min: number;
    max: number;
  };
}

// Default validation rules
export const DEFAULT_CATEGORY_VALIDATION: CategoryValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-&'.()]+$/
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 500
  },
  tags: {
    maxCount: 10,
    maxTagLength: 30
  },
  sort_order: {
    min: 0,
    max: 9999
  }
};

// Category filters for listing
export interface CategoryFilters {
  search?: string;
  is_active?: boolean;
  parent_category_id?: string;
  has_products?: boolean;
  display_on_main_screen?: boolean;
  tags?: string[];
  sort_by?: 'name' | 'sort_order' | 'created_at' | 'updated_at' | 'product_count';
  sort_order?: 'asc' | 'desc';
}

// Predefined category templates for quick setup
export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Electronic devices, gadgets, and accessories',
    icon: '💻',
    color: '#3B82F6',
    tags: ['electronics', 'technology', 'gadgets', 'devices'],
    defaultTags: ['electronics', 'technology'],
    properties: { theme: 'tech', tax_category: 'electronics' },
    defaultProperties: { theme: 'tech', tax_category: 'electronics' }
  },
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'Apparel, fashion items, and accessories',
    icon: '👕',
    color: '#10B981',
    tags: ['clothing', 'fashion', 'apparel', 'accessories'],
    defaultTags: ['clothing', 'fashion'],
    properties: { theme: 'fashion', seasonal: true },
    defaultProperties: { theme: 'fashion', seasonal: true }
  },
  {
    id: 'food-beverages',
    name: 'Food & Beverages',
    description: 'Food items, drinks, and consumables',
    icon: '🍕',
    color: '#F59E0B',
    tags: ['food', 'beverages', 'drinks', 'consumables'],
    defaultTags: ['food', 'beverages'],
    properties: { theme: 'food', tax_category: 'food' },
    defaultProperties: { theme: 'food', tax_category: 'food' }
  },
  {
    id: 'books-media',
    name: 'Books & Media',
    description: 'Books, educational materials, and media content',
    icon: '📚',
    color: '#8B5CF6',
    tags: ['books', 'education', 'media', 'learning'],
    defaultTags: ['books', 'education'],
    properties: { theme: 'education', tax_category: 'books' },
    defaultProperties: { theme: 'education', tax_category: 'books' }
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    description: 'Sports equipment, fitness gear, and outdoor activities',
    icon: '⚽',
    color: '#EF4444',
    tags: ['sports', 'fitness', 'outdoor', 'equipment'],
    defaultTags: ['sports', 'fitness'],
    properties: { theme: 'sports', seasonal: true },
    defaultProperties: { theme: 'sports', seasonal: true }
  },
  {
    id: 'beauty-personal-care',
    name: 'Beauty & Personal Care',
    description: 'Cosmetics, skincare, and personal care products',
    icon: '💄',
    color: '#EC4899',
    tags: ['beauty', 'cosmetics', 'skincare', 'personal-care'],
    defaultTags: ['beauty', 'cosmetics'],
    properties: { theme: 'beauty', tax_category: 'cosmetics' },
    defaultProperties: { theme: 'beauty', tax_category: 'cosmetics' }
  },
  {
    id: 'home-garden',
    name: 'Home & Garden',
    description: 'Home improvement, furniture, and gardening supplies',
    icon: '🏠',
    color: '#06B6D4',
    tags: ['home', 'garden', 'furniture', 'improvement'],
    defaultTags: ['home', 'garden'],
    properties: { theme: 'home', seasonal: true },
    defaultProperties: { theme: 'home', seasonal: true }
  },
  {
    id: 'toys-games',
    name: 'Toys & Games',
    description: 'Toys, games, and entertainment products for all ages',
    icon: '🧸',
    color: '#84CC16',
    tags: ['toys', 'games', 'entertainment', 'children'],
    defaultTags: ['toys', 'games'],
    properties: { theme: 'toys', featured: true },
    defaultProperties: { theme: 'toys', featured: true }
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Car parts, accessories, and automotive supplies',
    icon: '🚗',
    color: '#6B7280',
    tags: ['automotive', 'cars', 'parts', 'accessories'],
    defaultTags: ['automotive', 'cars'],
    properties: { theme: 'automotive', tax_category: 'automotive' },
    defaultProperties: { theme: 'automotive', tax_category: 'automotive' }
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    description: 'Health products, supplements, and wellness items',
    icon: '🏥',
    color: '#059669',
    tags: ['health', 'wellness', 'supplements', 'medical'],
    defaultTags: ['health', 'wellness'],
    properties: { theme: 'health', tax_category: 'medical' },
    defaultProperties: { theme: 'health', tax_category: 'medical' }
  }
];

// Color palette for categories
export const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6B7280', // Gray
  '#059669', // Green
  '#DC2626', // Red
  '#7C3AED', // Purple
  '#DB2777', // Pink
  '#0891B2', // Sky
  '#65A30D', // Green
  '#EA580C', // Orange
  '#374151', // Gray
];

// Icon options for categories
export const CATEGORY_ICONS = [
  '💻', '📱', '⌚', '🎧', '📷', '🖥️', '⌨️', '🖱️', // Electronics
  '👕', '👔', '👗', '👠', '👜', '🧢', '🧥', '🥾', // Clothing
  '🍕', '🍔', '🍜', '🥗', '🍰', '☕', '🥤', '🍷', // Food & Drinks
  '📚', '📝', '🎵', '🎬', '🎮', '🎲', '🃏', '🧩', // Books & Media
  '⚽', '🏀', '🎾', '🏸', '🏓', '🥅', '🏋️', '🎯', // Sports
  '💄', '💅', '🧴', '🧽', '🪒', '👓', '💍', '⌚', // Beauty
  '🏠', '🛋️', '🪑', '🛏️', '🚿', '🔧', '🌱', '🌷', // Home & Garden
  '🧸', '🎮', '🎯', '🎨', '🎪', '🎭', '🎪', '🎠', // Toys & Games
  '🚗', '🚙', '🏍️', '🚲', '⛽', '🔧', '🛞', '🚘', // Automotive
  '💊', '🩺', '🌡️', '💉', '🧬', '🦷', '👁️', '🫀', // Health
];

// Utility functions for categories
export const CategoryUtils = {
  /**
   * Build category hierarchy from flat list
   */
  buildHierarchy(categories: EnhancedCategory[]): CategoryNode[] {
    const categoryMap = new Map<string, CategoryNode>();
    const rootNodes: CategoryNode[] = [];

    // First pass: create all nodes
    categories.forEach(category => {
      categoryMap.set(category.category_id, {
        ...category,
        children: [],
        depth: 0,
        hasChildren: false,
        isExpanded: false
      });
    });

    // Second pass: build hierarchy
    categories.forEach(category => {
      const node = categoryMap.get(category.category_id)!;
      
      if (category.parent_category_id) {
        const parent = categoryMap.get(category.parent_category_id);
        if (parent) {
          parent.children.push(node);
          parent.hasChildren = true;
          node.depth = parent.depth + 1;
        }
      } else {
        rootNodes.push(node);
      }
    });

    // Sort by sort_order
    const sortNodes = (nodes: CategoryNode[]) => {
      nodes.sort((a, b) => a.sort_order - b.sort_order);
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(rootNodes);
    return rootNodes;
  },

  /**
   * Flatten hierarchy back to list
   */
  flattenHierarchy(nodes: CategoryNode[]): EnhancedCategory[] {
    const result: EnhancedCategory[] = [];
    
    const traverse = (nodeList: CategoryNode[]) => {
      nodeList.forEach(node => {
        const { children, depth, hasChildren, isExpanded, ...category } = node;
        result.push(category);
        if (children.length > 0) {
          traverse(children);
        }
      });
    };
    
    traverse(nodes);
    return result;
  },

  /**
   * Get category path (breadcrumb)
   */
  getCategoryPath(categoryId: string, categories: EnhancedCategory[]): EnhancedCategory[] {
    const categoryMap = new Map(categories.map(c => [c.category_id, c]));
    const path: EnhancedCategory[] = [];
    
    let current = categoryMap.get(categoryId);
    while (current) {
      path.unshift(current);
      current = current.parent_category_id ? categoryMap.get(current.parent_category_id) : undefined;
    }
    
    return path;
  },

  /**
   * Filter categories by criteria
   */
  filterCategories(categories: EnhancedCategory[], filters: CategoryFilters): EnhancedCategory[] {
    return categories.filter(category => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = category.name.toLowerCase().includes(searchLower);
        const matchesDescription = category.description.toLowerCase().includes(searchLower);
        const matchesTags = category.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesName && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      // Status filter
      if (filters.is_active !== undefined && category.is_active !== filters.is_active) {
        return false;
      }

      // Parent filter
      if (filters.parent_category_id !== undefined) {
        if (filters.parent_category_id === '') {
          // Root categories only
          if (category.parent_category_id) return false;
        } else {
          if (category.parent_category_id !== filters.parent_category_id) return false;
        }
      }

      // Display filter
      if (filters.display_on_main_screen !== undefined && 
          category.display_on_main_screen !== filters.display_on_main_screen) {
        return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => category.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }
};

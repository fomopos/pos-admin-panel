// Category validation utilities
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
  parent_category_id?: string;
  sort_order?: number;
  is_active: boolean;
  icon_url?: string;
  image_url?: string;
  display_on_main_screen: boolean;
  tags: string[];
  properties?: Record<string, any>;
}

export class CategoryValidationRules {
  /**
   * Validate a specific field in the category form
   */
  static validateField(fieldName: string, value: any, _formData: CategoryFormData): ValidationResult {
    switch (fieldName) {
      case 'name':
        return this.validateName(value);
      case 'description':
        return this.validateDescription(value);
      case 'parent_category_id':
        return this.validateParentCategory(value);
      case 'sort_order':
        return this.validateSortOrder(value);
      case 'tags':
        return this.validateTags(value);
      default:
        return { isValid: true };
    }
  }

  /**
   * Validate category name
   */
  static validateName(name: string): ValidationResult {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Category name is required' };
    }

    if (name.trim().length < 2) {
      return { isValid: false, error: 'Category name must be at least 2 characters long' };
    }

    if (name.trim().length > 100) {
      return { isValid: false, error: 'Category name must be less than 100 characters' };
    }

    // Check for special characters (allow letters, numbers, spaces, hyphens, underscores)
    const validNamePattern = /^[a-zA-Z0-9\s\-_&]+$/;
    if (!validNamePattern.test(name.trim())) {
      return { isValid: false, error: 'Category name contains invalid characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate category description
   */
  static validateDescription(description: string): ValidationResult {
    if (!description || description.trim().length === 0) {
      return { isValid: false, error: 'Category description is required' };
    }

    if (description.trim().length < 5) {
      return { isValid: false, error: 'Description must be at least 5 characters long' };
    }

    if (description.trim().length > 500) {
      return { isValid: false, error: 'Description must be less than 500 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate parent category selection
   */
  static validateParentCategory(parentId?: string): ValidationResult {
    // Parent category is optional, so empty is valid
    if (!parentId) {
      return { isValid: true };
    }

    // Basic format validation for UUID-like strings
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^\d+$/i;
    if (!uuidPattern.test(parentId)) {
      return { isValid: false, error: 'Invalid parent category ID format' };
    }

    return { isValid: true };
  }

  /**
   * Validate sort order
   */
  static validateSortOrder(sortOrder?: number): ValidationResult {
    if (sortOrder === undefined || sortOrder === null) {
      return { isValid: true }; // Optional field
    }

    if (!Number.isInteger(sortOrder)) {
      return { isValid: false, error: 'Sort order must be a whole number' };
    }

    if (sortOrder < 0) {
      return { isValid: false, error: 'Sort order must be a positive number' };
    }

    if (sortOrder > 9999) {
      return { isValid: false, error: 'Sort order must be less than 10000' };
    }

    return { isValid: true };
  }

  /**
   * Validate tags array
   */
  static validateTags(tags: string[]): ValidationResult {
    if (!Array.isArray(tags)) {
      return { isValid: false, error: 'Tags must be an array' };
    }

    if (tags.length > 20) {
      return { isValid: false, error: 'Cannot have more than 20 tags' };
    }

    for (const tag of tags) {
      if (typeof tag !== 'string') {
        return { isValid: false, error: 'All tags must be text' };
      }

      if (tag.trim().length === 0) {
        return { isValid: false, error: 'Tags cannot be empty' };
      }

      if (tag.trim().length > 50) {
        return { isValid: false, error: 'Each tag must be less than 50 characters' };
      }

      // Check for valid tag characters
      const validTagPattern = /^[a-zA-Z0-9\s\-_]+$/;
      if (!validTagPattern.test(tag.trim())) {
        return { isValid: false, error: `Tag "${tag}" contains invalid characters` };
      }
    }

    // Check for duplicate tags
    const uniqueTags = new Set(tags.map(tag => tag.trim().toLowerCase()));
    if (uniqueTags.size !== tags.length) {
      return { isValid: false, error: 'Duplicate tags are not allowed' };
    }

    return { isValid: true };
  }

  /**
   * Validate the entire form
   */
  static validateForm(formData: CategoryFormData): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Validate all fields
    const fields = ['name', 'description', 'parent_category_id', 'sort_order', 'tags'];
    
    for (const field of fields) {
      const validation = this.validateField(field, (formData as any)[field], formData);
      if (!validation.isValid) {
        errors[field] = validation.error || 'Invalid value';
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  /**
   * Validate file uploads
   */
  static validateImageFile(file: File): ValidationResult {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { isValid: false, error: 'Image file must be smaller than 5MB' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Image must be JPEG, PNG, GIF, or WebP format' };
    }

    return { isValid: true };
  }

  /**
   * Validate icon files
   */
  static validateIconFile(file: File): ValidationResult {
    // Check file size (max 1MB)
    const maxSize = 1 * 1024 * 1024; // 1MB in bytes
    if (file.size > maxSize) {
      return { isValid: false, error: 'Icon file must be smaller than 1MB' };
    }

    // Check file type (prefer SVG for icons)
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Icon must be SVG, PNG, or JPEG format' };
    }

    return { isValid: true };
  }
}

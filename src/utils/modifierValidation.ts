import type { ProductModifier, ProductModifierGroup } from '../services/types/product.types';

export interface ModifierValidationErrors {
  [key: string]: string;
}

export const validateModifierGroup = (group: ProductModifierGroup, index: number): ModifierValidationErrors => {
  const errors: ModifierValidationErrors = {};
  const prefix = `modifier_groups[${index}]`;

  // Validate group name
  if (!group.name?.trim()) {
    errors[`${prefix}.name`] = 'Group name is required';
  } else if (group.name.trim().length < 2) {
    errors[`${prefix}.name`] = 'Group name must be at least 2 characters';
  } else if (group.name.trim().length > 50) {
    errors[`${prefix}.name`] = 'Group name must be less than 50 characters';
  }

  // Validate sort order
  if (group.sort_order < 1) {
    errors[`${prefix}.sort_order`] = 'Sort order must be at least 1';
  }

  // Validate selection type and limits
  if (group.selection_type === 'limited') {
    if (!group.max_selections || group.max_selections < 1) {
      errors[`${prefix}.max_selections`] = 'Max selections must be at least 1 for limited selection type';
    }
    
    if (group.min_selections !== undefined && group.min_selections < 0) {
      errors[`${prefix}.min_selections`] = 'Min selections cannot be negative';
    }
    
    if (group.min_selections !== undefined && group.max_selections && group.min_selections > group.max_selections) {
      errors[`${prefix}.min_selections`] = 'Min selections cannot be greater than max selections';
    }
  }

  if (group.selection_type === 'exact') {
    if (!group.exact_selections || group.exact_selections < 1) {
      errors[`${prefix}.exact_selections`] = 'Exact selections must be at least 1';
    }
    
    // Ensure there are enough modifiers for the exact selection requirement
    if (group.exact_selections && group.modifiers && group.exact_selections > group.modifiers.length) {
      errors[`${prefix}.exact_selections`] = `Cannot require ${group.exact_selections} selections when only ${group.modifiers.length} modifiers exist`;
    }
  }

  // Validate modifiers
  if (!group.modifiers || group.modifiers.length === 0) {
    errors[`${prefix}.modifiers`] = 'At least one modifier is required';
  } else {
    // Check for required groups having at least one default
    if (group.required && group.selection_type === 'single') {
      const hasDefault = group.modifiers.some(modifier => modifier.default_selected);
      if (!hasDefault) {
        errors[`${prefix}.modifiers_default`] = 'Required single-selection groups must have one default modifier';
      }
    }

    // Check for exact selection groups having appropriate defaults
    if (group.required && group.selection_type === 'exact' && group.exact_selections) {
      const defaultCount = group.modifiers.filter(modifier => modifier.default_selected).length;
      if (defaultCount !== group.exact_selections) {
        errors[`${prefix}.modifiers_exact`] = `Required exact-selection groups must have exactly ${group.exact_selections} default modifier${group.exact_selections !== 1 ? 's' : ''}`;
      }
    }

    // Check for single selection groups having only one default
    if (group.selection_type === 'single') {
      const defaultCount = group.modifiers.filter(modifier => modifier.default_selected).length;
      if (defaultCount > 1) {
        errors[`${prefix}.modifiers_single`] = 'Single-selection groups can only have one default modifier';
      }
    }

    // Check for exact selection groups not exceeding exact count for defaults
    if (group.selection_type === 'exact' && group.exact_selections) {
      const defaultCount = group.modifiers.filter(modifier => modifier.default_selected).length;
      if (defaultCount > group.exact_selections) {
        errors[`${prefix}.modifiers_exact_limit`] = `Cannot have more than ${group.exact_selections} default modifiers for exact selection`;
      }
    }

    // Check for limited selection groups not exceeding max defaults
    if (group.selection_type === 'limited' && group.max_selections) {
      const defaultCount = group.modifiers.filter(modifier => modifier.default_selected).length;
      if (defaultCount > group.max_selections) {
        errors[`${prefix}.modifiers_limited`] = `Cannot have more than ${group.max_selections} default modifiers for limited selection`;
      }
    }

    // Validate individual modifiers
    group.modifiers.forEach((modifier, modifierIndex) => {
      const modifierErrors = validateModifier(modifier, index, modifierIndex);
      Object.assign(errors, modifierErrors);
    });
  }

  return errors;
};

export const validateModifier = (modifier: ProductModifier, groupIndex: number, modifierIndex: number): ModifierValidationErrors => {
  const errors: ModifierValidationErrors = {};
  const prefix = `modifier_groups[${groupIndex}].modifiers[${modifierIndex}]`;

  // Validate modifier name
  if (!modifier.name?.trim()) {
    errors[`${prefix}.name`] = 'Modifier name is required';
  } else if (modifier.name.trim().length < 2) {
    errors[`${prefix}.name`] = 'Modifier name must be at least 2 characters';
  } else if (modifier.name.trim().length > 50) {
    errors[`${prefix}.name`] = 'Modifier name must be less than 50 characters';
  }

  // Validate price delta
  if (typeof modifier.price_delta !== 'number') {
    errors[`${prefix}.price_delta`] = 'Price delta must be a number';
  } else if (modifier.price_delta < -1000) {
    errors[`${prefix}.price_delta`] = 'Price delta cannot be less than -$1000';
  } else if (modifier.price_delta > 1000) {
    errors[`${prefix}.price_delta`] = 'Price delta cannot be more than $1000';
  }

  // Validate sort order
  if (modifier.sort_order < 1) {
    errors[`${prefix}.sort_order`] = 'Sort order must be at least 1';
  }

  return errors;
};

export const validateAllModifierGroups = (modifierGroups: ProductModifierGroup[]): ModifierValidationErrors => {
  const errors: ModifierValidationErrors = {};

  // Check for duplicate group names
  const groupNames = modifierGroups.map(group => group.name?.trim().toLowerCase()).filter(Boolean);
  const duplicateNames = groupNames.filter((name, index) => groupNames.indexOf(name) !== index);
  
  if (duplicateNames.length > 0) {
    errors['modifier_groups.duplicate_names'] = `Duplicate modifier group names found: ${duplicateNames.join(', ')}`;
  }

  // Validate each group
  modifierGroups.forEach((group, index) => {
    const groupErrors = validateModifierGroup(group, index);
    Object.assign(errors, groupErrors);

    // Check for duplicate modifier names within group
    if (group.modifiers?.length > 0) {
      const modifierNames = group.modifiers.map(modifier => modifier.name?.trim().toLowerCase()).filter(Boolean);
      const duplicateModifiers = modifierNames.filter((name, idx) => modifierNames.indexOf(name) !== idx);
      
      if (duplicateModifiers.length > 0) {
        errors[`modifier_groups[${index}].duplicate_modifiers`] = `Duplicate modifier names in "${group.name}": ${duplicateModifiers.join(', ')}`;
      }
    }
  });

  return errors;
};

// JSON Schema for API validation
export const modifierGroupSchema = {
  type: 'object',
  properties: {
    group_id: {
      type: 'string',
      description: 'Optional group ID for existing groups'
    },
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
      description: 'Display name for the modifier group'
    },
    selection_type: {
      type: 'string',
      enum: ['single', 'multiple'],
      description: 'Whether customers can select one or multiple modifiers'
    },
    required: {
      type: 'boolean',
      description: 'Whether customers must make a selection from this group'
    },
    sort_order: {
      type: 'integer',
      minimum: 1,
      description: 'Display order of the group'
    },
    modifiers: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          modifier_id: {
            type: 'string',
            description: 'Optional modifier ID for existing modifiers'
          },
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            description: 'Display name for the modifier'
          },
          price_delta: {
            type: 'number',
            minimum: -1000,
            maximum: 1000,
            description: 'Price adjustment (positive or negative)'
          },
          default_selected: {
            type: 'boolean',
            description: 'Whether this modifier is selected by default'
          },
          sort_order: {
            type: 'integer',
            minimum: 1,
            description: 'Display order of the modifier within the group'
          }
        },
        required: ['name', 'price_delta', 'default_selected', 'sort_order'],
        additionalProperties: false
      }
    }
  },
  required: ['name', 'selection_type', 'required', 'sort_order', 'modifiers'],
  additionalProperties: false
};

export const productWithModifiersSchema = {
  type: 'object',
  properties: {
    // ... existing product properties
    modifier_groups: {
      type: 'array',
      items: modifierGroupSchema,
      description: 'Optional array of modifier groups for product customization'
    }
  }
};

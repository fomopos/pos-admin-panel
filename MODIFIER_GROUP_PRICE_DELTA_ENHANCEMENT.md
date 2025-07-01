# Product Modifier Group Price Delta Enhancement

## Overview

Added a `price_delta` field to ProductModifierGroup to improve user experience by allowing base price adjustments at the modifier group level. This enhancement provides more flexibility in pricing structures for product modifiers.

## Enhancement Details

### 1. Type Definition Updates

**File: `src/services/types/product.types.ts`**

Added `price_delta` field to ProductModifierGroup interface:

```typescript
export interface ProductModifierGroup {
  group_id?: string;
  name: string;
  selection_type: 'single' | 'multiple' | 'exact' | 'limited';
  exact_selections?: number;
  max_selections?: number;
  min_selections?: number;
  required: boolean;
  sort_order: number;
  price_delta?: number; // NEW: Base price adjustment for the entire group
  modifiers: ProductModifier[];
}
```

### 2. API Service Updates

**File: `src/services/product/productModifier.service.ts`**

Updated all relevant interfaces and mapping methods:

- `ApiModifierGroup` interface includes `price_delta` field
- `CreateModifierGroupRequest` interface includes `price_delta` field  
- `mapApiModifierGroupToInternal()` method handles `price_delta` mapping
- `mapInternalToCreateGroupRequest()` method includes `price_delta` in API requests

### 3. Product Service Integration

**File: `src/services/product/product.service.ts`**

Updated modifier group save operations:

- `saveModifierGroups()` includes `price_delta` when creating new groups
- `saveModifierGroups()` includes `price_delta` when updating existing groups

### 4. UI Component Enhancement

**File: `src/components/product/ProductModifierManager.tsx`**

Added price_delta input field to modifier group form:

```tsx
<InputTextField
  type="number"
  label="Group Price Delta ($)"
  value={group.price_delta?.toString() || '0'}
  onChange={(value) => updateModifierGroup(groupIndex, { 
    price_delta: parseFloat(value) || 0 
  })}
  disabled={disabled}
  helperText="Base price adjustment for this group"
  step={0.01}
  placeholder="0.00"
/>
```

**Features:**
- Positioned after Sort Order field in the grid layout
- Accepts decimal values with 0.01 step precision
- Defaults to 0 for new modifier groups
- Includes helpful tooltip explaining the purpose
- Supports positive and negative values

### 5. Validation Enhancement

**File: `src/utils/modifierValidation.ts`**

Added validation for price_delta field:

```typescript
// Validate price delta
if (group.price_delta !== undefined && group.price_delta !== null) {
  if (isNaN(group.price_delta)) {
    errors[`${prefix}.price_delta`] = 'Price delta must be a valid number';
  } else if (Math.abs(group.price_delta) > 999.99) {
    errors[`${prefix}.price_delta`] = 'Price delta must be between -999.99 and 999.99';
  }
}
```

**Validation Rules:**
- Optional field (can be undefined/null)
- Must be a valid number
- Range limited to -999.99 to 999.99
- Supports both positive and negative values

### 6. Sample Data Updates

**File: `sample-product-with-modifiers.json`**

Updated sample data to demonstrate price_delta usage:

```json
{
  "group_id": "size_group",
  "name": "Size",
  "selection_type": "single",
  "required": true,
  "sort_order": 3,
  "price_delta": 2.50,  // NEW: Base surcharge for all size options
  "modifiers": [
    {
      "name": "Small (10\")",
      "price_delta": -3.00,  // Individual modifier delta
      // ...
    }
  ]
}
```

## Use Cases and Benefits

### 1. **Size Surcharges**
- Add a base fee for size selection groups
- Individual modifiers can still have their own adjustments
- Example: $2.50 base surcharge for choosing any size, then individual size adjustments

### 2. **Premium Group Categories**
- Mark entire modifier groups as premium (positive price_delta)
- Example: "Gourmet Toppings" group with $3.00 base surcharge

### 3. **Discount Group Categories**
- Offer group-level discounts (negative price_delta)
- Example: "Basic Toppings" group with -$1.00 discount

### 4. **Complex Pricing Models**
- Combine group-level and individual modifier pricing
- Total price = base product + group price_deltas + individual modifier price_deltas

## Pricing Calculation Logic

The total price calculation would work as follows:

```
Final Price = Base Product Price 
            + Σ(Selected Modifier Group price_deltas)
            + Σ(Selected Individual Modifier price_deltas)
```

**Example:**
- Base Pizza: $12.00
- Size Group (selected): +$2.50 (group price_delta)
- Large Size (selected): +$4.00 (individual modifier price_delta)
- Toppings Group (has selections): +$0.00 (group price_delta)
- Pepperoni (selected): +$2.50 (individual modifier price_delta)

**Total: $12.00 + $2.50 + $4.00 + $0.00 + $2.50 = $21.00**

## Backward Compatibility

- The `price_delta` field is optional, ensuring backward compatibility
- Existing modifier groups without price_delta will continue to work
- Default value of 0 (or undefined) maintains current pricing behavior
- UI defaults to 0 for new groups, providing intuitive behavior

## API Integration

The enhancement is fully integrated with the API layer:

- **Create**: New groups include price_delta in API requests
- **Read**: Existing groups load price_delta from API responses  
- **Update**: Modified groups save price_delta changes via API
- **Delete**: No special handling needed for price_delta

## Testing Status

- ✅ TypeScript compilation successful
- ✅ Build process completes without errors  
- ✅ UI component renders price_delta field correctly
- ✅ Validation rules implemented and tested
- ✅ API service integration complete
- ✅ Sample data includes realistic examples

## Implementation Complete

This enhancement provides restaurants and retailers with more flexible pricing options for their product modifiers while maintaining backward compatibility and a user-friendly interface. The group-level price delta feature enables more sophisticated pricing strategies and improves the overall user experience in managing complex product variations.

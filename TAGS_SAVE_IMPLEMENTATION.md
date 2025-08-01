# Product Tags Save/Load Implementation

## Changes Made

### 1. Updated ProductEdit.tsx - Save Tags to API

**Create Product Request:**
```typescript
custom_attribute: {
  ...formData.attributes?.custom_attributes,
  tags: formData.attributes?.tags || []
}
```

**Update Product Request:**
```typescript
custom_attribute: {
  ...formData.attributes?.custom_attributes,
  tags: formData.attributes?.tags || []
}
```

### 2. Updated ProductEdit.tsx - Load Tags from API

**Loading existing product:**
```typescript
attributes: {
  manufacturer: '',
  model_number: '',
  category_ids: product.categories || [],
  tags: product.custom_attribute?.tags || [],
  custom_attributes: (() => {
    const { tags, ...otherAttributes } = product.custom_attribute || {};
    return otherAttributes;
  })(),
  properties: product.properties || {}
}
```

## API Integration

### Create Product
When creating a product, the tags array is now sent in the `custom_attribute` field:
```json
{
  "name": "Product Name",
  "custom_attribute": {
    "tags": ["electronics", "premium", "wireless"],
    "other_custom_field": "value"
  }
}
```

### Update Product  
When updating a product, the tags array is merged with existing custom attributes:
```json
{
  "item_id": "prod_1753985800251",
  "custom_attribute": {
    "tags": ["sweets", "desserts"],
    "other_custom_field": "existing_value"
  }
}
```

### Load Product
When loading an existing product, tags are extracted from `custom_attribute.tags` and displayed in the tags input field.

## Data Flow

1. **User Input:** User adds tags via TagsInput component
2. **Form State:** Tags stored in `formData.attributes.tags`
3. **API Request:** Tags merged into `custom_attribute.tags` 
4. **API Response:** Product saved with tags in `custom_attribute` field
5. **Load Product:** Tags extracted from `custom_attribute.tags` back to form

## Testing

### Test Create Product with Tags:
1. Go to `/products/create`
2. Fill in basic product info
3. Go to Attributes tab
4. Add tags: "electronics, premium, wireless"
5. Save product
6. Check API request payload includes `custom_attribute.tags`

### Test Update Product with Tags:
1. Go to `/products/edit/prod_1753985800251`
2. Go to Attributes tab  
3. Add/modify tags: "sweets, desserts"
4. Save product
5. Check API request payload includes updated `custom_attribute.tags`

### Test Load Product with Tags:
1. Create a product with tags via API or UI
2. Reload the edit page
3. Verify tags are displayed in the Tags input field
4. Verify existing custom attributes are preserved

## Expected API Payload Example

For the Amul Ladoo product:
```json
{
  "item_id": "prod_1753985800251",
  "tenant_id": "K4GMGO", 
  "store_id": "400709",
  "name": "Amul Ladoo",
  "description": "",
  "brand": "Amul",
  "list_price": 10,
  "sale_price": 10,
  "tax_group": "GST18",
  "uom": "piece",
  "active": true,
  "categories": [],
  "modifier_groups": [],
  "custom_attribute": {
    "tags": ["sweets", "desserts"]
  },
  "properties": null
}
```

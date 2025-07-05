/**
 * Unit of Measure (UOM) constants and utilities
 */

export interface UnitOfMeasure {
  id: string;
  label: string;
  description: string;
  category: 'weight' | 'volume' | 'length' | 'count' | 'other';
}

/**
 * Standard units of measure commonly used in POS systems
 */
export const UNITS_OF_MEASURE: UnitOfMeasure[] = [
  // Count/Quantity (Most common)
  { id: 'each', label: 'Each', description: 'Individual items (default)', category: 'count' },
  { id: 'piece', label: 'Piece', description: 'Individual pieces', category: 'count' },
  { id: 'pack', label: 'Pack', description: 'Package or bundle', category: 'count' },
  { id: 'dozen', label: 'Dozen', description: '12 items', category: 'count' },
  { id: 'pair', label: 'Pair', description: '2 items', category: 'count' },
  { id: 'set', label: 'Set', description: 'Complete set', category: 'count' },
  
  // Weight
  { id: 'lb', label: 'Pound (lb)', description: 'Pounds', category: 'weight' },
  { id: 'kg', label: 'Kilogram (kg)', description: 'Kilograms', category: 'weight' },
  { id: 'oz', label: 'Ounce (oz)', description: 'Ounces', category: 'weight' },
  { id: 'g', label: 'Gram (g)', description: 'Grams', category: 'weight' },
  { id: 'ton', label: 'Ton', description: 'Tons', category: 'weight' },
  
  // Volume
  { id: 'gal', label: 'Gallon (gal)', description: 'Gallons', category: 'volume' },
  { id: 'l', label: 'Liter (L)', description: 'Liters', category: 'volume' },
  { id: 'qt', label: 'Quart (qt)', description: 'Quarts', category: 'volume' },
  { id: 'pt', label: 'Pint (pt)', description: 'Pints', category: 'volume' },
  { id: 'fl_oz', label: 'Fluid Ounce (fl oz)', description: 'Fluid ounces', category: 'volume' },
  { id: 'ml', label: 'Milliliter (mL)', description: 'Milliliters', category: 'volume' },
  { id: 'cup', label: 'Cup', description: 'Cups', category: 'volume' },
  
  // Length
  { id: 'ft', label: 'Foot (ft)', description: 'Feet', category: 'length' },
  { id: 'm', label: 'Meter (m)', description: 'Meters', category: 'length' },
  { id: 'in', label: 'Inch (in)', description: 'Inches', category: 'length' },
  { id: 'cm', label: 'Centimeter (cm)', description: 'Centimeters', category: 'length' },
  { id: 'yd', label: 'Yard (yd)', description: 'Yards', category: 'length' },
  
  // Other common units
  { id: 'box', label: 'Box', description: 'Boxed items', category: 'other' },
  { id: 'bag', label: 'Bag', description: 'Bagged items', category: 'other' },
  { id: 'bottle', label: 'Bottle', description: 'Bottled items', category: 'other' },
  { id: 'can', label: 'Can', description: 'Canned items', category: 'other' },
  { id: 'tube', label: 'Tube', description: 'Tubed items', category: 'other' },
  { id: 'roll', label: 'Roll', description: 'Rolled items', category: 'other' },
];

/**
 * Default UOM - "Each" is the most common unit for retail items
 */
export const DEFAULT_UOM = 'each';

/**
 * Get UOM by ID
 */
export const getUOMById = (id: string): UnitOfMeasure | undefined => {
  return UNITS_OF_MEASURE.find(uom => uom.id === id);
};

/**
 * Get UOM display label by ID
 */
export const getUOMLabel = (id: string): string => {
  const uom = getUOMById(id);
  return uom ? uom.label : id;
};

/**
 * Convert UOM array to DropdownSearch options
 */
export const getUOMDropdownOptions = () => {
  return UNITS_OF_MEASURE.map(uom => ({
    id: uom.id,
    label: uom.label,
    description: uom.description,
    data: uom
  }));
};

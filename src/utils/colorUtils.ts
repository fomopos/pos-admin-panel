/**
 * Color utilities for generating and managing colors in the application
 */

/**
 * Predefined color palette for categories and visual elements
 */
export const COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7', // Violet
  '#22C55E', // Green-500
  '#FBBF24', // Yellow
  '#DC2626', // Red-600
  '#059669', // Emerald
  '#7C3AED', // Violet-600
  '#DB2777', // Pink-600
];

/**
 * Generate a random hex color from the predefined palette
 * @returns A random hex color string
 */
export const generateRandomColor = (): string => {
  return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
};

/**
 * Validate if a string is a valid hex color
 * @param color - The color string to validate
 * @returns true if valid hex color, false otherwise
 */
export const isValidHexColor = (color: string): boolean => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
};

/**
 * Get a fallback color if the provided color is invalid
 * @param color - The color to validate
 * @param fallback - Optional fallback color (defaults to random)
 * @returns Valid hex color
 */
export const getValidColor = (color?: string, fallback?: string): string => {
  if (color && isValidHexColor(color)) {
    return color;
  }
  return fallback || generateRandomColor();
};

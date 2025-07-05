import React, { useState, useMemo } from 'react';
import { generateRandomColor } from '../../utils/colorUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingBag,
  faHome,
  faFlask,
  faCake,
  faGift,
  faHeart,
  faStar,
  faSun,
  faBook,
  faMusic,
  faPaintBrush,
  faWrench,
  faMobile,
  faDesktop,
  faTruck,
  faStore,
  faUsers,
  faSmile,
  faFire,
  faBolt,
  faCloud,
  faMoon,
  faGlobe,
  faTshirt,
  faGamepad,
  faCamera,
  faBicycle,
  faCoffee,
  faShirt,
  faLaptop,
  faTablet,
  faCar,
  faPlane,
  faTree,
  faLeaf,
  faMountain,
  faSnowflake,
  // Food & Beverage Icons
  faPizzaSlice,
  faBurger,
  faHotdog,
  faIceCream,
  faBreadSlice,
  faFish,
  faCarrot,
  faAppleWhole,
  faLemon,
  faWineGlass,
  faBeer,
  faMartiniGlass,
  faMugHot,
  faGlassWater,
  faBowlFood,
  faUtensils,
  faCheese,
  faEgg,
  faCookieBite,
  faCandyCane,
  faShrimp,
  faBone,
  faDrumstickBite,
  faWineBottle,
  faGlassWhiskey
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface CategoryIcon {
  id: string;
  name: string;
  icon: IconDefinition;
  category: 'general' | 'food' | 'retail' | 'technology' | 'lifestyle' | 'nature';
}

export const CATEGORY_ICONS: CategoryIcon[] = [
  // General
  { id: 'shopping-bag', name: 'Shopping Bag', icon: faShoppingBag, category: 'general' },
  { id: 'home', name: 'Home', icon: faHome, category: 'general' },
  { id: 'store', name: 'Store', icon: faStore, category: 'general' },
  { id: 'users', name: 'People', icon: faUsers, category: 'general' },
  { id: 'star', name: 'Star', icon: faStar, category: 'general' },
  { id: 'heart', name: 'Heart', icon: faHeart, category: 'general' },
  { id: 'gift', name: 'Gift', icon: faGift, category: 'general' },
  { id: 'camera', name: 'Camera', icon: faCamera, category: 'general' },
  
  // Food & Beverage
  { id: 'cake', name: 'Cake', icon: faCake, category: 'food' },
  { id: 'coffee', name: 'Coffee', icon: faCoffee, category: 'food' },
  { id: 'flask', name: 'Drinks', icon: faFlask, category: 'food' },
  { id: 'pizza-slice', name: 'Pizza', icon: faPizzaSlice, category: 'food' },
  { id: 'burger', name: 'Burger', icon: faBurger, category: 'food' },
  { id: 'hotdog', name: 'Hotdog', icon: faHotdog, category: 'food' },
  { id: 'ice-cream', name: 'Ice Cream', icon: faIceCream, category: 'food' },
  { id: 'bread-slice', name: 'Bread', icon: faBreadSlice, category: 'food' },
  { id: 'fish', name: 'Fish', icon: faFish, category: 'food' },
  { id: 'carrot', name: 'Vegetables', icon: faCarrot, category: 'food' },
  { id: 'apple-whole', name: 'Fruits', icon: faAppleWhole, category: 'food' },
  { id: 'lemon', name: 'Citrus', icon: faLemon, category: 'food' },
  { id: 'wine-glass', name: 'Wine', icon: faWineGlass, category: 'food' },
  { id: 'beer', name: 'Beer', icon: faBeer, category: 'food' },
  { id: 'martini-glass', name: 'Cocktails', icon: faMartiniGlass, category: 'food' },
  { id: 'mug-hot', name: 'Hot Drinks', icon: faMugHot, category: 'food' },
  { id: 'glass-water', name: 'Water', icon: faGlassWater, category: 'food' },
  { id: 'bowl-food', name: 'Meals', icon: faBowlFood, category: 'food' },
  { id: 'utensils', name: 'Dining', icon: faUtensils, category: 'food' },
  { id: 'cheese', name: 'Cheese', icon: faCheese, category: 'food' },
  { id: 'egg', name: 'Eggs', icon: faEgg, category: 'food' },
  { id: 'cookie-bite', name: 'Cookies', icon: faCookieBite, category: 'food' },
  { id: 'candy-cane', name: 'Sweets', icon: faCandyCane, category: 'food' },
  { id: 'shrimp', name: 'Seafood', icon: faShrimp, category: 'food' },
  { id: 'bone', name: 'Meat', icon: faBone, category: 'food' },
  { id: 'drumstick-bite', name: 'Chicken', icon: faDrumstickBite, category: 'food' },
  { id: 'wine-bottle', name: 'Wine Bottle', icon: faWineBottle, category: 'food' },
  { id: 'glass-whiskey', name: 'Spirits', icon: faGlassWhiskey, category: 'food' },
  
  // Retail & Fashion
  { id: 'tshirt', name: 'Clothing', icon: faTshirt, category: 'retail' },
  { id: 'shirt', name: 'Shirts', icon: faShirt, category: 'retail' },
  { id: 'paint-brush', name: 'Beauty', icon: faPaintBrush, category: 'retail' },
  { id: 'wrench', name: 'Tools', icon: faWrench, category: 'retail' },
  
  // Technology
  { id: 'mobile', name: 'Mobile', icon: faMobile, category: 'technology' },
  { id: 'desktop', name: 'Computer', icon: faDesktop, category: 'technology' },
  { id: 'laptop', name: 'Laptop', icon: faLaptop, category: 'technology' },
  { id: 'tablet', name: 'Tablet', icon: faTablet, category: 'technology' },
  
  // Lifestyle
  { id: 'book', name: 'Books', icon: faBook, category: 'lifestyle' },
  { id: 'music', name: 'Music', icon: faMusic, category: 'lifestyle' },
  { id: 'smile', name: 'Entertainment', icon: faSmile, category: 'lifestyle' },
  { id: 'gamepad', name: 'Gaming', icon: faGamepad, category: 'lifestyle' },
  { id: 'bicycle', name: 'Sports', icon: faBicycle, category: 'lifestyle' },
  { id: 'truck', name: 'Automotive', icon: faTruck, category: 'lifestyle' },
  { id: 'car', name: 'Car', icon: faCar, category: 'lifestyle' },
  { id: 'plane', name: 'Travel', icon: faPlane, category: 'lifestyle' },
  
  // Nature & Elements
  { id: 'sun', name: 'Sun', icon: faSun, category: 'nature' },
  { id: 'moon', name: 'Moon', icon: faMoon, category: 'nature' },
  { id: 'cloud', name: 'Cloud', icon: faCloud, category: 'nature' },
  { id: 'fire', name: 'Fire', icon: faFire, category: 'nature' },
  { id: 'bolt', name: 'Energy', icon: faBolt, category: 'nature' },
  { id: 'globe', name: 'Globe', icon: faGlobe, category: 'nature' },
  { id: 'tree', name: 'Tree', icon: faTree, category: 'nature' },
  { id: 'leaf', name: 'Leaf', icon: faLeaf, category: 'nature' },
  { id: 'mountain', name: 'Mountain', icon: faMountain, category: 'nature' },
  { id: 'snowflake', name: 'Winter', icon: faSnowflake, category: 'nature' }
];

interface IconPickerProps {
  selectedIconId?: string;
  onIconSelect: (iconId: string) => void;
  color?: string; // If not provided, a random color will be generated
}

export const IconPicker: React.FC<IconPickerProps> = ({
  selectedIconId,
  onIconSelect,
  color
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Generate a random color if none is provided (memoized to prevent re-generation on re-renders)
  const effectiveColor = useMemo(() => color || generateRandomColor(), [color]);
  
  const categories = [
    { id: 'all', name: 'All Icons' },
    { id: 'general', name: 'General' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'retail', name: 'Retail' },
    { id: 'technology', name: 'Technology' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'nature', name: 'Nature' }
  ];

  const filteredIcons = selectedCategory === 'all' 
    ? CATEGORY_ICONS 
    : CATEGORY_ICONS.filter(icon => icon.category === selectedCategory);

  const selectedIcon = CATEGORY_ICONS.find(icon => icon.id === selectedIconId);

  return (
    <div className="space-y-4">
      {/* Selected Icon Preview */}
      {selectedIcon && (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: effectiveColor }}
          >
            <FontAwesomeIcon icon={selectedIcon.icon} className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{selectedIcon.name}</p>
            <p className="text-xs text-gray-500">Selected Icon</p>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
        {filteredIcons.map(icon => {
          const isSelected = selectedIconId === icon.id;
          
          return (
            <button
              key={icon.id}
              type="button"
              onClick={() => onIconSelect(icon.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : 'hover:bg-gray-100'
              }`}
              style={{ 
                backgroundColor: isSelected ? effectiveColor : 'transparent',
              }}
              title={icon.name}
            >
              <FontAwesomeIcon 
                icon={icon.icon}
                className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} 
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const getIconById = (iconId: string): CategoryIcon | undefined => {
  return CATEGORY_ICONS.find(icon => icon.id === iconId);
};

export const getIconComponent = (iconId: string): IconDefinition | undefined => {
  const icon = getIconById(iconId);
  return icon?.icon;
};

import React from 'react';
import { DropdownSearch } from '../components/ui';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import { 
  DEMO_CATEGORIES, 
  DEMO_USERS, 
  DEMO_COUNTRIES, 
  DEMO_CURRENCIES 
} from '../constants/dropdownOptions';

/**
 * DropdownSearchDemo - Example usage of the DropdownSearch component
 * 
 * This demonstrates various configurations and use cases for the reusable DropdownSearch component.
 */
const DropdownSearchDemo: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>();
  const [selectedUser, setSelectedUser] = React.useState<string | undefined>();
  const [selectedCountry, setSelectedCountry] = React.useState<string | undefined>();
  const [selectedCurrency, setSelectedCurrency] = React.useState<string | undefined>();

  const handleCategorySelect = (option: DropdownSearchOption | null) => {
    setSelectedCategory(option?.id);
  };

  const handleUserSelect = (option: DropdownSearchOption | null) => {
    setSelectedUser(option?.id);
  };

  const handleCountrySelect = (option: DropdownSearchOption | null) => {
    setSelectedCountry(option?.id);
  };

  const handleCurrencySelect = (option: DropdownSearchOption | null) => {
    setSelectedCurrency(option?.id);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DropdownSearch Component Demo</h1>
        <p className="text-gray-600">Examples of the reusable DropdownSearch component in different scenarios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hierarchical Categories Example */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hierarchical Categories</h2>
          <DropdownSearch
            label="Product Category"
            value={selectedCategory}
            placeholder="Select a category"
            searchPlaceholder="Search categories..."
            options={DEMO_CATEGORIES}
            onSelect={handleCategorySelect}
            clearLabel="No Category"
            noOptionsMessage="No categories found"
            allowClear={true}
            required={true}
          />
          {selectedCategory && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {DEMO_CATEGORIES.find(c => c.id === selectedCategory)?.label}
            </p>
          )}
        </div>

        {/* User Selection Example */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Selection</h2>
          <DropdownSearch
            label="Assign to User"
            value={selectedUser}
            placeholder="Choose a user"
            searchPlaceholder="Search users..."
            options={DEMO_USERS}
            onSelect={handleUserSelect}
            clearLabel="Unassigned"
            noOptionsMessage="No users found"
            allowClear={true}
          />
          {selectedUser && (
            <p className="mt-2 text-sm text-gray-600">
              Assigned to: {DEMO_USERS.find(u => u.id === selectedUser)?.label}
            </p>
          )}
        </div>

        {/* Country Selection Example */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Country Selection</h2>
          <DropdownSearch
            label="Country"
            value={selectedCountry}
            placeholder="Select country"
            searchPlaceholder="Search countries..."
            options={DEMO_COUNTRIES}
            onSelect={handleCountrySelect}
            clearLabel="No Country"
            noOptionsMessage="No countries found"
            allowClear={false}
            required={true}
          />
          {selectedCountry && (
            <p className="mt-2 text-sm text-gray-600">
              Country: {DEMO_COUNTRIES.find(c => c.id === selectedCountry)?.label}
            </p>
          )}
        </div>
      </div>

      {/* Custom Styling Example */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Styling Example</h2>
        <div className="max-w-md">
          <DropdownSearch
            label="Premium Category"
            value={selectedCategory}
            placeholder="Choose premium category"
            searchPlaceholder="Search premium categories..."
            options={DEMO_CATEGORIES.filter(c => c.level === 0)} // Only top-level categories
            onSelect={handleCategorySelect}
            clearLabel="No Premium Category"
            noOptionsMessage="No premium categories available"
            allowClear={true}
            className="premium-dropdown"
            buttonClassName="border-2 border-blue-300 hover:border-blue-400"
            dropdownClassName="border-2 border-blue-300"
          />
        </div>
      </div>

      {/* Enhanced DisplayValue Component Example */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enhanced DisplayValue with Components</h2>
        <p className="text-sm text-gray-600 mb-4">
          This example shows how displayValue can now render React components, not just strings.
        </p>
        <div className="max-w-md">
          <DropdownSearch
            label="Currency"
            value={selectedCurrency}
            placeholder="Select currency"
            searchPlaceholder="Search currencies..."
            options={DEMO_CURRENCIES}
            onSelect={handleCurrencySelect}
            clearLabel="No Currency"
            noOptionsMessage="No currencies found"
            allowClear={true}
            // Enhanced displayValue that returns a React component
            displayValue={(option) => {
              if (!option) return "Select currency";
              return (
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span className="font-medium">{option.id}</span>
                  <span className="text-gray-500">-</span>
                  <span>{option.label}</span>
                </div>
              );
            }}
            // Custom option rendering for dropdown items
            renderOption={(option) => (
              <div className="flex items-center gap-3">
                <div className="text-lg">{option.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.id} - {option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </div>
            )}
          />
          {selectedCurrency && (
            <p className="mt-2 text-sm text-gray-600">
              Selected currency: {DEMO_CURRENCIES.find(c => c.id === selectedCurrency)?.label} ({selectedCurrency})
            </p>
          )}
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Component Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Core Features:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Real-time search filtering</li>
              <li>• Hierarchical option display</li>
              <li>• Keyboard navigation ready</li>
              <li>• Click-outside-to-close</li>
              <li>• Custom option rendering</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Customization:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Custom styling support</li>
              <li>• Configurable labels and messages</li>
              <li>• Optional clear functionality</li>
              <li>• Error state handling</li>
              <li>• Disabled state support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropdownSearchDemo;

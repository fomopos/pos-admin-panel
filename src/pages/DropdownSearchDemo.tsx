import React from 'react';
import { DropdownSearch } from '../components/ui';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';

/**
 * DropdownSearchDemo - Example usage of the DropdownSearch component
 * 
 * This demonstrates various configurations and use cases for the reusable DropdownSearch component.
 */
const DropdownSearchDemo: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>();
  const [selectedUser, setSelectedUser] = React.useState<string | undefined>();
  const [selectedCountry, setSelectedCountry] = React.useState<string | undefined>();

  // Sample category options with hierarchy
  const categoryOptions: DropdownSearchOption[] = [
    { id: '1', label: 'Electronics', description: 'Electronic devices and accessories', level: 0 },
    { id: '2', label: 'Smartphones', description: 'Mobile phones and accessories', level: 1 },
    { id: '3', label: 'iPhone', description: 'Apple smartphones', level: 2 },
    { id: '4', label: 'Android', description: 'Android smartphones', level: 2 },
    { id: '5', label: 'Laptops', description: 'Portable computers', level: 1 },
    { id: '6', label: 'Gaming Laptops', description: 'High-performance gaming computers', level: 2 },
    { id: '7', label: 'Business Laptops', description: 'Professional work computers', level: 2 },
    { id: '8', label: 'Clothing', description: 'Apparel and fashion items', level: 0 },
    { id: '9', label: 'Men\'s Clothing', description: 'Clothing for men', level: 1 },
    { id: '10', label: 'Women\'s Clothing', description: 'Clothing for women', level: 1 },
  ];

  // Sample user options
  const userOptions: DropdownSearchOption[] = [
    { id: 'user1', label: 'John Doe', description: 'Administrator' },
    { id: 'user2', label: 'Jane Smith', description: 'Manager' },
    { id: 'user3', label: 'Bob Johnson', description: 'Sales Representative' },
    { id: 'user4', label: 'Alice Brown', description: 'Customer Service' },
    { id: 'user5', label: 'Charlie Wilson', description: 'IT Support' },
  ];

  // Sample country options
  const countryOptions: DropdownSearchOption[] = [
    { id: 'us', label: 'United States', description: 'North America' },
    { id: 'ca', label: 'Canada', description: 'North America' },
    { id: 'uk', label: 'United Kingdom', description: 'Europe' },
    { id: 'fr', label: 'France', description: 'Europe' },
    { id: 'de', label: 'Germany', description: 'Europe' },
    { id: 'jp', label: 'Japan', description: 'Asia' },
    { id: 'au', label: 'Australia', description: 'Oceania' },
  ];

  const handleCategorySelect = (option: DropdownSearchOption | null) => {
    setSelectedCategory(option?.id);
  };

  const handleUserSelect = (option: DropdownSearchOption | null) => {
    setSelectedUser(option?.id);
  };

  const handleCountrySelect = (option: DropdownSearchOption | null) => {
    setSelectedCountry(option?.id);
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
            options={categoryOptions}
            onSelect={handleCategorySelect}
            clearLabel="No Category"
            noOptionsMessage="No categories found"
            allowClear={true}
            required={true}
          />
          {selectedCategory && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {categoryOptions.find(c => c.id === selectedCategory)?.label}
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
            options={userOptions}
            onSelect={handleUserSelect}
            clearLabel="Unassigned"
            noOptionsMessage="No users found"
            allowClear={true}
          />
          {selectedUser && (
            <p className="mt-2 text-sm text-gray-600">
              Assigned to: {userOptions.find(u => u.id === selectedUser)?.label}
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
            options={countryOptions}
            onSelect={handleCountrySelect}
            clearLabel="No Country"
            noOptionsMessage="No countries found"
            allowClear={false}
            required={true}
          />
          {selectedCountry && (
            <p className="mt-2 text-sm text-gray-600">
              Country: {countryOptions.find(c => c.id === selectedCountry)?.label}
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
            options={categoryOptions.filter(c => c.level === 0)} // Only top-level categories
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

import React from 'react';
import { Widget } from '../ui';
import { 
  CreditCardIcon,
  UserIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';

/**
 * Widget Usage Examples
 * 
 * This component demonstrates different ways to use the unified Widget component
 * that can be used throughout the project to maintain consistent design.
 */

const WidgetExamples: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Widget Component Examples</h1>
      
      {/* Default Widget */}
      <Widget
        title="Default Widget"
        description="This is a default widget with standard styling"
        icon={CreditCardIcon}
        headerActions={
          <Button size="sm" variant="outline">
            Action
          </Button>
        }
      >
        <p className="text-gray-600">
          This is the content area of the widget. You can put any React components here.
        </p>
      </Widget>

      {/* Primary Variant */}
      <Widget
        title="Primary Widget"
        description="Widget with primary color scheme"
        icon={UserIcon}
        variant="primary"
        headerActions={
          <div className="flex space-x-2">
            <Button size="sm">Edit</Button>
            <Button size="sm" variant="outline">View</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Feature 1</h4>
            <p className="text-blue-700 text-sm">Description here</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Feature 2</h4>
            <p className="text-blue-700 text-sm">Description here</p>
          </div>
        </div>
      </Widget>

      {/* Success Variant */}
      <Widget
        title="Success Widget"
        description="Widget for success states or completed actions"
        icon={ChartBarIcon}
        variant="success"
        size="sm"
      >
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 p-2 rounded-full">
            <ChartBarIcon className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Task Completed</p>
            <p className="text-xs text-gray-500">Successfully processed 100 items</p>
          </div>
        </div>
      </Widget>

      {/* Warning Variant */}
      <Widget
        title="Warning Widget"
        description="Widget for warnings or attention-needed states"
        icon={ExclamationTriangleIcon}
        variant="warning"
        headerActions={
          <Button size="sm" variant="outline" className="text-amber-600 border-amber-300">
            Review
          </Button>
        }
      >
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            <strong>Attention Required:</strong> Some items need your review before proceeding.
          </p>
          <ul className="mt-2 text-xs text-amber-700 list-disc list-inside">
            <li>Check inventory levels</li>
            <li>Verify pricing information</li>
            <li>Update product descriptions</li>
          </ul>
        </div>
      </Widget>

      {/* Danger Variant */}
      <Widget
        title="Error Widget"
        description="Widget for errors or critical issues"
        icon={ExclamationTriangleIcon}
        variant="danger"
        size="lg"
        headerActions={
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            Fix Issues
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-red-800 font-medium">Critical Issues Found</h4>
            <p className="text-red-700 text-sm mt-1">
              The following issues require immediate attention:
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Database connection failed</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">API rate limit exceeded</span>
            </div>
          </div>
        </div>
      </Widget>

      {/* Settings Widget */}
      <Widget
        title="Configuration Settings"
        description="Manage system configuration and preferences"
        icon={CogIcon}
        className="overflow-visible"
        headerActions={
          <Button size="sm" variant="outline">
            Save Changes
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Store Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Enter store name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Currency</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>USD</option>
              <option>EUR</option>
              <option>AED</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Time Zone</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>UTC</option>
              <option>EST</option>
              <option>GST</option>
            </select>
          </div>
        </div>
      </Widget>

      {/* Widget without icon */}
      <Widget
        title="Simple Widget"
        description="Widget without an icon for minimalist design"
      >
        <p className="text-gray-600">
          This widget doesn't have an icon, showing the flexibility of the component.
        </p>
      </Widget>
    </div>
  );
};

export default WidgetExamples;

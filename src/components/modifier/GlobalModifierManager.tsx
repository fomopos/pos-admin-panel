import React, { useState } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Button, InputTextField, DropdownSearch, CompactToggle } from '../ui';
import type { ProductModifier } from '../../services/types/product.types';
import type { DropdownSearchOption } from '../ui/DropdownSearch';

interface GlobalModifierManagerProps {
  template: {
    name: string;
    description?: string;
    selection_type: 'single' | 'multiple' | 'exact' | 'limited';
    exact_selections?: number;
    max_selections?: number;
    min_selections?: number;
    required: boolean;
    sort_order: number;
    price_delta?: number;
    modifiers: ProductModifier[];
  };
  onChange: (template: GlobalModifierManagerProps['template']) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}

const GlobalModifierManager: React.FC<GlobalModifierManagerProps> = ({
  template,
  onChange,
  disabled = false,
  errors
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper function to get error for specific field
  const getFieldError = (fieldName: string): string | undefined => {
    return errors?.[fieldName];
  };

  const selectionTypeOptions: DropdownSearchOption[] = [
    {
      id: 'single',
      label: 'Single Selection',
      description: 'Customer picks one option'
    },
    {
      id: 'multiple', 
      label: 'Multiple Selection',
      description: 'Customer picks multiple options'
    },
    {
      id: 'exact',
      label: 'Exact Selection (specify number)',
      description: 'Customer must pick exactly N options'
    },
    {
      id: 'limited',
      label: 'Limited Selection (min-max range)',
      description: 'Customer picks within a specified range'
    }
  ];

  const updateTemplate = (updates: Partial<GlobalModifierManagerProps['template']>) => {
    onChange({ ...template, ...updates });
  };

  const addModifier = () => {
    const newModifier: ProductModifier = {
      name: '',
      price_delta: 0,
      default_selected: false,
      sort_order: (template.modifiers?.length || 0) + 1
    };
    
    updateTemplate({
      modifiers: [...(template.modifiers || []), newModifier]
    });
  };

  const updateModifier = (modifierIndex: number, updates: Partial<ProductModifier>) => {
    const updatedModifiers = [...(template.modifiers || [])];
    updatedModifiers[modifierIndex] = {
      ...updatedModifiers[modifierIndex],
      ...updates
    };
    updateTemplate({ modifiers: updatedModifiers });
  };

  const removeModifier = (modifierIndex: number) => {
    const updatedModifiers = (template.modifiers || []).filter((_, index) => index !== modifierIndex);
    updateTemplate({ modifiers: updatedModifiers });
  };

  const moveModifier = (modifierIndex: number, direction: 'up' | 'down') => {
    const modifiers = template.modifiers || [];
    if ((direction === 'up' && modifierIndex === 0) || 
        (direction === 'down' && modifierIndex === modifiers.length - 1)) {
      return;
    }

    const updatedModifiers = [...modifiers];
    const targetIndex = direction === 'up' ? modifierIndex - 1 : modifierIndex + 1;
    
    [updatedModifiers[modifierIndex], updatedModifiers[targetIndex]] = 
    [updatedModifiers[targetIndex], updatedModifiers[modifierIndex]];
    
    // Update sort orders
    updatedModifiers.forEach((modifier, index) => {
      modifier.sort_order = index + 1;
    });
    
    updateTemplate({ modifiers: updatedModifiers });
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg bg-white">
        {/* Group Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-left flex-1"
              disabled={disabled}
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
              )}
              <span className="font-medium text-gray-900">
                {template.name || 'Modifier Template'}
              </span>
              <span className="text-sm text-gray-500">
                ({(() => {
                  if (template.selection_type === 'single') return '1 selection';
                  if (template.selection_type === 'multiple') return 'unlimited selections';
                  if (template.selection_type === 'exact') {
                    const exact = template.exact_selections || 1;
                    return `exactly ${exact} selection${exact !== 1 ? 's' : ''}`;
                  }
                  if (template.selection_type === 'limited') {
                    const min = template.min_selections || 0;
                    const max = template.max_selections || '∞';
                    return `${min}-${max} selections`;
                  }
                  return template.selection_type;
                })()}, {template.required ? 'Required' : 'Optional'})
              </span>
            </button>
          </div>
        </div>

        {/* Group Content */}
        {isExpanded && (
          <div className="p-4 space-y-4">
            {/* Group Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div>
                <DropdownSearch
                  label="Selection Type"
                  options={selectionTypeOptions}
                  value={template.selection_type}
                  onSelect={(option) => updateTemplate({ 
                    selection_type: option?.id as any,
                    // Reset related fields when selection type changes
                    exact_selections: option?.id === 'exact' ? 1 : undefined,
                    max_selections: option?.id === 'limited' ? 5 : undefined,
                    min_selections: option?.id === 'limited' ? 0 : undefined
                  })}
                  disabled={disabled}
                  placeholder="Select selection type"
                />
              </div>

              {/* Exact selections field - only show for 'exact' type */}
              {template.selection_type === 'exact' && (
                <div>
                  <InputTextField
                    type="number"
                    label="Exact Selections"
                    value={template.exact_selections?.toString() || '1'}
                    onChange={(value) => updateTemplate({ 
                      exact_selections: parseInt(value) || 1 
                    })}
                    disabled={disabled}
                    helperText="Number of selections required"
                    min={1}
                  />
                </div>
              )}

              {/* Min/Max selections fields - only show for 'limited' type */}
              {template.selection_type === 'limited' && (
                <>
                  <div>
                    <InputTextField
                      type="number"
                      label="Min Selections"
                      value={template.min_selections?.toString() || '0'}
                      onChange={(value) => updateTemplate({ 
                        min_selections: parseInt(value) || 0 
                      })}
                      disabled={disabled}
                      helperText="Minimum required selections"
                      min={0}
                    />
                  </div>
                  <div>
                    <InputTextField
                      type="number"
                      label="Max Selections"
                      value={template.max_selections?.toString() || ''}
                      onChange={(value) => updateTemplate({ 
                        max_selections: parseInt(value) || undefined 
                      })}
                      disabled={disabled}
                      helperText="Maximum allowed selections"
                      min={1}
                    />
                  </div>
                </>
              )}

              <div>
                <InputTextField
                  type="number"
                  label="Sort Order"
                  value={template.sort_order?.toString() || '1'}
                  onChange={(value) => updateTemplate({ 
                    sort_order: parseInt(value) || 1 
                  })}
                  disabled={disabled}
                  helperText="Display order in the menu"
                  min={1}
                />
              </div>

              <div>
                <InputTextField
                  type="number"
                  label="Group Price Delta ($)"
                  value={template.price_delta?.toString() || '0'}
                  onChange={(value) => updateTemplate({ 
                    price_delta: parseFloat(value) || 0 
                  })}
                  disabled={disabled}
                  helperText="Base price adjustment for this group"
                  step={0.01}
                  placeholder="0.00"
                />
              </div>

              <div>
                <CompactToggle
                  label="Required"
                  inlineLabel="Required Group"
                  helperText="Force customer to choose from this group"
                  checked={template.required}
                  onChange={(checked) => updateTemplate({ required: checked })}
                  disabled={disabled}
                />
              </div>
            </div>

            {/* Modifiers List */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-medium text-gray-800">Modifiers</h4>
                <Button
                  type="button"
                  onClick={addModifier}
                  disabled={disabled}
                  size="sm"
                  variant="outline"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Modifier
                </Button>
              </div>

              {(!template.modifiers || template.modifiers.length === 0) ? (
                <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded">
                  <p className="text-sm">No modifiers added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {template.modifiers.map((modifier, modifierIndex) => (
                    <div key={modifierIndex} className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                      {/* Mobile-optimized layout */}
                      <div className="p-4 space-y-3">
                        {/* Input fields and checkbox - responsive grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <InputTextField
                            label="Modifier Name"
                            value={modifier.name}
                            onChange={(value) => updateModifier(modifierIndex, { name: value })}
                            placeholder="e.g., Pepperoni, Large, Spicy"
                            disabled={disabled}
                            required
                            helperText="Display name for this option"
                            error={getFieldError(`modifiers.${modifierIndex}.name`)}
                          />
                          
                          <InputTextField
                            type="number"
                            label="Price Delta ($)"
                            value={modifier.price_delta.toString()}
                            onChange={(value) => updateModifier(modifierIndex, { 
                              price_delta: parseFloat(value) || 0 
                            })}
                            placeholder="0.00"
                            disabled={disabled}
                            step={0.01}
                            helperText="Price adjustment (+/- allowed)"
                            error={getFieldError(`modifiers.${modifierIndex}.price_delta`)}
                          />
                          
                          <InputTextField
                            type="number"
                            label="Sort Order"
                            value={modifier.sort_order.toString()}
                            onChange={(value) => updateModifier(modifierIndex, { 
                              sort_order: parseInt(value) || 1 
                            })}
                            disabled={disabled}
                            helperText="Display order (1, 2, 3...)"
                            min={1}
                          />
                          
                          {/* Compact toggle that matches InputTextField height */}
                          <CompactToggle
                            label="Default Selected"
                            inlineLabel="Pre-selected"
                            helperText="Pre-selected for customers"
                            checked={modifier.default_selected}
                            onChange={(checked) => updateModifier(modifierIndex, { 
                              default_selected: checked 
                            })}
                            disabled={disabled}
                          />
                        </div>
                        
                        {/* Action buttons - centered on mobile, right-aligned on desktop */}
                        <div className="flex justify-center sm:justify-end items-center space-x-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={() => moveModifier(modifierIndex, 'up')}
                            disabled={disabled || modifierIndex === 0}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-md hover:bg-gray-100 transition-colors"
                            title="Move up"
                          >
                            <ArrowUpIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveModifier(modifierIndex, 'down')}
                            disabled={disabled || modifierIndex === (template.modifiers?.length || 0) - 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-md hover:bg-gray-100 transition-colors"
                            title="Move down"
                          >
                            <ArrowDownIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeModifier(modifierIndex)}
                            disabled={disabled}
                            className="p-2 text-red-400 hover:text-red-600 disabled:opacity-30 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete modifier"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalModifierManager;

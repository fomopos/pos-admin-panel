import React, { useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { Button, InputTextField, DropdownSearch, CompactToggle } from '../ui';
import type { ProductModifier, ProductModifierGroup } from '../../services/types/product.types';
import type { DropdownSearchOption } from '../ui/DropdownSearch';

interface ProductModifierManagerProps {
  modifierGroups: ProductModifierGroup[];
  onChange: (modifierGroups: ProductModifierGroup[]) => void;
  disabled?: boolean;
}

const ProductModifierManager: React.FC<ProductModifierManagerProps> = ({
  modifierGroups,
  onChange,
  disabled = false
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  // Selection type options for DropdownSearch
  const selectionTypeOptions: DropdownSearchOption[] = [
    {
      id: 'single',
      label: 'Single Selection (1)',
      description: 'Customer picks exactly one option'
    },
    {
      id: 'multiple',
      label: 'Multiple Selection (unlimited)',
      description: 'Customer can pick any number of options'
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

  const toggleGroupExpansion = (groupIndex: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupIndex)) {
      newExpanded.delete(groupIndex);
    } else {
      newExpanded.add(groupIndex);
    }
    setExpandedGroups(newExpanded);
  };

  const addModifierGroup = () => {
    const newGroup: ProductModifierGroup = {
      name: '',
      selection_type: 'multiple',
      exact_selections: undefined,
      max_selections: undefined,
      min_selections: undefined,
      required: false,
      sort_order: modifierGroups.length + 1,
      price_delta: 0,
      modifiers: []
    };
    onChange([...modifierGroups, newGroup]);
    setExpandedGroups(new Set([...expandedGroups, modifierGroups.length]));
  };

  const updateModifierGroup = (groupIndex: number, updates: Partial<ProductModifierGroup>) => {
    const updatedGroups = [...modifierGroups];
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], ...updates };
    onChange(updatedGroups);
  };

  const removeModifierGroup = (groupIndex: number) => {
    const updatedGroups = modifierGroups.filter((_, index) => index !== groupIndex);
    onChange(updatedGroups);
    const newExpanded = new Set(expandedGroups);
    newExpanded.delete(groupIndex);
    setExpandedGroups(newExpanded);
  };

  const moveModifierGroup = (groupIndex: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && groupIndex === 0) || 
        (direction === 'down' && groupIndex === modifierGroups.length - 1)) {
      return;
    }

    const updatedGroups = [...modifierGroups];
    const targetIndex = direction === 'up' ? groupIndex - 1 : groupIndex + 1;
    
    [updatedGroups[groupIndex], updatedGroups[targetIndex]] = 
    [updatedGroups[targetIndex], updatedGroups[groupIndex]];
    
    // Update sort orders
    updatedGroups.forEach((group, index) => {
      group.sort_order = index + 1;
    });
    
    onChange(updatedGroups);
  };

  const addModifier = (groupIndex: number) => {
    const newModifier: ProductModifier = {
      name: '',
      price_delta: 0,
      default_selected: false,
      sort_order: (modifierGroups[groupIndex]?.modifiers?.length || 0) + 1
    };
    
    const updatedGroups = [...modifierGroups];
    updatedGroups[groupIndex].modifiers = [
      ...(updatedGroups[groupIndex].modifiers || []),
      newModifier
    ];
    onChange(updatedGroups);
  };

  const updateModifier = (groupIndex: number, modifierIndex: number, updates: Partial<ProductModifier>) => {
    const updatedGroups = [...modifierGroups];
    updatedGroups[groupIndex].modifiers[modifierIndex] = {
      ...updatedGroups[groupIndex].modifiers[modifierIndex],
      ...updates
    };
    onChange(updatedGroups);
  };

  const removeModifier = (groupIndex: number, modifierIndex: number) => {
    const updatedGroups = [...modifierGroups];
    updatedGroups[groupIndex].modifiers = updatedGroups[groupIndex].modifiers.filter(
      (_, index) => index !== modifierIndex
    );
    onChange(updatedGroups);
  };

  const moveModifier = (groupIndex: number, modifierIndex: number, direction: 'up' | 'down') => {
    const modifiers = modifierGroups[groupIndex].modifiers;
    if ((direction === 'up' && modifierIndex === 0) || 
        (direction === 'down' && modifierIndex === modifiers.length - 1)) {
      return;
    }

    const updatedGroups = [...modifierGroups];
    const targetIndex = direction === 'up' ? modifierIndex - 1 : modifierIndex + 1;
    
    [updatedGroups[groupIndex].modifiers[modifierIndex], updatedGroups[groupIndex].modifiers[targetIndex]] = 
    [updatedGroups[groupIndex].modifiers[targetIndex], updatedGroups[groupIndex].modifiers[modifierIndex]];
    
    // Update sort orders
    updatedGroups[groupIndex].modifiers.forEach((modifier, index) => {
      modifier.sort_order = index + 1;
    });
    
    onChange(updatedGroups);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Product Modifiers</h3>
        <Button
          type="button"
          onClick={addModifierGroup}
          disabled={disabled}
          size="sm"
          variant="outline"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Modifier Group
        </Button>
      </div>

      {modifierGroups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No modifier groups added yet.</p>
          <p className="text-sm mt-1">Add modifier groups to allow customers to customize this product.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {modifierGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="border border-gray-200 rounded-lg bg-white">
              {/* Group Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleGroupExpansion(groupIndex)}
                    className="flex items-center space-x-2 text-left flex-1"
                    disabled={disabled}
                  >
                    <span className="font-medium text-gray-900">
                      {group.name || `Modifier Group ${groupIndex + 1}`}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({(() => {
                        if (group.selection_type === 'single') return '1 selection';
                        if (group.selection_type === 'multiple') return 'unlimited selections';
                        if (group.selection_type === 'exact') {
                          const exact = group.exact_selections || 1;
                          return `exactly ${exact} selection${exact !== 1 ? 's' : ''}`;
                        }
                        if (group.selection_type === 'limited') {
                          const min = group.min_selections || 0;
                          const max = group.max_selections || '∞';
                          return `${min}-${max} selections`;
                        }
                        return group.selection_type;
                      })()}, {group.required ? 'Required' : 'Optional'})
                    </span>
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => moveModifierGroup(groupIndex, 'up')}
                      disabled={disabled || groupIndex === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveModifierGroup(groupIndex, 'down')}
                      disabled={disabled || groupIndex === modifierGroups.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeModifierGroup(groupIndex)}
                      disabled={disabled}
                      className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Group Content */}
              {expandedGroups.has(groupIndex) && (
                <div className="p-4 space-y-4">
                  {/* Group Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                      <InputTextField
                        label="Group Name"
                        value={group.name}
                        onChange={(value) => updateModifierGroup(groupIndex, { name: value })}
                        placeholder="e.g., Toppings, Size, Spice Level"
                        disabled={disabled}
                        required
                        helperText="Category name for related options"
                      />
                    </div>

                    <div>
                      <DropdownSearch
                        label="Selection Type"
                        value={group.selection_type}
                        options={selectionTypeOptions}
                        onSelect={(option) => {
                          if (!option) return;
                          
                          const newType = option.id as 'single' | 'multiple' | 'exact' | 'limited';
                          const updates: Partial<ProductModifierGroup> = { 
                            selection_type: newType 
                          };
                          
                          // Set defaults based on selection type
                          if (newType === 'single') {
                            updates.max_selections = 1;
                            updates.min_selections = group.required ? 1 : 0;
                            updates.exact_selections = undefined;
                          } else if (newType === 'multiple') {
                            updates.max_selections = undefined;
                            updates.min_selections = group.required ? 1 : 0;
                            updates.exact_selections = undefined;
                          } else if (newType === 'exact') {
                            updates.exact_selections = 2; // Default to 2 exact selections
                            updates.max_selections = undefined;
                            updates.min_selections = undefined;
                          } else if (newType === 'limited') {
                            updates.max_selections = 3;
                            updates.min_selections = group.required ? 1 : 0;
                            updates.exact_selections = undefined;
                          }
                          
                          updateModifierGroup(groupIndex, updates);
                        }}
                        disabled={disabled}
                        placeholder="Choose selection type"
                        closeOnSelect={true}
                        allowClear={false}
                        displayValue={(option) => option?.label || 'Select selection type'}
                        renderOption={(option) => (
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            {option.description && (
                              <span className="text-xs text-gray-500">{option.description}</span>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* Selection Configuration Fields */}
                    {group.selection_type === 'exact' && (
                      <div>
                        <InputTextField
                          type="number"
                          label="Exact Selections"
                          value={group.exact_selections?.toString() || '2'}
                          onChange={(value) => updateModifierGroup(groupIndex, { 
                            exact_selections: parseInt(value) || 2 
                          })}
                          disabled={disabled}
                          helperText="Exact number of choices required"
                          min={1}
                          required
                        />
                      </div>
                    )}

                    {group.selection_type === 'limited' && (
                      <>
                        <div>
                          <InputTextField
                            type="number"
                            label="Min Selections"
                            value={group.min_selections?.toString() || '0'}
                            onChange={(value) => updateModifierGroup(groupIndex, { 
                              min_selections: parseInt(value) || 0 
                            })}
                            disabled={disabled}
                            helperText="Minimum choices required"
                            min={0}
                          />
                        </div>
                        
                        <div>
                          <InputTextField
                            type="number"
                            label="Max Selections"
                            value={group.max_selections?.toString() || ''}
                            onChange={(value) => updateModifierGroup(groupIndex, { 
                              max_selections: parseInt(value) || undefined 
                            })}
                            disabled={disabled}
                            helperText="Maximum choices allowed"
                            min={1}
                            required
                          />
                        </div>
                      </>
                    )}

                    {/* Show info for single/multiple selection types */}
                    {(group.selection_type === 'single' || group.selection_type === 'multiple') && (
                      <div className="flex flex-col justify-center">
                        <div className="text-sm text-gray-600">
                          {group.selection_type === 'single' ? (
                            <>
                              <span className="font-medium">1</span> selection allowed
                            </>
                          ) : (
                            <>
                              <span className="font-medium">Unlimited</span> selections
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {group.selection_type === 'single' ? 'Customer picks one option' : 'Customer can pick multiple options'}
                        </p>
                      </div>
                    )}

                    <div>
                      <InputTextField
                        type="number"
                        label="Sort Order"
                        value={group.sort_order.toString()}
                        onChange={(value) => updateModifierGroup(groupIndex, { 
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
                        value={group.price_delta?.toString() || '0'}
                        onChange={(value) => updateModifierGroup(groupIndex, { 
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
                        checked={group.required}
                        onChange={(checked) => updateModifierGroup(groupIndex, { required: checked })}
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
                        onClick={() => addModifier(groupIndex)}
                        disabled={disabled}
                        size="sm"
                        variant="outline"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Modifier
                      </Button>
                    </div>

                    {group.modifiers.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded">
                        <p className="text-sm">No modifiers added yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {group.modifiers.map((modifier, modifierIndex) => (
                          <div key={modifierIndex} className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                            {/* Mobile-optimized layout */}
                            <div className="p-4 space-y-3">
                              {/* Input fields and checkbox - responsive grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <InputTextField
                                  label="Modifier Name"
                                  value={modifier.name}
                                  onChange={(value) => updateModifier(groupIndex, modifierIndex, { name: value })}
                                  placeholder="e.g., Pepperoni, Large, Spicy"
                                  disabled={disabled}
                                  required
                                  helperText="Display name for this option"
                                />
                                
                                <InputTextField
                                  type="number"
                                  label="Price Delta ($)"
                                  value={modifier.price_delta.toString()}
                                  onChange={(value) => updateModifier(groupIndex, modifierIndex, { 
                                    price_delta: parseFloat(value) || 0 
                                  })}
                                  placeholder="0.00"
                                  disabled={disabled}
                                  step={0.01}
                                  helperText="Price adjustment (+/- allowed)"
                                />
                                
                                <InputTextField
                                  type="number"
                                  label="Sort Order"
                                  value={modifier.sort_order.toString()}
                                  onChange={(value) => updateModifier(groupIndex, modifierIndex, { 
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
                                  onChange={(checked) => updateModifier(groupIndex, modifierIndex, { 
                                    default_selected: checked 
                                  })}
                                  disabled={disabled}
                                />
                              </div>
                              
                              {/* Action buttons - centered on mobile, right-aligned on desktop */}
                              <div className="flex justify-center sm:justify-end items-center space-x-2 pt-2 border-t border-gray-200">
                                <button
                                  type="button"
                                  onClick={() => moveModifier(groupIndex, modifierIndex, 'up')}
                                  disabled={disabled || modifierIndex === 0}
                                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-md hover:bg-gray-100 transition-colors"
                                  title="Move up"
                                >
                                  <ArrowUpIcon className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveModifier(groupIndex, modifierIndex, 'down')}
                                  disabled={disabled || modifierIndex === group.modifiers.length - 1}
                                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-md hover:bg-gray-100 transition-colors"
                                  title="Move down"
                                >
                                  <ArrowDownIcon className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeModifier(groupIndex, modifierIndex)}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductModifierManager;

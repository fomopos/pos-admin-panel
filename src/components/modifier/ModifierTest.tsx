import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import type { ProductModifier } from '../../services/types/product.types';

const ModifierTest: React.FC = () => {
  const [modifiers, setModifiers] = useState<ProductModifier[]>([]);

  const addModifier = () => {
    console.log('Add modifier clicked');
    const newModifier: ProductModifier = {
      name: `Modifier ${modifiers.length + 1}`,
      price_delta: 0,
      default_selected: false,
      sort_order: modifiers.length + 1
    };
    
    setModifiers(prev => [...prev, newModifier]);
  };

  return (
    <div className="p-6 bg-white border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Modifier Test</h2>
      
      <div className="flex justify-between items-center mb-4">
        <span>Modifiers ({modifiers.length})</span>
        <Button onClick={addModifier} size="sm" variant="outline">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Modifier
        </Button>
      </div>

      <div className="space-y-2">
        {modifiers.map((modifier, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded border">
            <div>Name: {modifier.name}</div>
            <div>Price Delta: {modifier.price_delta}</div>
            <div>Sort Order: {modifier.sort_order}</div>
          </div>
        ))}
        
        {modifiers.length === 0 && (
          <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded">
            No modifiers added yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ModifierTest;

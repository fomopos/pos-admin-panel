import React, { useState } from 'react';

// Simple test component to verify tags input functionality
export const TagsInputTest: React.FC = () => {
  const [tagsString, setTagsString] = useState('');
  const [tagsArray, setTagsArray] = useState<string[]>([]);

  const handleInputChange = (value: string) => {
    setTagsString(value);
    const tags = value.split(',').map(t => t.trim()).filter(t => t);
    setTagsArray(tags);
  };

  return (
    <div className="p-4 border rounded-lg max-w-md">
      <h3 className="text-lg font-semibold mb-4">Tags Input Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Test Input (try typing commas and spaces):
          </label>
          <input
            type="text"
            value={tagsString}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="electronics, premium, wireless"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Raw Input Value:
          </label>
          <pre className="bg-gray-100 p-2 rounded text-xs">{JSON.stringify(tagsString)}</pre>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Parsed Tags ({tagsArray.length}):
          </label>
          <div className="flex flex-wrap gap-1">
            {tagsArray.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsInputTest;

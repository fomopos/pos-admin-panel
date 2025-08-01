import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
}

export const TagsInput: React.FC<TagsInputProps> = ({
  tags = [],
  onChange,
  placeholder = "Add tags...",
  className = "",
  maxTags = 20,
  allowDuplicates = false
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tagValue: string) => {
    const trimmedTag = tagValue.trim();
    
    if (!trimmedTag) return;
    
    // Check for duplicates if not allowed
    if (!allowDuplicates && tags.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase())) {
      return;
    }
    
    // Check max tags limit
    if (tags.length >= maxTags) {
      return;
    }
    
    const newTags = [...tags, trimmedTag];
    onChange(newTags);
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
      case ',':
        e.preventDefault();
        addTag(inputValue);
        break;
      case 'Backspace':
        if (!inputValue && tags.length > 0) {
          removeTag(tags.length - 1);
        }
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // If user types a comma, add the tag
    if (value.includes(',')) {
      const newTag = value.split(',')[0];
      addTag(newTag);
      return;
    }
    
    setInputValue(value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedTags = pastedText.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    pastedTags.forEach(tag => addTag(tag));
  };

  return (
    <div className={`border border-gray-300 rounded-md p-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 ${className}`}>
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="w-full border-none outline-none focus:ring-0 text-sm"
        placeholder={tags.length === 0 ? placeholder : "Add another tag..."}
        disabled={tags.length >= maxTags}
      />
      
      <div className="text-xs text-gray-500 mt-1">
        Press Enter or comma to add tags. {tags.length}/{maxTags} tags used.
      </div>
    </div>
  );
};

export default TagsInput;

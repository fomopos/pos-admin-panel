import React from 'react';
import { useTranslation } from 'react-i18next';

const TranslationTest: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Translation Test</h2>
      
      <div className="space-y-2">
        <div>
          <strong>Nested Key Test:</strong>
          <p>categories.templates.title: "{t('categories.templates.title')}"</p>
          <p>categories.create.fields.name: "{t('categories.create.fields.name')}"</p>
          <p>categories.create.tabs.basic: "{t('categories.create.tabs.basic')}"</p>
        </div>
        
        <div className="mt-4">
          <strong>Regular Key Test:</strong>
          <p>categories.title: "{t('categories.title')}"</p>
          <p>common.save: "{t('common.save')}"</p>
        </div>
        
        <div className="mt-4">
          <strong>Missing Key Test (should show key):</strong>
          <p>categories.nonexistent.key: "{t('categories.nonexistent.key')}"</p>
        </div>
      </div>
    </div>
  );
};

export default TranslationTest;

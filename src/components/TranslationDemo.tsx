import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from './ui/Card';
import LanguageSwitcher from './ui/LanguageSwitcher';

const TranslationDemo: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Translation Demo</h2>
        <LanguageSwitcher showLabel />
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Navigation</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Dashboard:</strong> {t('nav.dashboard')}</li>
              <li><strong>Products:</strong> {t('nav.products')}</li>
              <li><strong>Categories:</strong> {t('nav.categories')}</li>
              <li><strong>Sales:</strong> {t('nav.sales')}</li>
              <li><strong>Customers:</strong> {t('nav.customers')}</li>
              <li><strong>Settings:</strong> {t('nav.settings')}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Common Actions</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Save:</strong> {t('common.save')}</li>
              <li><strong>Cancel:</strong> {t('common.cancel')}</li>
              <li><strong>Delete:</strong> {t('common.delete')}</li>
              <li><strong>Edit:</strong> {t('common.edit')}</li>
              <li><strong>Add:</strong> {t('common.add')}</li>
              <li><strong>Search:</strong> {t('common.search')}</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-700 mb-2">Page Titles</h3>
          <ul className="space-y-1 text-sm">
            <li><strong>Dashboard:</strong> {t('dashboard.title')}</li>
            <li><strong>Products:</strong> {t('products.title')}</li>
            <li><strong>Add Product:</strong> {t('products.addProduct')}</li>
          </ul>
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-sm text-slate-600">
            <strong>Current Language:</strong> {i18n.language} | 
            <strong> Resolved Language:</strong> {i18n.resolvedLanguage}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default TranslationDemo;

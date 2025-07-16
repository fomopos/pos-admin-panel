import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const I18nTestPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">i18n Test Page</h1>
            <LanguageSwitcher showLabel={true} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Navigation translations */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-900">Navigation</h2>
              <ul className="space-y-2">
                <li><span className="font-medium">Dashboard:</span> {t('nav.dashboard')}</li>
                <li><span className="font-medium">Products:</span> {t('nav.products')}</li>
                <li><span className="font-medium">Categories:</span> {t('nav.categories')}</li>
                <li><span className="font-medium">Orders:</span> {t('nav.orders')}</li>
                <li><span className="font-medium">Customers:</span> {t('nav.customers')}</li>
                <li><span className="font-medium">Reports:</span> {t('nav.reports')}</li>
                <li><span className="font-medium">Settings:</span> {t('nav.settings')}</li>
                <li><span className="font-medium">Sales:</span> {t('nav.sales')}</li>
              </ul>
            </div>
            
            {/* Common translations */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-green-900">Common Actions</h2>
              <ul className="space-y-2">
                <li><span className="font-medium">Cancel:</span> {t('common.cancel')}</li>
                <li><span className="font-medium">Save:</span> {t('common.save')}</li>
                <li><span className="font-medium">Delete:</span> {t('common.delete')}</li>
                <li><span className="font-medium">Edit:</span> {t('common.edit')}</li>
                <li><span className="font-medium">Create:</span> {t('common.create')}</li>
                <li><span className="font-medium">Refresh:</span> {t('common.refresh')}</li>
                <li><span className="font-medium">Search:</span> {t('common.search')}</li>
                <li><span className="font-medium">Loading:</span> {t('common.loading')}</li>
              </ul>
            </div>
            
            {/* Categories translations */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-purple-900">Categories</h2>
              <ul className="space-y-2">
                <li><span className="font-medium">Title:</span> {t('categories.title')}</li>
                <li><span className="font-medium">Subtitle:</span> {t('categories.subtitle')}</li>
                <li><span className="font-medium">New Category:</span> {t('categories.newCategory')}</li>
                <li><span className="font-medium">Edit Category:</span> {t('categories.editCategory')}</li>
                <li><span className="font-medium">Create Title:</span> {t('categories.create.title')}</li>
                <li><span className="font-medium">Search:</span> {t('categories.search.placeholder')}</li>
              </ul>
            </div>
            
            {/* Discounts translations */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-yellow-900">Discounts</h2>
              <ul className="space-y-2">
                <li><span className="font-medium">Title:</span> {t('discounts.title')}</li>
                <li><span className="font-medium">Description:</span> {t('discounts.description')}</li>
                <li><span className="font-medium">Add:</span> {t('discounts.add')}</li>
                <li><span className="font-medium">Empty Title:</span> {t('discounts.empty.title')}</li>
                <li><span className="font-medium">Search:</span> {t('discounts.search.placeholder')}</li>
                <li><span className="font-medium">No Results:</span> {t('discounts.noResults')}</li>
              </ul>
            </div>
          </div>
          
          {/* Language Information */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Language Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium">Current Language:</span> {i18n.language}
              </div>
              <div>
                <span className="font-medium">Document Direction:</span> {document.dir || 'ltr'}
              </div>
              <div>
                <span className="font-medium">HTML Lang Attribute:</span> {document.documentElement.lang}
              </div>
            </div>
          </div>
          
          {/* RTL Test */}
          {document.dir === 'rtl' && (
            <div className="mt-6 bg-red-50 p-4 rounded-lg border-r-4 border-red-400">
              <h2 className="text-xl font-semibold mb-2 text-red-900">RTL Mode Active</h2>
              <p className="text-red-700">This message appears when an RTL language (like Arabic) is selected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default I18nTestPage;
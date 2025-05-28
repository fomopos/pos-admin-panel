import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const TranslationDemo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('demo.title')}</h1>
        <LanguageSwitcher />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('nav.dashboard')}</h2>
          <p className="text-gray-600">{t('dashboard.title')}</p>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('nav.products')}</h2>
          <p className="text-gray-600">{t('products.title')}</p>
          <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {t('products.addProduct')}
          </button>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('nav.sales')}</h2>
          <p className="text-gray-600">{t('sales.title')}</p>
        </Card>
      </div>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('demo.features')}</h2>
        <ul className="space-y-2 text-gray-600">
          <li>• {t('demo.feature1')}</li>
          <li>• {t('demo.feature2')}</li>
          <li>• {t('demo.feature3')}</li>
        </ul>
      </Card>
    </div>
  );
};

export default TranslationDemo;
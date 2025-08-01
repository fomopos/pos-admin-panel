import React, { useState } from 'react';
import { useTenantStore } from '../tenants/tenantStore';
import { useCurrencyFormatter, getCurrencySymbol, useStoreCurrency } from '../utils/currencyUtils';

const CurrencyTest: React.FC = () => {
  const { currentStore } = useTenantStore();
  const formatCurrency = useCurrencyFormatter();
  const storeCurrency = useStoreCurrency();
  const [testAmount, setTestAmount] = useState(99.99);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Currency Test</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <strong>Current Store:</strong> {currentStore?.store_name || 'No store selected'}
        </div>
        <div>
          <strong>Store Currency:</strong> {currentStore?.currency || 'USD'}
        </div>
        <div>
          <strong>Currency Symbol:</strong> {getCurrencySymbol(storeCurrency)}
        </div>
        <div>
          <strong>Store Locale:</strong> {currentStore?.locale || 'en-US'}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Amount:
        </label>
        <input
          type="number"
          step="0.01"
          value={testAmount}
          onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
          className="border border-gray-300 rounded-md px-3 py-2 w-32"
        />
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Formatted Currency (using store settings):</h3>
          <div className="text-xl text-green-600 font-bold">
            {formatCurrency(testAmount)}
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Different Currency Examples:</h3>
          <div className="space-y-2">
            <div>USD: {getCurrencySymbol('USD')}{testAmount.toFixed(2)}</div>
            <div>EUR: {getCurrencySymbol('EUR')}{testAmount.toFixed(2)}</div>
            <div>GBP: {getCurrencySymbol('GBP')}{testAmount.toFixed(2)}</div>
            <div>INR: {getCurrencySymbol('INR')}{testAmount.toFixed(2)}</div>
            <div>AED: {getCurrencySymbol('AED')}{testAmount.toFixed(2)}</div>
            <div>JPY: {getCurrencySymbol('JPY')}{testAmount.toFixed(0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyTest;

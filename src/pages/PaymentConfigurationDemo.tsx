import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { paymentServices } from '../services/payment';
import type { 
  Tender, 
  PaymentConfiguration, 
  CreateTenderRequest,
  CreatePaymentConfigurationRequest 
} from '../services/types/payment.types';

const PaymentConfigurationDemo: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Demo: Get all tenders
  const handleGetTenders = async () => {
    setIsLoading(true);
    addLog('Fetching all tenders...');
    try {
      const result = await paymentServices.tender.getMockTenders();
      setTenders(result);
      addLog(`Successfully fetched ${result.length} tenders`);
    } catch (error) {
      addLog(`Error fetching tenders: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo: Create a new tender
  const handleCreateTender = async () => {
    setIsLoading(true);
    addLog('Creating new tender...');
    
    const newTender: CreateTenderRequest = {
      tender_id: `demo_${Date.now()}`,
      type_code: 'mobile_payment',
      currency_id: 'usd',
      description: 'Demo Mobile Payment',
      over_tender_allowed: false,
      availability: ['sale', 'return']
    };

    try {
      const result = await paymentServices.tender.createTender(newTender);
      addLog(`Successfully created tender: ${result.tender_id}`);
      // Update local state
      setTenders(prev => [...prev, result]);
    } catch (error) {
      addLog(`Error creating tender: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo: Get payment configuration
  const handleGetPaymentConfig = async () => {
    setIsLoading(true);
    addLog('Fetching payment configuration...');
    try {
      const result = await paymentServices.configuration.getMockPaymentConfiguration();
      setPaymentConfig(result);
      addLog(`Successfully fetched payment configuration for tenant: ${result.tenant_id}`);
    } catch (error) {
      addLog(`Error fetching payment configuration: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo: Create payment configuration
  const handleCreatePaymentConfig = async () => {
    setIsLoading(true);
    addLog('Creating payment configuration...');
    
    const configRequest: CreatePaymentConfigurationRequest = {
      tenant_id: 'demo_tenant',
      store_id: 'demo_store',
      tenders: [
        {
          tender_id: 'cash_demo',
          type_code: 'cash',
          currency_id: 'usd',
          description: 'Demo Cash',
          over_tender_allowed: true,
          availability: ['sale', 'return']
        },
        {
          tender_id: 'card_demo',
          type_code: 'credit_card',
          currency_id: 'usd',
          description: 'Demo Credit Card',
          over_tender_allowed: false,
          availability: ['sale', 'return']
        }
      ],
      default_tender_id: 'cash_demo'
    };

    try {
      const result = await paymentServices.configuration.createPaymentConfiguration(configRequest);
      setPaymentConfig(result);
      addLog(`Successfully created payment configuration with ${result.tenders.length} tenders`);
    } catch (error) {
      addLog(`Error creating payment configuration: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo: Get payment statistics
  const handleGetStats = async () => {
    setIsLoading(true);
    addLog('Fetching payment statistics...');
    try {
      const stats = await paymentServices.configuration.getPaymentConfigurationStats('demo_tenant', 'demo_store');
      addLog(`Statistics - Total: ${stats.totalTenders}, Active: ${stats.activeTenders}, Currencies: ${stats.supportedCurrencies.length}`);
    } catch (error) {
      addLog(`Error fetching statistics: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo: Update tender
  const handleUpdateTender = async () => {
    if (tenders.length === 0) {
      addLog('No tenders available to update. Fetch tenders first.');
      return;
    }

    setIsLoading(true);
    const firstTender = tenders[0];
    addLog(`Updating tender: ${firstTender.tender_id}...`);
    
    try {
      const updatedTender = await paymentServices.tender.updateTender(firstTender.tender_id, {
        tender_id: firstTender.tender_id,
        description: `Updated ${firstTender.description} - ${new Date().toLocaleTimeString()}`
      });
      
      setTenders(prev => prev.map(t => 
        t.tender_id === firstTender.tender_id ? updatedTender : t
      ));
      addLog(`Successfully updated tender: ${updatedTender.tender_id}`);
    } catch (error) {
      addLog(`Error updating tender: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo: Toggle tender status
  const handleToggleStatus = async () => {
    if (tenders.length === 0) {
      addLog('No tenders available to toggle. Fetch tenders first.');
      return;
    }

    setIsLoading(true);
    const firstTender = tenders[0];
    const newStatus = !firstTender.is_active;
    addLog(`Toggling tender status to: ${newStatus ? 'active' : 'inactive'}...`);
    
    try {
      const updatedTender = await paymentServices.tender.toggleTenderStatus(firstTender.tender_id, newStatus);
      
      setTenders(prev => prev.map(t => 
        t.tender_id === firstTender.tender_id ? updatedTender : t
      ));
      addLog(`Successfully toggled tender status`);
    } catch (error) {
      addLog(`Error toggling tender status: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo: Get tenders by type
  const handleGetTendersByType = async () => {
    setIsLoading(true);
    addLog('Fetching tenders by type (credit_card)...');
    try {
      const result = await paymentServices.tender.getTendersByType('credit_card');
      addLog(`Found ${result.length} credit card tenders`);
    } catch (error) {
      addLog(`Error fetching tenders by type: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Configuration API Demo
        </h1>
        <p className="text-gray-600">
          This demo showcases all the payment configuration API methods following the established patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Demo Controls */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Methods</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleGetTenders} 
                disabled={isLoading}
                className="text-sm"
              >
                Get Tenders
              </Button>
              <Button 
                onClick={handleCreateTender} 
                disabled={isLoading}
                className="text-sm"
              >
                Create Tender
              </Button>
              <Button 
                onClick={handleUpdateTender} 
                disabled={isLoading || tenders.length === 0}
                className="text-sm"
              >
                Update Tender
              </Button>
              <Button 
                onClick={handleToggleStatus} 
                disabled={isLoading || tenders.length === 0}
                className="text-sm"
              >
                Toggle Status
              </Button>
              <Button 
                onClick={handleGetTendersByType} 
                disabled={isLoading}
                className="text-sm"
              >
                Get by Type
              </Button>
              <Button 
                onClick={handleGetPaymentConfig} 
                disabled={isLoading}
                className="text-sm"
              >
                Get Config
              </Button>
              <Button 
                onClick={handleCreatePaymentConfig} 
                disabled={isLoading}
                className="text-sm"
              >
                Create Config
              </Button>
              <Button 
                onClick={handleGetStats} 
                disabled={isLoading}
                className="text-sm"
              >
                Get Statistics
              </Button>
            </div>
          </div>
        </Card>

        {/* API Response Logs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Logs</h2>
          <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
            <div className="space-y-1">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">No API calls yet. Click a button to start.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-gray-700">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
          <Button 
            onClick={() => setLogs([])} 
            variant="outline" 
            size="sm" 
            className="mt-3"
          >
            Clear Logs
          </Button>
        </Card>
      </div>

      {/* Data Display */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenders Data */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Loaded Tenders ({tenders.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tenders.length === 0 ? (
              <p className="text-gray-500 text-sm">No tenders loaded. Click "Get Tenders" to load data.</p>
            ) : (
              tenders.map((tender) => (
                <div key={tender.tender_id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{tender.description}</h3>
                      <p className="text-sm text-gray-600">
                        ID: {tender.tender_id} | Type: {tender.type_code}
                      </p>
                      <p className="text-sm text-gray-600">
                        Currency: {tender.currency_id.toUpperCase()} | 
                        Over Tender: {tender.over_tender_allowed ? 'Yes' : 'No'}
                      </p>
                      <div className="mt-1 flex space-x-1">
                        {tender.availability.map(avail => (
                          <span 
                            key={avail}
                            className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800"
                          >
                            {avail}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      tender.is_active !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tender.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Payment Configuration Data */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Payment Configuration
          </h2>
          {paymentConfig ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-900">Configuration Details</h3>
                <p className="text-sm text-gray-600">Tenant: {paymentConfig.tenant_id}</p>
                <p className="text-sm text-gray-600">Store: {paymentConfig.store_id}</p>
                <p className="text-sm text-gray-600">Default Tender: {paymentConfig.default_tender_id}</p>
                <p className="text-sm text-gray-600">Total Tenders: {paymentConfig.tenders.length}</p>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {paymentConfig.tenders.map((tender) => (
                  <div key={tender.tender_id} className="border rounded p-2 bg-white">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{tender.description}</span>
                      <span className="text-xs text-gray-500">{tender.type_code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No configuration loaded. Click "Get Config" or "Create Config" to load data.
            </p>
          )}
        </Card>
      </div>

      {/* Code Examples */}
      <Card className="mt-8 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Code Examples</h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`// Import payment services
import { paymentServices } from '../services/payment';

// Get all tenders
const tenders = await paymentServices.tender.getTenders();

// Create a new tender
const newTender = await paymentServices.tender.createTender({
  tender_id: "cash",
  type_code: "cash", 
  currency_id: "aed",
  description: "Cash",
  over_tender_allowed: true,
  availability: ["sale", "return"]
});

// Update tender
const updated = await paymentServices.tender.updateTender("cash", {
  tender_id: "cash",
  description: "Updated Cash Description"
});

// Toggle tender status
const toggled = await paymentServices.tender.toggleTenderStatus("cash", false);

// Get payment configuration
const config = await paymentServices.configuration.getPaymentConfiguration({
  tenant_id: "272e",
  store_id: "*"
});

// Create payment configuration
const newConfig = await paymentServices.configuration.createPaymentConfiguration({
  tenant_id: "272e",
  store_id: "*",
  tenders: [...],
  default_tender_id: "cash"
});`}
          </pre>
        </div>
      </Card>
    </div>
  );
};

export default PaymentConfigurationDemo;

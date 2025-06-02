import React, { useEffect, useState } from 'react';
import { useTenantStore } from '../tenants/tenantStore';
import { authService } from '../auth/authService';

/**
 * LogoutTestComponent - A component to test logout data clearing functionality
 * 
 * This component provides:
 * 1. Visual display of current tenant store state
 * 2. Manual logout button for testing
 * 3. Data clearing verification
 * 4. Real-time state monitoring
 */
const LogoutTestComponent: React.FC = () => {
  const {
    tenants,
    currentTenant,
    currentStore,
    isLoading,
    error,
    clearAllData
  } = useTenantStore();

  const [testResults, setTestResults] = useState<{
    beforeLogout?: any;
    afterLogout?: any;
    isCleared?: boolean;
  }>({});

  const [isTestRunning, setIsTestRunning] = useState(false);

  // Capture current state for testing
  const captureCurrentState = () => {
    return {
      tenants: tenants.length,
      currentTenant: currentTenant?.name || null,
      currentStore: currentStore?.store_name || null,
      isLoading,
      error,
      timestamp: new Date().toISOString()
    };
  };

  // Test logout data clearing
  const testLogoutDataClearing = async () => {
    setIsTestRunning(true);
    console.log('🧪 Starting logout data clearing test...');

    try {
      // Capture state before logout
      const beforeState = captureCurrentState();
      console.log('📊 State before logout:', beforeState);

      setTestResults(prev => ({ ...prev, beforeLogout: beforeState }));

      // Perform logout
      console.log('🚪 Performing logout...');
      await authService.signOut();

      // Wait a moment for state to update
      setTimeout(() => {
        const afterState = captureCurrentState();
        console.log('📊 State after logout:', afterState);

        // Check if data was cleared
        const isCleared = 
          afterState.tenants === 0 && 
          afterState.currentTenant === null && 
          afterState.currentStore === null;

        console.log(`${isCleared ? '✅' : '❌'} Data clearing test result: ${isCleared ? 'PASSED' : 'FAILED'}`);

        setTestResults({
          beforeLogout: beforeState,
          afterLogout: afterState,
          isCleared
        });

        setIsTestRunning(false);
      }, 1000);

    } catch (error) {
      console.error('❌ Logout test error:', error);
      setIsTestRunning(false);
    }
  };

  // Manual data clearing test (without full logout)
  const testManualDataClearing = () => {
    console.log('🧹 Testing manual data clearing...');
    const beforeState = captureCurrentState();
    
    clearAllData();
    
    setTimeout(() => {
      const afterState = captureCurrentState();
      const isCleared = 
        afterState.tenants === 0 && 
        afterState.currentTenant === null && 
        afterState.currentStore === null;

      console.log(`${isCleared ? '✅' : '❌'} Manual clearing test result: ${isCleared ? 'PASSED' : 'FAILED'}`);
      
      setTestResults({
        beforeLogout: beforeState,
        afterLogout: afterState,
        isCleared
      });
    }, 100);
  };

  // Make store accessible globally for browser testing
  useEffect(() => {
    (window as any).useTenantStore = useTenantStore;
    (window as any).authService = authService;
    (window as any).testLogoutDataClearing = testLogoutDataClearing;
    (window as any).testManualDataClearing = testManualDataClearing;
    
    console.log('🔧 LogoutTestComponent: Made tenant store and auth service available globally');
    
    return () => {
      delete (window as any).useTenantStore;
      delete (window as any).authService;
      delete (window as any).testLogoutDataClearing;
      delete (window as any).testManualDataClearing;
    };
  }, []);

  return (
    <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        🧪 Logout Data Clearing Test Component
      </h2>
      
      {/* Current State Display */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="text-lg font-semibold mb-2">📊 Current Tenant Store State</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Tenants Count:</strong> 
            <span className={`ml-2 px-2 py-1 rounded ${tenants.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {tenants.length}
            </span>
          </div>
          <div>
            <strong>Current Tenant:</strong> 
            <span className={`ml-2 px-2 py-1 rounded ${currentTenant ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
              {currentTenant?.name || 'None'}
            </span>
          </div>
          <div>
            <strong>Current Store:</strong> 
            <span className={`ml-2 px-2 py-1 rounded ${currentStore ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
              {currentStore?.store_name || 'None'}
            </span>
          </div>
          <div>
            <strong>Loading:</strong> 
            <span className={`ml-2 px-2 py-1 rounded ${isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
              {isLoading ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="text-lg font-semibold mb-2">🎮 Test Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testLogoutDataClearing}
            disabled={isTestRunning}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTestRunning ? '🔄 Testing Logout...' : '🚪 Test Full Logout'}
          </button>
          
          <button
            onClick={testManualDataClearing}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            🧹 Test Manual Clear
          </button>
          
          <button
            onClick={() => setTestResults({})}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            🗑️ Clear Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      {(testResults.beforeLogout || testResults.afterLogout) && (
        <div className="p-4 bg-white rounded border">
          <h3 className="text-lg font-semibold mb-2">📋 Test Results</h3>
          
          {testResults.isCleared !== undefined && (
            <div className={`mb-3 p-3 rounded ${testResults.isCleared ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>{testResults.isCleared ? '✅ TEST PASSED' : '❌ TEST FAILED'}</strong>
              <span className="ml-2">
                {testResults.isCleared 
                  ? 'All data was properly cleared on logout'
                  : 'Some data was not cleared properly'
                }
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {testResults.beforeLogout && (
              <div>
                <h4 className="font-semibold mb-1">Before Logout:</h4>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(testResults.beforeLogout, null, 2)}
                </pre>
              </div>
            )}
            
            {testResults.afterLogout && (
              <div>
                <h4 className="font-semibold mb-1">After Logout:</h4>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(testResults.afterLogout, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Browser Console Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">🖥️ Browser Console Testing</h3>
        <p className="text-sm text-blue-700 mb-2">
          The following functions are available in the browser console:
        </p>
        <ul className="text-xs text-blue-600 space-y-1 font-mono">
          <li>• <code>window.useTenantStore</code> - Access the tenant store directly</li>
          <li>• <code>window.authService</code> - Access the auth service</li>
          <li>• <code>window.testLogoutDataClearing()</code> - Run full logout test</li>
          <li>• <code>window.testManualDataClearing()</code> - Run manual clear test</li>
          <li>• <code>window.runLogoutTest()</code> - Run comprehensive test suite</li>
        </ul>
      </div>
    </div>
  );
};

export default LogoutTestComponent;

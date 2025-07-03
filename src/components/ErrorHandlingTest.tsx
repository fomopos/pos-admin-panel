import React from 'react';
import { useError } from '../hooks/useError';

/**
 * Simple test component to verify error handling works without infinite recursion
 */
export const ErrorHandlingTest: React.FC = () => {
  const { showError, showSuccess, showWarning, showInfo } = useError();

  const testBasicErrors = () => {
    showInfo('Info test - this should appear as a blue toast');
    setTimeout(() => showWarning('Warning test - this should appear as a yellow toast'), 1000);
    setTimeout(() => showError(new Error('Error test - this should appear as a red toast')), 2000);
    setTimeout(() => showSuccess('Success test - this should appear as a green toast'), 3000);
  };

  const testRecursionBug = () => {
    // This used to cause infinite recursion
    console.error('This is a test console.error that should not cause infinite recursion');
    showSuccess('Console.error test completed - no recursion!');
  };

  const testErrorBoundary = () => {
    // This will trigger an error boundary
    throw new Error('Test error boundary - this should be caught');
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Error Handling Tests</h2>
      
      <div className="space-y-3">
        <button
          onClick={testBasicErrors}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Test Basic Error Types
        </button>
        
        <button
          onClick={testRecursionBug}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Test Recursion Fix
        </button>
        
        <button
          onClick={testErrorBoundary}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Test Error Boundary
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Open browser dev tools to see console output.</p>
        <p>Toasts should appear in the top-right corner.</p>
      </div>
    </div>
  );
};

export default ErrorHandlingTest;

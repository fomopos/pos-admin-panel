import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import './auth/config'; // Initialize AWS Cognito
import i18n from './i18n';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import SignIn from './pages/auth/SignIn';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductEdit from './pages/ProductEdit';
import Categories from './pages/Categories';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import TranslationDemo from './pages/TranslationDemo';
import TaxSettings from './pages/TaxSettings';
import PaymentSettings from './pages/PaymentSettings';
import PaymentAnalyticsDashboard from './pages/PaymentAnalyticsDashboard';
import StoreSettings from './pages/StoreSettings';

// Placeholder components for other pages
const Settings: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
    <p className="text-gray-600">Settings coming soon...</p>
  </div>
);

const SignUp: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full">
      <h1 className="text-2xl font-bold text-center mb-4">Sign Up</h1>
      <p className="text-center text-gray-600">Sign up functionality coming soon...</p>
    </div>
  </div>
);

const ForgotPassword: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full">
      <h1 className="text-2xl font-bold text-center mb-4">Forgot Password</h1>
      <p className="text-center text-gray-600">Password reset functionality coming soon...</p>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    // Initialize the app
    console.log('POS Admin Panel initialized');
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<ProductEdit />} />
              <Route path="products/edit/:id" element={<ProductEdit />} />
              <Route path="categories" element={<Categories />} />
              <Route path="sales" element={<Sales />} />
              <Route path="customers" element={<Customers />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/store" element={<StoreSettings />} />
              <Route path="tax-settings" element={<TaxSettings />} />
              <Route path="payment-settings" element={<PaymentSettings />} />
              <Route path="payment-analytics" element={<PaymentAnalyticsDashboard />} />
              <Route path="demo" element={<TranslationDemo />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </I18nextProvider>
  );
}

export default App;

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import './auth/config'; // Initialize AWS Cognito
import i18n from './i18n';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import ResetPassword from './pages/auth/ResetPassword';
import TenantStoreSelection from './pages/auth/TenantStoreSelection';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductEdit from './pages/ProductEdit';
import Categories from './pages/Categories';
import CategoryEditPage from './pages/CategoryEditPage';
import Sales from './pages/Sales';
import SalesDetail from './pages/SalesDetail';
import Customers from './pages/Customers';
import TaxSettings from './pages/TaxSettings';
import PaymentSettings from './pages/PaymentSettings';
import PaymentAnalyticsDashboard from './pages/PaymentAnalyticsDashboard';
import StoreSettings from './pages/StoreSettings';
import CreateStore from './pages/CreateStore';
import { UserManagement } from './pages/user';
import { RoleManagement } from './pages/role';

// Placeholder components for other pages
const Settings: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
    <p className="text-gray-600">Settings coming soon...</p>
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
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            
            {/* Tenant/Store Selection - Protected but outside dashboard layout */}
            <Route 
              path="/tenant-store-selection" 
              element={
                <ProtectedRoute>
                  <TenantStoreSelection />
                </ProtectedRoute>
              } 
            />
            
            {/* Create Store - Protected but accessible from tenant selection */}
            <Route 
              path="/create-store" 
              element={
                <ProtectedRoute>
                  <CreateStore />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes - Dashboard requires tenant/store selection */}
            <Route
              path="/"
              element={
                <ProtectedRoute requiresTenantStore={true}>
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
              <Route path="categories/new" element={<CategoryEditPage />} />
              <Route path="categories/edit/:id" element={<CategoryEditPage />} />
              <Route path="sales" element={<Sales />} />
              <Route path="sales/:transId" element={<SalesDetail />} />
              <Route path="customers" element={<Customers />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/store" element={<StoreSettings />} />
              <Route path="settings/users" element={<UserManagement />} />
              <Route path="settings/roles" element={<RoleManagement />} />
              <Route path="tax-settings" element={<TaxSettings />} />
              <Route path="payment-settings" element={<PaymentSettings />} />
              <Route path="payment-analytics" element={<PaymentAnalyticsDashboard />} />
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

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
import GlobalModifiers from './pages/GlobalModifiers';
import GlobalModifierEdit from './pages/GlobalModifierEdit';
import GlobalModifierDetail from './pages/GlobalModifierDetail';
import Categories from './pages/Categories';
import CategoryEditPage from './pages/CategoryEditPage';
import Discounts from './pages/Discounts';
import DiscountEditPage from './pages/DiscountEditPage';
import DiscountDetailPage from './pages/DiscountDetailPage';
import Sales from './pages/Sales';
import SalesDetail from './pages/SalesDetail';
import ReceiptDemo from './pages/ReceiptDemo';
import Customers from './pages/Customers';
import TaxSettings from './pages/TaxSettings';
import PaymentSettings from './pages/PaymentSettings';
import TenderEditPage from './pages/TenderEditPage';
import PaymentAnalyticsDashboard from './pages/PaymentAnalyticsDashboard';
import StoreSettings from './pages/StoreSettings';
import CreateStore from './pages/CreateStore';
import TerminalSettings from './pages/TerminalSettings';
import TranslationManagement from './pages/TranslationManagement';
import { UserManagement } from './pages/user';
import RolesPage from './pages/roles/RolesPage';
import CreateRolePage from './pages/roles/CreateRolePage';
import EditRolePage from './pages/roles/EditRolePage';
import RoleDetailPage from './pages/roles/RoleDetailPage';
import { Tables, TableEditPage, TableDetailPage, ZoneEditPage, ReservationEditPage, ServerAssignmentPage, TableMergeUnmergePage } from './pages/table';
import EmployeeShiftManagement from './pages/EmployeeShiftManagement';

// Error handling imports
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import { setupGlobalErrorHandlers } from './services/errorHandler';

// Placeholder components for other pages
const Settings: React.FC = () => {
  const [VersionDisplay, setVersionDisplay] = React.useState<React.ComponentType<any> | null>(null);
  
  React.useEffect(() => {
    import('./components/ui/VersionDisplay').then((module) => {
      setVersionDisplay(() => module.default);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Application configuration and system information</p>
        </div>
        {VersionDisplay && (
          <VersionDisplay style="badge" size="md" />
        )}
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500">Application Version:</span>
            <div className="mt-1">
              {VersionDisplay && <VersionDisplay style="text" size="sm" />}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-500">Build Date:</span>
            <div className="mt-1 text-gray-900">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Application Settings</h2>
        <p className="text-gray-600">More configuration options coming soon...</p>
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Initialize the app and setup global error handlers
    console.log('POS Admin Panel initialized');
    setupGlobalErrorHandlers();
  }, []);

  return (
    <ErrorBoundary>
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
              <Route path="global-modifiers" element={<GlobalModifiers />} />
              <Route path="global-modifiers/new" element={<GlobalModifierEdit />} />
              <Route path="global-modifiers/edit/:id" element={<GlobalModifierEdit />} />
              <Route path="global-modifiers/:id" element={<GlobalModifierDetail />} />
              <Route path="categories" element={<Categories />} />
              <Route path="categories/new" element={<CategoryEditPage />} />
              <Route path="categories/edit/:id" element={<CategoryEditPage />} />
              <Route path="discounts" element={<Discounts />} />
              <Route path="discounts/new" element={<DiscountEditPage />} />
              <Route path="discounts/edit/:id" element={<DiscountEditPage />} />
              <Route path="discounts/:id" element={<DiscountDetailPage />} />
              <Route path="sales" element={<Sales />} />
              <Route path="sales/:transId" element={<SalesDetail />} />
              <Route path="receipt-demo" element={<ReceiptDemo />} />
              <Route path="customers" element={<Customers />} />
              <Route path="tables" element={<Tables />} />
              <Route path="tables/new" element={<TableEditPage />} />
              <Route path="tables/edit/:tableId" element={<TableEditPage />} />
              <Route path="tables/:tableId" element={<TableDetailPage />} />
              <Route path="tables/assign/:tableId" element={<ServerAssignmentPage />} />
              <Route path="tables/merge" element={<TableMergeUnmergePage />} />
              <Route path="zones/new" element={<ZoneEditPage />} />
              <Route path="zones/edit/:zoneId" element={<ZoneEditPage />} />
              <Route path="reservations/new" element={<ReservationEditPage />} />
              <Route path="reservations/edit/:reservationId" element={<ReservationEditPage />} />
              <Route path="employee-shifts" element={<EmployeeShiftManagement />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/store" element={<StoreSettings />} />
              <Route path="settings/terminals" element={<TerminalSettings />} />
              <Route path="settings/translations" element={<TranslationManagement />} />
              <Route path="settings/users" element={<UserManagement />} />
              <Route path="settings/roles" element={<RolesPage />} />
              <Route path="settings/roles/new" element={<CreateRolePage />} />
              <Route path="settings/roles/edit/:id" element={<EditRolePage />} />
              <Route path="settings/roles/:id" element={<RoleDetailPage />} />
              <Route path="tax-settings" element={<TaxSettings />} />
              <Route path="payment-settings" element={<PaymentSettings />} />
              <Route path="payment-settings/new" element={<TenderEditPage />} />
              <Route path="payment-settings/edit/:id" element={<TenderEditPage />} />
              <Route path="payment-analytics" element={<PaymentAnalyticsDashboard />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          {/* Toast notifications container */}
          <ToastContainer />
        </div>
      </Router>
    </I18nextProvider>
  </ErrorBoundary>
  );
}

export default App;

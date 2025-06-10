import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../auth/authService';
import { useTenantStore } from '../tenants/tenantStore';
import { Loading } from '../components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresTenantStore?: boolean; // Flag to require both tenant and store selection
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresTenantStore = false 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const { currentTenant, currentStore } = useTenantStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use actual AWS Cognito authentication check
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <Loading
        title="Authenticating"
        description="Please wait while we verify your credentials..."
        fullScreen={true}
        size="xl"
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // For routes that require tenant/store selection, check if they're available
  if (requiresTenantStore) {
    console.log('🔍 ProtectedRoute Check:', {
      pathname: location.pathname,
      currentTenant: currentTenant ? currentTenant.id : null,
      currentStore: currentStore ? currentStore.store_id : null,
      requiresTenantStore,
      timestamp: new Date().toISOString()
    });
    
    // If on tenant-store-selection page, don't redirect
    if (location.pathname === '/tenant-store-selection') {
      return <>{children}</>;
    }
    
    // If no tenant or store selected, redirect to selection page
    if (!currentTenant || !currentStore) {
      console.log('❌ Missing tenant or store, redirecting to selection page');
      return (
        <Navigate 
          to="/tenant-store-selection" 
          state={{ from: location }} 
          replace 
        />
      );
    } else {
      console.log('✅ Tenant and store available, allowing access');
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

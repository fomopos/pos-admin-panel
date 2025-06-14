import React from 'react';
import { usePermissions } from '../utils/permissions';
import { PermissionManager } from '../utils/permissions';

const PermissionDebug: React.FC = () => {
  const permissions = usePermissions();
  
  const handleDebug = () => {
    permissions.debug();
  };

  const handleRefresh = async () => {
    console.log('Manually refreshing permissions...');
    try {
      await PermissionManager.refresh();
      console.log('Permissions refreshed successfully');
      permissions.debug();
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg border rounded-lg p-4 max-w-sm z-50">
      <h3 className="font-semibold text-sm mb-2">Permission Debug</h3>
      <div className="space-y-1 text-xs">
        <div>Can Manage Users: {permissions.canManageUsers() ? '✅' : '❌'}</div>
        <div>Can Manage Roles: {permissions.canManageRoles() ? '✅' : '❌'}</div>
        <div>Is Admin: {permissions.isAdmin() ? '✅' : '❌'}</div>
        <div>Role: {permissions.getCurrentUserRole()}</div>
        <div>Permissions: {permissions.getCurrentUserPermissions().length}</div>
      </div>
      <div className="flex space-x-1 mt-2">
        <button 
          onClick={handleDebug}
          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Log Debug
        </button>
        <button 
          onClick={handleRefresh}
          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default PermissionDebug;

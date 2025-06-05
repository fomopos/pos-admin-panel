import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  PencilIcon,
  ClockIcon,
  ChartBarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  KeyIcon,
  ShieldCheckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Button, Card, PageHeader } from '../../components/ui';
import { userService } from '../../services/user';
import type { StoreUser } from '../../services/types/user.types';

interface UserDetailProps {
  userId: string;
  onBack: () => void;
  onEdit: (userId: string) => void;
  onViewActivity: (userId: string) => void;
  onViewTimeTracking: (userId: string) => void;
}

const UserDetail: React.FC<UserDetailProps> = ({
  userId,
  onBack,
  onEdit,
  onViewActivity,
  onViewTimeTracking
}) => {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const userData = await userService.getUserById(userId);
      setUser(userData);
    } catch (err) {
      setError('Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading user details...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <UserIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Not Found</h3>
          <p className="text-gray-500">{error || 'The requested user could not be found.'}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 ring-1 ring-green-600/20';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
      case 'suspended':
        return 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={`${user.first_name} ${user.last_name}`}
        description={user.email}
        className="bg-white border border-gray-200 shadow-sm rounded-lg p-6"
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <Button
            variant="outline"
            onClick={() => onViewActivity(userId)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            View Activity
          </Button>
          <Button
            variant="outline"
            onClick={() => onViewTimeTracking(userId)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ClockIcon className="h-4 w-4 mr-2" />
            Time Tracking
          </Button>
          <Button
            onClick={() => onEdit(userId)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit User
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-gray-600">{user.role_name}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}

                {user.employee_id && (
                  <div className="flex items-center space-x-3">
                    <KeyIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Employee ID</p>
                      <p className="text-sm text-gray-900">{user.employee_id}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {user.department && (
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Department</p>
                      <p className="text-sm text-gray-900">{user.department}</p>
                    </div>
                  </div>
                )}

                {user.hire_date && (
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Hire Date</p>
                      <p className="text-sm text-gray-900">
                        {new Date(user.hire_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Two-Factor Auth</p>
                    <p className="text-sm text-gray-900">
                      {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Permissions */}
          <Card className="p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {user.permissions.map((permission) => (
                <div
                  key={permission}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
              ))}
            </div>
          </Card>

          {/* Access Schedule */}
          {user.access_schedule && user.access_schedule.enabled && (
            <Card className="p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Schedule</h3>
              <div className="space-y-3">
                {user.access_schedule.schedule.map((schedule) => (
                  <div
                    key={schedule.day}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {schedule.day}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        {schedule.start_time} - {schedule.end_time}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        schedule.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Activity Summary */}
        <div className="space-y-6">
          <Card className="p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm text-gray-600">Login Count</span>
                <span className="text-sm font-semibold text-gray-900">{user.login_count}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-semibold text-gray-900">
                  {user.last_login 
                    ? new Date(user.last_login).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Session Status</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.session_active 
                    ? 'bg-green-100 text-green-800 ring-1 ring-green-600/20' 
                    : 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20'
                }`}>
                  {user.session_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(user.updated_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Created By</span>
                <span className="text-sm font-semibold text-gray-900">{user.created_by}</span>
              </div>
              {user.updated_by && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Updated By</span>
                  <span className="text-sm font-semibold text-gray-900">{user.updated_by}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;

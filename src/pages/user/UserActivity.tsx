import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Button, Card, Input, PageHeader, Loading } from '../../components/ui';
import { userService } from '../../services/user';
import type { UserActivity, StoreUser } from '../../services/types/user.types';

interface UserActivityPageProps {
  userId: string;
  onBack: () => void;
}

const UserActivityPage: React.FC<UserActivityPageProps> = ({ userId, onBack }) => {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');

  useEffect(() => {
    loadUserAndActivities();
  }, [userId]);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, activityTypeFilter, dateRange]);

  const loadUserAndActivities = async () => {
    try {
      setIsLoading(true);
      const [userData, activityData] = await Promise.all([
        userService.getUserById(userId),
        userService.getUserActivity(userId)
      ]);
      
      setUser(userData);
      setActivities(activityData.activities);
    } catch (error) {
      console.error('Failed to load user activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.activity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.ip_address?.includes(searchQuery)
      );
    }

    // Filter by activity type
    if (activityTypeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.activity_type === activityTypeFilter);
    }

    // Filter by date range
    const now = new Date();
    const dateThreshold = new Date();
    
    switch (dateRange) {
      case '1day':
        dateThreshold.setDate(now.getDate() - 1);
        break;
      case '7days':
        dateThreshold.setDate(now.getDate() - 7);
        break;
      case '30days':
        dateThreshold.setDate(now.getDate() - 30);
        break;
      case '90days':
        dateThreshold.setDate(now.getDate() - 90);
        break;
      default:
        dateThreshold.setFullYear(2000); // Show all
    }

    filtered = filtered.filter(activity => new Date(activity.timestamp) >= dateThreshold);

    setFilteredActivities(filtered);
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'login':
      case 'logout':
        return UserIcon;
      case 'clock_in':
      case 'clock_out':
        return ClockIcon;
      default:
        return ComputerDesktopIcon;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'login':
      case 'clock_in':
        return 'text-green-600 bg-green-100 ring-1 ring-green-600/20';
      case 'logout':
      case 'clock_out':
        return 'text-red-600 bg-red-100 ring-1 ring-red-600/20';
      case 'transaction':
        return 'text-primary-600 bg-primary-100 ring-1 ring-primary-600/20';
      case 'void':
      case 'refund':
        return 'text-orange-600 bg-orange-100 ring-1 ring-orange-600/20';
      case 'settings_change':
        return 'text-purple-600 bg-purple-100 ring-1 ring-purple-600/20';
      default:
        return 'text-gray-600 bg-gray-100 ring-1 ring-gray-600/20';
    }
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getUniqueActivityTypes = () => {
    const types = Array.from(new Set(activities.map(a => a.activity_type)));
    return types.sort();
  };

  if (isLoading) {
    return (
      <Loading
        title="Loading Activity Log"
        description="Please wait while we fetch the user activity data..."
        fullScreen={true}
        size="lg"
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Not Found</h3>
              <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or has been removed.</p>
              <Button onClick={onBack} className="bg-primary-600 hover:bg-primary-700">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <PageHeader
            title={`Activity Log: ${user.first_name} ${user.last_name}`}
            description="User activity history and audit trail"
          >
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          </PageHeader>

          {/* Filters */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                </div>
                
                <select
                  value={activityTypeFilter}
                  onChange={(e) => setActivityTypeFilter(e.target.value)}
                  className="input-base"
                >
                  <option value="all">All Activities</option>
                  {getUniqueActivityTypes().map(type => (
                    <option key={type} value={type}>
                      {formatActivityType(type)}
                    </option>
                  ))}
                </select>

                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="input-base"
                >
                  <option value="1day">Last 24 Hours</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border border-gray-200 shadow-sm p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{filteredActivities.length}</p>
                <p className="text-sm text-gray-500">Total Activities</p>
              </div>
            </Card>
            <Card className="border border-gray-200 shadow-sm p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {filteredActivities.filter(a => ['login', 'clock_in', 'transaction'].includes(a.activity_type)).length}
                </p>
                <p className="text-sm text-gray-500">Positive Actions</p>
              </div>
            </Card>
            <Card className="border border-gray-200 shadow-sm p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {filteredActivities.filter(a => a.activity_type === 'transaction').length}
                </p>
                <p className="text-sm text-gray-500">Transactions</p>
              </div>
            </Card>
            <Card className="border border-gray-200 shadow-sm p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {filteredActivities.filter(a => a.activity_type === 'settings_change').length}
                </p>
                <p className="text-sm text-gray-500">Settings Changes</p>
              </div>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card className="border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h2>
            
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ComputerDesktopIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No activities found for the selected filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.activity_type);
                  
                  return (
                    <div key={activity.activity_id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100/50 transition-colors">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.activity_type)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {formatActivityType(activity.activity_type)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {activity.ip_address && (
                            <div className="flex items-center space-x-1">
                              <GlobeAltIcon className="h-3 w-3" />
                              <span>{activity.ip_address}</span>
                            </div>
                          )}
                          {activity.device_info && (
                            <div className="flex items-center space-x-1">
                              <ComputerDesktopIcon className="h-3 w-3" />
                              <span className="truncate max-w-xs">{activity.device_info}</span>
                            </div>
                          )}
                          {activity.session_id && (
                            <div className="flex items-center space-x-1">
                              <span>Session: {activity.session_id.substring(0, 8)}...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserActivityPage;

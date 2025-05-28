import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  MapPinIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { userService } from '../../services/user';
import type { UserTimeTracking, StoreUser } from '../../services/types/user.types';

interface UserTimeTrackingPageProps {
  userId: string;
  onBack: () => void;
}

const UserTimeTrackingPage: React.FC<UserTimeTrackingPageProps> = ({ userId, onBack }) => {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [timeRecords, setTimeRecords] = useState<UserTimeTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>('7days');
  const [filteredRecords, setFilteredRecords] = useState<UserTimeTracking[]>([]);

  useEffect(() => {
    loadUserAndTimeTracking();
  }, [userId]);

  useEffect(() => {
    filterRecords();
  }, [timeRecords, dateRange]);

  const loadUserAndTimeTracking = async () => {
    try {
      setIsLoading(true);
      const [userData, timeData] = await Promise.all([
        userService.getUserById(userId),
        userService.getTimeTracking(userId)
      ]);
      
      setUser(userData);
      setTimeRecords(timeData.records);
    } catch (error) {
      console.error('Failed to load time tracking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...timeRecords];

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

    filtered = filtered.filter(record => new Date(record.clock_in_time) >= dateThreshold);
    filtered.sort((a, b) => new Date(b.clock_in_time).getTime() - new Date(a.clock_in_time).getTime());

    setFilteredRecords(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return PlayIcon;
      case 'clocked_out':
        return PauseIcon;
      case 'on_break':
        return ClockIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return 'text-green-600 bg-green-100 ring-1 ring-green-600/20';
      case 'clocked_out':
        return 'text-gray-600 bg-gray-100 ring-1 ring-gray-600/20';
      case 'on_break':
        return 'text-orange-600 bg-orange-100 ring-1 ring-orange-600/20';
      default:
        return 'text-gray-600 bg-gray-100 ring-1 ring-gray-600/20';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDuration = (hours: number | undefined) => {
    if (!hours) return 'N/A';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const calculateTotalHours = () => {
    return filteredRecords.reduce((total, record) => total + (record.total_hours || 0), 0);
  };

  const getAverageHoursPerDay = () => {
    const totalHours = calculateTotalHours();
    const daysWorked = new Set(filteredRecords.map(r => new Date(r.clock_in_time).toDateString())).size;
    return daysWorked > 0 ? totalHours / daysWorked : 0;
  };

  const getClockedInDays = () => {
    return new Set(filteredRecords.map(r => new Date(r.clock_in_time).toDateString())).size;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="text-sm text-gray-600">Loading time tracking data...</p>
            </div>
          </div>
        </div>
      </div>
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
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="border-l border-gray-300 pl-4">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Time Tracking: {user.first_name} {user.last_name}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Work hours and time tracking history
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <Card className="border border-gray-200 shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
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

          {/* Time Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="h-6 w-6 text-primary-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(calculateTotalHours())}
                </p>
                <p className="text-sm text-gray-500">Total Hours</p>
              </div>
            </Card>

            <Card className="border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(getAverageHoursPerDay())}
                </p>
                <p className="text-sm text-gray-500">Avg per Day</p>
              </div>
            </Card>

            <Card className="border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{getClockedInDays()}</p>
                <p className="text-sm text-gray-500">Days Worked</p>
              </div>
            </Card>

            <Card className="border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PlayIcon className="h-6 w-6 text-primary-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{filteredRecords.length}</p>
                <p className="text-sm text-gray-500">Total Sessions</p>
              </div>
            </Card>
          </div>

          {/* Time Records */}
          <Card className="border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Time Records</h2>
            
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No time records found for the selected period</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => {
                  const IconComponent = getStatusIcon(record.status);
                  const clockInDate = new Date(record.clock_in_time);
                  const clockOutDate = record.clock_out_time ? new Date(record.clock_out_time) : null;
                  
                  return (
                    <div key={record.tracking_id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(record.status)}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="text-sm font-semibold text-gray-900">
                                {clockInDate.toLocaleDateString()}
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                {formatStatus(record.status)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <p className="font-medium text-gray-500">Clock In</p>
                                <p>{clockInDate.toLocaleTimeString()}</p>
                              </div>
                              
                              {clockOutDate && (
                                <div>
                                  <p className="font-medium text-gray-500">Clock Out</p>
                                  <p>{clockOutDate.toLocaleTimeString()}</p>
                                </div>
                              )}
                              
                              {record.total_hours && (
                                <div>
                                  <p className="font-medium text-gray-500">Total Hours</p>
                                  <p>{formatDuration(record.total_hours)}</p>
                                </div>
                              )}
                              
                              {record.break_duration && (
                                <div>
                                  <p className="font-medium text-gray-500">Break Time</p>
                                  <p>{formatDuration(record.break_duration / 60)}</p>
                                </div>
                              )}
                            </div>

                            {record.location && (
                              <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                                <MapPinIcon className="h-4 w-4" />
                                <span>{record.location}</span>
                              </div>
                            )}

                            {record.notes && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600 italic">"{record.notes}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Break times */}
                      {record.break_start_time && (
                        <div className="mt-4 pl-12 border-l-2 border-orange-200">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center space-x-4">
                              <span className="font-medium text-orange-600">Break:</span>
                              <span>
                                {new Date(record.break_start_time).toLocaleTimeString()}
                                {record.break_end_time && (
                                  <> - {new Date(record.break_end_time).toLocaleTimeString()}</>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
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

export default UserTimeTrackingPage;

import React from 'react';
import { XMarkIcon, ClockIcon, UserIcon, GlobeAltIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import type { UserActivity } from '../../services/types/user.types';

interface ActivityModalProps {
  isOpen: boolean;
  activities: UserActivity[];
  userName: string;
  onClose: () => void;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, activities, userName, onClose }) => {
  if (!isOpen) return null;

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
        return 'text-green-600 bg-green-100';
      case 'logout':
      case 'clock_out':
        return 'text-red-600 bg-red-100';
      case 'transaction':
        return 'text-blue-600 bg-blue-100';
      case 'void':
      case 'refund':
        return 'text-orange-600 bg-orange-100';
      case 'settings_change':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-xl font-semibold">User Activity Log</h2>
                <p className="text-indigo-100 text-sm">{userName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activity found</h3>
              <p className="mt-1 text-sm text-gray-500">
                This user has no recorded activity yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.activity_type);
                const colorClasses = getActivityColor(activity.activity_type);
                const { date, time } = formatTimestamp(activity.timestamp);

                return (
                  <div key={activity.activity_id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start space-x-4">
                      {/* Activity Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-lg ${colorClasses}`}>
                        <ActivityIcon className="h-5 w-5" />
                      </div>

                      {/* Activity Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {formatActivityType(activity.activity_type)}
                          </h4>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{date}</p>
                            <p className="text-sm font-medium text-gray-900">{time}</p>
                          </div>
                        </div>

                        <p className="mt-1 text-sm text-gray-600">
                          {activity.description}
                        </p>

                        {/* Additional Information */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                          {activity.ip_address && (
                            <div className="flex items-center text-gray-500">
                              <GlobeAltIcon className="h-3 w-3 mr-1" />
                              <span>IP: {activity.ip_address}</span>
                            </div>
                          )}
                          {activity.device_info && (
                            <div className="flex items-center text-gray-500">
                              <ComputerDesktopIcon className="h-3 w-3 mr-1" />
                              <span>{activity.device_info}</span>
                            </div>
                          )}
                          {activity.location && (
                            <div className="flex items-center text-gray-500">
                              <span>📍 {activity.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Metadata */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-3 p-2 bg-white rounded-lg border">
                            <p className="text-xs font-medium text-gray-700 mb-1">Additional Details:</p>
                            <div className="space-y-1">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-500 capitalize">
                                    {key.replace(/_/g, ' ')}:
                                  </span>
                                  <span className="text-gray-900 font-medium">
                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Session ID */}
                        {activity.session_id && (
                          <p className="mt-2 text-xs text-gray-400">
                            Session: {activity.session_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-6 border-t mt-6">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;

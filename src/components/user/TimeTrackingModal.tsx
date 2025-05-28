import React from 'react';
import { XMarkIcon, ClockIcon, PlayIcon, PauseIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import type { UserTimeTracking } from '../../services/types/user.types';

interface TimeTrackingModalProps {
  isOpen: boolean;
  timeRecords: UserTimeTracking[];
  userName: string;
  onClose: () => void;
}

const TimeTrackingModal: React.FC<TimeTrackingModalProps> = ({ 
  isOpen, 
  timeRecords, 
  userName, 
  onClose 
}) => {
  if (!isOpen) return null;

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
        return 'text-green-600 bg-green-100 border-green-200';
      case 'clocked_out':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'on_break':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatDuration = (hours: number) => {
    if (!hours) return 'N/A';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const calculateTotalHours = () => {
    return timeRecords.reduce((total, record) => {
      return total + (record.total_hours || 0);
    }, 0);
  };

  const getCurrentlyWorking = () => {
    return timeRecords.filter(record => record.status === 'clocked_in').length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-xl font-semibold">Time Tracking</h2>
                <p className="text-blue-100 text-sm">{userName}</p>
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

        {/* Summary Stats */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(calculateTotalHours())}
              </p>
              <p className="text-sm text-gray-600">Total Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {timeRecords.length}
              </p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {getCurrentlyWorking()}
              </p>
              <p className="text-sm text-gray-600">Currently Working</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {timeRecords.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No time records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                This user has no time tracking records yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeRecords.map((record) => {
                const StatusIcon = getStatusIcon(record.status);
                const statusColorClasses = getStatusColor(record.status);
                const clockInTime = formatTime(record.clock_in_time);
                const clockOutTime = record.clock_out_time ? formatTime(record.clock_out_time) : null;

                return (
                  <div key={record.tracking_id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between">
                      {/* Left Side - Status and Times */}
                      <div className="flex items-start space-x-4">
                        {/* Status Icon */}
                        <div className={`flex-shrink-0 p-2 rounded-lg border ${statusColorClasses}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>

                        {/* Time Details */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColorClasses}`}>
                              {formatStatus(record.status)}
                            </span>
                            {record.location && (
                              <span className="flex items-center text-xs text-gray-500">
                                <MapPinIcon className="h-3 w-3 mr-1" />
                                {record.location}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            {/* Clock In */}
                            <div>
                              <p className="text-gray-600 mb-1">Clock In</p>
                              <p className="font-medium text-gray-900">{clockInTime.date}</p>
                              <p className="text-lg font-bold text-green-600">{clockInTime.time}</p>
                            </div>

                            {/* Clock Out */}
                            <div>
                              <p className="text-gray-600 mb-1">Clock Out</p>
                              {clockOutTime ? (
                                <>
                                  <p className="font-medium text-gray-900">{clockOutTime.date}</p>
                                  <p className="text-lg font-bold text-red-600">{clockOutTime.time}</p>
                                </>
                              ) : (
                                <p className="text-gray-400 italic">Still clocked in</p>
                              )}
                            </div>
                          </div>

                          {/* Break Time */}
                          {(record.break_start_time || record.break_end_time) && (
                            <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                              <p className="text-xs font-medium text-orange-800 mb-1">Break Time</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-orange-600">Start: </span>
                                  <span className="text-orange-900">
                                    {record.break_start_time ? formatTime(record.break_start_time).time : 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-orange-600">End: </span>
                                  <span className="text-orange-900">
                                    {record.break_end_time ? formatTime(record.break_end_time).time : 'N/A'}
                                  </span>
                                </div>
                              </div>
                              {record.break_duration && (
                                <p className="mt-1 text-xs text-orange-800">
                                  Duration: {formatDuration(record.break_duration)}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Notes */}
                          {record.notes && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs font-medium text-blue-800 mb-1">Notes</p>
                              <p className="text-sm text-blue-900">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side - Duration */}
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Total Hours</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatDuration(record.total_hours || 0)}
                        </p>
                        {record.break_duration && record.break_duration > 0 && (
                          <p className="text-xs text-orange-600 mt-1">
                            (Break: {formatDuration(record.break_duration)})
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer with timestamps */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                      <span>Created: {formatTime(record.created_at).date} {formatTime(record.created_at).time}</span>
                      <span>Updated: {formatTime(record.updated_at).date} {formatTime(record.updated_at).time}</span>
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

export default TimeTrackingModal;

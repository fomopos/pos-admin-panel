import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface TimeSlot {
  time: string;
  available: boolean;
  reservationCount?: number;
}

interface TimeSlotPickerProps {
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  availableSlots?: TimeSlot[];
  disabled?: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedTime,
  onTimeSelect,
  availableSlots,
  disabled = false
}) => {
  // Default time slots if none provided
  const defaultSlots: TimeSlot[] = [
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '12:00', available: true },
    { time: '12:30', available: true },
    { time: '13:00', available: true },
    { time: '13:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
    { time: '17:00', available: true },
    { time: '17:30', available: true },
    { time: '18:00', available: true },
    { time: '18:30', available: true },
    { time: '19:00', available: true },
    { time: '19:30', available: true },
    { time: '20:00', available: true },
    { time: '20:30', available: true },
    { time: '21:00', available: true },
    { time: '21:30', available: true },
  ];

  const timeSlots = availableSlots || defaultSlots;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
        <ClockIcon className="h-4 w-4" />
        <span>Select Time</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
        {timeSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isDisabled = disabled || !slot.available;
          
          return (
            <button
              key={slot.time}
              onClick={() => !isDisabled && onTimeSelect(slot.time)}
              disabled={isDisabled}
              className={`
                relative px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isSelected 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
                  : 'cursor-pointer border'
                }
              `}
            >
              {formatTime(slot.time)}
              
              {/* Reservation count indicator */}
              {slot.reservationCount && slot.reservationCount > 0 && !isSelected && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  <span className="text-xs leading-none">
                    {slot.reservationCount > 9 ? '9+' : slot.reservationCount}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedTime && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <ClockIcon className="h-4 w-4" />
            <span>Selected time: <span className="font-medium">{formatTime(selectedTime)}</span></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
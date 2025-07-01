import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  reservations?: Array<{
    date: string;
    count: number;
  }>;
  minDate?: Date;
  maxDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  reservations = [],
  minDate,
  maxDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());
  const endOfCalendar = new Date(endOfMonth);
  endOfCalendar.setDate(endOfCalendar.getDate() + (6 - endOfCalendar.getDay()));

  const days = [];
  const currentDate = new Date(startOfCalendar);
  
  while (currentDate <= endOfCalendar) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const getReservationCountForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const reservation = reservations.find(r => r.date === dateStr);
    return reservation?.count || 0;
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(date => {
          const reservationCount = getReservationCountForDate(date);
          const isDisabled = isDateDisabled(date);
          const isSelected = isDateSelected(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          const isToday = date.toDateString() === today.toDateString();

          return (
            <button
              key={date.toISOString()}
              onClick={() => !isDisabled && onDateSelect(date)}
              disabled={isDisabled}
              className={`
                relative h-10 w-10 rounded-lg text-sm font-medium transition-colors
                ${isDisabled 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'hover:bg-gray-100 cursor-pointer'
                }
                ${isSelected 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-900'
                }
                ${!isCurrentMonthDate && !isSelected 
                  ? 'text-gray-400' 
                  : ''
                }
                ${isToday && !isSelected 
                  ? 'bg-blue-100 text-blue-600' 
                  : ''
                }
              `}
            >
              {date.getDate()}
              
              {/* Reservation indicator */}
              {reservationCount > 0 && !isSelected && (
                <div className="absolute bottom-0 right-0 h-2 w-2 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  <span className="sr-only">{reservationCount} reservations</span>
                </div>
              )}
              
              {/* Multiple reservations indicator */}
              {reservationCount > 3 && !isSelected && (
                <div className="absolute top-0 right-0 h-3 w-3 bg-orange-500 rounded-full text-xs flex items-center justify-center text-white">
                  <span className="text-xs leading-none">{reservationCount > 9 ? '9+' : reservationCount}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-blue-100 rounded-full"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
          <span>Has Reservations</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
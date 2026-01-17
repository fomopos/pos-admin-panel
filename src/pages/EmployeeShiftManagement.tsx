import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Will be used for navigation actions
import {
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import {
  PageHeader,
  Button,
  DataTable,
  Modal
} from '../components/ui';

// Type definitions
interface Employee {
  employee_id: string;
  name: string;
  role: string;
  hourly_rate: number;
  status: 'active' | 'inactive';
  contact: string;
  hire_date: string;
}

interface Shift {
  shift_id: string;
  employee_id: string;
  employee_name: string;
  role: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  hourly_rate: number;
  break_minutes: number;
  notes?: string;
}

// interface ShiftTemplate {
//   template_id: string;
//   name: string;
//   day_of_week: number; // 0-6 (Sunday-Saturday)
//   start_time: string;
//   end_time: string;
//   role: string;
//   required_employees: number;
// }

// WeeklyScheduleView Component - Teams-style calendar with time blocks
interface WeeklyScheduleViewProps {
  shifts: Shift[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onShiftClick: (shift: Shift) => void;
  onTimeSlotClick: (date: Date, time: string) => void;
}

const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  shifts,
  selectedDate,
  onDateSelect,
  onShiftClick,
  onTimeSlotClick
}) => {
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay()); // Go to Sunday
    return start;
  });

  // Time slots from 6 AM to 2 AM next day (for overnight shifts)
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
    '00:00', '01:00', '02:00'
  ];

  // Get days of the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      chef: 'bg-red-500',
      server: 'bg-blue-500',
      host: 'bg-green-500',
      bartender: 'bg-purple-500',
      manager: 'bg-gray-500',
    };
    return colors[role] || 'bg-gray-500';
  };

  const getStatusOpacity = (status: string): string => {
    const opacity: Record<string, string> = {
      scheduled: 'opacity-70',
      confirmed: 'opacity-90',
      in_progress: 'opacity-100 ring-2 ring-yellow-400',
      completed: 'opacity-50',
      cancelled: 'opacity-30 line-through',
    };
    return opacity[status] || 'opacity-70';
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getShiftPosition = (shift: Shift): { top: number; height: number } => {
    const startMinutes = timeToMinutes(shift.start_time);
    const endMinutes = timeToMinutes(shift.end_time);
    
    // Handle overnight shifts
    const actualEndMinutes = endMinutes < startMinutes ? endMinutes + 24 * 60 : endMinutes;
    
    // Calculate position relative to 6 AM (360 minutes)
    const dayStartMinutes = 6 * 60; // 6 AM
    const relativeStart = Math.max(0, startMinutes - dayStartMinutes);
    const relativeEnd = Math.min(20 * 60, actualEndMinutes - dayStartMinutes); // Max 20 hours displayed
    
    const hourHeight = 48; // 48px per hour (h-12)
    const top = (relativeStart / 60) * hourHeight;
    const height = Math.max(24, ((relativeEnd - relativeStart) / 60) * hourHeight); // Min 24px height
    
    return { top, height };
  };

  const getShiftsForDay = (date: Date): Shift[] => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.date === dateStr);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(weekStart.getDate() + (direction === 'next' ? 7 : -7));
    setWeekStart(newWeekStart);
  };

  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header with week navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Chef</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Server</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Host</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Bartender</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex">
        {/* Time column */}
        <div className="w-20 border-r border-gray-200">
          <div className="h-12 border-b border-gray-200"></div> {/* Header spacer */}
          {timeSlots.map((time) => (
            <div key={time} className="h-12 border-b border-gray-100 px-2 py-1 text-xs text-gray-500 text-right flex items-center justify-end">
              {formatTime12Hour(time)}
            </div>
          ))}
        </div>

        {/* Days columns */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day, dayIndex) => {
            const dayShifts = getShiftsForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === selectedDate.toDateString();

            return (
              <div key={dayIndex} className="border-r border-gray-200 last:border-r-0">
                {/* Day header */}
                <div 
                  className={`h-12 border-b border-gray-200 p-2 text-center cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 text-blue-700' : isToday ? 'bg-yellow-50 text-yellow-700' : ''
                  }`}
                  onClick={() => onDateSelect(day)}
                >
                  <div className="text-xs text-gray-500">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-sm font-medium ${isToday ? 'font-bold' : ''}`}>
                    {day.getDate()}
                  </div>
                </div>

                {/* Time slots */}
                <div className="relative">
                  {timeSlots.map((time, timeIndex) => (
                    <div
                      key={`${dayIndex}-${timeIndex}`}
                      className="h-12 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onTimeSlotClick(day, time)}
                    ></div>
                  ))}

                  {/* Shift blocks */}
                  {dayShifts.map((shift, shiftIndex) => {
                    const position = getShiftPosition(shift);
                    return (
                      <div
                        key={shift.shift_id}
                        className={`absolute left-1 right-1 rounded px-2 py-1 text-xs text-white cursor-pointer hover:shadow-lg transition-shadow ${getRoleColor(shift.role)} ${getStatusOpacity(shift.status)}`}
                        style={{
                          top: `${position.top}px`,
                          height: `${position.height}px`,
                          zIndex: 10 + shiftIndex
                        }}
                        onClick={() => onShiftClick(shift)}
                        title={`${shift.employee_name} - ${shift.role}\n${shift.start_time} - ${shift.end_time}`}
                      >
                        <div className="font-medium truncate">{shift.employee_name}</div>
                        <div className="text-xs opacity-90 truncate">
                          {shift.start_time} - {shift.end_time}
                        </div>
                        {shift.status === 'in_progress' && (
                          <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const EmployeeShiftManagement: React.FC = () => {
  // const navigate = useNavigate(); // Will be used for navigation actions
  
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  // const [templates, setTemplates] = useState<ShiftTemplate[]>([]); // Will be used for shift templates
  const [loading, setLoading] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // TODO: Replace with actual API calls when shift management service is implemented
      // const employeesResponse = await shiftService.getEmployees();
      // const shiftsResponse = await shiftService.getShifts();
      // setEmployees(employeesResponse);
      // setShifts(shiftsResponse);
      setEmployees([]);
      setShifts([]);
    } catch (error) {
      console.error('Failed to load shift data:', error);
      setEmployees([]);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const getShiftsForDate = (date: Date): Shift[] => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.date === dateStr);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      chef: 'bg-red-100 text-red-800',
      server: 'bg-blue-100 text-blue-800',
      host: 'bg-green-100 text-green-800',
      bartender: 'bg-purple-100 text-purple-800',
      manager: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role.toUpperCase()}
      </span>
    );
  };

  const calculateShiftHours = (startTime: string, endTime: string): number => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    let end = new Date(`1970-01-01T${endTime}:00`);
    
    // Handle overnight shifts
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  // Employee columns for data table
  const employeeColumns = [
    {
      key: 'name',
      title: 'Employee',
      sortable: true,
      render: (value: string, employee: Employee) => (
        <div className="flex items-center">
          <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{employee.employee_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      render: (value: string) => getRoleBadge(value),
    },
    {
      key: 'hourly_rate',
      title: 'Hourly Rate',
      sortable: true,
      render: (value: number) => (
        <span className="text-sm text-gray-900">${value.toFixed(2)}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value}</span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_value: any, _employee: Employee) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline">
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Shift columns for data table
  const shiftColumns = [
    {
      key: 'employee_name',
      title: 'Employee',
      sortable: true,
      render: (value: string, shift: Shift) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{getRoleBadge(shift.role)}</div>
        </div>
      ),
    },
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'start_time',
      title: 'Time',
      render: (value: string, shift: Shift) => (
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">
            {value} - {shift.end_time}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'hourly_rate',
      title: 'Rate',
      render: (value: number, shift: Shift) => {
        const hours = calculateShiftHours(shift.start_time, shift.end_time);
        const total = hours * value;
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">${value}/hr</div>
            <div className="text-xs text-gray-500">${total.toFixed(2)} total</div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_value: any, _shift: Shift) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shift management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title="Employee Shift Management"
        description="Schedule and manage employee shifts, track hours, and organize work schedules"
      >
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowShiftModal(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Employee</span>
          </Button>
          <Button
            onClick={() => setShowShiftModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Schedule Shift</span>
          </Button>
        </div>
      </PageHeader>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Shifts</p>
              <p className="text-2xl font-bold text-gray-900">
                {getShiftsForDate(new Date()).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-gray-900">
                {shifts.filter(s => s.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Week Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {shifts.reduce((total, shift) => {
                  return total + calculateShiftHours(shift.start_time, shift.end_time);
                }, 0).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`${
              activeTab === 'calendar'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <CalendarDaysIcon className="h-4 w-4" />
            <span>Schedule Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`${
              activeTab === 'shifts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <ClockIcon className="h-4 w-4" />
            <span>All Shifts</span>
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`${
              activeTab === 'employees'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <UserGroupIcon className="h-4 w-4" />
            <span>Employees</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'calendar' && (
        <WeeklyScheduleView 
          shifts={shifts} 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onShiftClick={(shift) => console.log('Shift clicked:', shift)}
          onTimeSlotClick={(date, time) => console.log('Time slot clicked:', date, time)}
        />
      )}

      {activeTab === 'shifts' && (
        <DataTable
          data={shifts}
          columns={shiftColumns}
          searchable={true}
          searchPlaceholder="Search shifts..."
          searchFields={['employee_name', 'role', 'date']}
          pagination={true}
          pageSize={15}
          defaultSort={{ key: 'date', direction: 'desc' }}
        />
      )}

      {activeTab === 'employees' && (
        <DataTable
          data={employees}
          columns={employeeColumns}
          searchable={true}
          searchPlaceholder="Search employees..."
          searchFields={['name', 'role', 'employee_id']}
          pagination={true}
          pageSize={10}
          defaultSort={{ key: 'name', direction: 'asc' }}
        />
      )}

      {/* Shift Modal Placeholder */}
      <Modal isOpen={showShiftModal} onClose={() => setShowShiftModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule New Shift</h3>
          <p className="text-gray-600">Shift scheduling form will be implemented here.</p>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowShiftModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowShiftModal(false)}>
              Save Shift
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeShiftManagement;
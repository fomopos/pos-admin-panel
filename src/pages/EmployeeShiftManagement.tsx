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
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  DataTable,
  Calendar,
  Modal
} from '../components/ui';

// Mock data types
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
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    
    // Mock employees
    const mockEmployees: Employee[] = [
      {
        employee_id: 'EMP001',
        name: 'Alice Johnson',
        role: 'server',
        hourly_rate: 15.00,
        status: 'active',
        contact: '+1234567890',
        hire_date: '2023-01-15'
      },
      {
        employee_id: 'EMP002',
        name: 'Bob Smith',
        role: 'chef',
        hourly_rate: 20.00,
        status: 'active',
        contact: '+1234567891',
        hire_date: '2022-08-10'
      },
      {
        employee_id: 'EMP003',
        name: 'Carol Williams',
        role: 'server',
        hourly_rate: 16.00,
        status: 'active',
        contact: '+1234567892',
        hire_date: '2023-03-20'
      },
      {
        employee_id: 'EMP004',
        name: 'David Brown',
        role: 'host',
        hourly_rate: 14.00,
        status: 'active',
        contact: '+1234567893',
        hire_date: '2023-06-01'
      },
      {
        employee_id: 'EMP005',
        name: 'Eva Martinez',
        role: 'bartender',
        hourly_rate: 18.00,
        status: 'active',
        contact: '+1234567894',
        hire_date: '2023-02-14'
      }
    ];

    // Mock shifts for the next 7 days
    const mockShifts: Shift[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const shiftDate = new Date(today);
      shiftDate.setDate(today.getDate() + i);
      const dateStr = shiftDate.toISOString().split('T')[0];
      
      // Morning shift - Chef
      mockShifts.push({
        shift_id: `SHF${i}001`,
        employee_id: 'EMP002',
        employee_name: 'Bob Smith',
        role: 'chef',
        date: dateStr,
        start_time: '08:00',
        end_time: '16:00',
        status: i === 0 ? 'in_progress' : 'scheduled',
        hourly_rate: 20.00,
        break_minutes: 60,
        notes: i === 0 ? 'Currently working' : ''
      });

      // Day shift - Servers
      mockShifts.push({
        shift_id: `SHF${i}002`,
        employee_id: 'EMP001',
        employee_name: 'Alice Johnson',
        role: 'server',
        date: dateStr,
        start_time: '11:00',
        end_time: '19:00',
        status: i === 0 ? 'confirmed' : 'scheduled',
        hourly_rate: 15.00,
        break_minutes: 30
      });

      mockShifts.push({
        shift_id: `SHF${i}003`,
        employee_id: 'EMP003',
        employee_name: 'Carol Williams',
        role: 'server',
        date: dateStr,
        start_time: '17:00',
        end_time: '23:00',
        status: 'scheduled',
        hourly_rate: 16.00,
        break_minutes: 30
      });

      // Host shift
      mockShifts.push({
        shift_id: `SHF${i}004`,
        employee_id: 'EMP004',
        employee_name: 'David Brown',
        role: 'host',
        date: dateStr,
        start_time: '16:00',
        end_time: '22:00',
        status: 'scheduled',
        hourly_rate: 14.00,
        break_minutes: 30
      });

      // Evening bartender (Fri-Sat only)
      if (shiftDate.getDay() === 5 || shiftDate.getDay() === 6) {
        mockShifts.push({
          shift_id: `SHF${i}005`,
          employee_id: 'EMP005',
          employee_name: 'Eva Martinez',
          role: 'bartender',
          date: dateStr,
          start_time: '18:00',
          end_time: '02:00',
          status: 'scheduled',
          hourly_rate: 18.00,
          break_minutes: 45
        });
      }
    }

    // const mockTemplates: ShiftTemplate[] = [
    //   {
    //     template_id: 'TPL001',
    //     name: 'Weekday Morning Chef',
    //     day_of_week: 1, // Monday
    //     start_time: '08:00',
    //     end_time: '16:00',
    //     role: 'chef',
    //     required_employees: 1
    //   },
    //   {
    //     template_id: 'TPL002',
    //     name: 'Weekend Dinner Service',
    //     day_of_week: 6, // Saturday
    //     start_time: '17:00',
    //     end_time: '23:00',
    //     role: 'server',
    //     required_employees: 3
    //   }
    // ];

    setEmployees(mockEmployees);
    setShifts(mockShifts);
    // setTemplates(mockTemplates); // Will be used for shift templates
    setLoading(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>

          {/* Selected Date Shifts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Shifts for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getShiftsForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-8">
                      <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No shifts scheduled for this date</p>
                      <Button 
                        onClick={() => setShowShiftModal(true)}
                        className="mt-4"
                        variant="outline"
                      >
                        Schedule New Shift
                      </Button>
                    </div>
                  ) : (
                    getShiftsForDate(selectedDate)
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map((shift) => (
                        <div key={shift.shift_id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h4 className="font-medium text-gray-900">{shift.employee_name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  {getRoleBadge(shift.role)}
                                  {getStatusBadge(shift.status)}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {shift.start_time} - {shift.end_time}
                                </div>
                                <div className="mt-1">
                                  {calculateShiftHours(shift.start_time, shift.end_time).toFixed(1)} hours
                                  @ ${shift.hourly_rate}/hr
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              {shift.status === 'scheduled' && (
                                <Button size="sm" variant="outline" className="text-green-600">
                                  <CheckCircleIcon className="h-4 w-4" />
                                </Button>
                              )}
                              {shift.status === 'confirmed' && (
                                <Button size="sm" variant="outline" className="text-red-600">
                                  <XCircleIcon className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          {shift.notes && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                              {shift.notes}
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
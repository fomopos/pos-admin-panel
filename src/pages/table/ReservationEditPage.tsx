import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  CalendarDaysIcon,
  UserGroupIcon,
  PhoneIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { tableApiService } from '../../services/table';
import { 
  PageHeader, 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Input,
  DropdownSearch,
  Calendar,
  TimeSlotPicker
} from '../../components/ui';
import type { 
  CreateReservationRequest, 
  UpdateReservationRequest, 
  EnhancedTable,
  ReservationStatus,
  DropdownSearchOption 
} from '../../types/table';
import useTenantStore from '../../tenants/tenantStore';

const ReservationEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { reservationId } = useParams<{ reservationId: string }>();
  const isEditing = reservationId !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tables, setTables] = useState<EnhancedTable[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const { currentTenant, currentStore } = useTenantStore();

  const [formData, setFormData] = useState<CreateReservationRequest & UpdateReservationRequest>({
    reservation_id: '',
    table_id: '',
    customer_name: '',
    contact: '',
    reservation_time: '',
    number_of_guests: 2,
    notes: '',
    status: 'confirmed',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInitialData();
  }, [reservationId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const context = {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      };

      // Load tables first
      const tablesData = await tableApiService.getTables(context);
      setTables(tablesData);

      // If editing, load reservation data
      if (isEditing && reservationId) {
        const reservationsData = await tableApiService.getReservations(context);
        const reservation = reservationsData.find(r => r.reservation_id === reservationId);
        
        if (reservation) {
          const reservationDate = new Date(reservation.reservation_time);
          setSelectedDate(reservationDate);
          setSelectedTime(reservationDate.toTimeString().slice(0, 5)); // HH:MM format
          
          setFormData({
            reservation_id: reservation.reservation_id,
            table_id: reservation.table_id,
            customer_name: reservation.customer_name,
            contact: reservation.contact,
            reservation_time: reservation.reservation_time,
            number_of_guests: reservation.number_of_guests,
            notes: reservation.notes || '',
            status: reservation.status,
          });
        }
      } else {
        // Set default reservation date to today and time to next available hour
        const now = new Date();
        const nextHour = new Date();
        nextHour.setHours(now.getHours() + 1, 0, 0, 0);
        
        setSelectedDate(nextHour);
        setSelectedTime('19:00'); // Default to 7 PM
      }
    } catch (error) {
      console.error('Failed to load reservation data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    updateReservationTime(date, selectedTime);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    updateReservationTime(selectedDate, time);
  };

  const updateReservationTime = (date?: Date, time?: string) => {
    if (date && time) {
      const [hours, minutes] = time.split(':');
      const reservationDateTime = new Date(date);
      reservationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      setFormData(prev => ({
        ...prev,
        reservation_time: reservationDateTime.toISOString()
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact information is required';
    }

    if (!formData.table_id) {
      newErrors.table_id = 'Table selection is required';
    }

    if (!selectedDate) {
      newErrors.date = 'Reservation date is required';
    }

    if (!selectedTime) {
      newErrors.time = 'Reservation time is required';
    }

    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      const reservationDateTime = new Date(selectedDate);
      reservationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const now = new Date();
      if (reservationDateTime < now) {
        newErrors.time = 'Reservation time cannot be in the past';
      }
    }

    if (!formData.number_of_guests || formData.number_of_guests < 1) {
      newErrors.number_of_guests = 'Number of guests must be at least 1';
    }

    // Check if selected table has enough capacity
    if (formData.table_id && formData.number_of_guests) {
      const selectedTable = tables.find(t => t.table_id === formData.table_id);
      if (selectedTable && formData.number_of_guests > selectedTable.capacity) {
        newErrors.number_of_guests = `Selected table capacity is ${selectedTable.capacity}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      const context = {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      };

      // Convert local datetime to ISO string
      const reservationData = {
        ...formData,
        reservation_time: new Date(formData.reservation_time).toISOString(),
      };

      if (isEditing && reservationId) {
        await tableApiService.updateReservation(reservationId, reservationData, context);
      } else {
        await tableApiService.createReservation(reservationData, context);
      }

      navigate('/tables?tab=reservations');
    } catch (error) {
      console.error('Failed to save reservation:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTableDropdownOptions = (): DropdownSearchOption[] => {
    return tables
      .filter(table => table.active)
      .map(table => ({
        id: table.table_id,
        label: table.name,
        description: `Zone: ${table.zone_name || 'No zone'} • Capacity: ${table.capacity} • Status: ${table.status}`,
      }));
  };

  const getTableDisplayValue = (): string => {
    if (!formData.table_id) return 'Select a table...';
    
    const table = tables.find(t => t.table_id === formData.table_id);
    return table ? `${table.name} (${table.zone_name || 'No zone'})` : 'Unknown Table';
  };

  const handleTableSelect = (option: DropdownSearchOption | null) => {
    handleInputChange('table_id', option?.id || '');
  };

  const getSelectedTableInfo = () => {
    if (!formData.table_id) return null;
    return tables.find(t => t.table_id === formData.table_id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reservation data...</p>
        </div>
      </div>
    );
  }

  const selectedTable = getSelectedTableInfo();

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title={isEditing ? 'Edit Reservation' : 'Create Reservation'}
        description={isEditing ? 'Update reservation details' : 'Make a new table reservation'}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/tables?tab=reservations')}
          >
            <XMarkIcon className="w-5 h-5 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? 'Saving...' : (isEditing ? 'Update Reservation' : 'Create Reservation')}
          </Button>
        </div>
      </PageHeader>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDaysIcon className="h-6 w-6 mr-2" />
              Reservation Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  placeholder="Enter customer's full name"
                  error={errors.customer_name}
                />
                {errors.customer_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information *
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    value={formData.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    placeholder="Phone number or email"
                    className="pl-10"
                    error={errors.contact}
                  />
                </div>
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
                )}
              </div>
            </div>

            {/* Reservation Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  <CalendarDaysIcon className="inline h-4 w-4 mr-2" />
                  Select Date *
                </label>
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  minDate={new Date()} // No past dates
                  maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 days in future
                />
                {errors.date && (
                  <p className="mt-2 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              {/* Time Slot Section */}
              <div>
                <TimeSlotPicker
                  selectedTime={selectedTime}
                  onTimeSelect={handleTimeSelect}
                  disabled={!selectedDate}
                />
                {errors.time && (
                  <p className="mt-2 text-sm text-red-600">{errors.time}</p>
                )}
                
                {/* Confirmation */}
                {selectedDate && selectedTime && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Reservation Time Confirmed
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} at {selectedTime}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <div className="relative">
                  <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.number_of_guests}
                    onChange={(e) => handleInputChange('number_of_guests', parseInt(e.target.value) || 0)}
                    className="pl-10"
                    error={errors.number_of_guests}
                  />
                </div>
                {errors.number_of_guests && (
                  <p className="mt-1 text-sm text-red-600">{errors.number_of_guests}</p>
                )}
              </div>
            </div>

            {/* Table Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Selection *
              </label>
              <DropdownSearch
                label="Table Selection"
                value={formData.table_id}
                options={getTableDropdownOptions()}
                onSelect={handleTableSelect}
                displayValue={() => getTableDisplayValue()}
                placeholder="Select a table..."
                searchPlaceholder="Search tables..."
                error={errors.table_id}
              />
              {errors.table_id && (
                <p className="mt-1 text-sm text-red-600">{errors.table_id}</p>
              )}
              
              {/* Selected Table Info */}
              {selectedTable && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Table Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-blue-600">Name:</span>
                      <div className="font-medium">{selectedTable.name}</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Zone:</span>
                      <div className="font-medium">{selectedTable.zone_name || 'No zone'}</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Capacity:</span>
                      <div className="font-medium">{selectedTable.capacity} guests</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Status:</span>
                      <div className="font-medium capitalize">{selectedTable.status.replace('_', ' ')}</div>
                    </div>
                  </div>
                  {formData.number_of_guests > selectedTable.capacity && (
                    <div className="mt-2 text-sm text-red-600">
                      ⚠️ Guest count exceeds table capacity
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reservation Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reservation Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as ReservationStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="seated">Seated</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special requests, dietary restrictions, or notes..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Reservation ID */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reservation ID (Optional)
                </label>
                <Input
                  value={formData.reservation_id}
                  onChange={(e) => handleInputChange('reservation_id', e.target.value)}
                  placeholder="Auto-generated if empty"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty for automatic generation
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReservationEditPage;
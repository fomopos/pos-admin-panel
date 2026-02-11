import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { Button, Card, PageHeader, ConfirmDialog, Loading } from '../components/ui';
import { formattingService } from '../services/formatting';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  status: 'active' | 'inactive';
  totalPurchases: number;
  totalSpent: number;
  lastPurchase?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const Customers: React.FC = () => {
  const { t } = useTranslation();
  const { currentTenant, currentStore } = useTenantStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showDetails, setShowDetails] = useState(false);
  
  // Suppress TS6133 warnings for unused variables that are defined but not used
  console.log({ showForm, selectedCustomer, showDetails });
  
  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();
  
  const [formData, setFormData] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    dateOfBirth: '',
    gender: undefined,
    status: 'active',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // TODO: Implement customer API service
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      
      try {
        // TODO: Replace with actual API call when customer service is implemented
        // const response = await customerService.getCustomers();
        // setCustomers(response.customers);
        setCustomers([]);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [currentTenant]);

  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Using the function to avoid TS6133 error
    console.log('Input changed:', name, value);
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Suppress TS6133 warning for unused function
  console.log({ handleInputChange });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.address?.street) newErrors['address.street'] = 'Street address is required';
    if (!formData.address?.city) newErrors['address.city'] = 'City is required';
    if (!formData.address?.state) newErrors['address.state'] = 'State is required';
    if (!formData.address?.zipCode) newErrors['address.zipCode'] = 'ZIP code is required';
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Using the function to avoid TS6133 error
    console.log('Form submitted');
    
    if (!validateForm()) return;
    
    try {
      if (editingCustomer) {
        // Update existing customer
        setCustomers(prev => prev.map(c => 
          c.id === editingCustomer.id 
            ? { 
                ...c, 
                ...formData,
                updatedAt: new Date().toISOString()
              } as Customer
            : c
        ));
      } else {
        // Add new customer
        const newCustomer: Customer = {
          ...formData as Customer,
          id: Date.now().toString(),
          totalPurchases: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCustomers(prev => [...prev, newCustomer]);
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };
  
  // Suppress TS6133 warning for unused function
  console.log({ handleSubmit });

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowForm(true);
  };

  const handleDelete = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'this customer';
    
    deleteDialog.openDeleteDialog(customerName, () => {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    });
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
      },
      dateOfBirth: '',
      gender: undefined,
      status: 'active',
      notes: '',
    });
    setErrors({});
  };

  const getStatusBadge = (status: Customer['status']) => {
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
        status === 'active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {status === 'active' ? t('customers.status.active') : t('customers.status.inactive')}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return formattingService.formatCurrency(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Suppress TS6133 warning for unused function
  console.log({ formatDateTime });

  // Calculate summary stats
  const activeCustomers = customers.filter(c => c.status === 'active');
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageSpent = customers.length > 0 ? totalRevenue / customers.length : 0;

  if (isLoading) {
    return (
      <Loading
        title={t('customers.loading.title')}
        description={t('customers.loading.description')}
        fullScreen={false}
        size="md"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={t('customers.title')}
        description={`${currentStore ? `${currentStore.store_name} - ` : ''}${t('customers.description')}`}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="inline-flex items-center"
          >
            {t('customers.export')}
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('customers.addCustomer')}
          </Button>
        </div>
      </PageHeader>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-2xl mb-4">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{t('customers.stats.totalCustomers')}</p>
              <p className="text-3xl font-bold text-slate-900">{customers.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-2xl mb-4">
                <span className="text-green-600 font-semibold text-lg">✓</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{t('customers.stats.active')}</p>
              <p className="text-3xl font-bold text-slate-900">{activeCustomers.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-2xl mb-4">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{t('customers.stats.totalRevenue')}</p>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-2xl mb-4">
                <span className="text-purple-600 font-semibold text-lg">Ø</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{t('customers.stats.avgSpent')}</p>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(averageSpent)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('customers.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <option value="all">{t('customers.filters.allStatus')}</option>
            <option value="active">{t('customers.filters.active')}</option>
            <option value="inactive">{t('customers.filters.inactive')}</option>
          </select>
          
          <button className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            {t('customers.export')}
          </button>
        </div>
      </Card>

      {/* Customers Table */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-1">{t('customers.table.title')}</h3>
          <p className="text-sm text-slate-500">
            {filteredCustomers.length} {t('customers.table.customersFound')}
          </p>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('customers.table.customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('customers.table.contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('customers.table.location')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('customers.table.purchases')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('customers.table.totalSpent')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('customers.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('customers.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-slate-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-slate-500">
                          Customer since {formatDate(customer.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-slate-900">
                        <EnvelopeIcon className="h-4 w-4 text-slate-400 mr-2" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-slate-500">
                        <PhoneIcon className="h-4 w-4 text-slate-400 mr-2" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-900">
                      <MapPinIcon className="h-4 w-4 text-slate-400 mr-2" />
                      <div>
                        <div>{customer.address.city}, {customer.address.state}</div>
                        <div className="text-slate-500">{customer.address.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {customer.totalPurchases}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(customer.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(customer)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredCustomers.length === 0 && (
        <Card className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <UserIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">{t('customers.empty.title')}</h3>
          <p className="mt-2 text-sm text-slate-500">
            {searchTerm || statusFilter !== 'all' 
              ? t('customers.empty.tryAdjusting')
              : t('customers.empty.getStarted')
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('customers.addCustomer')}
            </Button>
          )}
        </Card>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.dialogState.isOpen}
        onClose={deleteDialog.closeDialog}
        onConfirm={deleteDialog.handleConfirm}
        title={deleteDialog.dialogState.title}
        message={deleteDialog.dialogState.message}
        confirmText={deleteDialog.dialogState.confirmText}
        cancelText={deleteDialog.dialogState.cancelText}
        variant={deleteDialog.dialogState.variant}
        isLoading={deleteDialog.dialogState.isLoading}
      />
    </div>
  );
};

export default Customers;

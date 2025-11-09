'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchCustomers, checkAdminAuthStatus } from '@/store';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import CustomersTable from '@/components/CustomersTable';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { 
  UsersIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldExclamationIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Customer } from '@/store';
import { formatINR } from '@/lib/currency';

export default function CustomersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const { customers, loading: customersLoading } = useSelector((state: RootState) => state.dashboard);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(checkAdminAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCustomers());
    }
  }, [isAuthenticated, dispatch]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleRefresh = () => {
    dispatch(fetchCustomers());
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="neutral">Inactive</Badge>;
      case 'banned':
        return <Badge variant="error">Banned</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
  const avgOrderValue = customers.length > 0 ? totalRevenue / totalOrders : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 page-transition">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Customers</h1>
            <p className="text-text-secondary mt-1">Manage customer accounts and view analytics</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-soft"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Customers</p>
                <p className="text-3xl font-bold mt-2">{customers.length}</p>
              </div>
              <UsersIcon className="h-12 w-12 text-purple-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold mt-2">{formatINR(totalRevenue)}</p>
              </div>
              <CurrencyDollarIcon className="h-12 w-12 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{totalOrders}</p>
              </div>
              <ShoppingBagIcon className="h-12 w-12 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Avg Order Value</p>
                <p className="text-2xl font-bold mt-2">{formatINR(avgOrderValue)}</p>
              </div>
              <CurrencyDollarIcon className="h-12 w-12 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-lg shadow-elevated p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-64">
              <SearchInput
                placeholder="Search customers..."
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary custom-select"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Customers Table */}
        {customersLoading ? (
          <div className="bg-surface rounded-lg shadow-elevated p-6">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            icon={<UsersIcon className="w-16 h-16 text-gray-400" />}
            title="No customers found"
            description={searchTerm || statusFilter !== 'all'
              ? "No customers match your search or filter criteria."
              : "No customers have registered yet."
            }
          />
        ) : (
          <div className="bg-surface rounded-lg shadow-elevated overflow-hidden">
            <CustomersTable customers={filteredCustomers} />
          </div>
        )}

        {/* Customer Details Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedCustomer?.name}
          size="lg"
        >
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 pb-4 border-b border-border">
                <div className="h-20 w-20 rounded-full bg-success flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary">{selectedCustomer.name}</h3>
                  <div className="flex items-center mt-2">
                    {getStatusBadge(selectedCustomer.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center text-text-secondary mb-2">
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-text-primary">{selectedCustomer.email}</p>
                </div>
                <div>
                  <div className="flex items-center text-text-secondary mb-2">
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="text-text-primary">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <div className="flex items-center text-text-secondary mb-2">
                    <ShoppingBagIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Total Orders</span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{selectedCustomer.totalOrders}</p>
                </div>
                <div>
                  <div className="flex items-center text-text-secondary mb-2">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Total Spent</span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{formatINR(selectedCustomer.totalSpent)}</p>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center text-text-secondary mb-2">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Member Since</span>
                  </div>
                  <p className="text-text-primary">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}


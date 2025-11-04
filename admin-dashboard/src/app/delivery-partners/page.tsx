'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchDeliveryPartners, checkAdminAuthStatus } from '@/store';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import DeliveryPartnersTable from '@/components/DeliveryPartnersTable';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/Modal';
import { 
  TruckIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldExclamationIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { DeliveryPartner } from '@/store';

export default function DeliveryPartnersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const { deliveryPartners, loading: partnersLoading } = useSelector((state: RootState) => state.dashboard);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(checkAdminAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDeliveryPartners());
    }
  }, [isAuthenticated, dispatch]);

  const filteredPartners = deliveryPartners.filter(partner => {
    const matchesSearch = searchTerm === '' || 
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;
    const matchesVehicle = vehicleFilter === 'all' || partner.vehicleType.toLowerCase().includes(vehicleFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesVehicle;
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
    dispatch(fetchDeliveryPartners());
  };

  const handlePartnerClick = (partner: DeliveryPartner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="neutral">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="error">Suspended</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const averageRating = deliveryPartners.length > 0
    ? (deliveryPartners.reduce((sum, p) => sum + p.rating, 0) / deliveryPartners.length).toFixed(1)
    : '0.0';

  const totalDeliveries = deliveryPartners.reduce((sum, p) => sum + p.totalDeliveries, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 page-transition">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Delivery Partners</h1>
            <p className="text-text-secondary mt-1">Manage delivery partners and their performance</p>
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
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Total Partners</p>
                <p className="text-3xl font-bold mt-2">{deliveryPartners.length}</p>
              </div>
              <TruckIcon className="h-12 w-12 text-indigo-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold mt-2">{averageRating} ★</p>
              </div>
              <StarIcon className="h-12 w-12 text-yellow-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active</p>
                <p className="text-3xl font-bold mt-2">{deliveryPartners.filter(p => p.status === 'active').length}</p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Deliveries</p>
                <p className="text-3xl font-bold mt-2">{totalDeliveries}</p>
              </div>
              <MapPinIcon className="h-12 w-12 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-lg shadow-elevated p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-64">
              <SearchInput
                placeholder="Search partners..."
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
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary custom-select"
            >
              <option value="all">All Vehicles</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
            </select>
            {(searchTerm || statusFilter !== 'all' || vehicleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setVehicleFilter('all');
                }}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Partners Table */}
        {partnersLoading ? (
          <div className="bg-surface rounded-lg shadow-elevated p-6">
            <TableSkeleton rows={5} cols={7} />
          </div>
        ) : filteredPartners.length === 0 ? (
          <EmptyState
            icon={<TruckIcon className="w-16 h-16 text-gray-400" />}
            title="No delivery partners found"
            description={searchTerm || statusFilter !== 'all' || vehicleFilter !== 'all'
              ? "No delivery partners match your search or filter criteria."
              : "No delivery partners have been registered yet."
            }
          />
        ) : (
          <div className="bg-surface rounded-lg shadow-elevated overflow-hidden">
            <DeliveryPartnersTable deliveryPartners={filteredPartners} />
          </div>
        )}

        {/* Partner Details Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedPartner?.name}
          size="lg"
        >
          {selectedPartner && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 pb-4 border-b border-border">
                <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {selectedPartner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary">{selectedPartner.name}</h3>
                  <div className="flex items-center mt-2">
                    {getStatusBadge(selectedPartner.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center text-text-secondary mb-2">
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-text-primary">{selectedPartner.email}</p>
                </div>
                <div>
                  <div className="flex items-center text-text-secondary mb-2">
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="text-text-primary">{selectedPartner.phone}</p>
                </div>
                <div>
                  <div className="flex items-center text-text-secondary mb-2">
                    <TruckIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Vehicle</span>
                  </div>
                  <p className="text-text-primary">{selectedPartner.vehicleType}</p>
                </div>
                <div>
                  <div className="flex items-center text-text-secondary mb-2">
                    <span className="text-sm font-medium mr-2">License</span>
                  </div>
                  <p className="text-text-primary">{selectedPartner.licenseNumber}</p>
                </div>
                <div>
                  <div className="flex items-center text-text-secondary mb-2">
                    <StarIcon className="h-5 w-5 mr-2 text-yellow-500" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-text-primary">{selectedPartner.rating}</span>
                    <span className="text-yellow-400 ml-2">★</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center text-text-secondary mb-2">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Total Deliveries</span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{selectedPartner.totalDeliveries}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}


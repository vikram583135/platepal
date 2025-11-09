'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchRestaurants, checkAdminAuthStatus } from '@/store';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import RestaurantsTable from '@/components/RestaurantsTable';
import LoadingSkeleton, { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { 
  BuildingStorefrontIcon, 
  Squares2X2Icon, 
  TableCellsIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Restaurant } from '@/store';

type ViewMode = 'grid' | 'table';

export default function RestaurantsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const { restaurants, loading: restaurantsLoading } = useSelector((state: RootState) => state.dashboard);
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(checkAdminAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchRestaurants());
    }
  }, [isAuthenticated, dispatch]);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = searchTerm === '' || 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
    
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
    dispatch(fetchRestaurants());
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
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

  return (
    <DashboardLayout>
      <div className="space-y-6 page-transition">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Restaurants</h1>
            <p className="text-text-secondary mt-1">Manage all restaurants on the platform</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-soft"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Restaurants</p>
                <p className="text-3xl font-bold mt-2">{restaurants.length}</p>
              </div>
              <BuildingStorefrontIcon className="h-12 w-12 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active</p>
                <p className="text-3xl font-bold mt-2">{restaurants.filter(r => r.status === 'active').length}</p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Inactive</p>
                <p className="text-3xl font-bold mt-2">{restaurants.filter(r => r.status === 'inactive').length}</p>
              </div>
              <XCircleIcon className="h-12 w-12 text-gray-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Suspended</p>
                <p className="text-3xl font-bold mt-2">{restaurants.filter(r => r.status === 'suspended').length}</p>
              </div>
              <ShieldExclamationIcon className="h-12 w-12 text-red-200" />
            </div>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="bg-surface rounded-lg shadow-elevated p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 flex-1">
              <div className="w-full md:w-64">
                <SearchInput
                  placeholder="Search restaurants..."
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
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                <TableCellsIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {restaurantsLoading ? (
          <div className="bg-surface rounded-lg shadow-elevated p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4">
                    <LoadingSkeleton variant="rounded" className="h-48 mb-4" />
                    <LoadingSkeleton variant="text" className="mb-2" />
                    <LoadingSkeleton variant="text" className="w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <TableSkeleton rows={5} cols={6} />
            )}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <EmptyState
            icon={<BuildingStorefrontIcon className="w-16 h-16 text-gray-400" />}
            title="No restaurants found"
            description={searchTerm || statusFilter !== 'all'
              ? "No restaurants match your search or filter criteria. Try adjusting your filters."
              : "No restaurants have been registered yet."
            }
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => handleRestaurantClick(restaurant)}
                className="bg-surface rounded-lg shadow-elevated overflow-hidden cursor-pointer card-hover group"
              >
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {getStatusBadge(restaurant.status)}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{restaurant.name}</h3>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{restaurant.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-yellow-500">
                      <span>★</span>
                      <span className="ml-1 text-text-primary">{restaurant.rating}</span>
                    </div>
                    <div className="text-text-secondary">⏱ {restaurant.deliveryTime}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-text-secondary">Owner: {restaurant.ownerName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-lg shadow-elevated overflow-hidden">
            <RestaurantsTable restaurants={filteredRestaurants} />
          </div>
        )}

        {/* Restaurant Details Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedRestaurant?.name}
          size="lg"
        >
          {selectedRestaurant && (
            <div className="space-y-6">
              <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={selectedRestaurant.image}
                  alt={selectedRestaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-1">Owner</p>
                  <p className="text-text-primary">{selectedRestaurant.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-1">Status</p>
                  {getStatusBadge(selectedRestaurant.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-1">Rating</p>
                  <div className="flex items-center text-yellow-500">
                    <span>★</span>
                    <span className="ml-1 text-text-primary">{selectedRestaurant.rating}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-1">Delivery Time</p>
                  <p className="text-text-primary">⏱ {selectedRestaurant.deliveryTime}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">Description</p>
                <p className="text-text-primary">{selectedRestaurant.description}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}


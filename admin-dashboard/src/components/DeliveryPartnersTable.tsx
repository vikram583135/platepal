'use client';

import { DeliveryPartner } from '@/store';
import DataTable, { Column } from './DataTable';

interface DeliveryPartnersTableProps {
  deliveryPartners: DeliveryPartner[];
}

export default function DeliveryPartnersTable({ deliveryPartners }: DeliveryPartnersTableProps) {
  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      active: 'badge-success',
      inactive: 'bg-border text-text-secondary',
      suspended: 'badge-error',
    };
    return statusClasses[status] || 'bg-border text-text-secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const columns: Column<DeliveryPartner>[] = [
    {
      key: 'name',
      label: 'Partner',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 mr-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {String(value).charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-text-primary">{String(value)}</div>
            <div className="text-sm text-text-secondary">{row.licenseNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-sm text-text-primary">{row.email}</div>
          <div className="text-sm text-text-secondary">{row.phone}</div>
        </div>
      ),
    },
    {
      key: 'vehicleType',
      label: 'Vehicle',
      sortable: true,
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <span className="text-yellow-400">★</span>
          <span className="ml-1">{Number(value).toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: 'totalDeliveries',
      label: 'Deliveries',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex ${getStatusBadge(String(value))}`}>
          {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (value) => <span className="text-text-secondary">{formatDate(String(value))}</span>,
      format: (value) => formatDate(String(value)),
    },
  ];

  return (
    <DataTable
      data={deliveryPartners}
      columns={columns}
      title="Delivery Partners"
      searchable={true}
      searchPlaceholder="Search partners..."
      searchKeys={['name', 'email', 'phone', 'licenseNumber']}
      exportable={true}
      exportFilename="delivery-partners"
      pagination={true}
      itemsPerPage={10}
      emptyMessage="No delivery partners found"
    />
  );
}

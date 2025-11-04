'use client';

import { Restaurant } from '@/store';
import DataTable, { Column } from './DataTable';
import Image from 'next/image';

interface RestaurantsTableProps {
  restaurants: Restaurant[];
}

export default function RestaurantsTable({ restaurants }: RestaurantsTableProps) {
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

  const columns: Column<Restaurant>[] = [
    {
      key: 'name',
      label: 'Restaurant',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 mr-3">
            <Image
              className="h-10 w-10 rounded-full object-cover"
              src={row.image}
              alt={row.name}
              width={40}
              height={40}
            />
          </div>
          <div>
            <div className="text-sm font-medium text-text-primary">{row.name}</div>
            <div className="text-sm text-text-secondary">{row.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'ownerName',
      label: 'Owner',
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
      key: 'deliveryTime',
      label: 'Delivery Time',
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
      data={restaurants}
      columns={columns}
      title="Restaurants"
      searchable={true}
      searchPlaceholder="Search restaurants..."
      searchKeys={['name', 'ownerName', 'description']}
      exportable={true}
      exportFilename="restaurants"
      pagination={true}
      itemsPerPage={10}
      emptyMessage="No restaurants found"
    />
  );
}

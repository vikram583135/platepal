'use client';

import { Customer } from '@/store';
import { formatINR } from '@/lib/currency';
import DataTable, { Column } from './DataTable';

interface CustomersTableProps {
  customers: Customer[];
}

export default function CustomersTable({ customers }: CustomersTableProps) {
  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      active: 'badge-success',
      inactive: 'bg-border text-text-secondary',
      banned: 'badge-error',
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

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      label: 'Customer',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 mr-3">
            <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {String(value).charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-sm font-medium text-text-primary">{String(value)}</div>
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
      key: 'totalOrders',
      label: 'Orders',
      sortable: true,
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      render: (value) => <span className="font-semibold">{formatINR(Number(value))}</span>,
      format: (value) => formatINR(Number(value), false),
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
      data={customers}
      columns={columns}
      title="Customers"
      searchable={true}
      searchPlaceholder="Search customers..."
      searchKeys={['name', 'email', 'phone']}
      exportable={true}
      exportFilename="customers"
      pagination={true}
      itemsPerPage={10}
      emptyMessage="No customers found"
    />
  );
}

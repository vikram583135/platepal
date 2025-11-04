'use client';

import { Order } from '@/store';
import { formatINR } from '@/lib/currency';
import DataTable, { Column } from './DataTable';
import { useState } from 'react';
import Modal from './Modal';

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      preparing: 'badge-info',
      ready: 'badge-warning',
      delivered: 'badge-success',
      cancelled: 'badge-error',
    };
    return statusClasses[status] || 'bg-border text-text-secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const columns: Column<Order>[] = [
    {
      key: 'id',
      label: 'Order ID',
      render: (value) => `#${String(value).slice(-8)}`,
      format: (value) => String(value).slice(-8),
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'restaurantName',
      label: 'Restaurant',
      sortable: true,
    },
    {
      key: 'total',
      label: 'Total',
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
      label: 'Date',
      sortable: true,
      render: (value) => <span className="text-text-secondary">{formatDate(String(value))}</span>,
      format: (value) => formatDate(String(value)),
    },
  ];

  return (
    <>
      <DataTable
        data={orders}
        columns={columns}
        title="Orders"
        searchable={true}
        searchPlaceholder="Search orders..."
        searchKeys={['id', 'customerName', 'restaurantName']}
        exportable={true}
        exportFilename="orders"
        pagination={true}
        itemsPerPage={10}
        onRowClick={handleRowClick}
        emptyMessage="No orders found"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Order Details - #${selectedOrder?.id.slice(-8)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-text-secondary">Customer</p>
                <p className="text-text-primary">{selectedOrder.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Restaurant</p>
                <p className="text-text-primary">{selectedOrder.restaurantName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Status</p>
                <span className={`inline-flex mt-1 ${getStatusBadge(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Total</p>
                <p className="text-text-primary font-semibold">{formatINR(selectedOrder.total)}</p>
              </div>
              {selectedOrder.deliveryPartnerName && (
                <div>
                  <p className="text-sm font-medium text-text-secondary">Delivery Partner</p>
                  <p className="text-text-primary">{selectedOrder.deliveryPartnerName}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-text-secondary">Date</p>
                <p className="text-text-primary">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">Items</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-primary-light bg-opacity-10 rounded">
                    <span className="text-text-primary">{item.name}</span>
                    <span className="text-text-primary">
                      {item.quantity} × {formatINR(item.price)} = {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

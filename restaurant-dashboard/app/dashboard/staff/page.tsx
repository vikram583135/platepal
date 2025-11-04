'use client';

import { Plus, UserCircle2, Mail, Phone, Shield, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function StaffPage() {
  const staff = [
    { id: '1', name: 'John Doe', email: 'john@restaurant.com', phone: '+91 98765 43210', role: 'Manager', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane@restaurant.com', phone: '+91 98765 43211', role: 'Chef', status: 'Active' },
    { id: '3', name: 'Mike Johnson', email: 'mike@restaurant.com', phone: '+91 98765 43212', role: 'Waiter', status: 'Active' },
    { id: '4', name: 'Sarah Williams', email: 'sarah@restaurant.com', phone: '+91 98765 43213', role: 'Chef', status: 'On Leave' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Staff Management</h1>
          <p className="text-text-secondary mt-1">Manage your team and their roles</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/staff/schedule"
            className="px-4 py-2 bg-surface border border-border rounded-lg hover:bg-background transition-colors flex items-center gap-2 text-text-primary font-medium"
          >
            <Calendar size={18} />
            <span>View Schedule</span>
          </Link>
          <button
            onClick={() => toast.info('Add staff dialog coming soon!')}
            className="px-4 py-2 gradient-primary text-white rounded-lg hover-lift transition-all flex items-center gap-2 font-medium"
          >
            <Plus size={18} />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <h3 className="text-text-secondary text-sm font-medium mb-3">Total Staff</h3>
          <p className="text-3xl font-bold text-text-primary">{staff.length}</p>
        </div>
        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <h3 className="text-text-secondary text-sm font-medium mb-3">Active</h3>
          <p className="text-3xl font-bold text-success">{staff.filter(s => s.status === 'Active').length}</p>
        </div>
        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <h3 className="text-text-secondary text-sm font-medium mb-3">On Leave</h3>
          <p className="text-3xl font-bold text-warning">{staff.filter(s => s.status === 'On Leave').length}</p>
        </div>
        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <h3 className="text-text-secondary text-sm font-medium mb-3">Departments</h3>
          <p className="text-3xl font-bold text-text-primary">3</p>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-surface rounded-lg shadow-soft overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Team Members</h2>
        </div>
        <div className="divide-y divide-border">
          {staff.map((member, index) => (
            <div key={member.id} className="p-6 hover:bg-background transition-colors animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
                  <UserCircle2 className="text-white" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary">{member.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <Mail size={14} />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <Phone size={14} />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary-light rounded-full">
                    <Shield size={14} className="text-primary" />
                    <span className="text-sm font-semibold text-primary">{member.role}</span>
                  </div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    member.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {member.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


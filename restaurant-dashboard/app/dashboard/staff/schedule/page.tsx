'use client';

import { useState } from 'react';
import { Calendar, Clock, User, Plus, Edit, Save, X } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import { toast } from 'sonner';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface Schedule {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  shiftType: 'morning' | 'afternoon' | 'evening' | 'night';
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [isCreating, setIsCreating] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const staff: StaffMember[] = [
    { id: '1', name: 'John Doe', role: 'Manager', email: 'john@restaurant.com' },
    { id: '2', name: 'Jane Smith', role: 'Chef', email: 'jane@restaurant.com' },
    { id: '3', name: 'Mike Johnson', role: 'Waiter', email: 'mike@restaurant.com' },
    { id: '4', name: 'Sarah Williams', role: 'Chef', email: 'sarah@restaurant.com' },
  ];

  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      staffId: '1',
      staffName: 'John Doe',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      breakStart: '13:00',
      breakEnd: '14:00',
      shiftType: 'morning',
    },
    {
      id: '2',
      staffId: '2',
      staffName: 'Jane Smith',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '18:00',
      breakStart: '14:00',
      breakEnd: '15:00',
      shiftType: 'morning',
    },
  ]);

  const getDaysInWeek = (date: Date): Date[] => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDays = viewMode === 'week' ? getDaysInWeek(new Date(selectedDate)) : [];

  const getShiftColor = (shiftType: string) => {
    switch (shiftType) {
      case 'morning':
        return 'bg-secondary/20 border-secondary text-secondary';
      case 'afternoon':
        return 'bg-accent/20 border-accent text-accent-dark';
      case 'evening':
        return 'bg-primary/20 border-primary text-primary';
      case 'night':
        return 'bg-surface-dark/20 border-surface-dark text-text-primary';
      default:
        return 'bg-background border-border text-text-primary';
    }
  };

  const handleSaveSchedule = (schedule: Omit<Schedule, 'id'>) => {
    if (editingSchedule) {
      setSchedules(prev =>
        prev.map(s => (s.id === editingSchedule.id ? { ...editingSchedule, ...schedule, id: editingSchedule.id } : s))
      );
      toast.success('Schedule updated');
      setEditingSchedule(null);
    } else {
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        ...schedule,
      };
      setSchedules(prev => [...prev, newSchedule]);
      toast.success('Schedule created');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Staff Scheduling</h1>
          <p className="text-text-secondary mt-1">Manage shifts and schedules for your team</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'day' | 'week' | 'month')}
            className="px-4 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 gradient-primary text-white rounded-lg hover-lift transition-all flex items-center gap-2 font-medium"
          >
            <Plus size={18} />
            <span>New Schedule</span>
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-surface rounded-lg p-4 shadow-soft flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const date = new Date(selectedDate);
              if (viewMode === 'week') {
                date.setDate(date.getDate() - 7);
              } else {
                date.setDate(date.getDate() - 1);
              }
              setSelectedDate(date.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <Calendar className="text-text-primary" size={20} />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => {
              const date = new Date(selectedDate);
              if (viewMode === 'week') {
                date.setDate(date.getDate() + 7);
              } else {
                date.setDate(date.getDate() + 1);
              }
              setSelectedDate(date.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <Calendar className="text-text-primary" size={20} />
          </button>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-4 py-2 bg-background border border-border rounded-lg text-text-primary hover:bg-primary-light hover:bg-opacity-10 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Schedule View */}
      {viewMode === 'week' && (
        <div className="bg-surface rounded-lg shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Staff</th>
                  {weekDays.map((day, index) => (
                    <th
                      key={index}
                      className={`px-4 py-3 text-center text-sm font-semibold text-text-primary ${
                        day.toDateString() === new Date().toDateString() ? 'bg-primary-light bg-opacity-20' : ''
                      }`}
                    >
                      <div>{day.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                      <div className="text-xs text-text-secondary font-normal">
                        {day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-background transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
                          <User className="text-white" size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary">{member.name}</div>
                          <div className="text-xs text-text-secondary">{member.role}</div>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((day) => {
                      const daySchedule = schedules.find(
                        s => s.staffId === member.id && s.date === day.toISOString().split('T')[0]
                      );
                      return (
                        <td key={day.toDateString()} className="px-2 py-2">
                          {daySchedule ? (
                            <div
                              className={`p-2 rounded-lg border-2 ${getShiftColor(daySchedule.shiftType)} cursor-pointer hover:shadow-md transition-all`}
                              onClick={() => setEditingSchedule(daySchedule)}
                            >
                              <div className="flex items-center gap-1 text-xs font-semibold mb-1">
                                <Clock size={12} />
                                <span>{daySchedule.startTime} - {daySchedule.endTime}</span>
                              </div>
                              <div className="text-xs capitalize">{daySchedule.shiftType}</div>
                              {daySchedule.breakStart && (
                                <div className="text-xs opacity-75 mt-1">
                                  Break: {daySchedule.breakStart} - {daySchedule.breakEnd}
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsCreating(true)}
                              className="w-full h-16 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary-light hover:bg-opacity-5 transition-all flex items-center justify-center text-text-secondary hover:text-primary"
                            >
                              <Plus size={16} />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Schedule Modal */}
      {(isCreating || editingSchedule) && (
        <ScheduleModal
          staff={staff}
          schedule={editingSchedule}
          selectedDate={selectedDate}
          onSave={handleSaveSchedule}
          onClose={() => {
            setIsCreating(false);
            setEditingSchedule(null);
          }}
        />
      )}
    </div>
  );
}

interface ScheduleModalProps {
  staff: StaffMember[];
  schedule: Schedule | null;
  selectedDate: string;
  onSave: (schedule: Omit<Schedule, 'id'>) => void;
  onClose: () => void;
}

function ScheduleModal({ staff, schedule, selectedDate, onSave, onClose }: ScheduleModalProps) {
  const [formData, setFormData] = useState({
    staffId: schedule?.staffId || staff[0]?.id || '',
    date: schedule?.date || selectedDate,
    startTime: schedule?.startTime || '09:00',
    endTime: schedule?.endTime || '17:00',
    breakStart: schedule?.breakStart || '',
    breakEnd: schedule?.breakEnd || '',
    shiftType: schedule?.shiftType || 'morning',
  });

  const selectedStaff = staff.find(s => s.id === formData.staffId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      staffId: formData.staffId,
      staffName: selectedStaff?.name || '',
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      breakStart: formData.breakStart || undefined,
      breakEnd: formData.breakEnd || undefined,
      shiftType: formData.shiftType as Schedule['shiftType'],
    });
  };

  return (
    <div className="fixed inset-0 bg-surface-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface rounded-lg shadow-floating p-6 max-w-md w-full animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            {schedule ? 'Edit Schedule' : 'Create Schedule'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Staff Member</label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Shift Type</label>
            <select
              value={formData.shiftType}
              onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as 'morning' | 'afternoon' | 'evening' | 'night' })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Break Start (Optional)</label>
              <input
                type="time"
                value={formData.breakStart}
                onChange={(e) => setFormData({ ...formData, breakStart: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Break End (Optional)</label>
              <input
                type="time"
                value={formData.breakEnd}
                onChange={(e) => setFormData({ ...formData, breakEnd: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 gradient-primary text-white rounded-lg hover-lift transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Save size={18} />
              {schedule ? 'Update' : 'Create'} Schedule
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-background border border-border rounded-lg text-text-primary hover:bg-primary-light hover:bg-opacity-10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


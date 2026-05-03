import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Calendar({ user }) {
  const [projects, setProjects] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'payment_due',
    project_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchReminders();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      toast.error('Error fetching projects');
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await axios.get('/api/reminders');
      setReminders(response.data);
    } catch (error) {
      // Reminders endpoint might not exist yet, that's ok
      console.log('Reminders endpoint not available yet');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getProjectsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return projects.filter(project => {
      const startDate = new Date(project.start_date).toISOString().split('T')[0];
      return startDate === dateStr;
    });
  };

  const getRemindersForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return reminders.filter(reminder => reminder.date === dateStr);
  };

  const getOverdueProjects = () => {
    const today = new Date().toISOString().split('T')[0];
    return projects.filter(project =>
      project.remaining_amount > 0 &&
      project.start_date < today &&
      project.status !== 'full'
    );
  };

  const getTodaysTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysProjects = getProjectsForDate(new Date());
    const todaysReminders = getRemindersForDate(new Date());
    return { projects: todaysProjects, reminders: todaysReminders };
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/reminders', newReminder);
      toast.success('Reminder created successfully!');
      setNewReminder({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'payment_due',
        project_id: ''
      });
      setShowReminderModal(false);
      fetchReminders();
    } catch (error) {
      toast.error('Error creating reminder');
    }
    setLoading(false);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);
  const todaysTasks = getTodaysTasks();
  const overdueProjects = getOverdueProjects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar & Reminders</h1>
          <p className="text-gray-600">Track project deadlines and payment reminders</p>
        </div>
        <button
          onClick={() => setShowReminderModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Add Reminder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ‹
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((date, index) => {
                if (!date) {
                  return <div key={index} className="p-2"></div>;
                }

                const projectsForDate = getProjectsForDate(date);
                const remindersForDate = getRemindersForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`p-2 min-h-[80px] border cursor-pointer hover:bg-gray-50 ${
                      isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {projectsForDate.slice(0, 2).map(project => (
                        <div
                          key={project.id}
                          className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                          title={`${project.customer_name} - ${formatCurrency(project.total_amount)}`}
                        >
                          {project.customer_name}
                        </div>
                      ))}
                      {remindersForDate.slice(0, 1).map(reminder => (
                        <div
                          key={reminder.id}
                          className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded truncate"
                          title={reminder.title}
                        >
                          {reminder.title}
                        </div>
                      ))}
                      {projectsForDate.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{projectsForDate.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Tasks</h3>
            <div className="space-y-3">
              {todaysTasks.projects.length === 0 && todaysTasks.reminders.length === 0 ? (
                <p className="text-gray-500 text-sm">No tasks for today</p>
              ) : (
                <>
                  {todaysTasks.projects.map(project => (
                    <div key={project.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{project.customer_name}</p>
                        <p className="text-sm text-gray-600">{project.category}</p>
                      </div>
                    </div>
                  ))}
                  {todaysTasks.reminders.map(reminder => (
                    <div key={reminder.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{reminder.title}</p>
                        <p className="text-sm text-gray-600">{reminder.time}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Overdue Projects */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overdue Projects</h3>
            <div className="space-y-3">
              {overdueProjects.length === 0 ? (
                <p className="text-gray-500 text-sm">No overdue projects</p>
              ) : (
                overdueProjects.slice(0, 5).map(project => (
                  <div key={project.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{project.customer_name}</p>
                      <p className="text-sm text-red-600">
                        {formatCurrency(project.remaining_amount)} due
                      </p>
                    </div>
                  </div>
                ))
              )}
              {overdueProjects.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{overdueProjects.length - 5} more overdue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Reminder</h2>

            <form onSubmit={handleAddReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Payment reminder, meeting, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newReminder.type}
                  onChange={(e) => setNewReminder({...newReminder, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="payment_due">Payment Due</option>
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Project Deadline</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newReminder.date}
                    onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Project</label>
                <select
                  value={newReminder.project_id}
                  onChange={(e) => setNewReminder({...newReminder, project_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.customer_name} - {project.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
import React, { useState } from 'react';
import { FiCalendar, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

const EventsDashboard = () => {
  const [events, setEvents] = useState([
    { id: 1, title: 'Member Meetup', date: '2024-06-15', time: '18:00', location: 'Club Lounge', description: 'Monthly member social gathering' },
    { id: 2, title: 'Yoga Class', date: '2024-06-16', time: '07:00', location: 'Wellness Center', description: 'Morning yoga session' },
    { id: 3, title: 'Pool Maintenance', date: '2024-06-17', time: '09:00-12:00', location: 'Main Pool', description: 'Pool will be closed for maintenance' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', time: '', location: '', description: ''
  });

  const handleAddEvent = () => {
    setEvents([...events, { ...newEvent, id: Date.now() }]);
    setShowAddModal(false);
    setNewEvent({ title: '', date: '', time: '', location: '', description: '' });
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  return (
    <div className="lost-items-dashboard">
      <div className="dashboard-header">
        <h2><FiCalendar size={18} /> Today's Events</h2>
        <div className="header-controls">
          <button className="add-button primary" onClick={() => setShowAddModal(true)}>
            <FiPlus size={16} /> Add Event
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.date}</td>
                <td>{event.time}</td>
                <td>{event.location}</td>
                <td>
                  <button className="icon-button" onClick={() => deleteEvent(event.id)}>
                    <FiTrash2 />
                  </button>
                  <button className="icon-button">
                    <FiEdit2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-modal">
            <h3>Add New Event</h3>
            <input
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
            />
            <input
              type="date"
              placeholder="Date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
            />
            <input
              type="text"
              placeholder="Time (e.g., 18:00 or 09:00-12:00)"
              value={newEvent.time}
              onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
            />
            <input
              type="text"
              placeholder="Location"
              value={newEvent.location}
              onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
            />
            <textarea
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
            />
            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="primary" onClick={handleAddEvent}>Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsDashboard;
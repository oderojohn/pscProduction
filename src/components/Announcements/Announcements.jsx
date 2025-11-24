// src/components/AnnouncementsDashboard.jsx
import React, { useState } from 'react';
import { FiVolume2, FiPlus, FiEye } from 'react-icons/fi';

const AnnouncementsDashboard = () => {
  const [announcements, setAnnouncements] = useState([
    { 
      id: 1, 
      title: 'New Reception System Launching', 
      content: 'We are excited to announce the launch of our new reception system designed to streamline check-ins and improve service.', 
      date: '2024-06-15', 
      priority: 'high' 
    },
    { 
      id: 2, 
      title: 'Fire Bridge Visit', 
      content: 'The local fire brigade will visit the premises for a safety inspection and demo at 3pm on 2024-06-14.', 
      date: '2024-06-14', 
      priority: 'medium' 
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '', content: '', date: '', priority: 'medium'
  });

  const handleAddAnnouncement = () => {
    setAnnouncements([...announcements, { ...newAnnouncement, id: Date.now() }]);
    setShowAddModal(false);
    setNewAnnouncement({ title: '', content: '', date: '', priority: 'medium' });
  };

  return (
    <div className="lost-items-dashboard">
      <div className="dashboard-header">
        <h2><FiVolume2 size={18} /> Announcements</h2>
        <div className="header-controls">
          <button className="add-button primary" onClick={() => setShowAddModal(true)}>
            <FiPlus size={16} /> Add Announcement
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map(announcement => (
              <tr 
                key={announcement.id}
                className="clickable-row"
                onClick={() => {
                  setSelectedAnnouncement(announcement);
                  setShowViewModal(true);
                }}
              >
                <td>{announcement.title}</td>
                <td>{announcement.date}</td>
                <td>
                  <span className={`priority-badge ${announcement.priority}`}>
                    {announcement.priority}
                  </span>
                </td>
                <td>
                  <FiEye />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-modal">
            <h3>Create New Announcement</h3>
            <input
              type="text"
              placeholder="Title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
            />
            <textarea
              placeholder="Content"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
              rows={4}
            />
            <input
              type="date"
              value={newAnnouncement.date}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, date: e.target.value})}
            />
            <select
              value={newAnnouncement.priority}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="primary" onClick={handleAddAnnouncement}>Post Announcement</button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedAnnouncement && (
        <div className="modal-overlay">
          <div className="add-modal">
            <h3>{selectedAnnouncement.title}</h3>
            <div className="announcement-meta">
              <span className="date">{selectedAnnouncement.date}</span>
              <span className={`priority ${selectedAnnouncement.priority}`}>
                {selectedAnnouncement.priority} priority
              </span>
            </div>
            <div className="announcement-content">
              {selectedAnnouncement.content}
            </div>
            <div className="modal-actions single">
              <button onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsDashboard;

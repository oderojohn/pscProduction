import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiPlus, FiPaperclip, FiX, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { PhoneIssuesAPI } from '../../service/api/api';
import { useAuth } from '../../service/auth/AuthContext';
import './ReportIssue.css'; // Make sure to create this CSS file with the styles below

const ReportIssue = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    category: 'General',
    description: '',
    priority: 'Medium',
    attachments: []
  });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [success, setSuccess] = useState(null);
  

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  // Fetch issues on component mount
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await PhoneIssuesAPI.getIssues();
        setIssues(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const handleAddIssue = async () => {
    setIsSubmitting(true);
    try {
      const issueData = {
        title: newIssue.title,
        category: newIssue.category,
        description: newIssue.description,
        priority: newIssue.priority,
      };

      const createdIssue = await PhoneIssuesAPI.createIssue(issueData);
      setIssues([createdIssue, ...issues]);
      setShowAddModal(false);
      setNewIssue({
        title: '',
        category: 'General',
        description: '',
        priority: 'Medium',
        attachments: []
      });
    } catch (err) {
      alert(`Failed to create issue: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setSuccess('Issue Submitted successfully!'); 

    }
  };

  const updateIssueStatus = async (id, newStatus) => {
    try {
      const updatedIssue = await PhoneIssuesAPI.updateIssueStatus(id, newStatus);
      setIssues(issues.map(issue => 
        issue.id === updatedIssue.id ? updatedIssue : issue
      ));
      setSelectedIssue(updatedIssue);
      setShowDetailsModal(false);
      setSuccess('Updated successfully!'); 
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewIssue({
      ...newIssue,
      attachments: [...newIssue.attachments, ...files]
    });
  };

  const removeAttachment = (index) => {
    const newAttachments = [...newIssue.attachments];
    newAttachments.splice(index, 1);
    setNewIssue({
      ...newIssue,
      attachments: newAttachments
    });
  };
  useEffect(() => {
      if (error || success) {
        const timer = setTimeout(() => {
          setError(null);
          setSuccess(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }, [error, success]);

  if (loading) return <div className="loading">Loading issues...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="lost-items-dashboard">
      {/* Notification Messages */}
      {error && (
        <div className="notification error">
          <div className="notification-content">
            <span className="notification-icon">⚠️</span>
            <span>{error}</span>
          </div>
          <button className="notification-close" onClick={() => setError(null)}>
            &times;
          </button>
        </div>
      )}
      
      {success && (
        <div className="notification success">
          <div className="notification-content">
            <span className="notification-icon">✓</span>
            <span>{success}</span>
          </div>
          <button className="notification-close" onClick={() => setSuccess(null)}>
            &times;
          </button>
        </div>
      )}
      {/* Header and controls */}
      <div className="dashboard-header">
        <h2><FiAlertCircle size={20} /> Report an Issue</h2>
        <div className="header-controls">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus size={16} /> New Issue
          </button>
        </div>
      </div>

      {/* Issues table */}
      <div className="table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Reported By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr key={issue.id}>
                <td>{issue.title}</td>
                <td>{issue.category}</td>
                <td>
                  <span className={`status-badge ${issue.status.toLowerCase().replace(' ', '-')}`}>
                    {issue.status}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${issue.priority.toLowerCase()}`}>
                    {issue.priority}
                  </span>
                </td>
                <td>{issue.reported_by || 'System'}</td>
                <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      setSelectedIssue(issue);
                      setShowDetailsModal(true);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Issue Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Report New Issue</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowAddModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddIssue();
              }}>
                <div className="form-group">
                  <label>Title <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Brief description of the issue"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Category <span className="required">*</span></label>
                    <select
                      value={newIssue.category}
                      onChange={(e) => setNewIssue({...newIssue, category: e.target.value})}
                      required
                    >
                      <option value="General">General</option>
                      <option value="Facilities">Facilities</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Security">Security</option>
                      <option value="IT">IT</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Priority <span className="required">*</span></label>
                    <select
                      value={newIssue.priority}
                      onChange={(e) => setNewIssue({...newIssue, priority: e.target.value})}
                      required
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description <span className="required">*</span></label>
                  <textarea
                    placeholder="Detailed description of the issue..."
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                    rows={5}
                    required
                  />
                </div>
                
                <div className="form-section">
                  <div className="section-header-toggle" onClick={() => setShowAttachments(!showAttachments)}>
                    <h4 className="form-section-title">
                      <FiPaperclip className="section-icon" />
                      Attachments
                    </h4>
                    <button 
                      type="button" 
                      className="toggle-notes-btn"
                      aria-expanded={showAttachments}
                    >
                      {showAttachments ? 'Hide' : 'Show'}
                      {showAttachments ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>
                  
                  {showAttachments && (
                    <div className="form-group notes-group">
                      <label htmlFor="fileUpload" className="file-upload-label">
                        <FiPaperclip /> Choose Files
                      </label>
                      <input 
                        id="fileUpload"
                        type="file" 
                        multiple 
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      {newIssue.attachments.length > 0 && (
                        <div className="attachments-list">
                          {newIssue.attachments.map((file, index) => (
                            <div key={index} className="attachment-item">
                              {file.name} ({Math.round(file.size / 1024)} KB)
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeAttachment(index);
                                }}
                                className="remove-attachment"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary" 
                    disabled={!newIssue.title || !newIssue.description || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Issue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Issue Details Modal */}
      {showDetailsModal && selectedIssue && (
        <div className="modal">
          <div className="modal-content wide">
            <div className="modal-header">
              <h3>{selectedIssue.title}</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowDetailsModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="issue-details-grid">
                <div className="detail-field">
                  <strong>Category:</strong> {selectedIssue.category}
                </div>
                <div className="detail-field">
                  <strong>Status:</strong> 
                  <span className={`status-badge ${selectedIssue.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedIssue.status}
                  </span>
                </div>
                <div className="detail-field">
                  <strong>Priority:</strong> 
                  <span className={`priority-badge ${selectedIssue.priority.toLowerCase()}`}>
                    {selectedIssue.priority}
                  </span>
                </div>
                <div className="detail-field">
                  <strong>Reported By:</strong> {selectedIssue.reported_by || 'System'}
                </div>
                <div className="detail-field">
                  <strong>Date Reported:</strong> {new Date(selectedIssue.created_at).toLocaleString()}
                </div>
                <div className="detail-field full-width">
                  <strong>Description:</strong> 
                  <div className="description-text">{selectedIssue.description}</div>
                </div>
              </div>

              {hasRole(['ADMIN']) && (
                <div className="status-actions">
                  <h4>Update Status:</h4>
                  <div className="status-buttons">
                    <button 
                      className={`status-btn ${selectedIssue.status === 'Open' ? 'active' : ''} open`}
                      onClick={() => updateIssueStatus(selectedIssue.id, 'Open')}
                    >
                      Open
                    </button>
                    <button 
                      className={`status-btn ${selectedIssue.status === 'In Progress' ? 'active' : ''} in-progress`}
                      onClick={() => updateIssueStatus(selectedIssue.id, 'In Progress')}
                    >
                      In Progress
                    </button>
                    <button 
                      className={`status-btn ${selectedIssue.status === 'Resolved' ? 'active' : ''} resolved`}
                      onClick={() => updateIssueStatus(selectedIssue.id, 'Resolved')}
                    >
                      Resolved
                    </button>
                    <button 
                      className={`status-btn ${selectedIssue.status === 'Closed' ? 'active' : ''} closed`}
                      onClick={() => updateIssueStatus(selectedIssue.id, 'Closed')}
                    >
                      Closed
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportIssue;
import React, { useState, useEffect } from 'react';
import { FiPhone, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { PhoneIssuesAPI } from '../../service/api/api';
import { useAuth } from '../../service/auth/AuthContext';
import './PhoneExtensionsDashboard.css'; 

const PhoneExtensionsDashboard = () => {
  const { user } = useAuth();
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState(null);
  const [newExtension, setNewExtension] = useState({
    name: '',
    number: '',
    location: '',
    description: ''
  });

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  

  // Fetch extensions on component mount
  useEffect(() => {
    const fetchExtensions = async () => {
      try {
        const data = await PhoneIssuesAPI.getPhoneExtensions();
        setExtensions(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchExtensions();
  }, []);

  const handleAddExtension = async () => {
    try {
      const createdExtension = await PhoneIssuesAPI.createPhoneExtension(newExtension);
      setExtensions([...extensions, createdExtension]);
      setShowAddModal(false);
      setNewExtension({ name: '', number: '', location: '', description: '' });
    } catch (err) {
      alert(`Failed to add extension: ${err.message}`);
    }
  };

  const handleUpdateExtension = async () => {
    try {
      const updatedExtension = await PhoneIssuesAPI.updatePhoneExtension(
        selectedExtension.id,
        newExtension
      );
      setExtensions(extensions.map(ext => 
        ext.id === updatedExtension.id ? updatedExtension : ext
      ));
      setShowEditModal(false);
    } catch (err) {
      alert(`Failed to update extension: ${err.message}`);
    }
  };

  const handleDeleteExtension = async (id) => {
    if (window.confirm('Are you sure you want to delete this extension?')) {
      try {
        await PhoneIssuesAPI.deletePhoneExtension(id);
        setExtensions(extensions.filter(ext => ext.id !== id));
      } catch (err) {
        alert(`Failed to delete extension: ${err.message}`);
      }
    }
  };

  const handleEditClick = (extension) => {
    setSelectedExtension(extension);
    setNewExtension({
      name: extension.name,
      number: extension.number,
      location: extension.location,
      description: extension.description
    });
    setShowEditModal(true);
  };

  const handleViewClick = (extension) => {
    setSelectedExtension(extension);
    setShowViewModal(true);
  };

  if (loading) return <div className="loading">Loading extensions...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="lost-items-dashboard">
      <div className="dashboard-header">
        <h2><FiPhone size={20} /> Phone Extensions</h2>
        <div className="header-controls">
          {hasRole(['ADMIN','STAFF']) && (
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddModal(true)}
            >
              <FiPlus size={16} /> Add Extension
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Number</th>
              <th>Location</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {extensions.map(extension => (
              <tr key={extension.id} onClick={() => handleViewClick(extension)}>
                <td>{extension.name}</td>
                <td>{extension.number}</td>
                <td>{extension.location}</td>
                <td>{extension.description || '-'}</td>
                <td className="actions">
                  {hasRole(['ADMIN','STAFF']) && (
                    <>
                      <button 
                        className="btn btn-sm btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(extension);
                        }}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="btn btn-sm btn-icon danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExtension(extension.id);
                        }}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Extension Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Extension</h3>
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
                handleAddExtension();
              }}>
                <div className="form-group">
                  <label>Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={newExtension.name}
                    onChange={(e) => setNewExtension({ ...newExtension, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label>Extension Number <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter extension number"
                    value={newExtension.number}
                    onChange={(e) => setNewExtension({ ...newExtension, number: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={newExtension.location}
                    onChange={(e) => setNewExtension({ ...newExtension, location: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Enter description"
                    rows={3}
                    value={newExtension.description}
                    onChange={(e) => setNewExtension({ ...newExtension, description: e.target.value })}
                  />
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
                    disabled={!newExtension.name || !newExtension.number}
                  >
                    Save Extension
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Extension Modal */}
      {showEditModal && selectedExtension && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Extension</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowEditModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateExtension();
              }}>
                <div className="form-group">
                  <label>Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={newExtension.name}
                    onChange={(e) => setNewExtension({ ...newExtension, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label>Extension Number <span className="required">*</span></label>
                  <input
                    type="text"
                    value={newExtension.number}
                    onChange={(e) => setNewExtension({ ...newExtension, number: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={newExtension.location}
                    onChange={(e) => setNewExtension({ ...newExtension, location: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={newExtension.description}
                    onChange={(e) => setNewExtension({ ...newExtension, description: e.target.value })}
                  />
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary" 
                    disabled={!newExtension.name || !newExtension.number}
                  >
                    Update Extension
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Extension Modal */}
      {showViewModal && selectedExtension && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedExtension.name}</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowViewModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="extension-details">
                <div className="detail-row">
                  <strong>Extension Number:</strong>
                  <span>{selectedExtension.number}</span>
                </div>
                <div className="detail-row">
                  <strong>Location:</strong>
                  <span>{selectedExtension.location || '-'}</span>
                </div>
                <div className="detail-row">
                  <strong>Description:</strong>
                  <p>{selectedExtension.description || '-'}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              {hasRole(['admin']) && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditClick(selectedExtension);
                  }}
                >
                  <FiEdit2 /> Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneExtensionsDashboard;
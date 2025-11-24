import React, { useState, useEffect, useCallback } from 'react';
import { FiKey, FiUser, FiCheck, FiPlus, FiClock, FiPhone, FiInfo, FiChevronUp, FiChevronDown, FiX } from 'react-icons/fi';
import { PhoneIssuesAPI } from '../../service/api/api';
import { useAuth } from '../../service/auth/AuthContext';
import './SecurityControlDashboard.css';

const SecurityControlDashboard = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [keyHistory, setKeyHistory] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [success, setSuccess] = useState(null);
  
  // Form states
  const [checkoutDetails, setCheckoutDetails] = useState({
    holderName: '',
    holderRole: 'staff',
    holderPhone: '',
    notes: ''
  });
  
  const [returnDetails, setReturnDetails] = useState({
    notes: ''
  });
  
  const [newKey, setNewKey] = useState({
    key_id: '',
    location: '',
    key_type: 'Access',
    status: 'available'
  });

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  // Fetch keys on component mount
  const fetchKeys = useCallback(async (query = '') => {
    try {
      setLoading(true);
      const response = await PhoneIssuesAPI.getSecurityKeys(query);
      setKeys(response);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const fetchKeyHistory = async (keyId) => {
    try {
      const response = await PhoneIssuesAPI.getKeyHistory(keyId);
      setKeyHistory(response);
      setSelectedKey(keys.find(key => key.id === keyId));
      setShowHistoryModal(true);
    } catch (err) {
      alert(`Failed to fetch history: ${err.message}`);
    }
  };

  const handleAddKey = async () => {
    try {
      const response = await PhoneIssuesAPI.createSecurityKey(newKey);
      setKeys([...keys, response]);
      setShowAddModal(false);
      setSuccess('Key Added successfully!');
      setNewKey({
        key_id: '',
        location: '',
        key_type: 'Access',
        status: 'available'
      });
    } catch (err) {
      alert(`Failed to add key: ${err.message}`);
    }
  };

  const handleCheckout = async (id) => {
    try {
      const checkoutData = {
        holder_name: checkoutDetails.holderName,
        holder_type: checkoutDetails.holderRole,
        holder_phone: checkoutDetails.holderPhone,
        notes: checkoutDetails.notes
      };
      
      const updatedKey = await PhoneIssuesAPI.checkoutKey(id, checkoutData);
      
      setKeys(keys.map(key => 
        key.id === updatedKey.id ? updatedKey : key
      ));
      
      setShowCheckoutModal(false);
      setSuccess('Checkout successfully!');
      setCheckoutDetails({
        holderName: '',
        holderRole: 'staff',
        holderPhone: '',
        notes: ''
      });
      setShowNotes(false);
    } catch (err) {
      setError(`Checkout failed: ${err.message}`);
    };
  };

  const handleReturn = async (id) => {
    try {
      const returnData = {
        notes: returnDetails.notes
      };
      
      const updatedKey = await PhoneIssuesAPI.returnKey(id, returnData);
      
      setKeys(keys.map(key => 
        key.id === updatedKey.id ? updatedKey : key
      ));
      
      setShowReturnModal(false);
      setSuccess('Key Returned successfully!');
      setReturnDetails({
        notes: ''
      });
    } catch (err) {
      setError(`Return failed: ${err.message}`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchKeys(searchQuery);
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

  if (loading) return <div className="loading">Loading keys...</div>;
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
      
      <div className="dashboard-header">
        <h2><FiKey size={20} /> Security Key Control</h2>
        <div className="header-controls">
          {hasRole(['ADMIN']) && (
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddModal(true)}
            >
              <FiPlus size={16} /> Add Key
            </button>
          )}
        </div>
      </div>

      <form className="search-barrr" onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Search by Key ID, Location, or Holder..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">Search</button>
        <button 
          type="button" 
          className="btn btn-outline" 
          onClick={() => {
            setSearchQuery('');
            fetchKeys();
          }}
        >
          Clear
        </button>
      </form>

      <div className="table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th>Key ID</th>
              <th>Location</th>
              <th>Type</th>
              <th>Status</th>
              <th>Current Holder</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map(key => (
              <tr key={key.id}>
                <td>{key.key_id}</td>
                <td>{key.location}</td>
                <td>{key.key_type}</td>
                <td>
                  <span className={`badge ${key.status}`}>
                    {key.status}
                  </span>
                </td>
                <td>
                  {key.current_holder_name ? (
                    <>
                      {key.current_holder_name} 
                      <small className="text-muted">({key.current_holder_type})</small>
                    </>
                  ) : '-'}
                </td>
                <td>{key.current_holder_phone || '-'}</td>
                <td className="actions">
                  {hasRole(['ADMIN']) && (
                    <button 
                      className="btn btn-sm btn-icon"
                      onClick={() => fetchKeyHistory(key.id)}
                      title="View History"
                    >
                      <FiClock />
                    </button>
                  )}
                  
                  {key.status === 'available' ? (
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setSelectedKey(key);
                        setShowCheckoutModal(true);
                      }}
                    >
                      <FiUser /> Check Out
                    </button>
                  ) : (
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => {
                        setSelectedKey(key);
                        setShowReturnModal(true);
                      }}
                    >
                      <FiCheck /> Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Key Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Key</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Key ID *</label>
                <input
                  type="text"
                  value={newKey.key_id}
                  onChange={(e) => setNewKey({...newKey, key_id: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={newKey.location}
                  onChange={(e) => setNewKey({...newKey, location: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Key Type</label>
                <select
                  value={newKey.key_type}
                  onChange={(e) => setNewKey({...newKey, key_type: e.target.value})}
                >
                  <option value="Access">Access</option>
                  <option value="Master">Master</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleAddKey}
                disabled={!newKey.key_id || !newKey.location}
              >
                Add Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && selectedKey && (
        <div className="modal">
          <div className="modal-content checkout-modal">
            <div className="modal-header">
              <div className="modal-header-content">
                <FiKey className="modal-icon" />
                <h3>Check Out Key: {selectedKey.key_id}</h3>
              </div>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowCheckoutModal(false);
                  setShowNotes(false);
                }}
                aria-label="Close checkout modal"
              >
                <FiX />
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCheckout(selectedKey.id);
              }}>
                <div className="form-section">
                  <h4 className="form-section-title">
                    <FiUser className="section-icon" />
                    Holder Information
                  </h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="holderName">
                        Full Name <span className="required">*</span>
                      </label>
                      <input
                        id="holderName"
                        type="text"
                        value={checkoutDetails.holderName}
                        onChange={(e) => setCheckoutDetails({...checkoutDetails, holderName: e.target.value})}
                        placeholder="Enter holder's full name"
                        required
                        autoFocus
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="holderRole">
                        Role <span className="required">*</span>
                      </label>
                      <select
                        id="holderRole"
                        value={checkoutDetails.holderRole}
                        onChange={(e) => setCheckoutDetails({...checkoutDetails, holderRole: e.target.value})}
                        required
                      >
                        <option value="">Select role</option>
                        <option value="staff">Staff</option>
                        <option value="member">Member</option>
                        <option value="contractor">Contractor</option>
                        <option value="visitor">Visitor</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="holderPhone">
                      <FiPhone className="input-icon" />
                      Phone Number
                    </label>
                    <input
                      id="holderPhone"
                      type="tel"
                      value={checkoutDetails.holderPhone}
                      onChange={(e) => setCheckoutDetails({...checkoutDetails, holderPhone: e.target.value})}
                      placeholder="0712345678"
                    />
                    <p className="input-hint">Optional but recommended for contact purposes</p>
                  </div>
                </div>
                
                <div className="form-section">
                  <div className="section-header-toggle" onClick={() => setShowNotes(!showNotes)}>
                    <h4 className="form-section-title">
                      <FiInfo className="section-icon" />
                      Additional Information
                    </h4>
                    <button 
                      type="button" 
                      className="toggle-notes-btn"
                      aria-expanded={showNotes}
                    >
                      {showNotes ? (
                        <>
                          Hide Note <FiChevronUp />
                        </>
                      ) : (
                        <>
                          Add Note <FiChevronDown />
                        </>
                      )}
                    </button>
                  </div>
                  
                  {showNotes && (
                    <div className="form-group notes-group">
                      <label htmlFor="checkoutNotes">Notes</label>
                      <textarea
                        id="checkoutNotes"
                        value={checkoutDetails.notes}
                        onChange={(e) => setCheckoutDetails({...checkoutDetails, notes: e.target.value})}
                        rows="3"
                        placeholder="Enter any special instructions or reasons for checkout..."
                      />
                      <p className="input-hint">Max 500 characters</p>
                    </div>
                  )}
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setShowNotes(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={!checkoutDetails.holderName || !checkoutDetails.holderRole}
                  >
                    <FiCheck /> Confirm Checkout
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedKey && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Return Key: {selectedKey.key_id}</h3>
              <button className="close-btn" onClick={() => setShowReturnModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="key-info">
                <p><strong>Location:</strong> {selectedKey.location}</p>
                <p><strong>Key Type:</strong> {selectedKey.key_type}</p>
                <p><strong>Checked Out By:</strong> {selectedKey.current_holder_name ? `${selectedKey.current_holder_name} (${selectedKey.current_holder_type})` : 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedKey.current_holder_phone || 'N/A'}</p>
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={returnDetails.notes}
                  onChange={(e) => setReturnDetails({...returnDetails, notes: e.target.value})}
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowReturnModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleReturn(selectedKey.id)}
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedKey && (
        <div className="modal">
          <div className="modal-content wide">
            <div className="modal-header">
              <h3>Key History: {selectedKey.key_id}</h3>
              <button className="close-btn" onClick={() => setShowHistoryModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              {keyHistory.length > 0 ? (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Action</th>
                      <th>Holder</th>
                      <th>Phone</th>
                      <th>User</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keyHistory.map(record => (
                      <tr key={record.id}>
                        <td>{new Date(record.timestamp).toLocaleString()}</td>
                        <td><span className={`badge ${record.action}`}>{record.action}</span></td>
                        <td>{record.holder_name} ({record.holder_type})</td>
                        <td>{record.holder_phone || '-'}</td>
                        <td>{record.user || 'System'}</td>
                        <td>{record.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <FiInfo size={24} />
                  <p>No history records found for this key</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityControlDashboard;
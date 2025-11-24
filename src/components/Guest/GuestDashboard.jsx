import React, { useState, useEffect } from 'react';
import { 
  FiUser, FiUsers, FiCalendar, 
  FiClock, FiHash, FiAlertTriangle, 
  FiCheckCircle, FiPhone, FiSearch,
  FiPlus, FiMinus, FiEdit, FiTrash2,
  FiX
} from 'react-icons/fi';

const GuestRegistration = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('registration');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(0);

  const [memberInfo, setMemberInfo] = useState({
    number: '',
    phone: '',
    verified: false,
    remainingInvites: 4,
    name: ''
  });

  const [guestForm, setGuestForm] = useState({
    name: '',
    phone: '',
    id: '',
    type: 'member_guest',
    company: '',
    notes: ''
  });

  const [guestLogs, setGuestLogs] = useState([]);
  const [editingLog, setEditingLog] = useState(null);

  // Load logs from localStorage on component mount
  useEffect(() => {
    const savedLogs = localStorage.getItem('guestLogs');
    if (savedLogs) {
      setGuestLogs(JSON.parse(savedLogs));
    }
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('guestLogs', JSON.stringify(guestLogs));
  }, [guestLogs]);

  // Timer effect for verification timeout
  useEffect(() => {
    let timer;
    if (verificationTimer > 0) {
      timer = setTimeout(() => {
        setVerificationTimer(verificationTimer - 1);
      }, 1000);
    } else if (verificationTimer === 0 && memberInfo.verified) {
      resetVerification();
    }
    return () => clearTimeout(timer);
  }, [verificationTimer, memberInfo.verified]);

  const verifyMember = () => {
    const mockMembers = {
      '1': { name: 'John Doe', phone: '1', dailyInvitesLeft: 3 },
      '789012': { name: 'Jane Smith', phone: '555-5678', dailyInvitesLeft: 4 },
      '345678': { name: 'Mike Johnson', phone: '555-9012', dailyInvitesLeft: 2 }
    };

    if (mockMembers[memberInfo.number] && 
        mockMembers[memberInfo.number].phone === memberInfo.phone) {
      setMemberInfo({
        ...memberInfo,
        verified: true,
        remainingInvites: mockMembers[memberInfo.number].dailyInvitesLeft,
        name: mockMembers[memberInfo.number].name
      });
      
      // Set verification timeout (10 seconds)
      setVerificationTimer(10);
    } else {
      alert('Member not found or phone number mismatch');
    }
  };

  const resetVerification = () => {
    setMemberInfo({
      number: '',
      phone: '',
      verified: false,
      remainingInvites: 4,
      name: ''
    });
    setVerificationTimer(0);
  };

  const closeVerification = () => {
    resetVerification();
  };

  const registerGuest = (e) => {
    e.preventDefault();
    
    // Validate based on guest type
    if (guestForm.type === 'member_guest') {
      if (!memberInfo.verified) {
        alert('Please verify member first');
        return;
      }
      if (memberInfo.remainingInvites <= 0) {
        alert('You have no invites left for today');
        return;
      }
    }

    const stats = getVisitStats(guestForm);
    if (stats.isOverLimit) {
      alert(`This guest has reached their ${stats.period}ly visit limit (${stats.limit})`);
      return;
    }

    const newLog = {
      ...guestForm,
      memberNumber: guestForm.type === 'member_guest' ? memberInfo.number : '',
      memberName: guestForm.type === 'member_guest' ? memberInfo.name : '',
      date: new Date().toISOString(),
      id: guestForm.id || `G-${Date.now()}`,
      registeredBy: 'Staff Name'
    };

    setGuestLogs([newLog, ...guestLogs]);
    
    if (guestForm.type === 'member_guest') {
      setMemberInfo({ ...memberInfo, remainingInvites: memberInfo.remainingInvites - 1 });
    }
    
    setGuestForm({ 
      name: '', 
      phone: '', 
      id: '', 
      type: 'member_guest', 
      company: '', 
      notes: '' 
    });
  };

  const updateLog = (e) => {
    e.preventDefault();
    const updatedLogs = guestLogs.map(log => 
      log.date === editingLog.date ? editingLog : log
    );
    setGuestLogs(updatedLogs);
    setEditingLog(null);
  };

  const deleteLog = (logToDelete) => {
    if (window.confirm('Are you sure you want to delete this guest record?')) {
      const updatedLogs = guestLogs.filter(log => log.date !== logToDelete.date);
      setGuestLogs(updatedLogs);
    }
  };

  const getVisitStats = (guest) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const guestVisits = guestLogs.filter(g => 
      g.phone === guest.phone && 
      g.type === guest.type
    );

    const monthlyVisits = guestVisits.filter(g => {
      const visitDate = new Date(g.date);
      return visitDate.getFullYear() === currentYear && 
             visitDate.getMonth() === currentMonth;
    }).length;

    const yearlyVisits = guestVisits.filter(g => {
      const visitDate = new Date(g.date);
      return visitDate.getFullYear() === currentYear;
    }).length;

    let limit, period;
    switch(guest.type) {
      case 'member_guest':
        limit = 5;
        period = 'month';
        break;
      case 'reciprocating':
        limit = 20;
        period = 'year';
        break;
      case 'supplier':
        limit = 10;
        period = 'month';
        break;
      case 'walkin':
        limit = 5;
        period = 'month';
        break;
      default:
        limit = 10;
        period = 'month';
    }

    return {
      totalVisits: guestVisits.length,
      periodVisits: guest.type === 'reciprocating' ? yearlyVisits : monthlyVisits,
      limit,
      period,
      lastVisit: guestVisits[0]?.date,
      isOverLimit: (guest.type === 'reciprocating' ? yearlyVisits : monthlyVisits) >= limit
    };
  };

  const filteredLogs = guestLogs.filter(log => {
    const search = searchTerm.toLowerCase();
    return (
      log.name.toLowerCase().includes(search) ||
      log.phone.toLowerCase().includes(search) ||
      log.id.toLowerCase().includes(search) ||
      (log.memberNumber && log.memberNumber.toLowerCase().includes(search)) ||
      (log.memberName && log.memberName.toLowerCase().includes(search)) ||
      (log.company && log.company.toLowerCase().includes(search))
    );
  });

  const getTypeCount = (type) => {
    return guestLogs.filter(log => log.type === type).length;
  };

  return (
    <div className="lost-items-dashboard">
      <div className="dashboard-header">
        <h2>
          <FiUsers size={24} /> Guest Registration System
        </h2>
        <div className="header-controls">
          <div className="tabs">
            <button 
              className={activeTab === 'registration' ? 'active' : ''}
              onClick={() => setActiveTab('registration')}
            >
              Registration
            </button>
            <button 
              className={activeTab === 'logs' ? 'active' : ''}
              onClick={() => setActiveTab('logs')}
            >
              Visit Logs
            </button>
          </div>
          <div className="search-bar">
            <FiSearch />
            <input
              type="text"
              placeholder="Search guest logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {activeTab === 'registration' && (
        <>
          {/* Member Verification Section */}
          {guestForm.type === 'member_guest' && (
            <div className="verification-container">
              <div className="verification-header">
                <h3>Member Verification</h3>
                {memberInfo.verified && (
                  <button 
                    className="close-verification"
                    onClick={closeVerification}
                  >
                    <FiX />
                  </button>
                )}
              </div>
              {!memberInfo.verified ? (
                <div className="verification-form">
                  <div className="form-group">
                    <label>Member Number</label>
                    <input
                      type="text"
                      value={memberInfo.number}
                      onChange={(e) => setMemberInfo({...memberInfo, number: e.target.value})}
                      placeholder="Enter member number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Member Phone</label>
                    <input
                      type="text"
                      value={memberInfo.phone}
                      onChange={(e) => setMemberInfo({...memberInfo, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <button 
                    className="verify-button"
                    onClick={verifyMember}
                  >
                    Verify Member
                  </button>
                </div>
              ) : (
                <div className="member-info-card">
                  <div className="member-info">
                    <div className="member-name">{memberInfo.name}</div>
                    <div className="member-details">
                      <span><FiHash /> {memberInfo.number}</span>
                      <span><FiPhone /> {memberInfo.phone}</span>
                    </div>
                    <div className="verification-timer">
                      Verification expires in: {verificationTimer}s
                    </div>
                  </div>
                  <div className="invites-count">
                    <div className="invites-label">Today's Invites Left</div>
                    <div className="invites-number">{memberInfo.remainingInvites}/4</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guest Registration Form */}
          <div className="form-container">
            <form onSubmit={editingLog ? updateLog : registerGuest} className="guest-form">
              <div className="form-header">
                <h3>
                  <FiUser /> {editingLog ? 'Edit Guest Record' : 'Register Guest'}
                </h3>
                <button 
                  type="button" 
                  className="toggle-advanced"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? <FiMinus /> : <FiPlus />} Advanced
                </button>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Guest Type</label>
                  <select
                    value={editingLog ? editingLog.type : guestForm.type}
                    onChange={(e) => editingLog 
                      ? setEditingLog({...editingLog, type: e.target.value})
                      : setGuestForm({...guestForm, type: e.target.value})
                    }
                    disabled={!!editingLog}
                  >
                    <option value="member_guest">Member Guest</option>
                    <option value="reciprocating">Reciprocating</option>
                    <option value="walkin">Walk-In</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={editingLog ? editingLog.name : guestForm.name}
                    onChange={(e) => editingLog 
                      ? setEditingLog({...editingLog, name: e.target.value})
                      : setGuestForm({...guestForm, name: e.target.value})
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="text"
                    value={editingLog ? editingLog.phone : guestForm.phone}
                    onChange={(e) => editingLog 
                      ? setEditingLog({...editingLog, phone: e.target.value})
                      : setGuestForm({...guestForm, phone: e.target.value})
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>ID Number *</label>
                  <input
                    type="text"
                    value={editingLog ? editingLog.id : guestForm.id}
                    onChange={(e) => editingLog 
                      ? setEditingLog({...editingLog, id: e.target.value})
                      : setGuestForm({...guestForm, id: e.target.value})
                    }
                    required
                  />
                </div>
              </div>

              {showAdvanced && (
                <div className="advanced-fields">
                  <div className="form-group">
                    <label>Company/Organization</label>
                    <input
                      type="text"
                      value={editingLog ? editingLog.company : guestForm.company}
                      onChange={(e) => editingLog 
                        ? setEditingLog({...editingLog, company: e.target.value})
                        : setGuestForm({...guestForm, company: e.target.value})
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={editingLog ? editingLog.notes : guestForm.notes}
                      onChange={(e) => editingLog 
                        ? setEditingLog({...editingLog, notes: e.target.value})
                        : setGuestForm({...guestForm, notes: e.target.value})
                      }
                      rows="3"
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                {editingLog ? (
                  <>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => setEditingLog(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="update-button"
                    >
                      Update Record
                    </button>
                  </>
                ) : (
                  <button 
                    type="submit" 
                    className="register-button"
                    disabled={guestForm.type === 'member_guest' && 
                             (!memberInfo.verified || memberInfo.remainingInvites <= 0)}
                  >
                    Register Guest
                  </button>
                )}
              </div>

              {guestForm.type === 'member_guest' && memberInfo.verified && memberInfo.remainingInvites <= 0 && (
                <div className="form-warning">
                  <FiAlertTriangle /> This member has no invites left for today
                </div>
              )}
            </form>
          </div>
        </>
      )}

      {activeTab === 'logs' && (
        <div className="logs-container">
          <div className="logs-header">
            <h3><FiClock /> Guest Visit Logs</h3>
            <div className="export-controls">
              <button className="export-button">
                Export to CSV
              </button>
            </div>
          </div>
          
          <div className="logs-summary">
            <div className="summary-card">
              <div className="summary-value">{guestLogs.length}</div>
              <div className="summary-label">Total Visits</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                {guestLogs.filter(log => getVisitStats(log).isOverLimit).length}
              </div>
              <div className="summary-label">Over Limit</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                {new Set(guestLogs.map(log => log.phone)).size}
              </div>
              <div className="summary-label">Unique Guests</div>
            </div>
          </div>

          <div className="type-distribution">
            <div className="type-card">
              <div className="type-value">{getTypeCount('member_guest')}</div>
              <div className="type-label">Member Guests</div>
            </div>
            <div className="type-card">
              <div className="type-value">{getTypeCount('reciprocating')}</div>
              <div className="type-label">Reciprocating</div>
            </div>
            <div className="type-card">
              <div className="type-value">{getTypeCount('walkin')}</div>
              <div className="type-label">Walk-Ins</div>
            </div>
            <div className="type-card">
              <div className="type-value">{getTypeCount('supplier')}</div>
              <div className="type-label">Suppliers</div>
            </div>
          </div>

          <div className="logs-table">
            <div className="logs-table-header">
              <div className="header-col guest-col">Guest</div>
              <div className="header-col type-col">Type</div>
              <div className="header-col member-col">Member</div>
              <div className="header-col date-col">Visit Date</div>
              <div className="header-col visits-col">Visits</div>
              <div className="header-col status-col">Status</div>
              <div className="header-col actions-col">Actions</div>
            </div>

            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => {
                const stats = getVisitStats(log);
                const isNearLimit = stats.periodVisits >= stats.limit * 0.75;

                return (
                  <div 
                    key={index} 
                    className={`log-entry ${stats.isOverLimit ? 'over-limit' : ''}`}
                  >
                    <div className="log-col guest-col">
                      <div className="guest-name">
                        <FiUser /> {log.name}
                      </div>
                      <div className="guest-details">
                        <span><FiPhone /> {log.phone}</span>
                        <span><FiHash /> {log.id}</span>
                        {log.company && <span><FiUsers /> {log.company}</span>}
                      </div>
                    </div>

                    <div className="log-col type-col">
                      <span className={`type-badge ${log.type}`}>
                        {log.type === 'member_guest' && 'Member Guest'}
                        {log.type === 'reciprocating' && 'Reciprocating'}
                        {log.type === 'walkin' && 'Walk-In'}
                        {log.type === 'supplier' && 'Supplier'}
                      </span>
                    </div>

                    <div className="log-col member-col">
                      {log.memberName && (
                        <>
                          <div className="member-name">{log.memberName}</div>
                          <div className="member-number">#{log.memberNumber}</div>
                        </>
                      )}
                    </div>

                    <div className="log-col date-col">
                      <div className="visit-date">
                        <FiCalendar /> {new Date(log.date).toLocaleDateString()}
                      </div>
                      <div className="visit-time">
                        <FiClock /> {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>

                    <div className="log-col visits-col">
                      <div className="visits-count">
                        <FiHash /> {stats.periodVisits}/{stats.limit}
                      </div>
                      <div className="visits-period">
                        per {stats.period}
                      </div>
                      {isNearLimit && !stats.isOverLimit && (
                        <div className="visits-warning">
                          <FiAlertTriangle /> Approaching limit
                        </div>
                      )}
                    </div>

                    <div className="log-col status-col">
                      {stats.isOverLimit ? (
                        <span className="status-badge over-limit">
                          <FiAlertTriangle /> Over Limit
                        </span>
                      ) : (
                        <span className="status-badge active">
                          <FiCheckCircle /> Active
                        </span>
                      )}
                    </div>

                    <div className="log-col actions-col">
                      <button 
                        className="edit-button"
                        onClick={() => setEditingLog(log)}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => deleteLog(log)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-logs">
                No guest visits recorded yet. Register your first guest above.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestRegistration;
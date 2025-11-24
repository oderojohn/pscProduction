import React, { useState, useEffect } from 'react';
import { FiFileText, FiChevronDown, FiChevronUp, FiDownload, FiEye, FiPackage, FiKey, FiFile } from 'react-icons/fi';
import { AuthService } from '../../service/api/api';

const ReportsDashboard = () => {
  const [eventLogs, setEventLogs] = useState([]);
  const [packageData] = useState({
    pending: [],
    picked: [],
    summary: {},
    stats: {},
    allPackages: []
  });
  const [activeTab, setActiveTab] = useState('all');
  const [expandedPackage, setExpandedPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [logsOpen, setLogsOpen] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logs = await AuthService.getEventLogs();
        const formattedLogs = logs.map((log) => {
          const username = log.user?.username || (log.user ? `User #${log.user}` : 'System');
          const timestamp = new Date(log.timestamp).toLocaleString();
          return `[${timestamp}] ${username} ${log.action.toLowerCase()}${log.object_type ? ` ${log.object_type}` : ''}${log.object_id ? ` #${log.object_id}` : ''}`;
        });
        setEventLogs(formattedLogs);
      } catch (error) {
        console.error('Failed to load event logs:', error);
      }
    };
    fetchLogs();
  }, []);

  // Enhanced package filtering
  const filteredPackages = packageData.allPackages.filter(pkg => {
    const matchesSearch = searchTerm === '' || 
      Object.values(pkg).some(val => 
        val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && pkg.status === 'pending';
    if (activeTab === 'picked') return matchesSearch && pkg.status === 'picked';
    if (activeTab === 'keys') return matchesSearch && pkg.type === 'keys';
    if (activeTab === 'documents') return matchesSearch && pkg.type === 'document';
    if (activeTab === 'packages') return matchesSearch && pkg.type === 'package';
    
    return matchesSearch;
  });

  // Package type icon component
  const PackageIcon = ({ type }) => {
    switch(type) {
      case 'keys': return <FiKey className="package-icon" />;
      case 'document': return <FiFile className="package-icon" />;
      default: return <FiPackage className="package-icon" />;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Toggle package details expansion
  const togglePackageDetails = (id) => {
    setExpandedPackage(expandedPackage === id ? null : id);
  };

  // Enhanced package details view
  const renderPackageDetails = (pkg) => {
    return (
      <div className="package-details" style={{ 
        padding: '15px', 
        backgroundColor: '#f9f9f9', 
        border: '1px solid #ddd',
        marginTop: '5px',
        borderRadius: '4px'
      }}>
        <div className="details-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '10px' 
        }}>
          <div>
            <strong>Code:</strong> {pkg.code}
          </div>
          <div>
            <strong>Type:</strong> {pkg.package_type}
          </div>
          <div>
            <strong>Status:</strong> 
            <span style={{ 
              color: pkg.status === 'pending' ? '#d35400' : '#27ae60',
              fontWeight: 'bold',
              marginLeft: '5px'
            }}>
              {pkg.status}
            </span>
          </div>
          <div>
            <strong>Shelf:</strong> {pkg.shelf || 'N/A'}
          </div>
          <div>
            <strong>Dropped By:</strong> {pkg.dropped_by || 'N/A'}
          </div>
          <div>
            <strong>Dropper Phone:</strong> {pkg.dropper_phone || 'N/A'}
          </div>
          <div>
            <strong>Recipient:</strong> {pkg.recipient_name || 'N/A'}
          </div>
          <div>
            <strong>Recipient Phone:</strong> {pkg.recipient_phone || 'N/A'}
          </div>
          <div>
            <strong>Created:</strong> {formatDate(pkg.created_at)}
          </div>
          <div>
            <strong>Updated:</strong> {formatDate(pkg.updated_at)}
          </div>
          {pkg.picked_at && (
            <>
              <div>
                <strong>Picked At:</strong> {formatDate(pkg.picked_at)}
              </div>
              <div>
                <strong>Picked By:</strong> {pkg.picked_by || 'N/A'}
              </div>
            </>
          )}
        </div>
        <div style={{ marginTop: '10px' }}>
          <strong>Description:</strong>
          <p style={{ 
            padding: '8px', 
            backgroundColor: '#fff', 
            border: '1px solid #eee',
            borderRadius: '4px'
          }}>
            {pkg.description || 'No description provided'}
          </p>
        </div>
      </div>
    );
  };

  // Stats summary card
  const StatsCard = ({ title, value, color }) => (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center',
      flex: 1,
      minWidth: '150px'
    }}>
      <div style={{ 
        color: '#7f8c8d', 
        fontSize: '14px',
        marginBottom: '5px'
      }}>
        {title}
      </div>
      <div style={{ 
        color: color || '#2c3e50', 
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="lost-items-dashboard" style={{ paddingBottom: '80px' }}>
      <div className="dashboard-header">
        <h2><FiFileText size={18} /> Package Reports Dashboard</h2>
        <button 
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FiDownload /> Export All (CSV)
        </button>
      </div>

      {/* Stats Summary Row */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <StatsCard title="Total Packages" value={packageData.stats.total} color="#3498db" />
        <StatsCard title="Pending" value={packageData.stats.pending} color="#e74c3c" />
        <StatsCard title="Picked" value={packageData.stats.picked} color="#2ecc71" />
        <StatsCard title="Shelves Used" value={packageData.stats.shelves_occupied || 0} color="#f39c12" />
      </div>

      {/* Package Data Section */}
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                background: activeTab === 'all' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'all' ? 'white' : '#2c3e50',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              All Packages
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                background: activeTab === 'pending' ? '#e74c3c' : '#ecf0f1',
                color: activeTab === 'pending' ? 'white' : '#2c3e50',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('picked')}
              style={{
                background: activeTab === 'picked' ? '#2ecc71' : '#ecf0f1',
                color: activeTab === 'picked' ? 'white' : '#2c3e50',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Picked
            </button>
            <button
              onClick={() => setActiveTab('keys')}
              style={{
                background: activeTab === 'keys' ? '#f39c12' : '#ecf0f1',
                color: activeTab === 'keys' ? 'white' : '#2c3e50',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Keys
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              style={{
                background: activeTab === 'documents' ? '#9b59b6' : '#ecf0f1',
                color: activeTab === 'documents' ? 'white' : '#2c3e50',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              style={{
                background: activeTab === 'packages' ? '#1abc9c' : '#ecf0f1',
                color: activeTab === 'packages' ? 'white' : '#2c3e50',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Packages
            </button>
          </div>

          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minWidth: '250px'
            }}
          />
        </div>

        <div style={{ 
          maxHeight: '500px', 
          overflowY: 'auto',
          border: '1px solid #eee',
          borderRadius: '4px'
        }}>
          {filteredPackages.length > 0 ? (
            filteredPackages.map(pkg => (
              <div key={pkg.id} style={{ 
                borderBottom: '1px solid #eee',
                padding: '12px 15px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }} onClick={() => togglePackageDetails(pkg.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <PackageIcon type={pkg.type} />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {pkg.package_type} #{pkg.id}
                      </div>
                      <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
                        {pkg.description || 'No description'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                      backgroundColor: pkg.status === 'pending' ? '#fff4e5' : '#e8f8f0',
                      color: pkg.status === 'pending' ? '#d35400' : '#27ae60',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {pkg.status.toUpperCase()}
                    </div>
                    <div style={{ color: '#7f8c8d', fontSize: '13px' }}>
                      {formatDate(pkg.created_at)}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePackageDetails(pkg.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3498db',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <FiEye /> Details
                    </button>
                  </div>
                </div>
                {expandedPackage === pkg.id && renderPackageDetails(pkg)}
              </div>
            ))
          ) : (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#7f8c8d'
            }}>
              No packages found matching your criteria
            </div>
          )}
        </div>
      </div>

      <div
        className="system-logs-bar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#222',
          color: '#eee',
          fontFamily: 'monospace',
          fontSize: '13px',
          maxHeight: logsOpen ? '400px' : '40px',
          overflowY: 'auto',
          transition: 'max-height 0.3s ease',
          borderTop: '3px solid #0af',
          zIndex: 1000,
          padding: '10px',
          boxSizing: 'border-box',
        }}
      >
        <button
          onClick={() => setLogsOpen(!logsOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#0af',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: logsOpen ? '10px' : '0',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
          aria-expanded={logsOpen}
          aria-controls="system-logs-content"
        >
          System Logs {logsOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        <div id="system-logs-content" style={{ whiteSpace: 'pre-wrap' }}>
          {eventLogs.length > 0 ? eventLogs.join('\n') : 'Loading logs...'}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
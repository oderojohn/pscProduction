import React, { useState } from 'react';
import { FiAlertTriangle, FiUnlock, FiSearch } from 'react-icons/fi';

const ClampingDashboard = () => {
  const [clampedVehicles, setClampedVehicles] = useState([
    { id: 1, plateNumber: 'KCA 123A', make: 'Toyota', model: 'Prado', color: 'White', clampReason: 'Unauthorized parking', clampedBy: 'Officer Juma', clampTime: '2024-06-15 14:30', status: 'clamped' },
    { id: 2, plateNumber: 'KBT 456B', make: 'Mercedes', model: 'C200', color: 'Black', clampReason: 'No parking permit', clampedBy: 'Officer John', clampTime: '2024-06-15 16:45', status: 'released' },
    { id: 3, plateNumber: 'KCA 123A', make: 'Toyota', model: 'Prado', color: 'White', clampReason: 'Unauthorized parking', clampedBy: 'Officer Juma', clampTime: '2024-06-15 14:30', status: 'clamped' },
    { id: 4, plateNumber: 'KBT 456B', make: 'Mercedes', model: 'C200', color: 'Black', clampReason: 'No parking permit', clampedBy: 'Officer John', clampTime: '2024-06-15 16:45', status: 'released' },
    { id: 5, plateNumber: 'KCA 123A', make: 'Toyota', model: 'Prado', color: 'White', clampReason: 'Unauthorized parking', clampedBy: 'Officer Juma', clampTime: '2024-06-15 14:30', status: 'clamped' },
    { id: 6, plateNumber: 'KBT 456B', make: 'Mercedes', model: 'C200', color: 'Black', clampReason: 'No parking permit', clampedBy: 'Officer John', clampTime: '2024-06-15 16:45', status: 'released' },
    { id: 7, plateNumber: 'KCA 123A', make: 'Toyota', model: 'Prado', color: 'White', clampReason: 'Unauthorized parking', clampedBy: 'Officer Juma', clampTime: '2024-06-15 14:30', status: 'clamped' },
    { id: 8, plateNumber: 'KBT 456B', make: 'Mercedes', model: 'C200', color: 'Black', clampReason: 'No parking permit', clampedBy: 'Officer John', clampTime: '2024-06-15 16:45', status: 'released' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [releaseDetails, setReleaseDetails] = useState({
    releasedBy: '',
    releaseReason: '',
    releaseTime: new Date().toISOString().slice(0, 16)
  });

  const filteredVehicles = clampedVehicles
    .filter(vehicle =>
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.clampReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.clampedBy.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.status === 'clamped' && b.status !== 'clamped' ? -1 : 0);

  const handleRelease = (id) => {
    setClampedVehicles(clampedVehicles.map(vehicle => 
      vehicle.id === id ? { ...vehicle, status: 'released' } : vehicle
    ));
    setShowReleaseModal(false);
    setReleaseDetails({ releasedBy: '', releaseReason: '', releaseTime: new Date().toISOString().slice(0, 16) });
  };

  return (
    <div className="lost-items-dashboard">
      <div className="dashboard-header">
        <h2><FiAlertTriangle size={18} /> Clamping Records</h2>
        <div className="header-controls">
          <div className="search-bar">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by plate, make, model, officer, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th>Plate Number</th>
              <th>Make</th>
              <th>Model</th>
              <th>Color</th>
              <th>Clamp Reason</th>
              <th>Clamped By</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>{vehicle.plateNumber}</td>
                <td>{vehicle.make}</td>
                <td>{vehicle.model}</td>
                <td>{vehicle.color}</td>
                <td>{vehicle.clampReason}</td>
                <td>{vehicle.clampedBy}</td>
                <td>{vehicle.clampTime}</td>
                <td>
                  <span className={`status-badge ${vehicle.status}`}>
                    {vehicle.status}
                  </span>
                </td>
                <td>
                  {vehicle.status === 'clamped' && (
                    <button 
                      className="action-button"
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setShowReleaseModal(true);
                      }}
                    >
                      <FiUnlock /> Release
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showReleaseModal && selectedVehicle && (
        <div className="modal-overlay">
          <div className="add-modal">
            <h3>Release Clamped Vehicle</h3>
            <div className="item-details">
              <div><strong>Plate Number:</strong> {selectedVehicle.plateNumber}</div>
              <div><strong>Vehicle:</strong> {selectedVehicle.make} {selectedVehicle.model}</div>
              <div><strong>Clamped For:</strong> {selectedVehicle.clampReason}</div>
            </div>

            <input
              type="text"
              placeholder="Released By (Your Name)"
              value={releaseDetails.releasedBy}
              onChange={(e) => setReleaseDetails({...releaseDetails, releasedBy: e.target.value})}
            />
            <input
              type="text"
              placeholder="Release Reason"
              value={releaseDetails.releaseReason}
              onChange={(e) => setReleaseDetails({...releaseDetails, releaseReason: e.target.value})}
            />
            <input
              type="datetime-local"
              value={releaseDetails.releaseTime}
              onChange={(e) => setReleaseDetails({...releaseDetails, releaseTime: e.target.value})}
            />

            <div className="modal-actions">
              <button onClick={() => setShowReleaseModal(false)}>Cancel</button>
              <button 
                className="primary" 
                onClick={() => handleRelease(selectedVehicle.id)}
              >
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClampingDashboard;

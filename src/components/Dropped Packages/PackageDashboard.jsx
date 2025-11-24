import React, { useState, useEffect } from 'react';
import PackageStats from './PackageStats';
import PackageTable from './PackageTable';
import PackageModals from './PackageModals';
import PackageSettings from './PackageSettings';
import { PackageService } from '../../service/api/api';
import '../../assets/css/errors.css';

const PackageDashboard = () => {
  const [droppedPackages, setDroppedPackages] = useState([]);
  const [pickedPackages, setPickedPackages] = useState([]);
  const [stats, setStats] = useState({ pending: 0, picked: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showDropModal, setShowDropModal] = useState(false);
  const [showPickModal, setShowPickModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [pickedBy, setPickedBy] = useState({ memberId: '', name: '', phone: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('drop');

  const [newDroppedPackage, setNewDroppedPackage] = useState({
    type: 'package',
    description: '',
    recipientName: '',
    recipientPhone: '',
    droppedBy: '',
    dropperPhone: ''
  });

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pendingPackages, statsData, pickedPackages] = await Promise.all([
        PackageService.getPackages(),
        PackageService.getStats(),
        PackageService.getPickedPackages()
      ]);

      // Ensure arrays are handled properly
      const pendingArray = Array.isArray(pendingPackages) ? pendingPackages : [];
      const pickedArray = Array.isArray(pickedPackages) ? pickedPackages : [];

      setDroppedPackages(pendingArray);
      setPickedPackages(pickedArray);
      setStats(statsData);

    } catch (err) {
      console.error("Error fetching packages:", err);
      setError(err.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDroppedPackages = droppedPackages.filter(pkg => {
    const search = searchTerm.toLowerCase();
    return (
      (pkg.description && pkg.description.toLowerCase().includes(search)) ||
      (pkg.recipient_name && pkg.recipient_name.toLowerCase().includes(search)) ||
      (pkg.dropped_by && pkg.dropped_by.toLowerCase().includes(search)) ||
      (pkg.recipient_phone && pkg.recipient_phone.toLowerCase().includes(search))
    );
  });

  const filteredPickedPackages = pickedPackages.filter(pkg => {
    const search = searchTerm.toLowerCase();
    return (
      (pkg.description && pkg.description.toLowerCase().includes(search)) ||
      (pkg.recipient_name && pkg.recipient_name.toLowerCase().includes(search)) ||
      (pkg.picked_by && pkg.picked_by.toLowerCase().includes(search)) ||
      (pkg.recipient_phone && pkg.recipient_phone.toLowerCase().includes(search))
    );
  });

  const handleDropPackage = async () => {
    try {
      setError(null);

      const packageData = {
        type: newDroppedPackage.type,
        description: newDroppedPackage.description,
        recipient_name: newDroppedPackage.recipientName,
        recipient_phone: newDroppedPackage.recipientPhone,
        dropped_by: newDroppedPackage.droppedBy,
        dropper_phone: newDroppedPackage.dropperPhone
      };

      const createdPackage = await PackageService.createPackage(packageData);

      // Update local state
      setDroppedPackages([...droppedPackages, createdPackage]);
      setStats({
        ...stats,
        pending: stats.pending + 1,
        total: stats.total + 1
      });

      setShowDropModal(false);
      setNewDroppedPackage({
        type: 'package',
        description: '',
        recipientName: '',
        recipientPhone: '',
        droppedBy: '',
        dropperPhone: ''
      });

      // setSuccess('Package dropped successfully!');
    } catch (err) {
      setError(err.message || 'Error creating package');
    }
  };

  const handlePick = async () => {
    if (!selectedPackage) return;

    try {
      setError(null);

      const pickerData = {
        picked_by: pickedBy.name,
        picker_phone: pickedBy.phone,
        picker_id: pickedBy.memberId,
      };
      await PackageService.pickPackage(selectedPackage.id, pickerData);
      setShowDetailsModal(false);
      setPickedBy({ memberId: '', name: '', phone: '' });
      setSelectedPackage(null);

      setSuccess('Package picked successfully!');
      await fetchData(); // Refresh all data after picking
    } catch (err) {
      setError(err.message || 'Error picking package');
    }
  };

  if (loading) {
    return (
      <div className="lost-items-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading packages...</p>
        </div>
      </div>
    );
  }

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

      <PackageStats
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        droppedCount={stats.pending || droppedPackages.length}
        pickedCount={stats.picked || pickedPackages.length}
        setSearchTerm={setSearchTerm}
        searchTerm={searchTerm}
        setShowDropModal={setShowDropModal}
        setShowPickModal={setShowPickModal}
        setShowSettings={setShowSettings}
      />

      <PackageTable
        activeTab={activeTab}
        filteredDroppedPackages={filteredDroppedPackages}
        filteredPickedPackages={filteredPickedPackages}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onViewDetails={(pkg) => {
          setSelectedPackage(pkg);
          setShowDetailsModal(true);
        }}
        refreshData={fetchData}
      />

      <PackageModals
        showDropModal={showDropModal}
        setShowDropModal={setShowDropModal}
        showPickModal={showPickModal}
        setShowPickModal={setShowPickModal}
        newDroppedPackage={newDroppedPackage}
        setNewDroppedPackage={setNewDroppedPackage}
        handleDropPackage={handleDropPackage}
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        selectedPackage={selectedPackage}
        setSelectedPackage={setSelectedPackage}
        pickedBy={pickedBy}
        setPickedBy={setPickedBy}
        handlePick={handlePick}
        error={error}
        setError={setError}
        setSuccess={setSuccess}
        refreshData={fetchData}
      />

      {showSettings && (
        <PackageSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default PackageDashboard;
import React from 'react';

const PackageTable = ({
  activeTab,
  filteredDroppedPackages,
  filteredPickedPackages,
  searchTerm,
  setSearchTerm,
  onViewDetails,
  refreshData 
}) => {
  const renderNoDataMessage = () => (
    <div className="no-data-message">
      <div className="sad-emoji">📦</div>
      <h3>No packages found</h3>
      <p>We couldn't find any {activeTab === 'drop' ? 'dropped' : 'picked'} package</p>
      {searchTerm && (
        <button className="clear-search" onClick={() => {
          setSearchTerm('');
          refreshData(); // Refresh data when clearing search
        }}>
          Clear search
        </button>
      )}
    </div>
  );

  const renderRow = (pkg, isDropped = false, index) => {
    return (
      <tr key={pkg.id} onClick={() => {
        onViewDetails(pkg);
        // refreshData(); // Refresh data when viewing details
      }} className="clickable-row">
        <td>{index + 1}</td> {/* Added numbering */}
        <td>
        {pkg.package_type === 'document'
          ? '📄 '
          : pkg.package_type === 'package'
          ? '📦 '
          : '🔑 '}
      </td>
          <td>{pkg.description || 'N/A'}</td>
        <td>{pkg.recipient_name || 'N/A'}</td>
        <td>{pkg.recipient_phone || 'N/A'}</td>
        <td>{isDropped ? (pkg.dropped_by || 'N/A') : (pkg.picked_by || 'N/A')}</td>
        <td>{new Date(isDropped ? pkg.created_at : pkg.picked_at || pkg.created_at).toLocaleString()}</td>
        <td><span className={`status-badge ${pkg.status}`}>{pkg.status}</span></td>
      </tr>
    );
  };

  // Sort packages by date (newest first)
  const sortPackages = (packages, isDropped) => {
    return [...packages].sort((a, b) => {
      const dateA = new Date(isDropped ? a.created_at : a.picked_at || a.created_at);
      const dateB = new Date(isDropped ? b.created_at : b.picked_at || b.created_at);
      return dateB - dateA;
    });
  };

  const data = activeTab === 'drop' 
    ? sortPackages(filteredDroppedPackages, true) 
    : sortPackages(filteredPickedPackages, false);

  if (!data.length) return renderNoDataMessage();

  return (
    
    <div className="table-container">
      <table className="items-table">
        <thead>
          <tr>
            <th>#</th> 
            <th>T</th>
            <th>Description</th>
            <th>Recipient Name</th>
            <th>Recipient Phone</th>
            <th>{activeTab === 'drop' ? 'Dropped By' : 'Picked By'}</th>
            <th>Date & Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((pkg, index) => renderRow(pkg, activeTab === 'drop', index))}
        </tbody>
      </table>
    </div>
  );
};

export default PackageTable;
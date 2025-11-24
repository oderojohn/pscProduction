import React from 'react';
import { FiPackage, FiSearch } from 'react-icons/fi';

const PackageHeader = ({ searchTerm, setSearchTerm, activeTab }) => (
  <div className="dashboard-header">
    <h2>
      <FiPackage size={18} /> Package Management Dashboard
    </h2>
    <div className="header-controls">
      <div className="search-bar">
        <FiSearch />
        <input
          type="text"
          placeholder={`Search ${activeTab === 'drop' ? 'dropped' : 'picked'} packages...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  </div>
);

export default PackageHeader;
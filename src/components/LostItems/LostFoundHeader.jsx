import React from 'react';
import { FiPackage, FiSearch, FiDatabase } from 'react-icons/fi';


const LostFoundHeader = ({ searchTerm, setSearchTerm, activeTab, cacheStats }) => (
  <div className="dashboard-header">
    <h2>
      <FiPackage size={18} /> Lost & Found Dashboard
    </h2>
    <div className="header-controls">
      <div className="search-bar">
        <FiSearch />
        <input
          type="text"
          placeholder={`Search ${activeTab === 'lost' ? 'lost' : 'found'} items...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Cache Status Indicator */}
      {cacheStats && cacheStats.totalEntries > 0 && (
        <div className="cache-indicator" title={`Cache: ${cacheStats.totalEntries} entries (${cacheStats.memoryEntries} in memory, ${cacheStats.localStorageEntries} in storage)`}>
          <FiDatabase size={14} />
          <span className="cache-count">{cacheStats.totalEntries}</span>
        </div>
      )}
    </div>
  </div>
);

export default LostFoundHeader;

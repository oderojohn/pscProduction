import React from 'react';
import { FiPlus, FiList, FiSearch } from 'react-icons/fi';

const PackageStats = ({
  activeTab,
  setActiveTab,
  droppedCount,
  pickedCount,
  setShowDropModal,
  setShowPickModal,
  searchTerm,
  setSearchTerm,
  setShowSettings
}) => {
  return (
    <div className="dashboard-toolbar">
      <div className="stats-summary">
       
      </div>

      <div className="right-controls">
        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'drop' ? 'dropped' : 'picked'} packages...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="tab-controls">
          <button
            className={`tab-button ${activeTab === 'drop' ? 'active' : ''}`}
            onClick={() => setActiveTab('drop')}
          >
            <FiList size={16} /> Dropped
          </button>
          <button
            className={`tab-button ${activeTab === 'pick' ? 'active' : ''}`}
            onClick={() => setActiveTab('pick')}
          >
            <FiList size={16} /> Picked
          </button>
        </div>
        <div className="action-buttons">
          <button
            className={`add-button ${activeTab === 'drop' ? 'primary' : 'secondary'}`}
            onClick={() => setShowDropModal(true)}
          >
            <FiPlus size={16} /> Drop Package
          </button>
          {/* <button
            className="add-button secondary"
            onClick={() => setShowSettings(true)}
          >
            ⚙️ Settings
          </button> */}
        </div>
        <div className="action-buttons">
          {/* <button
            className={`add-button ${activeTab === 'drop' ? 'primary' : 'secondary'}`}
            onClick={() => setShowDropModal(true)}
          >
            <FiPlus size={16} /> Drop Package
          </button> */}
          <button
            className="add-button secondary"
            onClick={() => setShowSettings(true)}
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageStats;
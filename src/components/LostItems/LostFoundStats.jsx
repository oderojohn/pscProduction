import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiList, FiCreditCard, FiBriefcase, FiCheckSquare, FiDownload, FiMail } from 'react-icons/fi';
import { ReportFoundForm } from './forms/ReportFoundForm';
import { ReportLostForm } from './forms/ReportLostForm';
import { LostFoundService } from '../../service/api/api';
import SystemSettings from './SystemSettings';

const LostFoundStats = ({
  activeTab,
  setActiveTab,
  setShowMatches,
  showSettings,
  setShowSettings,
  onFoundSubmit
}) => {
  const [showLostModal, setShowLostModal] = useState(false);
  const [showFoundModal, setShowFoundModal] = useState(false);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [bulkEmailData, setBulkEmailData] = useState({ subject: '', message: '', recipients: [] });
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setShowMatches(false);
  };


  const handleLostSubmit = (newItem) => {
    console.log("New lost item submitted:", newItem);
    // update state or refetch list
  };

  const handleFoundSubmit = (formData) => {
    onFoundSubmit(formData);
    setShowFoundModal(false);
  };

  const handleExportCSV = async () => {
    try {
      let blob;
      if (activeTab.includes('lost')) {
        blob = await LostFoundService.exportLostItemsCSV();
      } else {
        blob = await LostFoundService.exportFoundItemsCSV();
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handleExportPDF = async () => {
    try {
      let blob;
      if (activeTab.includes('lost')) {
        blob = await LostFoundService.exportLostItemsPDF();
      } else {
        blob = await LostFoundService.exportFoundItemsPDF();
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleBulkEmail = async () => {
    try {
      await LostFoundService.sendBulkEmail(bulkEmailData);
      alert('Bulk email sent successfully!');
      setShowBulkEmailModal(false);
      setBulkEmailData({ subject: '', message: '', recipients: [] });
    } catch (error) {
      console.error('Error sending bulk email:', error);
      alert('Failed to send bulk email. Please try again.');
    }
  };

  return (
    <>
      <div className="dashboard-toolbar">
        <div className="stats-summary">
          
        </div>

        <div className="right-controls">
          <div className="tab-controls">
            <button
              className={`tab-button ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => handleTabClick('matches')}
            >
              <FiList size={16} /> Matches
            </button>
            <button
              className={`tab-button ${activeTab === 'lost-cards' ? 'active' : ''}`}
              onClick={() => handleTabClick('lost-cards')}
            >
              <FiCreditCard size={16} /> Lost Cards
            </button>
            <button
              className={`tab-button ${activeTab === 'lost-items' ? 'active' : ''}`}
              onClick={() => handleTabClick('lost-items')}
            >
              <FiBriefcase size={16} /> Lost Items
            </button>
            <button
              className={`tab-button ${activeTab === 'found-cards' ? 'active' : ''}`}
              onClick={() => handleTabClick('found-cards')}
            >
              <FiCreditCard size={16} /> Found Cards
            </button>
            <button
              className={`tab-button ${activeTab === 'found-items' ? 'active' : ''}`}
              onClick={() => handleTabClick('found-items')}
            >
              <FiBriefcase size={16} /> Found Items
            </button>
            <button
              className={`tab-button ${activeTab === 'picked' ? 'active' : ''}`}
              onClick={() => handleTabClick('picked')}
            >
              <FiCheckSquare size={16} /> Picked
            </button>
            {/* <button
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => {
                handleTabClick('settings');
                setShowSettings(true);
              }}
            > */}
              {/* <FiSettings size={16} /> Settings
            </button> */}
          </div>
          <div className="action-buttons">
            <button
              className="add-button primary"
              onClick={() => setShowLostModal(true)}
            >
              <FiPlus size={16} /> Report Lost
            </button>
            <button
              className="add-button secondary"
              onClick={() => setShowFoundModal(true)}
            >
              <FiPlus size={16} /> Report Found
            </button>
            {(activeTab.includes('lost') || activeTab.includes('found')) && (
               <div className="dropdown-container" ref={dropdownRef}>
                 {/* <button
                   className="add-button tertiary dropdown-toggle"
                   onClick={() => setShowExportDropdown(!showExportDropdown)}
                   title="Export Options"
                 >
                   <FiDownload size={16} /> Export <FiChevronDown size={14} />
                 </button> */}
                 {showExportDropdown && (
                   <div className="dropdown-menu">
                     <button
                       className="dropdown-item"
                       onClick={() => {
                         setShowBulkEmailModal(true);
                         setShowExportDropdown(false);
                       }}
                     >
                       <FiMail size={14} /> Bulk Email
                     </button>
                     <button
                       className="dropdown-item"
                       onClick={() => {
                         handleExportCSV();
                         setShowExportDropdown(false);
                       }}
                     >
                       <FiDownload size={14} /> Export CSV
                     </button>
                     <button
                       className="dropdown-item"
                       onClick={() => {
                         handleExportPDF();
                         setShowExportDropdown(false);
                       }}
                     >
                       <FiDownload size={14} /> Export PDF
                     </button>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>

      {showLostModal && (
        <ReportLostForm 
          onClose={() => setShowLostModal(false)}
          onSubmit={handleLostSubmit}
        />
      )}

      {showFoundModal && (
        <ReportFoundForm
          onClose={() => setShowFoundModal(false)}
          onSubmit={handleFoundSubmit}
        />
      )}

      {activeTab === 'settings' && <SystemSettings />}

      {showBulkEmailModal && (
        <div className="modal-overlay" onClick={() => setShowBulkEmailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Bulk Email</h3>
              <button
                className="modal-close"
                onClick={() => setShowBulkEmailModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Recipients (comma-separated emails):</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="email1@example.com, email2@example.com"
                  value={bulkEmailData.recipients.join(', ')}
                  onChange={(e) => setBulkEmailData({
                    ...bulkEmailData,
                    recipients: e.target.value.split(',').map(email => email.trim()).filter(email => email)
                  })}
                />
              </div>
              <div className="form-group">
                <label>Subject:</label>
                <input
                  type="text"
                  className="form-control"
                  value={bulkEmailData.subject}
                  onChange={(e) => setBulkEmailData({ ...bulkEmailData, subject: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Message:</label>
                <textarea
                  className="form-control"
                  rows="8"
                  value={bulkEmailData.message}
                  onChange={(e) => setBulkEmailData({ ...bulkEmailData, message: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowBulkEmailModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBulkEmail}
              >
                Send Bulk Email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LostFoundStats;

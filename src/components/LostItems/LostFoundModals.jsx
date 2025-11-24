import React from 'react'; 
import '../../assets/css/LostFoundModals.css'; 

const LostFoundModals = ({
  showDetailsModal,
  setShowDetailsModal,
  selectedItem,
  pickedBy,
  setPickedBy,
  handlePick,
  showPickupForm,
  setShowPickupForm,
}) => {
  return (
    <>
      {/* Item Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="lf-modal-overlay">
          <div className="lf-modal-container lf-details-modal">
            <div className="lf-modal-header">
              <h3>Item Details</h3>
              <button 
                className="lf-modal-close-btn"
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowPickupForm(false);
                }}
              >
                &times;
              </button>
            </div>
            
            <div className="lf-modal-body">
              <div className="lf-details-grid">
                <div className="lf-detail-row">
                  <span className="lf-detail-label">Type:</span>
                  <span className="lf-detail-value">
                    {selectedItem.type === 'card' ? '💳 Card' : '🧳 Item'}
                  </span>
                </div>

                {selectedItem.type === 'card' ? (
                  <div className="lf-detail-row">
                    <span className="lf-detail-label">Card Number:</span>
                    <span className="lf-detail-value">{selectedItem.card_last_four}</span>
                  </div>
                ) : (
                  <>
                    <div className="lf-detail-row">
                      <span className="lf-detail-label">Item Name:</span>
                      <span className="lf-detail-value">{selectedItem.item_name}</span>
                    </div>
                    <div className="lf-detail-row">
                      <span className="lf-detail-label">Description:</span>
                      <span className="lf-detail-value">{selectedItem.description}</span>
                    </div>
                  </>
                )}

                <div className="lf-detail-row">
                  <span className="lf-detail-label">Owner:</span>
                  <span className="lf-detail-value">{selectedItem.owner_name || 'Unknown'}</span>
                </div>

                {selectedItem.place_lost && (
                  <div className="lf-detail-row">
                    <span className="lf-detail-label">Place Lost:</span>
                    <span className="lf-detail-value">{selectedItem.place_lost}</span>
                  </div>
                )}

                {selectedItem.place_found && (
                  <div className="lf-detail-row">
                    <span className="lf-detail-label">Place Found:</span>
                    <span className="lf-detail-value">{selectedItem.place_found}</span>
                  </div>
                )}

                <div className="lf-detail-row">
                  <span className="lf-detail-label">
                    {selectedItem.place_lost ? 'Reported By:' : 'Found By:'}
                  </span>
                  <span className="lf-detail-value">
                    {selectedItem.reporter_member_id || selectedItem.finder_name}
                  </span>
                </div>

                <div className="lf-detail-row">
                  <span className="lf-detail-label">Contact:</span>
                  <span className="lf-detail-value">
                    {selectedItem.reporter_phone || selectedItem.finder_phone}
                  </span>
                </div>

                <div className="lf-detail-row">
                  <span className="lf-detail-label">Status:</span>
                  <span className={`lf-status-badge lf-status-${selectedItem.status}`}>
                    {selectedItem.status}
                  </span>
                </div>

                <div className="lf-detail-row">
                  <span className="lf-detail-label">Date Reported:</span>
                  <span className="lf-detail-value">
                    {new Date(selectedItem.date_reported).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Pickup Section - Only show for found items and found cards */}
              {(selectedItem.place_found || (selectedItem.type === 'card' && selectedItem.status === 'found')) && (
                !showPickupForm ? (
                  <button
                    className="lf-btn lf-btn-primary lf-pickup-btn"
                    onClick={() => setShowPickupForm(true)}
                    disabled={
                      selectedItem.status &&
                      selectedItem.status.toLowerCase() !== 'found'
                    }
                  >
                    Initiate Pickup Process
                  </button>
                ) : (
                  <div className="lf-pickup-form">
                    <div className="lf-scan-notice">
                      <p>Members can pick up items by scanning their Membership Card at the scanner.</p>
                    </div>

                    <h4>Manual Pick Up Form</h4>

                    <div className="lf-form-group">
                      <label>Member No/ID No</label>
                      <input
                        className="lf-form-control"
                        type="text"
                        placeholder="Member identification number"
                        value={pickedBy.memberId}
                        onChange={(e) => setPickedBy({ ...pickedBy, memberId: e.target.value })}
                      />
                    </div>

                    <div className="lf-form-group">
                      <label>Full Name</label>
                      <input
                        className="lf-form-control"
                        type="text"
                        placeholder="Member's full name"
                        value={pickedBy.name}
                        onChange={(e) => setPickedBy({ ...pickedBy, name: e.target.value })}
                      />
                    </div>

                    <div className="lf-form-group">
                      <label>Phone Number</label>
                      <input
                        className="lf-form-control"
                        type="tel"
                        placeholder="Member's phone number"
                        value={pickedBy.phone}
                        onChange={(e) => setPickedBy({ ...pickedBy, phone: e.target.value })}
                      />
                    </div>

                    <div className="lf-modal-footer">
                      <button
                        className="lf-btn lf-btn-secondary"
                        onClick={() => {
                          setShowPickupForm(false);
                          setPickedBy({ memberId: '', name: '', phone: '' });
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="lf-btn lf-btn-primary"
                        onClick={handlePick}
                      >
                        Confirm Pickup
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LostFoundModals;

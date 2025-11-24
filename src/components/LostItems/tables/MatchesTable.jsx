import React, { useState } from 'react';
import { FiCheck, FiInfo } from 'react-icons/fi';
import ConfirmationModal from '../ConfirmationModal';
import { LostFoundService } from '../../../service/api/api';
import { useNotification } from '../../../hooks/useNotification';

const MatchesTable = ({
  potentialMatches,
  loadingMatches,
  markAsFound,
  onViewDetails
}) => {
  const { success, error } = useNotification();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [refreshingMatches, setRefreshingMatches] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const safeText = (val, fallback = 'N/A') => {
    if (val === null || val === undefined) return fallback;
    return typeof val === 'string' ? val : 
           typeof val === 'object' ? JSON.stringify(val) : 
           String(val);
  };

  const handleMarkAsFound = (itemId) => {
    setSelectedItemId(itemId);
    setShowConfirmModal(true);
  };

  const confirmMarkAsFound = async () => {
    setShowConfirmModal(false);
    setRefreshingMatches(true);
    try {
      await markAsFound(selectedItemId);
      success(
        'Item Marked as Found',
        'The lost item has been successfully marked as found and matched with the corresponding found item.'
      );
    } catch (err) {
      console.error('Error marking item as found:', err);
      error(
        'Failed to Mark as Found',
        'There was an error marking the item as found. Please try again.'
      );
    } finally {
      setRefreshingMatches(false);
    }
  };

  const fetchMatchDetails = async (match) => {
    setLoadingDetails(true);
    setSelectedMatch(match);
    try {
      const details = await LostFoundService.getMatchDetails(
        match.lost_item_id || match.lost_item?.id,
        match.found_item_id || match.found_item?.id
      );
      setMatchDetails(details);
    } catch (err) {
      console.error('Error fetching match details:', err);
      setMatchDetails(null);
      error(
        'Failed to Load Match Details',
        'Unable to fetch detailed information for this match. Please try again.'
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeMatchDetails = () => {
    setSelectedMatch(null);
    setMatchDetails(null);
  };

  console.log("🔍 MatchesTable received potentialMatches:", potentialMatches);
  console.log("🔍 MatchesTable received loadingMatches:", loadingMatches);

  const sortedMatches = [...(potentialMatches || [])]
    .sort((a, b) => {
      // Sort by match score (highest first)
      const scoreA = a.match_score || 0;
      const scoreB = b.match_score || 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      // If scores are equal, sort by ID (most recent first - assuming higher IDs are more recent)
      return (b.lost_item_id || 0) - (a.lost_item_id || 0);
    });

  console.log("🔍 Sorted matches:", sortedMatches);

  console.log("🔍 Rendering table with sortedMatches.length:", sortedMatches.length);
  console.log("🔍 loadingMatches:", loadingMatches);

  console.log("🔍 About to render MatchesTable JSX");

  return (
    <>
      <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto', border: '2px solid red', padding: '10px', margin: '10px' }}>
        <div style={{ background: 'yellow', color: 'black', padding: '10px', marginBottom: '10px', fontWeight: 'bold' }}>
          🔍 DEBUG: Matches Table - {sortedMatches.length} matches loaded
        </div>
        <table className="items-table matches-table" style={{ border: '1px solid blue' }}>
          <thead>
            <tr>
              <th>Match Score</th>
              <th>Lost Item</th>
              <th>Found Item</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingMatches ? (
              <tr><td colSpan="4" className="loading-message">Loading matches...</td></tr>
            ) : sortedMatches.length > 0 ? (
              sortedMatches.map((match, index) => {
                console.log(`🔍 Rendering match row ${index}:`, match);
                return (
                  <MatchRow
                    key={`match-${index}`}
                    match={match}
                    onMarkAsFound={handleMarkAsFound}
                    onViewDetails={onViewDetails}
                    onRowClick={fetchMatchDetails}
                    refreshingMatches={refreshingMatches}
                    safeText={safeText}
                  />
                );
              })
            ) : (
              <tr><td colSpan="4" className="no-data-message">No matches found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmMarkAsFound}
        title="Confirm Mark as Found"
        message="Are you sure you want to mark this item as found? This action cannot be undone."
        isLoading={refreshingMatches}
      />

      {/* Match Details Modal */}
      {selectedMatch && (
        <div className="lf-modal-overlay" onClick={closeMatchDetails}>
          <div className="lf-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="lf-modal-header">
              <h3><FiInfo /> Match Details</h3>
              <button className="lf-modal-close-btn" onClick={closeMatchDetails}>
                ×
              </button>
            </div>
            <div className="lf-modal-body">
              {loadingDetails ? (
                <div className="loading-message">Loading match details...</div>
              ) : matchDetails ? (
                <div className="match-details-modal">
                  <div className="match-score-header">
                    <span className="match-score">
                      {Math.round(matchDetails.match_score * 100)}% Match
                    </span>
                  </div>
                  <div className="match-reasons-section">
                    <h4>Match Reasons:</h4>
                    <ul>
                      {matchDetails.match_reasons?.map((reason, i) => (
                        <li key={`reason-${i}`}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="match-items-comparison">
                    <div className="match-column lost-column">
                      <h4>Lost Item Details</h4>
                      <p><strong>Type:</strong> {matchDetails.lost_item?.type === 'card' ? 'Card' : 'Item'}</p>
                      {matchDetails.lost_item?.type === 'card' ? (
                        <>
                          <p><strong>Card Last 4:</strong> {safeText(matchDetails.lost_item?.card_last_four)}</p>
                        </>
                      ) : (
                        <>
                          <p><strong>Name:</strong> {safeText(matchDetails.lost_item?.item_name)}</p>
                          <p><strong>Description:</strong> {safeText(matchDetails.lost_item?.description)}</p>
                        </>
                      )}
                      <p><strong>Owner:</strong> {safeText(matchDetails.lost_item?.owner_name, 'Unknown')}</p>
                      <p><strong>Place Lost:</strong> {safeText(matchDetails.lost_item?.place_lost)}</p>
                      <p><strong>Reporter Email:</strong> {safeText(matchDetails.lost_item?.reporter_email)}</p>
                      <p><strong>Reporter Phone:</strong> {safeText(matchDetails.lost_item?.reporter_phone)}</p>
                      <p><strong>Date Reported:</strong> {matchDetails.lost_item?.date_reported ? new Date(matchDetails.lost_item.date_reported).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div className="match-column found-column">
                      <h4>Found Item Details</h4>
                      <p><strong>Type:</strong> {matchDetails.found_item?.type === 'card' ? 'Card' : 'Item'}</p>
                      {matchDetails.found_item?.type === 'card' ? (
                        <>
                          <p><strong>Card Last 4:</strong> {safeText(matchDetails.found_item?.card_last_four)}</p>
                        </>
                      ) : (
                        <>
                          <p><strong>Name:</strong> {safeText(matchDetails.found_item?.item_name)}</p>
                          <p><strong>Description:</strong> {safeText(matchDetails.found_item?.description)}</p>
                        </>
                      )}
                      <p><strong>Finder:</strong> {safeText(matchDetails.found_item?.finder_name, 'Unknown')}</p>
                      <p><strong>Place Found:</strong> {safeText(matchDetails.found_item?.place_found)}</p>
                      <p><strong>Finder Phone:</strong> {safeText(matchDetails.found_item?.finder_phone)}</p>
                      <p><strong>Date Reported:</strong> {matchDetails.found_item?.date_reported ? new Date(matchDetails.found_item.date_reported).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="error-message">Failed to load match details</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MatchRow = ({ match, onMarkAsFound, onViewDetails, onRowClick, refreshingMatches, safeText }) => {
  console.log("🔍 Rendering MatchRow with match:", match);

  // Handle both old and new data structures
  const lostItem = match.lost_item || {};
  const foundItem = match.found_item || {};
  const matchScore = match.match_score || 0;

  // For new API structure with IDs only
  const hasFullData = match.lost_item && match.found_item;
  const lostItemId = match.lost_item_id || lostItem.id;
  const foundItemId = match.found_item_id || foundItem.id;

  console.log("🔍 MatchRow data:", { hasFullData, lostItemId, foundItemId, matchScore });

  // Get display name for lost item
  const getLostItemDisplay = () => {
    if (hasFullData) {
      if (lostItem.type === 'card') {
        return `Card: ${safeText(lostItem.card_last_four)}`;
      }
      return safeText(lostItem.item_name, 'Unnamed Item');
    } else {
      // For new structure, show placeholder until details are loaded
      return `Lost Item #${lostItemId}`;
    }
  };

  // Get display name for found item
  const getFoundItemDisplay = () => {
    if (hasFullData) {
      if (foundItem.type === 'card') {
        return `Card: ${safeText(foundItem.card_last_four)}`;
      }
      return safeText(foundItem.item_name, 'Unnamed Item');
    } else {
      // For new structure, show placeholder until details are loaded
      return `Found Item #${foundItemId}`;
    }
  };

  return (
    <tr
      onClick={() => onRowClick(match)}
      style={{ cursor: 'pointer' }}
      className="clickable-match-row thin-match-row"
    >
      <td className="match-score-cell">
        <span className="match-score-badge">
          {Math.round(matchScore * 100)}%
        </span>
      </td>
      <td className="item-name-cell">
        <div className="item-info">
          <span className="item-name">{getLostItemDisplay()}</span>
          <small className="item-type">Lost</small>
        </div>
      </td>
      <td className="item-name-cell">
        <div className="item-info">
          <span className="item-name">{getFoundItemDisplay()}</span>
          <small className="item-type">Found</small>
        </div>
      </td>
      <td className="actions-cell">
        <div className="match-actions">
          {(!hasFullData || lostItem.status === 'pending') && (
            <button
              className="btn btn-success btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsFound(lostItemId);
              }}
              disabled={refreshingMatches}
            >
              <FiCheck /> Mark Found
            </button>
          )}
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick(match);
            }}
          >
            <FiInfo /> Details
          </button>
        </div>
      </td>
    </tr>
  );
};

export default MatchesTable;
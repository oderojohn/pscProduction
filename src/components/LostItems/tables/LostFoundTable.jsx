import React from 'react';
import LostCardsTable from './LostCardsTable';
import LostItemsTable from './LostItemsTable';
import FoundCardsTable from './FoundCardsTable';
import FoundItemsTable from './FoundItemsTable';
import PickedItemsTable from './PickedItemsTable';
import MatchesTable from './MatchesTable';

const LostFoundTable = ({
  activeTab,
  filteredLostItems = [],
  filteredFoundItems = [],
  filteredPickedItems = [],
  markAsFound,
  markAsPicked,
  searchTerm,
  setSearchTerm,
  onViewDetails,
  potentialMatches,
  loadingMatches = false
}) => {
  if (activeTab === 'matches') {
    console.log("🔍 Rendering MatchesTable with:", { potentialMatches, loadingMatches });
    return (
      <MatchesTable
        potentialMatches={potentialMatches}
        loadingMatches={loadingMatches}
        markAsFound={markAsFound}
        onViewDetails={onViewDetails}
      />
    );
  }

  if (activeTab === 'lost-cards') {
    return (
      <LostCardsTable
        items={filteredLostItems}
        onViewDetails={onViewDetails}
      />
    );
  }

  if (activeTab === 'lost-items') {
    return (
      <LostItemsTable
        items={filteredLostItems}
        onViewDetails={onViewDetails}
      />
    );
  }

  if (activeTab === 'found-cards') {
    return (
      <FoundCardsTable
        items={filteredFoundItems}
        onViewDetails={onViewDetails}
        markAsPicked={markAsPicked}
      />
    );
  }

  if (activeTab === 'found-items') {
    return (
      <FoundItemsTable
        items={filteredFoundItems}
        onViewDetails={onViewDetails}
        markAsPicked={markAsPicked}
      />
    );
  }

  if (activeTab === 'picked') {
    return (
      <PickedItemsTable
        items={filteredPickedItems}
        onViewDetails={onViewDetails}
      />
    );
  }

  return (
    <div className="no-data-message">
      <div className="sad-emoji">😞</div>
      <h3>No items found</h3>
      <p>Please select a tab to view items.</p>
    </div>
  );
};

export default LostFoundTable;
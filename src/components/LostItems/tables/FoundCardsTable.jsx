import React from 'react';
import ItemsTable from './ItemsTable';

const FoundCardsTable = ({ items, onViewDetails }) => {
  const columns = [
    { header: '#', width: '10%' },
    { header: 'Type', width: '15%' },
    { header: 'Card Details', width: '25%' },
    { header: 'Email', width: '25%' },
    { header: 'Date Reported', width: '15%' },
    { header: 'Status', width: '10%' }
  ];

  // Add sequential numbers to items
  const numberedItems = items.map((item, index) => ({ 
    ...item, 
    displayNumber: index + 1 
  }));

  return (
    <ItemsTable
      items={numberedItems}
      columns={columns}
      onViewDetails={onViewDetails}
      isFound={true}
      showType="cards"
    />
  );
};

export default FoundCardsTable;
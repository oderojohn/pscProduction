import React from 'react';
import ItemsTable from './ItemsTable';

const LostItemsTable = ({ items, onViewDetails }) => {
  const columns = [
    { header: '#', width: '5%' },
    { header: 'Type', width: '10%' },
    { header: 'Item Name', width: '15%' },
    { header: 'Owner', width: '15%' },
    { header: 'Place Lost', width: '15%' },
    { header: 'Phone', width: '15%' },
    { header: 'Email', width: '20%' },
    { header: 'Date Reported', width: '15%' },
    { header: 'Status', width: '10%' },
  ];

  // Add sequential numbers to items
  const numberedItems = items.map((item, index) => ({
    ...item,
    displayNumber: index + 1,
  }));

  return (
    <ItemsTable
      items={numberedItems}
      columns={columns}
      onViewDetails={onViewDetails} // ✅ same as LostCardsTable
      isLost={true}
      showType="items"
    />
  );
};

export default LostItemsTable;

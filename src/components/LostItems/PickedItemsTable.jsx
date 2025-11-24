import React from 'react';
import ItemsTable from './tables/ItemsTable';

const PickedItemsTable = ({ items, onViewDetails }) => {
  const columns = [
    { header: 'Type', width: '10%' },
    { header: 'Details', width: '15%' },
    { header: 'Owner', width: '12%' },
    { header: 'Place Found', width: '12%' },
    { header: 'Picked By', width: '12%' },
    { header: 'Picked By Phone', width: '10%' },
    { header: 'Pickup Date', width: '12%' },
    { header: 'Status', width: '10%' },
    { header: 'Actions', width: '7%' }
  ];

  return (
    <ItemsTable
      items={items}
      columns={columns}
      onViewDetails={onViewDetails}
      isPicked={true}
    />
  );
};

export default PickedItemsTable;
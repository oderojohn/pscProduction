import React from 'react';
import ItemsTable from './ItemsTable';

const PickedItemsTable = ({ items, onViewDetails }) => {
  const columns = [
    { header: 'Type', width: '10%' },
    { header: 'Details', width: '25%' },
    { header: 'Owner', width: '15%' },
    { header: 'Location', width: '15%' },
    { header: 'Contact', width: '15%' },
    { header: 'Phone', width: '10%' },
    { header: 'Date Reported', width: '15%' },
    { header: 'Status', width: '10%' }
  ];

  // Map the API response to normalized items
  const pickedItems = items.map(entry => {
    const item = entry.item_details;
    const pickup = entry.pickup_details;

    return {
      ...item,
      status: "picked", // force status to picked
      owner_name: pickup?.picked_by_name || item.owner_name,
      reporter_email: pickup?.picked_by_member_id || item.reporter_email,
      reporter_phone: pickup?.picked_by_phone || item.reporter_phone,
      date_reported: entry.pickup_date || item.date_reported,
    };
  });

  return (
    <ItemsTable
      items={pickedItems}
      columns={columns}
      onViewDetails={onViewDetails}
    />
  );
};

export default PickedItemsTable;

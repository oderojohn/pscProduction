import React from "react";
import ItemsTable from "./ItemsTable";

const FoundItemsTable = ({ items, onViewDetails, markAsPicked }) => {
  // Found-specific column headers
  const columns = [
    { header: "#", width: "5%" },
    { header: "Type", width: "10%" },
    { header: "Item Name", width: "15%" },
    { header: "Owner", width: "12%" },
    { header: "Place Found", width: "12%" },
    { header: "Finder", width: "12%" },
    { header: "Finder Phone", width: "10%" },
    { header: "Photo", width: "10%" },
    { header: "Date Reported", width: "12%" },
    { header: "Status", width: "10%" },
  ];

  // Add sequential numbers
  const numberedItems = items.map((item, index) => ({
    ...item,
    displayNumber: index + 1,
  }));

  return (
    <ItemsTable
      items={numberedItems}
      columns={columns}
      onViewDetails={onViewDetails}
      onMarkAsPicked={markAsPicked}
      isFound={true}
      showType="found-items"
    />
  );
};

export default FoundItemsTable;

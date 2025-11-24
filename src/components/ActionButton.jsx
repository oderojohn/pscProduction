import React from 'react';
import '../assets/css/ActionButton.css';

const ActionButton = ({ status }) => {
  const getClass = () => {
    switch (status) {
      case 'Check-in': return 'checkin';
      case 'Pending': return 'pending';
      case 'Processing': return 'processing';
      default: return '';
    }
  };

  return (
    <button className={`action-btn ${getClass()}`}>
      {status}
    </button>
  );
};

export default ActionButton;

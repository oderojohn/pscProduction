import React from 'react';
import ActionButton from './ActionButton';
import ProgressBar from './ProgressBar';

const GuestRow = ({ guest }) => {
  return (
    <tr>
      <td>{guest.name}</td>
      <td>{guest.phone}</td>
      <td>{guest.host}</td>
      <td><ActionButton status={guest.status} /></td>
      <td><ProgressBar percentage={guest.progress} /></td>
    </tr>
  );
};

export default GuestRow;

import React from 'react';
import '../assets/css/ProgressBar.css';

const ProgressBar = ({ percentage }) => {
  return (
    <div className="progress-bar">
      <div className="fill" style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

export default ProgressBar;

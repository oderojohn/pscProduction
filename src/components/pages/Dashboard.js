// Dashboard.js
import React from 'react';
import PackageDashboard from './PackageDashboard';
import LostFoundDashboard from './LostFoundDashboard';
import '../../assets/css/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="lost-items-dashboard">
    <div className="dashboard-container">
      <div className="dashboard-section">
      <div className="dashboard-header">

        <h4>Package Delivery Dashboard</h4>
        </div>
        <PackageDashboard />
      </div>
      
      <div className="dashboard-section">
      <div className="dashboard-header">

        <h2>Lost & Found Dashboard</h2>
        </div>
        <LostFoundDashboard />
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
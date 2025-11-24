import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHome, FaTag, FaFileAlt, FaBars, FaTimes, FaChevronLeft, 
  FaExclamationTriangle, FaShieldAlt, FaChartLine,FaClipboardList
} from 'react-icons/fa';
import '../assets/css/Sidebar.css';
import { useAuth } from '../service/auth/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsActive(!isActive);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <>
      <button className="menu-toggle" onClick={toggleSidebar}>
        {isActive ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`sidebar ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-heading">
          <div className='divtext'>
            {isCollapsed ? '' : <><FaHome /> <span>Dashboard</span></>}
          </div>
          <button className="collapse-btn" onClick={toggleCollapse}>
            <FaChevronLeft />
          </button>
        </div>
        <nav className="nav-links">
          <ul>
            {/* Admin Dashboard Link */}
            {hasRole(['ADMIN']) && (
              <li>
                <Link to="/">
                  <FaChartLine /> <span>Admin Dashboard</span>
                </Link>
              </li>
            )}

            {hasRole(['ADMIN', 'STAFF', 'RECEPTION']) && (
              <li>
                <Link to="/dropped-packages">
                  <FaTag /> <span>Drop Package</span>
                </Link>
              </li>
            )}
            
               {hasRole(['ADMIN']) && (
              <li>
                <Link to="/lost-found">
                  <FaClipboardList /> <span>Lost & Found</span>
                </Link>
              </li>
            )}

            {hasRole(['ADMIN', 'STAFF']) && (
              <li>
                <Link to="/SecurityControlDashboard">
                  <FaShieldAlt /> <span>Security Control</span>
                </Link>
              </li>
            )}

            {hasRole(['STAFF']) && (
              <li>
                <Link to="/ReportIssue">
                  <FaExclamationTriangle /> <span>Report an Issue</span>
                </Link>
              </li>
            )}

            {hasRole(['ADMIN']) && (
              <li>
                <Link to="/ReportIssue">
                  <FaExclamationTriangle /> <span>Reported Issues</span>
                </Link>
              </li>
            )}

         
            

            {hasRole(['ADMIN']) && (
              <li>
                <Link to="/ReportsDashboard">
                  <FaFileAlt /> <span>Reports</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="user-profile">
          <span>{user?.username || 'User Name'}</span>
          <small>View profile</small>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
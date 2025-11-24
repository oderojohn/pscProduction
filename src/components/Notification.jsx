import React, { useEffect } from 'react';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';
import '../assets/css/Notification.css';

export const Notification = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FiCheck />;
      case 'error':
        return <FiX />;
      case 'warning':
        return <FiAlertCircle />;
      case 'info':
      default:
        return <FiInfo />;
    }
  };

  const getClassName = () => {
    return `notification notification-${notification.type}`;
  };

  return (
    <div className={getClassName()}>
      <div className="notification-icon">
        {getIcon()}
      </div>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-message">{notification.message}</div>
      </div>
      <button className="notification-close" onClick={onClose}>
        <FiX />
      </button>
    </div>
  );
};

export const NotificationContainer = ({ notifications, onClose }) => {
  return (
    <div className="notification-container">
      {notifications.map((notification, index) => (
        <Notification
          key={notification.id || index}
          notification={notification}
          onClose={() => onClose(notification.id || index)}
        />
      ))}
    </div>
  );
};
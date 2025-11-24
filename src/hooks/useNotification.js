import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);

    return id;
  }, [removeNotification]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const success = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'success',
      title: title || 'Success',
      message,
      ...options
    });
  }, [addNotification]);

  const error = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'error',
      title: title || 'Error',
      message,
      duration: 7000, // Errors stay longer
      ...options
    });
  }, [addNotification]);

  const warning = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'warning',
      title: title || 'Warning',
      message,
      ...options
    });
  }, [addNotification]);

  const info = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'info',
      title: title || 'Information',
      message,
      ...options
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info
  };
};
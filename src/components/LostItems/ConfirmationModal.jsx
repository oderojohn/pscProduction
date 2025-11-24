import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h4>
            <FiAlertTriangle className="text-warning me-2" />
            {title}
          </h4>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
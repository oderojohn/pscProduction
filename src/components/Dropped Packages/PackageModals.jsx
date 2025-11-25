import React, { useState, useEffect } from 'react';
import { PackageService } from '../../service/api/api';
import { showSuccess, showError } from '../../utils/swalNotifications';
import Swal from 'sweetalert2';
import "../../assets/css/modals.css";

const PackageModals = ({
  showDropModal,
  setShowDropModal,
  showPickModal,
  setShowPickModal,
  newDroppedPackage,
  setNewDroppedPackage,
  handleDropPackage,
  showDetailsModal,
  setShowDetailsModal,
  selectedPackage,
  setSelectedPackage,
  pickedBy,
  setPickedBy,
  handlePick,
  setError,
  setSuccess,
  refreshData
}) => {
  const [localError, setLocalError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPickForm, setShowPickForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [packageHistory, setPackageHistory] = useState([]);
  const [editFormData, setEditFormData] = useState({});
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [cachedDescriptions, setCachedDescriptions] = useState([]);
  const [showDescriptionDropdown, setShowDescriptionDropdown] = useState(false);

  // Phone number validation regex (digits only, at least 10)
  const phoneRegex = /^[0-9]{10,}$/;
  // Member ID validation regex
  const memberIdRegex = /^(?:[A-Za-z]\d{3,18}[A-Za-z]?|\d{5,20})$/;
  // Name validation regex (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  // Description validation (at least 5 characters)
  const descRegex = /^.{5,500}$/;

  // Load cached descriptions from localStorage on component mount
  useEffect(() => {
    const savedDescriptions = localStorage.getItem('cachedDescriptions');
    if (savedDescriptions) {
      setCachedDescriptions(JSON.parse(savedDescriptions));
    }
  }, []);

  // Save to localStorage whenever cache changes
  useEffect(() => {
    localStorage.setItem('cachedDescriptions', JSON.stringify(cachedDescriptions));
  }, [cachedDescriptions]);

  const addToDescriptionCache = (description) => {
    if (!description) return;
    
    setCachedDescriptions(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item !== description);
      // Add to beginning of array
      const updated = [description, ...filtered];
      // Keep only last 10 items
      return updated.slice(0, 10);
    });
  };

  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors };

    switch (fieldName) {
      case 'description':
        if (!value) {
          errors.description = 'Description is required';
        } else if (!descRegex.test(value)) {
          errors.description = 'Description must be 5-500 characters';
        } else {
          delete errors.description;
        }
        break;

      case 'recipientName':
      case 'droppedBy':
        // For drop form - these remain required
        if (!value) {
          errors[fieldName] = 'Name is required';
        } else if (!nameRegex.test(value)) {
          errors[fieldName] = 'Enter a valid name (2-50 characters)';
        } else {
          delete errors[fieldName];
        }
        break;

      case 'recipientPhone':
      case 'dropperPhone':
        // For drop form - these remain required
        if (!value) {
          errors[fieldName] = 'Phone number or Member ID is required';
        } else if (!phoneRegex.test(value) && !memberIdRegex.test(value)) {
          errors[fieldName] = 'Enter a valid phone number (10+ digits) or Member ID (e.g., K1234)';
        } else {
          delete errors[fieldName];
        }
        break;

      case 'name':
        // For pickup form - optional, but validate format if provided
        if (value && !nameRegex.test(value)) {
          errors[fieldName] = 'Enter a valid name (2-50 characters)';
        } else {
          delete errors[fieldName];
        }
        break;

      case 'phone':
        // For pickup form - optional, but validate format if provided
        if (value && !phoneRegex.test(value) && !memberIdRegex.test(value)) {
          errors[fieldName] = 'Enter a valid phone number (10+ digits) or Member ID (e.g., K1234)';
        } else {
          delete errors[fieldName];
        }
        break;

      case 'memberId':
        // For pickup form - optional, but validate format if provided
        if (value && !memberIdRegex.test(value)) {
          errors.memberId = 'Enter a valid ID (e.g., M1234, K1234A, or numeric ID)';
        } else {
          delete errors.memberId;
        }
        break;

      default:
        break;
    }

    setFieldErrors(errors);
    return !errors[fieldName]; // returns true if valid
  };

  const validateEditForm = () => {
    const errors = {};

    // Description
    if (!editFormData.description || editFormData.description.length < 5 || editFormData.description.length > 500) {
      errors.description = 'Description must be 5-500 characters';
    }

    // Recipient Name
    if (!editFormData.recipient_name || !nameRegex.test(editFormData.recipient_name)) {
      errors.recipient_name = 'Enter a valid name (2-50 characters)';
    }

    // Recipient Phone
    if (!editFormData.recipient_phone || (!phoneRegex.test(editFormData.recipient_phone) && !memberIdRegex.test(editFormData.recipient_phone))) {
      errors.recipient_phone = 'Enter a valid phone number (10+ digits) or Member ID (e.g., K1234)';
    }

    // Dropped By
    if (!editFormData.dropped_by || !nameRegex.test(editFormData.dropped_by)) {
      errors.dropped_by = 'Enter a valid name (2-50 characters)';
    }

    // Dropper Phone
    if (!editFormData.dropper_phone || (!phoneRegex.test(editFormData.dropper_phone) && !memberIdRegex.test(editFormData.dropper_phone))) {
      errors.dropper_phone = 'Enter a valid phone number (10+ digits) or Member ID (e.g., K1234)';
    }

    setEditFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDropClick = async () => {
  // Validate all drop package fields
  const isValid = [
    validateField('description', newDroppedPackage.description),
    validateField('recipientName', newDroppedPackage.recipientName),
    validateField('recipientPhone', newDroppedPackage.recipientPhone),
    validateField('droppedBy', newDroppedPackage.droppedBy),
    validateField('dropperPhone', newDroppedPackage.dropperPhone)
  ].every(Boolean);

  if (!isValid) {
    setLocalError('Please fix the errors in the form');
    return;
  }

  // Prepare data for API - determine if phone or member ID
  const packageData = {
    type: newDroppedPackage.type,
    description: newDroppedPackage.description,
    recipient_name: newDroppedPackage.recipientName,
    dropped_by: newDroppedPackage.droppedBy
  };

  // Check recipient phone/ID
  if (phoneRegex.test(newDroppedPackage.recipientPhone)) {
    packageData.recipient_phone = newDroppedPackage.recipientPhone;
  } else {
    packageData.recipient_id = newDroppedPackage.recipientPhone;
  }

  // Check dropper phone/ID
  if (phoneRegex.test(newDroppedPackage.dropperPhone)) {
    packageData.dropper_phone = newDroppedPackage.dropperPhone;
  } else {
    packageData.dropper_id = newDroppedPackage.dropperPhone;
  }

  try {
    setIsLoading(true);
    setLocalError(null);

    const response = await handleDropPackage(packageData);

    // ✅ check response before success
    if (!response || response.error) {
      throw new Error(response?.error || 'Failed to drop package');
    }

    addToDescriptionCache(newDroppedPackage.description);
   showSuccess('Package Dropped', 'Package dropped successfully!');
   setShowDropModal(false);
    setNewDroppedPackage({
      type: 'package',
      description: '',
      recipientName: '',
      recipientPhone: '',
      droppedBy: '',
      dropperPhone: ''
    });
    setFieldErrors({});
  } catch (err) {
    setLocalError(err.message || 'Error dropping package');
  } finally {
    setIsLoading(false);
  }
};


  const handlePickClick = async () => {
    // Check if at least one field has content
    const hasContent = pickedBy.memberId.trim() || pickedBy.name.trim() || pickedBy.phone.trim();

    if (!hasContent) {
      setLocalError('Please provide at least one piece of identification (Member ID, Name, or Phone)');
      return;
    }

    // Validate format of provided fields (optional validation)
    const validations = [];
    if (pickedBy.memberId.trim()) {
      validations.push(validateField('memberId', pickedBy.memberId));
    }
    if (pickedBy.name.trim()) {
      validations.push(validateField('name', pickedBy.name));
    }
    if (pickedBy.phone.trim()) {
      validations.push(validateField('phone', pickedBy.phone));
    }

    // Check if all provided fields are valid
    const isValid = validations.every(Boolean);

    if (!isValid) {
      setLocalError('Please fix the errors in the form');
      return;
    }

    try {
      setIsLoading(true);
      setLocalError(null);
      await handlePick();
      setShowDetailsModal(false);
      setPickedBy({ memberId: '', name: '', phone: '' });
      setShowPickForm(false);
      setFieldErrors({});
    } catch (err) {
      setLocalError(err.message || 'Error picking up package');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReprintClick = async () => {
    try {
      setIsLoading(true);
      setLocalError(null);
      const response = await PackageService.reprintPackage(selectedPackage.id);

      // Handle enhanced response with edit information
      let successMessage = 'Package receipt reprinted successfully!';
      if (response.attempts_used && response.max_attempts) {
        successMessage += ` (Attempt ${response.attempts_used}/${response.max_attempts})`;
      }

      if (response.recent_edit) {
        successMessage += `\nRecent edit: ${response.recent_edit}`;
      }

      showSuccess('Receipt Reprinting', successMessage);
    } catch (err) {
      showError('Reprint Failed', err.message || 'Error reprinting receipt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfPick = async () => {
    // Show SweetAlert input dialog for optional comment
    const result = await Swal.fire({
      title: 'Self Pickup Verification',
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <p><strong>Package:</strong> ${selectedPackage.code}</p>
          <p><strong>Recipient:</strong> ${selectedPackage.recipient_name}</p>
          <p><strong>Description:</strong> ${selectedPackage.description}</p>
        </div>
        <p style="margin-bottom: 10px;">Please verify you are the intended recipient and add an optional comment:</p>
      `,
      input: 'textarea',
      inputPlaceholder: 'Optional comment (e.g., "Picked up by John - ID verified")',
      inputAttributes: {
        'aria-label': 'Optional pickup comment'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirm Self Pickup',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745',
      inputValidator: (value) => {
        // Optional validation - comment can be empty
        return null;
      }
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        setLocalError(null);

        // Prepare self-pick data
        const selfPickData = {
          package_id: selectedPackage.id,
          picked_by_name: selectedPackage.recipient_name,
          picked_by_phone: selectedPackage.recipient_phone,
          comment: result.value || 'Self pickup - recipient verified'
        };

        // Call the pickup service
        await PackageService.selfPickupPackage(selfPickData);

        // Show success message
        showSuccess(
          'Self Pickup Successful',
          `Package ${selectedPackage.code} has been successfully picked up by ${selectedPackage.recipient_name}`
        );

        // Close modal and refresh data
        setShowDetailsModal(false);
        if (refreshData) {
          await refreshData();
        }

      } catch (err) {
        showError(
          'Self Pickup Failed',
          err.message || 'Failed to complete self pickup. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetPickupProcess = () => {
    setShowPickForm(false);
    setPickedBy({ memberId: '', name: '', phone: '' });
    setLocalError(null);
    setFieldErrors({});
  };



  const handleEditPackage = () => {
    // Initialize edit form with current package data
    setEditFormData({
      type: (selectedPackage.package_type || selectedPackage.type || 'package').toLowerCase(),
      description: selectedPackage.description || '',
      recipient_name: selectedPackage.recipient_name || '',
      recipient_phone: selectedPackage.recipient_phone || '',
      dropped_by: selectedPackage.dropped_by || '',
      dropper_phone: selectedPackage.dropper_phone || ''
    });
    setEditFieldErrors({});
    setShowEditForm(true);
  };

  const handleSaveEdit = async () => {
    if (!validateEditForm()) {
      setLocalError('Please fix the errors in the form');
      return;
    }

    // Prepare data for API - determine if phone or member ID
    const updateData = {
      type: editFormData.type,
      description: editFormData.description,
      recipient_name: editFormData.recipient_name,
      dropped_by: editFormData.dropped_by
    };

    // Check recipient phone/ID
    if (phoneRegex.test(editFormData.recipient_phone)) {
      updateData.recipient_phone = editFormData.recipient_phone;
    } else {
      updateData.recipient_id = editFormData.recipient_phone;
    }

    // Check dropper phone/ID
    if (phoneRegex.test(editFormData.dropper_phone)) {
      updateData.dropper_phone = editFormData.dropper_phone;
    } else {
      updateData.dropper_id = editFormData.dropper_phone;
    }

    try {
      setIsLoading(true);
      setLocalError(null);
      await PackageService.updatePackage(selectedPackage.id, updateData);

      // Update the selectedPackage with new data for immediate UI update
      const updatedPackage = {
        ...selectedPackage,
        package_type: editFormData.type,
        type: editFormData.type,
        description: editFormData.description,
        recipient_name: editFormData.recipient_name,
        recipient_phone: editFormData.recipient_phone,
        dropped_by: editFormData.dropped_by,
        dropper_phone: editFormData.dropper_phone,
        last_updated: new Date().toISOString()
      };

      // Update the selected package state to show changes immediately
      if (typeof setSelectedPackage === 'function') {
        setSelectedPackage(updatedPackage);
      }

      showSuccess('Package Updated', 'Package updated successfully!');
      setShowEditForm(false);
      setEditFormData({});
      setEditFieldErrors({});

      // Refresh the package data to show updated information in table
      if (refreshData) {
        await refreshData();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        if (setSuccess) setSuccess(null);
      }, 3000);
    } catch (err) {
      setLocalError(err.message || 'Error updating package');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e, fieldName, formType) => {
  const rawValue = e.target.value;
  const value = fieldName === 'description' ? rawValue : rawValue.toUpperCase();

  if (formType === 'drop') {
    setNewDroppedPackage({ ...newDroppedPackage, [fieldName]: value });
  } else if (formType === 'pick') {
    setPickedBy({ ...pickedBy, [fieldName]: value });
  }

  validateField(fieldName, value);
};



  return (
    <>
      {/* Drop Package Modal */}
      {showDropModal && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3>Drop New Package</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowDropModal(false);
                  setLocalError(null);
                  setFieldErrors({});
                }}
                disabled={isLoading}
              >
                &times;
              </button>
            </div>
            
            {isLoading && <div className="loading-bar"></div>}
            
            {localError && (
              <div className="modal-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{localError}</span>
                <button 
                  className="error-close"
                  onClick={() => setLocalError(null)}
                >
                  &times;
                </button>
              </div>
            )}

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Package Type</label>
                  <select
                    value={newDroppedPackage.type}
                    onChange={(e) => setNewDroppedPackage({ ...newDroppedPackage, type: e.target.value.toLowerCase() })}
                    disabled={isLoading}
                  >
                    <option value="package">Package</option>
                    <option value="document">Document</option>
                    <option value="keys">Keys</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <div className="description-input-container">
                    <input
                      type="text"
                      placeholder="e.g., Red box, A4 envelope"
                      value={newDroppedPackage.description}
                      onChange={(e) => {
                        handleInputChange(e, 'description', 'drop');
                        setShowDescriptionDropdown(true);
                      }}
                      onFocus={() => setShowDescriptionDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDescriptionDropdown(false), 200)}
                      disabled={isLoading}
                      className={fieldErrors.description ? 'error' : ''}
                    />
                    {showDescriptionDropdown && cachedDescriptions.length > 0 && (
                      <div className="description-dropdown">
                        {cachedDescriptions.map((desc, index) => (
                          <div 
                            key={index}
                            className="dropdown-item"
                            onClick={() => {
                              setNewDroppedPackage({...newDroppedPackage, description: desc});
                              setShowDescriptionDropdown(false);
                            }}
                          >
                            {desc}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {fieldErrors.description && (
                    <span className="field-error">{fieldErrors.description}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Recipient Name</label>
                  <input
                    type="text"
                    placeholder="Recipient's full name"
                    value={newDroppedPackage.recipientName}
                    onChange={(e) => handleInputChange(e, 'recipientName', 'drop')}
                    disabled={isLoading}
                    className={fieldErrors.recipientName ? 'error' : ''}
                  />
                  {fieldErrors.recipientName && (
                    <span className="field-error">{fieldErrors.recipientName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Recipient Phone/Member NO</label>
                  <input
                    type="text"
                    placeholder="e.g., 0712345678 or K1234"
                    value={newDroppedPackage.recipientPhone}
                    onChange={(e) => handleInputChange(e, 'recipientPhone', 'drop')}
                    disabled={isLoading}
                    className={fieldErrors.recipientPhone ? 'error' : ''}
                  />
                  {fieldErrors.recipientPhone && (
                    <span className="field-error">{fieldErrors.recipientPhone}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    placeholder="Who is dropping this?"
                    value={newDroppedPackage.droppedBy}
                    onChange={(e) => handleInputChange(e, 'droppedBy', 'drop')}
                    disabled={isLoading}
                    className={fieldErrors.droppedBy ? 'error' : ''}
                  />
                  {fieldErrors.droppedBy && (
                    <span className="field-error">{fieldErrors.droppedBy}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Your Phone/Member NO</label>
                  <input
                    type="text"
                    placeholder="e.g., 0712345678 or K1234"
                    value={newDroppedPackage.dropperPhone}
                    onChange={(e) => handleInputChange(e, 'dropperPhone', 'drop')}
                    disabled={isLoading}
                    className={fieldErrors.dropperPhone ? 'error' : ''}
                  />
                  {fieldErrors.dropperPhone && (
                    <span className="field-error">{fieldErrors.dropperPhone}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowDropModal(false);
                  setLocalError(null);
                  setFieldErrors({});
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleDropClick}
                disabled={isLoading || Object.keys(fieldErrors).length > 0}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : 'Submit Package'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Details Modal */}
      {showDetailsModal && selectedPackage && (
        <div className="modal-overlay">
          <div className={`modal-content ${showPickForm ? 'small-modal' : 'medium-modal'}`}>
            <div className="modal-header">
              <h3>{showPickForm ? 'Verify Pickup' : 'Package Details'}</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowDetailsModal(false);
                  resetPickupProcess();
                }}
                disabled={isLoading}
              >
                &times;
              </button>
            </div>
            
            {isLoading && <div className="loading-bar"></div>}
            
            {localError && (
              <div className="modal-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{localError}</span>
                <button 
                  className="error-close"
                  onClick={() => setLocalError(null)}
                >
                  &times;
                </button>
              </div>
            )}

            {!showPickForm ? (
              <>
                <div className="modal-body" style={{ padding: '15px' }}>
                  <div className="details-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    fontSize: '0.85rem'
                  }}>
                    <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                      <span className="detail-label" style={{ fontWeight: '600' }}>Code:</span>
                      <span className="detail-value code">{selectedPackage.code}</span>
                    </div>
                    <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                      <span className="detail-label" style={{ fontWeight: '600' }}>Type:</span>
                      <span className="detail-value">{selectedPackage.package_type || selectedPackage.type}</span>
                    </div>

                    <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                      <span className="detail-label" style={{ fontWeight: '600' }}>Shelf:</span>
                      <span className="detail-value shelf-number">{selectedPackage.shelf}</span>
                    </div>
                    <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                      <span className="detail-label" style={{ fontWeight: '600' }}>Status:</span>
                      <span className={`detail-value status-${selectedPackage.status}`}>
                        {selectedPackage.status}
                      </span>
                    </div>

                    <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                      <span className="detail-label" style={{ fontWeight: '600' }}>Recipient:</span>
                      <span className="detail-value">{selectedPackage.recipient_name}</span>
                    </div>
                    <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                      <span className="detail-label" style={{ fontWeight: '600' }}>Recipient No:</span>
                      <span className="detail-value">{selectedPackage.recipient_phone}</span>
                    </div>

                    <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                      <span className="detail-label" style={{ fontWeight: '600' }}>Dropped By:</span>
                      <span className="detail-value">{selectedPackage.dropped_by}</span>
                    </div>
                    <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                      <span className="detail-label" style={{ fontWeight: '600' }}>Dropper Phone:</span>
                      <span className="detail-value">{selectedPackage.dropper_phone}</span>
                    </div>

                    {selectedPackage.picked_by && (
                      <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                        <span className="detail-label" style={{ fontWeight: '600' }}>Picked By:</span>
                        <span className="detail-value">{selectedPackage.picked_by}</span>
                      </div>
                    )}
                    {selectedPackage.picker_phone && (
                      <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                        <span className="detail-label" style={{ fontWeight: '600' }}>Picker Phone:</span>
                        <span className="detail-value">{selectedPackage.picker_phone}</span>
                      </div>
                    )}
                    {selectedPackage.picker_id && (
                      <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                        <span className="detail-label" style={{ fontWeight: '600' }}>Picker ID:</span>
                        <span className="detail-value">{selectedPackage.picker_id}</span>
                      </div>
                    )}

                    <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                      <span className="detail-label" style={{ fontWeight: '600' }}>Date Dropped:</span>
                      <span className="detail-value">{new Date(selectedPackage.created_at).toLocaleString()}</span>
                    </div>
                    {selectedPackage.picked_at && (
                      <div className="detail-item" style={{ display: 'flex', gap: '5px' }}>
                        <span className="detail-label" style={{ fontWeight: '600' }}>Date Picked:</span>
                        <span className="detail-value">{new Date(selectedPackage.picked_at).toLocaleString()}</span>
                      </div>
                    )}

                    <div className="detail-item" style={{ gridColumn: '1 / span 2', display: 'flex', gap: '5px' }}>
                      <span className="detail-label" style={{ fontWeight: '600' }}>Description:</span>
                      <span className="detail-value">{selectedPackage.description}</span>
                    </div>
                  </div>
                </div>

                {selectedPackage.status === 'pending' && (
                   <div className="modal-footer">
                     <button
                       className="btn btn-success"
                       onClick={handleSelfPick}
                       disabled={isLoading}
                       style={{ marginRight: '10px' }}
                     >
                       Self Pick
                     </button>
                     <button
                       className="btn btn-primary"
                       onClick={() => setShowPickForm(true)}
                       disabled={isLoading}
                     >
                       Initiate Pickup
                     </button>
                   </div>
                 )}

                {/* Action buttons for all packages */}
                {selectedPackage.status === 'pending' && (
                <div className="modal-footer">
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleEditPackage}
                    disabled={isLoading}
                  >
                    Edit Package
                  </button>
                  {/* <button
                    className="btn btn-outline-info"
                    onClick={handleViewHistory}
                    disabled={isLoading}
                  >
                    View History
                  </button> */}
                  <button
                    className="btn btn-secondary"
                    onClick={handleReprintClick}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Reprinting...' : 'Reprint Receipt'}
                  </button>
                </div>
                )}
              </>
            ) : (
              <div className="modal-body">
                <div className="pickup-instructions">
                  <p>Please provide your details to verify this pickup:</p>
                  <p style={{fontSize: '0.85rem', color: '#6c757d', marginTop: '5px'}}>
                    At least one field is required. All fields are optional but must be valid if provided.
                  </p>
                </div>

                <div className="form-group">
                  <label>Member ID/ID Number <span style={{fontSize: '0.8rem', color: '#6c757d'}}>(Optional)</span></label>
                  <input
                    type="text"
                    placeholder="Your identification number"
                    value={pickedBy.memberId}
                    onChange={(e) => handleInputChange(e, 'memberId', 'pick')}
                    disabled={isLoading}
                    className={fieldErrors.memberId ? 'error' : ''}
                  />
                  {fieldErrors.memberId && (
                    <span className="field-error">{fieldErrors.memberId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Full Name <span style={{fontSize: '0.8rem', color: '#6c757d'}}>(Optional)</span></label>
                  <input
                    type="text"
                    placeholder="Your full name as per ID"
                    value={pickedBy.name}
                    onChange={(e) => handleInputChange(e, 'name', 'pick')}
                    disabled={isLoading}
                    className={fieldErrors.name ? 'error' : ''}
                  />
                  {fieldErrors.name && (
                    <span className="field-error">{fieldErrors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone Number/Member No <span style={{fontSize: '0.8rem', color: '#6c757d'}}>(Optional)</span></label>
                  <input
                    type="tel"
                    placeholder="Your active phone number or Member ID"
                    value={pickedBy.phone}
                    onChange={(e) => handleInputChange(e, 'phone', 'pick')}
                    disabled={isLoading}
                    className={fieldErrors.phone ? 'error' : ''}
                  />
                  {fieldErrors.phone && (
                    <span className="field-error">{fieldErrors.phone}</span>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={resetPickupProcess}
                    disabled={isLoading}
                  >
                    Back to Details
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handlePickClick}
                    disabled={isLoading || (!pickedBy.memberId.trim() && !pickedBy.name.trim() && !pickedBy.phone.trim()) || Object.keys(fieldErrors).length > 0}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        Verifying...
                      </>
                    ) : 'Complete Pickup'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Package History Modal */}
      {showHistory && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h3>Package History - {selectedPackage.code}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowHistory(false);
                  setPackageHistory([]);
                }}
                disabled={isLoading}
              >
                &times;
              </button>
            </div>

            {isLoading && <div className="loading-bar"></div>}

            {localError && (
              <div className="modal-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{localError}</span>
                <button
                  className="error-close"
                  onClick={() => setLocalError(null)}
                >
                  &times;
                </button>
              </div>
            )}

            <div className="modal-body">
              {packageHistory.length > 0 ? (
                <div className="history-timeline" style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '10px'
                }}>
                  {packageHistory.map((entry, index) => (
                    <div key={index} className="history-entry" style={{
                      borderLeft: '3px solid #007bff',
                      padding: '10px 15px',
                      marginBottom: '15px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      position: 'relative'
                    }}>
                      <div className="history-timestamp" style={{
                        fontSize: '0.85rem',
                        color: '#6c757d',
                        marginBottom: '5px'
                      }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                      <div className="history-action" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '5px'
                      }}>
                        <span className="history-user" style={{
                          fontWeight: '600',
                          color: '#007bff'
                        }}>{entry.user}</span>
                        <span className="history-description">{entry.action}</span>
                      </div>
                      {entry.details && (
                        <div className="history-details" style={{
                          fontSize: '0.9rem',
                          color: '#495057',
                          backgroundColor: '#e9ecef',
                          padding: '8px',
                          borderRadius: '3px',
                          marginTop: '5px'
                        }}>
                          {entry.details}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-history" style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6c757d'
                }}>
                  <p>No history available for this package.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowHistory(false);
                  setPackageHistory([]);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal-content medium-modal">
            <div className="modal-header">
              <h3>Edit Package - {selectedPackage.code}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowEditForm(false);
                  setEditFormData({});
                  setEditFieldErrors({});
                }}
                disabled={isLoading}
              >
                &times;
              </button>
            </div>

            {isLoading && <div className="loading-bar"></div>}

            {localError && (
              <div className="modal-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{localError}</span>
                <button
                  className="error-close"
                  onClick={() => setLocalError(null)}
                >
                  &times;
                </button>
              </div>
            )}

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Package Type</label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value.toLowerCase() })}
                    disabled={isLoading}
                  >
                    <option value="package">Package</option>
                    <option value="document">Document</option>
                    <option value="keys">Keys</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    disabled={isLoading}
                    className={editFieldErrors.description ? 'error' : ''}
                  />
                  {editFieldErrors.description && (
                    <span className="field-error">{editFieldErrors.description}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Recipient Name</label>
                  <input
                    type="text"
                    value={editFormData.recipient_name}
                    onChange={(e) => setEditFormData({ ...editFormData, recipient_name: e.target.value })}
                    disabled={isLoading}
                    className={editFieldErrors.recipient_name ? 'error' : ''}
                  />
                  {editFieldErrors.recipient_name && (
                    <span className="field-error">{editFieldErrors.recipient_name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Recipient Phone/Member ID</label>
                  <input
                    type="tel"
                    value={editFormData.recipient_phone}
                    onChange={(e) => setEditFormData({ ...editFormData, recipient_phone: e.target.value })}
                    disabled={isLoading}
                    className={editFieldErrors.recipient_phone ? 'error' : ''}
                  />
                  {editFieldErrors.recipient_phone && (
                    <span className="field-error">{editFieldErrors.recipient_phone}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dropped By</label>
                  <input
                    type="text"
                    value={editFormData.dropped_by}
                    onChange={(e) => setEditFormData({ ...editFormData, dropped_by: e.target.value })}
                    disabled={isLoading}
                    className={editFieldErrors.dropped_by ? 'error' : ''}
                  />
                  {editFieldErrors.dropped_by && (
                    <span className="field-error">{editFieldErrors.dropped_by}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Dropper Phone/Member ID</label>
                  <input
                    type="tel"
                    value={editFormData.dropper_phone}
                    onChange={(e) => setEditFormData({ ...editFormData, dropper_phone: e.target.value })}
                    disabled={isLoading}
                    className={editFieldErrors.dropper_phone ? 'error' : ''}
                  />
                  {editFieldErrors.dropper_phone && (
                    <span className="field-error">{editFieldErrors.dropper_phone}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowEditForm(false);
                  setEditFormData({});
                  setEditFieldErrors({});
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveEdit}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PackageModals;
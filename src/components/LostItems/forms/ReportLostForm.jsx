import React, { useState } from 'react';
import { FiLink, FiAlertCircle, FiX } from 'react-icons/fi';
import { LostFoundService } from '../../../service/api/api';
import { showSuccess, showError } from '../../../utils/swalNotifications';
import '../../../assets/css/LostFoundForm.css';

export const ReportLostForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'card',
    card_last_four: '',
    email: '',
    item_name: '',
    description: '',
    place_lost: '',
    reporter_member_id: '',
    reporter_phone: '',
    owner_name: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (formData.type === 'card' && !/^[A-Z]\d{1,4}[A-Z]?$/i.test(formData.card_last_four)) {
      newErrors.card_last_four =
        'Card number must start with a letter followed by 1 to 4 digits and optional last letter (e.g., A1, b12, c123, d1234, A1A, B12B)';
    }
    if (formData.type === 'item' && !formData.item_name.trim()) {
      newErrors.item_name = 'Item name is required';
    }
    if (formData.type === 'item' && !formData.place_lost.trim()) {
      newErrors.place_lost = 'Location is required';
    }
    if (formData.type === 'item' && !formData.reporter_member_id.trim()) {
      newErrors.reporter_member_id = 'Member ID is required';
    }
    if (formData.type === 'item' && !/^\d{10,15}$/.test(formData.reporter_phone)) {
      newErrors.reporter_phone = 'Valid phone number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);
  try {
    let payload = {};

    if (formData.type === 'card') {
      payload = {
        type: 'card',
        card_last_four: formData.card_last_four,
        reporter_email: formData.email || null,
        status: 'pending'
      };
    } else {
      // For item type, map email to reporter_email as expected by backend
      const { email, ...restFormData } = formData;
      payload = {
        ...restFormData,
        reporter_email: email || null,
        status: 'pending'
      };
    }

    const createdItem = await LostFoundService.createLostItem(payload);

    // ✅ now only trigger parent refresh, no API in dashboard
    if (onSubmit) {
      onSubmit(createdItem);
    }

    showSuccess(
      'Lost Item Reported',
      `Successfully reported ${formData.type === 'card' ? 'card' : formData.item_name || 'item'}`
    );

    onClose();
  } catch (err) {
    console.error('Error creating lost item:', err);
    const errorMessage = err.response?.data?.message || 'Failed to submit form. Please try again later.';
    setErrors({ ...errors, form: errorMessage });
    showError(
      'Failed to Report Lost Item',
      errorMessage
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="lf-modal-overlay">
      <div className="lf-modal-container">
        <div className="lf-modal-header">
          <h3><FiLink /> Report Lost Item</h3>
          <button className="lf-modal-close-btn" onClick={onClose} disabled={isSubmitting}>
            <FiX />
          </button>
        </div>

        <div className="lf-modal-body">
          {errors.form && (
            <div className="lf-error-message">
              <FiAlertCircle className="lf-error-icon" />
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="lf-form-group">
              <label>Item Type</label>
              <select 
                className={`lf-form-control ${errors.type ? 'is-invalid' : ''}`} 
                value={formData.type} 
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="card">Card</option>
                <option value="item">Item</option>
              </select>
            </div>

            {formData.type === 'card' ? (
              <>
                <div className="lf-form-group">
                  <label>Card Number</label>
                  <input
                    className={`lf-form-control ${errors.card_last_four ? 'is-invalid' : ''}`}
                    type="text"
                    placeholder="A1, B12, C123, D1234, A1A, B12B"
                    maxLength="6"
                    value={formData.card_last_four}
                    onChange={(e) => {
                      const input = e.target.value.toUpperCase();
                      const valid = /^[A-Z]\d{0,4}[A-Z]?$/i.test(input);
                      if (valid || input === '') {
                        setFormData({ ...formData, card_last_four: input });
                      }
                    }}
                    required
                  />
                  {errors.card_last_four && (
                    <div className="lf-error-feedback">
                      <FiAlertCircle className="lf-error-icon" />{errors.card_last_four}
                    </div>
                  )}
                </div>

                <div className="lf-form-group">
                  <label>Email (Optional)</label>
                  <input
                    className="lf-form-control"
                    type="email"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="lf-form-group">
                  <label>Item Name</label>
                  <input
                    className={`lf-form-control ${errors.item_name ? 'is-invalid' : ''}`}
                    type="text"
                    placeholder="e.g., AirPods"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    required
                  />
                  {errors.item_name && <div className="lf-error-feedback"><FiAlertCircle className="lf-error-icon" />{errors.item_name}</div>}
                </div>
                <div className="lf-form-group">
                  <label>Description</label>
                  <textarea
                    className={`lf-form-control ${errors.description ? 'is-invalid' : ''}`}
                    placeholder="Brief description"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                  {errors.description && <div className="lf-error-feedback"><FiAlertCircle className="lf-error-icon" />{errors.description}</div>}
                </div>


                <div className="lf-form-group">
                  <label>Owner Name</label>
                  <input
                    className="lf-form-control"
                    type="text"
                    placeholder="If known"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  />
                </div>

                <div className="lf-form-group">
                  <label>Place Lost</label>
                  <input
                    className={`lf-form-control ${errors.place_lost ? 'is-invalid' : ''}`}
                    type="text"
                    placeholder="Where was it lost?"
                    value={formData.place_lost}
                    onChange={(e) => setFormData({ ...formData, place_lost: e.target.value })}
                    required
                  />
                  {errors.place_lost && <div className="lf-error-feedback"><FiAlertCircle className="lf-error-icon" />{errors.place_lost}</div>}
                </div>

                <div className="lf-form-group">
                  <label>Member Number</label>
                  <input
                    className={`lf-form-control ${errors.reporter_member_id ? 'is-invalid' : ''}`}
                    type="text"
                    placeholder="Your ID"
                    value={formData.reporter_member_id}
                    onChange={(e) => setFormData({ ...formData, reporter_member_id: e.target.value })}
                    required
                  />
                  {errors.reporter_member_id && <div className="lf-error-feedback"><FiAlertCircle className="lf-error-icon" />{errors.reporter_member_id}</div>}
                </div>

                <div className="lf-form-group">
                  <label>Phone Number</label>
                  <input
                    className={`lf-form-control ${errors.reporter_phone ? 'is-invalid' : ''}`}
                    type="tel"
                    placeholder="10-15 digits"
                    value={formData.reporter_phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, reporter_phone: value });
                    }}
                    required
                  />
                  {errors.reporter_phone && <div className="lf-error-feedback"><FiAlertCircle className="lf-error-icon" />{errors.reporter_phone}</div>}
                </div>

                <div className="lf-form-group">
                  <label>Email (Optional)</label>
                  <input
                    className="lf-form-control"
                    type="email"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="lf-modal-footer">
              <button type="button" className="lf-btn lf-btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="lf-btn lf-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


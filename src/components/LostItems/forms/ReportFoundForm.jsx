import React, { useRef, useState, useEffect } from 'react';
import { FiCamera, FiUpload, FiX, FiAlertCircle, FiLink } from 'react-icons/fi';
import { showSuccess, showError } from '../../../utils/swalNotifications';
import { compressImageFile, compressImageFromCanvas, getCompressionStats, needsCompression, getRecommendedSettings } from '../../../utils/imageCompression';

export const ReportFoundForm = ({ onClose, onSubmit }) => {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [formData, setFormData] = useState({
    type: 'card',
    card_last_four: '',
    reporter_email: '', 
    item_name: '',
    description: '',
    place_found: '', 
    finder_name: '',
    finder_phone: '',
    owner_name: '',
    // photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [compressionStats, setCompressionStats] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState('auto'); // auto, high, medium, low
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Get compression settings based on quality selection
  const getCompressionSettings = (file) => {
    if (compressionQuality === 'auto') {
      return getRecommendedSettings(file);
    }

    const qualityMap = {
      high: { quality: 0.9, maxWidth: 1600, maxHeight: 1600 },
      medium: { quality: 0.8, maxWidth: 1200, maxHeight: 1200 },
      low: { quality: 0.6, maxWidth: 800, maxHeight: 800 }
    };

    return qualityMap[compressionQuality] || qualityMap.medium;
  };

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      stopCamera();
    };
  }, [photoPreview]);

  const validateCardForm = () => {
    const newErrors = {};
    if (!/^[A-Z]\d{1,4}[A-Z]?$/i.test(formData.card_last_four)) {
      newErrors.card_last_four = 'Please enter a valid card number (e.g., A1, B12, C123, D1234, A1A, B12B)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateItemForm = () => {
    const newErrors = {};
    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Item name is required';
    }
    if (!formData.place_found.trim()) {
      newErrors.place_found = 'Location is required';
    }
    if (!formData.finder_name.trim()) {
      newErrors.finder_name = 'Your name is required';
    }
    if (!/^\d{10,15}$/.test(formData.finder_phone)) {
      newErrors.finder_phone = 'Valid phone number is required (10-15 digits)';
    }
    if (!formData.photo) {
      newErrors.photo = 'Please add a photo of the item';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setPhotoError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('File size must be less than 5MB');
        return;
      }

      setPhotoError(null);
      setIsCompressing(true);

      try {
        let processedFile = file;
        let stats = null;

        // Check if compression is needed
        if (needsCompression(file)) {
          console.log('🔧 Compressing image...');
          const compressionSettings = getCompressionSettings(file);
          processedFile = await compressImageFile(file, compressionSettings);
          stats = getCompressionStats(file, processedFile);
          console.log('✅ Compression complete:', stats);
        }

        setCompressionStats(stats);
        setPhotoPreview(URL.createObjectURL(processedFile));
        setFormData({ ...formData, photo: processedFile });
        setErrors({ ...errors, photo: null });

      } catch (error) {
        console.error('❌ Image compression failed:', error);
        setPhotoError('Failed to process image. Please try again.');
        // Fallback to original file
        setPhotoPreview(URL.createObjectURL(file));
        setFormData({ ...formData, photo: file });
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setPhotoError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      let errorMessage = 'Could not access camera';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera permissions.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      }
      setPhotoError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const takePhoto = async () => {
    if (videoRef.current) {
      setIsCompressing(true);

      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Create original file for stats comparison
        const originalBlob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', 0.95);
        });

        if (originalBlob) {
          const originalFile = new File([originalBlob], `photo_${Date.now()}_original.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          // Create image from canvas for compression
          const img = new Image();
          img.src = canvas.toDataURL('image/jpeg', 0.95);

          await new Promise((resolve) => {
            img.onload = async () => {
              console.log('📷 Compressing camera photo...');
              const compressionSettings = getCompressionSettings(originalFile);
              const compressedFile = await compressImageFromCanvas(
                img,
                `photo_${Date.now()}.jpg`,
                compressionSettings
              );

              const stats = getCompressionStats(originalFile, compressedFile);
              console.log('✅ Camera photo compression complete:', stats);

              setCompressionStats(stats);
              setPhotoPreview(URL.createObjectURL(compressedFile));
              setFormData({ ...formData, photo: compressedFile });
              resolve();
            };
          });
        }
      } catch (error) {
        console.error('❌ Camera photo compression failed:', error);
        // Fallback to simple canvas method
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            setPhotoPreview(URL.createObjectURL(blob));
            setFormData({ ...formData, photo: file });
            setCompressionStats(null);
          }
        }, 'image/jpeg', 0.8);
      } finally {
        setIsCompressing(false);
        stopCamera();
      }
    }
  };


  const handleCardSubmit = async (e) => {
    e.preventDefault();
    console.log('Card form submitted');
    if (!validateCardForm()) return;

    setIsSubmitting(true);

    try {
      const formPayload = new FormData();

      formPayload.append('type', 'card');
      formPayload.append('card_last_four', formData.card_last_four);
      if (formData.reporter_email) {
        formPayload.append('reporter_email', formData.reporter_email); // Changed to reporter_email
      }

      // Log all data being sent to backend
      console.log('Submitting card data:');
      console.log('- type:', 'card');
      console.log('- card_last_four:', formData.card_last_four);
      if (formData.reporter_email) {
        console.log('- reporter_email:', formData.reporter_email);
      }

      // Also log the FormData object contents
      console.log('FormData contents:');
      for (let [key, value] of formPayload.entries()) {
        console.log(`- ${key}:`, value);
      }

      onSubmit(formPayload);
      showSuccess(
        'Found Card Reported',
        `Successfully reported card ${formData.card_last_four}`
      );
      onClose();
    } catch (err) {
      console.error('Error submitting card form:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit form. Please try again.';
      setErrors({
        ...errors,
        form: errorMessage
      });
      showError(
        'Failed to Report Found Card',
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    console.log('Item form submitted');
    
    if (!validateItemForm()) {
      console.log('Item form validation failed:', errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formPayload = new FormData();
      
      // Required fields matching your Postman example
      formPayload.append('type', 'item');
      formPayload.append('item_name', formData.item_name);
      formPayload.append('description', formData.description);
      formPayload.append('place_found', formData.place_found); // Changed to place_found
      formPayload.append('finder_name', formData.finder_name);
      formPayload.append('finder_phone', formData.finder_phone);
      
      // Optional fields
      if (formData.owner_name) {
        formPayload.append('owner_name', formData.owner_name);
      }
      if (formData.reporter_email) {
        formPayload.append('reporter_email', formData.reporter_email); // Changed to reporter_email
      }
      
      // Append the photo file
      if (formData.photo) {
        formPayload.append('photo', formData.photo);
      }
      
      // Log all data being sent to backend
      console.log('Submitting item data:');
      console.log('- type:', 'item');
      console.log('- item_name:', formData.item_name);
      console.log('- description:', formData.description);
      console.log('- place_found:', formData.place_found);
      console.log('- finder_name:', formData.finder_name);
      console.log('- finder_phone:', formData.finder_phone);
      
      if (formData.owner_name) {
        console.log('- owner_name:', formData.owner_name);
      }
      if (formData.reporter_email) {
        console.log('- reporter_email:', formData.reporter_email);
      }
      if (formData.photo) {
        console.log('- photo:', formData.photo.name, formData.photo.size, formData.photo.type);
      }
      
      // Also log the FormData object contents
      console.log('FormData contents:');
      for (let [key, value] of formPayload.entries()) {
        if (value instanceof File) {
          console.log(`- ${key}:`, `File: ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`- ${key}:`, value);
        }
      }
      
      onSubmit(formPayload);
      showSuccess(
        'Found Item Reported',
        `Successfully reported ${formData.item_name}`
      );
      onClose();
    } catch (err) {
      console.error('Error submitting item form:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit form. Please try again.';
      setErrors({
        ...errors,
        form: errorMessage
      });
      showError(
        'Failed to Report Found Item',
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
          <h3><FiLink /> Report Found Item</h3>
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

          <div className="lf-form-group">
            <label>Item Type</label>
            <select 
              className={`lf-form-control ${errors.type ? 'is-invalid' : ''}`} 
              value={formData.type} 
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  type: e.target.value, 
                  photo: null,
                  card_last_four: '',
                  item_name: ''
                });
                setPhotoPreview(null);
                setErrors({});
              }}
            >
              <option value="card">Card</option>
              <option value="item">Item</option>
            </select>
          </div>

          {formData.type === 'card' ? (
            <form onSubmit={handleCardSubmit} noValidate>
              {/* Card form fields */}
              <div className="lf-form-group">
                <label>Card Number</label>
                <input
                  className={`lf-form-control ${errors.card_last_four ? 'is-invalid' : ''}`}
                  type="text"
                  placeholder="e.g., A1, B12, C123, D1234, A1A, B12B"
                  maxLength="6"
                  value={formData.card_last_four}
                  onChange={(e) => {
                    const input = e.target.value.toUpperCase();
                    const valid = /^[A-Z]\d{0,4}[A-Z]?$/.test(input);
                    if (valid || input === '') {
                      setFormData({ ...formData, card_last_four: input });
                    }
                  }}
                  required
                />
                {errors.card_last_four && (
                  <div className="lf-error-feedback">
                    <FiAlertCircle className="lf-error-icon" />
                    {errors.card_last_four}
                  </div>
                )}
                <small className="form-text text-muted">
                  Enter card number (e.g., A1, B12, C123, D1234, A1A, B12B). The full card identifier will be stored securely.
                </small>
              </div>

              <div className="lf-form-group">
                <label>Email (Optional)</label>
                <input
                  className="lf-form-control"
                  type="email"
                  placeholder="example@mail.com"
                  value={formData.reporter_email} // Changed to reporter_email
                  onChange={(e) => setFormData({ ...formData, reporter_email: e.target.value })}
                />
              </div>

              <div className="lf-modal-footer">
                <button 
                  type="button" 
                  className="lf-btn lf-btn-secondary" 
                  onClick={onClose} 
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="lf-btn lf-btn-primary" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleItemSubmit} noValidate encType="multipart/form-data">
              {/* Item form fields including photo */}
              <div className="lf-form-group">
                <label>Item Name *</label>
                <input
                  className={`lf-form-control ${errors.item_name ? 'is-invalid' : ''}`}
                  type="text"
                  placeholder="e.g., AirPods, Wallet"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  required
                />
                {errors.item_name && (
                  <div className="lf-error-feedback">
                    <FiAlertCircle className="lf-error-icon" />
                    {errors.item_name}
                  </div>
                )}
              </div>

              <div className="lf-form-group">
                <label>Photo *</label>
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="lf-photo-preview"
                    />
                    <div className="lf-photo-actions">
                      <button
                        type="button"
                        className="lf-btn lf-btn-secondary"
                        onClick={() => {
                          setFormData({ ...formData, photo: null });
                          setPhotoPreview(null);
                          setCompressionStats(null);
                        }}
                      >
                        <FiX /> Retake
                      </button>
                    </div>

                    {/* Compression Stats Display */}
                    {compressionStats && (
                      <div className="lf-compression-stats">
                        <div className="lf-compression-header">
                          <FiUpload size={14} />
                          <span>Image Optimized</span>
                        </div>
                        <div className="lf-compression-details">
                          <div className="lf-compression-row">
                            <span>Original:</span>
                            <span>{compressionStats.originalSize}</span>
                          </div>
                          <div className="lf-compression-row">
                            <span>Compressed:</span>
                            <span>{compressionStats.compressedSize}</span>
                          </div>
                          <div className="lf-compression-row lf-compression-savings">
                            <span>Saved:</span>
                            <span>{compressionStats.sizeReduction} ({compressionStats.compressionRatio})</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Compression Loading Indicator */}
                    {isCompressing && (
                      <div className="lf-compression-loading">
                        <div className="lf-spinner"></div>
                        <span>Optimizing image...</span>
                      </div>
                    )}
                  </>
                ) : cameraActive ? (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="lf-camera-preview"
                    />
                    <div className="lf-camera-controls">
                      <button 
                        type="button" 
                        className="lf-btn lf-btn-secondary"
                        onClick={stopCamera}
                      >
                        <FiX /> Cancel
                      </button>
                      <button 
                        type="button" 
                        className="lf-btn lf-btn-primary"
                        onClick={takePhoto}
                      >
                        <FiCamera /> Take Photo
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="lf-photo-placeholder">
                      <FiCamera size={32} />
                    </div>
                    <div className="lf-photo-options">
                      <button 
                        type="button" 
                        className="lf-btn lf-btn-secondary"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <FiUpload /> Upload
                      </button>
                      <button 
                        type="button" 
                        className="lf-btn lf-btn-primary"
                        onClick={startCamera}
                      >
                        <FiCamera /> Camera
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      capture="environment"
                      className="lf-file-input"
                    />
                  </>
                )}
                {(errors.photo || photoError) && (
                  <div className="lf-error-feedback">
                    <FiAlertCircle className="lf-error-icon" />
                    {errors.photo || photoError}
                  </div>
                )}

                {/* Advanced Settings Toggle */}
                <div className="lf-advanced-settings-toggle">
                  <button
                    type="button"
                    className="lf-btn lf-btn-link"
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  >
                    {showAdvancedSettings ? 'Hide' : 'Show'} Advanced Settings
                  </button>
                </div>

                {/* Advanced Settings */}
                {showAdvancedSettings && (
                  <div className="lf-advanced-settings">
                    <div className="lf-form-group">
                      <label>Image Quality</label>
                      <select
                        className="lf-form-control"
                        value={compressionQuality}
                        onChange={(e) => setCompressionQuality(e.target.value)}
                      >
                        <option value="auto">Auto (Recommended)</option>
                        <option value="high">High Quality</option>
                        <option value="medium">Medium Quality</option>
                        <option value="low">Low Quality</option>
                      </select>
                      <small className="form-text text-muted">
                        Auto mode automatically chooses the best quality based on file size
                      </small>
                    </div>
                  </div>
                )}
              </div>

              {/* Other item form fields */}
              <div className="lf-form-group">
                <label>Description *</label>
                <textarea
                  className={`lf-form-control ${errors.description ? 'is-invalid' : ''}`}
                  placeholder="Describe the item (color, brand, distinguishing features)"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                {errors.description && (
                  <div className="lf-error-feedback">
                    <FiAlertCircle className="lf-error-icon" />
                    {errors.description}
                  </div>
                )}
              </div>

              <div className="lf-form-group">
                <label>Owner Name (if known)</label>
                <input 
                  className="lf-form-control" 
                  type="text" 
                  placeholder="Owner's name" 
                  value={formData.owner_name} 
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })} 
                />
              </div>

              <div className="lf-form-group">
                <label>Place Found *</label>
                <input
                  className={`lf-form-control ${errors.place_found ? 'is-invalid' : ''}`}
                  type="text"
                  placeholder="Where was it found?"
                  value={formData.place_found}
                  onChange={(e) => setFormData({ ...formData, place_found: e.target.value })}
                  required
                />
                {errors.place_found && (
                  <div className="lf-error-feedback">
                    <FiAlertCircle className="lf-error-icon" />
                    {errors.place_found}
                  </div>
                )}
              </div>

              <div className="lf-form-group">
                <label>Your Name *</label>
                <input
                  className={`lf-form-control ${errors.finder_name ? 'is-invalid' : ''}`}
                  type="text"
                  placeholder="Your full name"
                  value={formData.finder_name}
                  onChange={(e) => setFormData({ ...formData, finder_name: e.target.value })}
                  required
                />
                {errors.finder_name && (
                  <div className="lf-error-feedback">
                    <FiAlertCircle className="lf-error-icon" />
                    {errors.finder_name}
                  </div>
                )}
              </div>

              <div className="lf-form-group">
                <label>Your Phone Number *</label>
                <input
                  className={`lf-form-control ${errors.finder_phone ? 'is-invalid' : ''}`}
                  type="tel"
                  placeholder="10-15 digits"
                  value={formData.finder_phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, finder_phone: value });
                  }}
                  required
                />
                {errors.finder_phone && (
                  <div className="lf-error-feedback">
                    <FiAlertCircle className="lf-error-icon" />
                    {errors.finder_phone}
                  </div>
                )}
              </div>

              <div className="lf-form-group">
                <label>Email (Optional)</label>
                <input
                  className="lf-form-control"
                  type="email"
                  placeholder="example@mail.com"
                  value={formData.reporter_email} // Changed to reporter_email
                  onChange={(e) => setFormData({ ...formData, reporter_email: e.target.value })}
                />
              </div>

              <div className="lf-modal-footer">
                <button 
                  type="button" 
                  className="lf-btn lf-btn-secondary" 
                  onClick={onClose} 
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="lf-btn lf-btn-primary" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
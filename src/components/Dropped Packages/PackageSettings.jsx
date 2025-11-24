import React, { useState, useEffect, useCallback } from 'react';
import { PackageService } from '../../service/api/api';

const PackageSettings = ({ onClose }) => {
  const [settings, setSettings] = useState({
    printer_ip: '192.168.10.173',
    printer_port: 9100,
    enable_qr_codes: true,
    default_package_type: 'package',
    auto_print_on_create: true,
    enable_reprint: true,
    max_reprint_attempts: 3,
    notification_email: '',
    enable_sms_notifications: false,
    sms_api_key: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching settings...');
      const data = await PackageService.getSettings();
      console.log('Settings loaded:', data);
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
      // If settings don't exist, keep default values
      if (err.response?.status === 404) {
        console.log('Settings not found, using defaults');
        setError(null); // Clear error for 404
        // Optionally create default settings
        try {
          console.log('Creating default settings...');
          await PackageService.createSettings(settings);
          console.log('Default settings created');
        } catch (createErr) {
          console.error('Error creating default settings:', createErr);
        }
      } else {
        setError('Failed to load settings');
      }
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      console.log('Saving settings:', settings);

      // Try to update first, if it fails with 404, create new settings
      try {
        const result = await PackageService.updateSettings(settings);
        console.log('Settings updated successfully:', result);
      } catch (updateError) {
        if (updateError.response?.status === 404) {
          console.log('Settings not found, creating new settings...');
          const result = await PackageService.createSettings(settings);
          console.log('Settings created successfully:', result);
        } else {
          throw updateError;
        }
      }

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      console.error('Error response:', err.response);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h3>Package System Settings</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>✓</span> {success}
            </div>
          )}

          <div className="settings-grid">
            {/* Printer Settings */}
            <div className="settings-section">
              <h4>Printer Configuration</h4>

              <div className="form-row">
                <div className="form-group">
                  <label>Printer IP Address</label>
                  <input
                    type="text"
                    value={settings.printer_ip}
                    onChange={(e) => handleInputChange('printer_ip', e.target.value)}
                    placeholder="192.168.10.173"
                  />
                </div>

                <div className="form-group">
                  <label>Printer Port</label>
                  <input
                    type="number"
                    value={settings.printer_port}
                    onChange={(e) => handleInputChange('printer_port', parseInt(e.target.value))}
                    placeholder="9100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.enable_qr_codes}
                    onChange={(e) => handleInputChange('enable_qr_codes', e.target.checked)}
                  />
                  Enable QR Codes on receipts
                </label>
              </div>
            </div>

            {/* Package Settings */}
            <div className="settings-section">
              <h4>Package Settings</h4>

              <div className="form-group">
                <label>Default Package Type</label>
                <select
                  value={settings.default_package_type}
                  onChange={(e) => handleInputChange('default_package_type', e.target.value)}
                >
                  <option value="package">Package</option>
                  <option value="document">Document</option>
                  <option value="keys">Keys</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.auto_print_on_create}
                    onChange={(e) => handleInputChange('auto_print_on_create', e.target.checked)}
                  />
                  Auto-print receipts when packages are created
                </label>
              </div>
            </div>

            {/* Reprint Settings */}
            <div className="settings-section">
              <h4>Reprint Settings</h4>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.enable_reprint}
                    onChange={(e) => handleInputChange('enable_reprint', e.target.checked)}
                  />
                  Enable reprint functionality
                </label>
              </div>

              <div className="form-group">
                <label>Maximum Reprint Attempts</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.max_reprint_attempts}
                  onChange={(e) => handleInputChange('max_reprint_attempts', parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Notification Settings */}
            <div className="settings-section">
              <h4>Notification Settings</h4>

              <div className="form-group">
                <label>Notification Email</label>
                <input
                  type="email"
                  value={settings.notification_email || ''}
                  onChange={(e) => handleInputChange('notification_email', e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.enable_sms_notifications}
                    onChange={(e) => handleInputChange('enable_sms_notifications', e.target.checked)}
                  />
                  Enable SMS notifications
                </label>
              </div>

              {settings.enable_sms_notifications && (
                <div className="form-group">
                  <label>SMS API Key</label>
                  <input
                    type="password"
                    value={settings.sms_api_key || ''}
                    onChange={(e) => handleInputChange('sms_api_key', e.target.value)}
                    placeholder="Enter SMS API key"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageSettings;
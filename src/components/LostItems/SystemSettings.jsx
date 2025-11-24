import React, { useState, useEffect } from 'react';
import { FiSettings, FiSave, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { LostFoundService } from '../../service/api/api';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await LostFoundService.getSettings();
      console.log('Settings response:', response);

      // Handle different response formats
      let settingsData = [];
      if (Array.isArray(response)) {
        settingsData = response;
      } else if (response && typeof response === 'object') {
        // Check if it's paginated response
        if (response.results) {
          settingsData = response.results;
        } else if (response.data) {
          settingsData = Array.isArray(response.data) ? response.data : [response.data];
        } else {
          // Direct object with settings
          settingsData = Object.keys(response).map(key => ({
            key,
            value: response[key],
            description: `Setting for ${key}`,
            updated_at: new Date().toISOString()
          }));
        }
      }

      console.log('Processed settings data:', settingsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.key === key ? { ...setting, value } : setting
      )
    );
  };

  const handleSaveSetting = async (setting) => {
    try {
      setSaving(true);
      await LostFoundService.setSetting({
        key: setting.key,
        value: setting.value,
        description: setting.description
      });
      setMessage('Setting saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving setting:', error);
      setMessage('Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      for (const setting of settings) {
        await LostFoundService.setSetting({
          key: setting.key,
          value: setting.value,
          description: setting.description
        });
      }
      setMessage('All settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save some settings');
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (setting) => {
    const { key, value } = setting;

    // Boolean settings
    if (['auto_print_lost_receipt', 'auto_print_found_receipt', 'email_notifications_enabled'].includes(key)) {
      return (
        <select
          value={value}
          onChange={(e) => handleSettingChange(key, e.target.value)}
          className="form-control"
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      );
    }

    // Numeric settings
    if (['lost_match_threshold', 'found_match_threshold', 'task_match_threshold', 'generate_match_threshold', 'print_match_threshold'].includes(key)) {
      return (
        <input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={value}
          onChange={(e) => handleSettingChange(key, e.target.value)}
          className="form-control"
        />
      );
    }

    // Integer settings
    if (['match_days_back', 'task_match_days_back', 'max_image_size_mb'].includes(key)) {
      return (
        <input
          type="number"
          min="1"
          value={value}
          onChange={(e) => handleSettingChange(key, e.target.value)}
          className="form-control"
        />
      );
    }

    // Text settings
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleSettingChange(key, e.target.value)}
        className="form-control"
      />
    );
  };

  if (loading) {
    return (
      <div className="system-settings">
        <div className="loading-spinner">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="system-settings">
      <div className="settings-header">
        <h2><FiSettings /> System Settings</h2>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={fetchSettings}
            disabled={loading}
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSaveAll}
            disabled={saving}
          >
            <FiSave /> Save All
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          <FiAlertCircle /> {message}
        </div>
      )}

      <div className="settings-grid">
        {settings.map(setting => (
          <div key={setting.key} className="setting-card">
            <div className="setting-header">
              <h4>{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleSaveSetting(setting)}
                disabled={saving}
              >
                <FiSave /> Save
              </button>
            </div>
            <p className="setting-description">{setting.description || 'No description available'}</p>
            <div className="setting-input">
              {renderSettingInput(setting)}
            </div>
            <div className="setting-meta">
              Last updated: {new Date(setting.updated_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .system-settings {
          padding: 20px;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
        }

        .settings-header h2 {
          margin: 0;
          color: #333;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .alert {
          padding: 10px;
          margin-bottom: 20px;
          border-radius: 4px;
        }

        .alert-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .setting-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background: white;
        }

        .setting-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .setting-header h4 {
          margin: 0;
          color: #333;
        }

        .setting-description {
          color: #666;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .setting-input {
          margin-bottom: 10px;
        }

        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .setting-meta {
          font-size: 12px;
          color: #999;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .loading-spinner {
          text-align: center;
          padding: 40px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default SystemSettings;
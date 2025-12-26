import axios from 'axios';
import { cacheService, CacheInvalidation } from '../cache/cacheService';

// const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8002/api/`
const API_BASE_URL = `https://copper-anytime-platform-capable.trycloudflare.com/api/`;

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccess = response.data.access;
        localStorage.setItem('access_token', newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// PackageService
export const PackageService = {
  // Get packages with filtering
  getPackages: async (params = {}) => {
    const response = await api.get('/packages/', { params: { ...params, status: 'pending' } });
    return response.data.results || response.data;
  },

  // Get picked packages (filtered by status and time_range)
  getPickedPackages: async (params = {}) => {
    const response = await api.get('/packages/', {
      params: {
        ...params,
        status: 'picked',
        time_range: 'today'
      }
    });
    return response.data.results || response.data;
  },

  // Create new package
  createPackage: async (data) => {
    const response = await api.post('/packages/', data);
    return response.data;
  },

  // Get single package
  getPackage: async (id) => {
    const response = await api.get(`/packages/${id}/`);
    return response.data;
  },

  // Update package
  updatePackage: async (id, data) => {
    console.log('PackageService.updatePackage called with:', id, data);
    try {
      const response = await api.patch(`/packages/${id}/`, data);
      console.log('PackageService.updatePackage response:', response.data);
      return response.data;
    } catch (error) {
      console.error('PackageService.updatePackage error:', error);
      throw error;
    }
  },

  // Partial update package
  partialUpdatePackage: async (id, data) => {
    const response = await api.patch(`/packages/${id}/`, data);
    return response.data;
  },

  // Delete package
  deletePackage: async (id) => {
    const response = await api.delete(`/packages/${id}/`);
    return response.data;
  },

  // Pick package
  pickPackage: async (id, pickerData) => {
    const response = await api.post(`/packages/${id}/pick/`, pickerData);
    return response.data;
  },

  // Reprint package receipt
  reprintPackage: async (id) => {
    const response = await api.post(`/packages/${id}/reprint/`);
    return response.data;
  },

  // Get package history
  getPackageHistory: async (id) => {
    const response = await api.get(`/packages/${id}/history/`);
    return response.data;
  },

  // Self pickup package
  selfPickupPackage: async (selfPickData) => {
    const response = await api.post('/packages/self_pick/', selfPickData);
    return response.data;
  },

  // Get package statistics
  getStats: async (params = {}) => {
    const response = await api.get('/packages/stats/', { params });
    return response.data;
  },

  // Search packages
  searchPackages: async (params = {}) => {
    const response = await api.get('/packages/', { params });
    return response.data;
  },

  // Export packages as CSV
  exportPackages: async (params = {}) => {
    const response = await api.get('/packages/export/', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Get package summary
  getSummary: async (params = {}) => {
    const response = await api.get('/packages/summary/', { params });
    return response.data;
  },

  // Settings management
  getSettings: async () => {
    console.log('PackageService.getSettings called');
    try {
      const response = await api.get('/settings/');
      console.log('PackageService.getSettings response:', response.data);
      return response.data;
    } catch (error) {
      console.error('PackageService.getSettings error:', error);
      throw error;
    }
  },

  createSettings: async (data) => {
    const response = await api.post('/settings/', data);
    return response.data;
  },

  updateSettings: async (data) => {
    console.log('PackageService.updateSettings called with:', data);
    try {
      const response = await api.put('/settings/', data);
      console.log('PackageService.updateSettings response:', response.data);
      return response.data;
    } catch (error) {
      console.error('PackageService.updateSettings error:', error);
      throw error;
    }
  },

  partialUpdateSettings: async (data) => {
    const response = await api.patch('/settings/', data);
    return response.data;
  },

  deleteSettings: async () => {
    const response = await api.delete('/settings/');
    return response.data;
  },
};

// AuthService
export const AuthService = {
  login: async (credentials) => {
    console.log("this are login",credentials);
    const response = await api.post('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    console.log("this is use3r data from sewrver ", user)
    return response.data;
  },

  getEventLogs: async (params = {}) => {
    const response = await api.get('/auth/event-logs/', { params });
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    await api.post('/auth/logout/', { refresh: refreshToken });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await api.post('/auth/token/refresh/', { refresh: refreshToken });
    localStorage.setItem('access_token', response.data.access);
    return response.data;
  }
};

// LostFoundService
export const LostFoundService = {
  // 🔹 Lost Items
  getLostItems: async (params = {}) => {
    const cacheKey = '/items/lost';
    const cachedData = cacheService.get(cacheKey, params);

    if (cachedData) {
      return cachedData;
    }

    const response = await api.get('/items/lost/', { params });
    const data = response.data.results || response.data;
    cacheService.set(cacheKey, params, data);
    return data;
  },
  getLostCards: async (params = {}) => {
    const response = await api.get('/items/lost/', {
      params: { ...params, type: 'card' }
    });
    return response.data;
  },
  getLostNonCards: async (params = {}) => {
    const response = await api.get('/items/lost/', {
      params: { ...params, type: 'item' }
    });
    return response.data;
  },

  getPotentialMatchesForLostItem: async () => {
    const cacheKey = '/api/items/found/generate_matches';
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const response = await api.get(`/items/found/generate_matches/`);
    cacheService.set(cacheKey, {}, response.data);
    return response.data;
  },

  createLostItem: async (data) => {
    const response = await api.post('/items/lost/', data);
    // Clear relevant caches after creating new item
    CacheInvalidation.clearItemsCache();
    CacheInvalidation.clearStatsCache();
    CacheInvalidation.clearMatchesCache();
    return response.data;
  },

  markAsFound: async (id) => {
    const response = await api.post(`/items/lost/${id}/mark_found/`);
    // Clear relevant caches after marking item as found
    CacheInvalidation.clearItemsCache();
    CacheInvalidation.clearStatsCache();
    CacheInvalidation.clearMatchesCache();
    CacheInvalidation.clearPickupsCache();
    return response.data;
  },

  // 🔹 Found Items
  getFoundItems: async (params = {}) => {
    const cacheKey = '/items/found';
    const cachedData = cacheService.get(cacheKey, params);

    if (cachedData) {
      return cachedData;
    }

    const response = await api.get('/items/found/', { params });
    const data = response.data.results || response.data;
    cacheService.set(cacheKey, params, data);
    return data;
  },
  getFoundCards: async (params = {}) => {
    const response = await api.get('/items/found/', {
      params: { ...params, type: 'card' }
    });
    return response.data;
  },
  getFoundNonCards: async (params = {}) => {
    const response = await api.get('/items/found/', {
      params: { ...params, type: 'item' }
    });
    return response.data;
  },

  getPotentialMatchesForFoundItem: async (itemId) => {
    const response = await api.get(`/items/found/generate_matches/`);
    return response.data;
  },

  createFoundItem: async (data) => {
  let payload = data;
  let headers = {};

  // If data is plain object with photo, convert to FormData
  if (!(data instanceof FormData)) {
    const formPayload = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formPayload.append(key, value);
      }
    });
    payload = formPayload;
    headers = { "Content-Type": "multipart/form-data" };
  } else {
    // If it's already FormData, still set the content type
    headers = { "Content-Type": "multipart/form-data" };
  }

  const response = await api.post("/items/found/", payload, { headers });
  // Clear relevant caches after creating new item
  CacheInvalidation.clearItemsCache();
  CacheInvalidation.clearStatsCache();
  CacheInvalidation.clearMatchesCache();
  return response.data;
},


  pickFoundItem: async (id, pickerData) => {
    const response = await api.post(`/items/found/${id}/pick/`, pickerData);
    // Clear relevant caches after picking up item
    CacheInvalidation.clearItemsCache();
    CacheInvalidation.clearStatsCache();
    CacheInvalidation.clearPickupsCache();
    return response.data;
  },

  // 🔹 Reports
  getFoundWeeklyReport: async (weeks = 2) => {
    const response = await api.get(`/items/found/weekly_report/`, {
      params: { weeks }
    });
    return response.data;
  },

  // 🔹 Pickups
  getRecentPickups: async () => {
    const cacheKey = '/items/pickuplogs/pickuphistory';
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await api.get('/items/pickuplogs/pickuphistory/');
      console.log('Recently picked items data:', response.data);
      const data = response.data.results || response.data;
      cacheService.set(cacheKey, {}, data);
      return data;
    } catch (error) {
      console.error('Error fetching recent pickups:', error);
      throw error;
    }
  },

  // 🔹 Print Receipt
  printLostReceipt: async (id) => {
    const response = await api.post(`/items/lost/${id}/print_receipt/`);
    return response.data;
  },

  printFoundReceipt: async (id) => {
    const response = await api.post(`/items/found/${id}/print_receipt/`);
    return response.data;
  },

  // 🔹 Send Email
  sendLostEmail: async (id, emailData) => {
    const response = await api.post(`/items/lost/${id}/send_email/`, emailData);
    return response.data;
  },

  sendFoundEmail: async (id, emailData) => {
    const response = await api.post(`/items/found/${id}/send_email/`, emailData);
    return response.data;
  },

  // 🔹 Bulk Email
  sendBulkEmail: async (emailData) => {
    const response = await api.post('/items/lost/send_bulk_email/', emailData);
    return response.data;
  },

  // 🔹 Export
  exportLostItemsCSV: async (params = {}) => {
    const response = await api.get('/items/lost/export_csv/', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  exportLostItemsPDF: async (params = {}) => {
    const response = await api.get('/items/lost/export_pdf/', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  exportFoundItemsCSV: async (params = {}) => {
    const response = await api.get('/items/found/export_csv/', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  exportFoundItemsPDF: async (params = {}) => {
    const response = await api.get('/items/found/export_pdf/', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // 🔹 System Settings
  getSettings: async (params = {}) => {
    const response = await api.get('/items/settings/', { params });
    return response.data;
  },

  createSetting: async (data) => {
    const response = await api.post('/items/settings/', data);
    return response.data;
  },

  updateSetting: async (id, data) => {
    const response = await api.put(`/items/settings/${id}/`, data);
    return response.data;
  },

  deleteSetting: async (id) => {
    const response = await api.delete(`/items/settings/${id}/`);
    return response.data;
  },

  getSetting: async (key) => {
    const response = await api.get('/items/settings/get_setting/', {
      params: { key }
    });
    return response.data;
  },

  setSetting: async (data) => {
    const response = await api.post('/items/settings/set_setting/', data);
    return response.data;
  },

  // 🔹 Enhanced Stats
  getStats: async (params = {}) => {
    const cacheKey = '/items/stats';
    const cachedData = cacheService.get(cacheKey, params);

    if (cachedData) {
      return cachedData;
    }

    const response = await api.get('/items/stats/', { params });
    // Use longer cache duration for stats
    cacheService.set(cacheKey, params, response.data, cacheService.LONG_CACHE_DURATION);
    return response.data;
  },

  // 🔹 Weekly Report
  getWeeklyReport: async (weeks = 4) => {
    const response = await api.get('/items/pickuplogs/weekly_report/', {
      params: { weeks }
    });
    return response.data;
  },

  // 🔹 Pickup Logs
  getPickupLogs: async (params = {}) => {
    const response = await api.get('/items/pickuplogs/', { params });
    return response.data;
  },

  createPickupLog: async (data) => {
    const response = await api.post('/items/pickuplogs/', data);
    // Clear relevant caches after creating pickup log
    CacheInvalidation.clearItemsCache();
    CacheInvalidation.clearStatsCache();
    CacheInvalidation.clearPickupsCache();
    return response.data;
  },

  updatePickupLog: async (id, data) => {
    const response = await api.put(`/items/pickuplogs/${id}/`, data);
    return response.data;
  },

  deletePickupLog: async (id) => {
    const response = await api.delete(`/items/pickuplogs/${id}/`);
    return response.data;
  },

  getPickupHistory: async (params = {}) => {
    const response = await api.get('/items/pickuplogs/pickuphistory/', { params });
    return response.data;
  },

  // 🔹 Print Match Receipt
  printMatchReceipt: async (trackingId) => {
    const response = await api.post('/items/found/print_match/', {
      tracking_id: trackingId
    });
    return response.data;
  },

  // 🔹 Get Match Details
  getMatchDetails: async (lostItemId, foundItemId) => {
    const response = await api.get('/items/found/match_details/', {
      params: {
        lost_item_id: lostItemId,
        found_item_id: foundItemId
      }
    });
    return response.data;
  }
};

// API Service for all endpoints
export const PhoneIssuesAPI = {
  // Phone Extensions
  getPhoneExtensions: async () => {
    const response = await api.get('phone-extensions/');
    return response.data;
  },
  createPhoneExtension: async (data) => {
    const response = await api.post('phone-extensions/', data);
    return response.data;
  },
  getPhoneExtension: async (id) => {
    const response = await api.get(`phone-extensions/${id}/`);
    return response.data;
  },
  updatePhoneExtension: async (id, data) => {
    const response = await api.put(`phone-extensions/${id}/`, data);
    return response.data;
  },
  deletePhoneExtension: async (id) => {
    await api.delete(`phone-extensions/${id}/`);
  },

  // Reported Issues
  getIssues: async (params = {}) => {
    const response = await api.get('issues/', { params });
    return response.data;
  },
  createIssue: async (data) => {
    console.log("issue data ", data)
    const response = await api.post('issues/', data);
    return response.data;
  },
  getIssue: async (id) => {
    const response = await api.get(`issues/${id}/`);
    return response.data;
  },
  updateIssue: async (id, data) => {
    const response = await api.put(`issues/${id}/`, data);
    return response.data;
  },
  updateIssueStatus: async (id, status) => {
    const response = await api.patch(`issues/${id}/status/`, { status });
    return response.data;
  },
  deleteIssue: async (id) => {
    await api.delete(`issues/${id}/`);
  },

  // Security Keys
  getSecurityKeys: async (searchQuery = '') => {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await api.get('security-keys/', { params });
    return response.data.results || response.data;
  },
  getSecurityKey: async (id) => {
    const response = await api.get(`security-keys/${id}/`);
    return response.data;
  },
  checkoutKey: async (id, holderData) => {
    console.log("checkout ",holderData)
    const response = await api.put(`security-keys/${id}/checkout/`, holderData);
    return response.data;
  },
  returnKey: async (id, returnData = {}) => {
    // If return_time not provided, server will use current time
    const response = await api.put(`security-keys/${id}/return/`, returnData);
    return response.data;
  },
  createSecurityKey: async (keyData) => {
  console.log("checkout ",keyData)
  const response = await api.post('security-keys/', keyData);
  return response.data;

},
getKeyHistory: async (id) => {
  const response = await api.get(`security-keys/${id}/history/`);
  return response.data.results || response.data;
},

 
};


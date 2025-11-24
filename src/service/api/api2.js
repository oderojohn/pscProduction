import axios from 'axios';

const API_BASE_URL = 'http://localhost:8002/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to inject token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
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

export const LostFoundService = {
  // Lost Items
  getLostItems: async (params = {}) => {
    try {
      const response = await api.get('/items/lost/', { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching lost items:", error.response?.data || error.message);
      throw error;
    }
  },

  createLostItem: async (itemData) => {
    try {
      const response = await api.post('/items/lost/', itemData);
      return response.data;
    } catch (error) {
      console.error("Error creating lost item:", error.response?.data || error.message);
      throw error;
    }
  },

  markAsFound: async (id) => {
    try {
      const response = await api.post(`/items/lost/${id}/mark_found/`);
      return response.data;
    } catch (error) {
      console.error(`Error marking item ${id} as found:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Found Items
  getFoundItems: async (params = {}) => {
    try {
      const response = await api.get('/items/found/', { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching found items:", error.response?.data || error.message);
      throw error;
    }
  },

  createFoundItem: async (itemData) => {
    try {
      const response = await api.post('/items/found/', itemData);
      return response.data;
    } catch (error) {
      console.error("Error creating found item:", error.response?.data || error.message);
      throw error;
    }
  },

  pickFoundItem: async (id, pickerData) => {
    try {
      const response = await api.post(`/items/found/${id}/pick/`, pickerData);
      return response.data;
    } catch (error) {
      console.error(`Error picking item ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Stats
  getStats: async () => {
    try {
      const response = await api.get('/items/stats/');
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error.response?.data || error.message);
      throw error;
    }
  }
};

export const AuthService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/token/', credentials);
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      return response.data;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await api.post('/auth/logout/', { refresh: refreshToken });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile/');
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error.response?.data || error.message);
      throw error;
    }
  }
};
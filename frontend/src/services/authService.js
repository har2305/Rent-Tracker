import api from './api';
import sessionManager from './sessionManager';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  }

  // Login user
  async login(credentials) {
    console.log('🔐 authService.login called with:', {
      email: credentials.email,
      password: credentials.password,
      passwordLength: credentials.password.length
    });

    try {
      console.log('📡 Making API call to /auth/login...');
      const response = await api.post('/auth/login', credentials);
      console.log('✅ API response received:', {
        status: response.status,
        hasToken: !!response.data.token,
        user: response.data.user
      });
      
      if (response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
        console.log('✅ Token and user set successfully');
      }
      return response.data;
    } catch (error) {
      console.error('❌ authService.login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error.response?.data || { error: 'Login failed' };
    }
  }

  // Logout user
  logout() {
    this.removeToken();
    this.removeUser();
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      this.setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch profile' };
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to change password' };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get token
  getToken() {
    return this.token;
  }

  // Set token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
    // Update API default headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Start session monitoring
    sessionManager.start();
  }

  // Remove token
  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    // Stop session monitoring
    sessionManager.stop();
  }

  // Set user
  setUser(user) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Remove user
  removeUser() {
    this.user = null;
    localStorage.removeItem('user');
  }
}

// Create singleton instance
const authService = new AuthService();

// Initialize API headers if token exists
if (authService.getToken()) {
  api.defaults.headers.common['Authorization'] = `Bearer ${authService.getToken()}`;
}

export default authService; 
import apiClient from './apiClient';

const authService = {
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async logout(refreshToken) {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

export default authService;

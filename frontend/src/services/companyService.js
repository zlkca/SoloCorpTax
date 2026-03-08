import apiClient from './apiClient';

const companyService = {
  async createCompany(companyData) {
    const response = await apiClient.post('/companies', companyData);
    return response.data;
  },

  async getCompanies() {
    const response = await apiClient.get('/companies');
    return response.data;
  },

  async getCompany(companyId) {
    const response = await apiClient.get(`/companies/${companyId}`);
    return response.data;
  },

  async updateCompany(companyId, companyData) {
    const response = await apiClient.put(`/companies/${companyId}`, companyData);
    return response.data;
  },

  async deleteCompany(companyId) {
    const response = await apiClient.delete(`/companies/${companyId}`);
    return response.data;
  },
};

export default companyService;

import apiClient from './apiClient';

const exportService = {
  async generateTaxReadyPack(companyId, taxYear) {
    const response = await apiClient.post(`/companies/${companyId}/exports`, { taxYear });
    return response.data;
  },

  async getExports(companyId) {
    const response = await apiClient.get(`/companies/${companyId}/exports`);
    return response.data;
  },

  async getExportUrl(companyId, exportId) {
    const response = await apiClient.get(`/companies/${companyId}/exports/${exportId}/url`);
    return response.data;
  },
};

export default exportService;

import apiClient from './apiClient';

const documentService = {
  async uploadDocument(companyId, file, type, taxYear) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (taxYear) {
      formData.append('taxYear', String(taxYear));
    }
    const response = await apiClient.post(
      `/companies/${companyId}/documents`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  async getDocuments(companyId, filters = {}) {
    const response = await apiClient.get(
      `/companies/${companyId}/documents`,
      { params: filters },
    );
    return response.data;
  },
};

export default documentService;

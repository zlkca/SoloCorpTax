import apiClient from './apiClient';

const transactionService = {
  async uploadCSV(companyId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `/companies/${companyId}/transactions/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  async getTransactions(companyId, filters = {}) {
    const response = await apiClient.get(`/companies/${companyId}/transactions`, {
      params: filters,
    });
    return response.data;
  },

  async updateTransaction(companyId, transactionId, updates) {
    const response = await apiClient.put(
      `/companies/${companyId}/transactions/${transactionId}`,
      updates,
    );
    return response.data;
  },

  async bulkUpdateTransactions(companyId, data) {
    const response = await apiClient.post(
      `/companies/${companyId}/transactions/bulk-update`,
      data,
    );
    return response.data;
  },

  async deleteTransaction(companyId, transactionId) {
    const response = await apiClient.delete(
      `/companies/${companyId}/transactions/${transactionId}`,
    );
    return response.data;
  },

  async getSummary(companyId, taxYear) {
    const response = await apiClient.get(
      `/companies/${companyId}/transactions/summary`,
      {
        params: { taxYear },
      },
    );
    return response.data;
  },
};

export default transactionService;

import apiClient from './client';

export const publicApi = {
  getFilters() {
    return apiClient.get('/public/filters');
  }
};

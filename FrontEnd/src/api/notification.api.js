import apiClient from './client';

export const notificationApi = {
  // Saját értesítések listázása
  getNotifications() {
    return apiClient.get('/notifications');
  },

  // Értesítés olvasottnak jelölése
  markAsRead(id) {
    return apiClient.put(`/notifications/${id}/read`);
  }
};

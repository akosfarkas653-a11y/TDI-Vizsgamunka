import apiClient from './client';

export const messageApi = {
  send({ lessonId, szoveg }) {
    return apiClient.post('/messages', { lessonId, szoveg });
  },
  getThread(lessonId) {
    return apiClient.get(`/messages/lesson/${lessonId}`);
  }
};

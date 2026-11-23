import apiClient from './client';

export const teacherApi = {
  // Új óra meghirdetése { tantargy, ora_TIME }
  createLesson(data) {
    return apiClient.post('/teacher/lessons', data);
  },

  // Tanár saját órái
  getLessons() {
    return apiClient.get('/teacher/lessons');
  },

  // Foglalt óra jóváhagyása
  approveLesson(lessonId) {
    return apiClient.put(`/teacher/lessons/${lessonId}/approve`);
  },

  // Óra lemondása
  cancelLesson(lessonId) {
    return apiClient.put(`/teacher/lessons/${lessonId}/cancel`);
  },

  // Tanári statisztika lekérdezése
  getStats() {
    return apiClient.get('/teacher/stats');
  }
};

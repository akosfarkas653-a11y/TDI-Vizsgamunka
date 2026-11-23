import apiClient from './client';

export const studentApi = {
  // Szabad órák keresése szűréssel (?teacher=&subject=)
  getFreeLessons(params = {}) {
    return apiClient.get('/student/lessons', { params });
  },

  // Óra lefoglalása { lessonId }
  bookLesson(lessonId) {
    return apiClient.post('/student/book', { lessonId });
  },

  // Diák saját foglalásai
  getMyBookings() {
    return apiClient.get('/student/my-bookings');
  },

  // Foglalás lemondása
  cancelBooking(lessonId) {
    return apiClient.put(`/student/bookings/${lessonId}/cancel`);
  },

  // Saját profil törlése (soft delete)
  deleteProfile() {
    return apiClient.delete('/student/profile');
  }
};

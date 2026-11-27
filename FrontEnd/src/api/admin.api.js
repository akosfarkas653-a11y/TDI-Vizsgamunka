import apiClient from './client';

export const adminApi = {
  // Új tanár fiók létrehozása { nev, email, jelszo }
  createTeacher(data) {
    return apiClient.post('/admin/teachers', data);
  },

  // Tanárok listázása (?includeDeleted=true/false)
  getTeachers(includeDeleted = false) {
    return apiClient.get('/admin/teachers', { params: { includeDeleted } });
  },

  // Diákok listázása (?includeDeleted=true/false)
  getStudents(includeDeleted = false) {
    return apiClient.get('/admin/students', { params: { includeDeleted } });
  },

  // Összes foglalt és jóváhagyott óra listázása
  getBookedLessons() {
    return apiClient.get('/admin/lessons');
  },

  // Tanár részletes statisztika és órák
  getTeacherOverview(teacherId) {
    return apiClient.get(`/admin/teachers/${teacherId}/overview`);
  },

  // Diák részletes statisztika és órák
  getStudentOverview(studentId) {
    return apiClient.get(`/admin/students/${studentId}/overview`);
  },

  // Tanár soft delete
  deleteTeacher(teacherId) {
    return apiClient.delete(`/admin/teachers/${teacherId}`);
  },

  // Diák soft delete
  deleteStudent(studentId) {
    return apiClient.delete(`/admin/students/${studentId}`);
  },

  // Rendszerszintű statisztikák
  getStats() {
    return apiClient.get('/admin/stats');
  }
};

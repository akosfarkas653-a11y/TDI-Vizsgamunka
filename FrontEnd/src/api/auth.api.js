import apiClient from './client';

export const authApi = {
  // Diák regisztráció { nev, email, jelszo }
  register(data) {
    return apiClient.post('/auth/register', data);
  },

  // Bejelentkezés { email, jelszo }
  login(data) {
    return apiClient.post('/auth/login', data);
  }
};

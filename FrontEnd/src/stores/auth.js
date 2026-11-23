import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth.api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('tdi_token') || null);
  const user = ref(
    (() => {
      try {
        const stored = localStorage.getItem('tdi_user');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    })()
  );

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const role = computed(() => user.value?.role || null);
  const isStudent = computed(() => role.value === 'student');
  const isTeacher = computed(() => role.value === 'teacher');
  const isAdmin = computed(() => role.value === 'admin');
  const userName = computed(() => user.value?.nev || '');
  const userEmail = computed(() => user.value?.email || '');

  async function login(credentials) {
    const response = await authApi.login(credentials);
    const data = response.data;
    
    token.value = data.token;
    user.value = data.user;
    
    localStorage.setItem('tdi_token', data.token);
    localStorage.setItem('tdi_user', JSON.stringify(data.user));
    
    return data;
  }

  async function register(userData) {
    const response = await authApi.register(userData);
    return response.data;
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('tdi_token');
    localStorage.removeItem('tdi_user');
  }

  return {
    token,
    user,
    isAuthenticated,
    role,
    isStudent,
    isTeacher,
    isAdmin,
    userName,
    userEmail,
    login,
    register,
    logout
  };
});

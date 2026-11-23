import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Kérés elfogó: Automatikus Bearer JWT token hozzáadása
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Válasz elfogó: 401 és hibakezelés
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore();
    
    // Ha 401 Unauthorized érkezik (kivéve login kérésnél)
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
      if (!isLoginRequest && authStore.token) {
        authStore.logout();
        router.push({ name: 'login', query: { expired: '1' } });
      }
    }
    
    // Egységes hibaüzenet kinyerése
    const serverMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Ismeretlen hiba történt';
    const customError = new Error(serverMessage);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    
    return Promise.reject(customError);
  }
);

export default apiClient;

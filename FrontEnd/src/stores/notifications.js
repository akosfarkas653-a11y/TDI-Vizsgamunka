import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { notificationApi } from '@/api/notification.api';
import { useAuthStore } from './auth';

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([]);
  const isLoading = ref(false);

  const unreadNotifications = computed(() =>
    notifications.value.filter((n) => !n.olvasott)
  );

  const unreadCount = computed(() => unreadNotifications.value.length);

  async function fetchNotifications() {
    const authStore = useAuthStore();
    // Csak bejelentkezett diák és tanár rendelkezik értesítésekkel
    if (!authStore.isAuthenticated || authStore.isAdmin) {
      notifications.value = [];
      return;
    }

    try {
      isLoading.value = true;
      const res = await notificationApi.getNotifications();
      notifications.value = Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error('Hiba az értesítések lekérésekor:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function markAsRead(notificationId) {
    try {
      await notificationApi.markAsRead(notificationId);
      const item = notifications.value.find(
        (n) => n.notif_ID === notificationId
      );
      if (item) {
        item.olvasott = 1;
      }
    } catch (err) {
      console.error('Nem sikerült olvasottnak jelölni:', err);
      throw err;
    }
  }

  function clear() {
    notifications.value = [];
  }

  return {
    notifications,
    isLoading,
    unreadNotifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    clear
  };
});

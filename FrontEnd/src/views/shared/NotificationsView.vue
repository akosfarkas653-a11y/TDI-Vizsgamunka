<script setup>
import { onMounted } from 'vue';
import { useNotificationStore } from '@/stores/notifications';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import { formatHungarianDateTime } from '@/utils/date';

const notificationStore = useNotificationStore();

onMounted(() => {
  notificationStore.fetchNotifications();
});

async function handleMarkAsRead(notifId) {
  try {
    await notificationStore.markAsRead(notifId);
  } catch (err) {
    console.error('Nem sikerült olvasottnak jelölni az értesítést:', err);
  }
}
</script>

<template>
  <div class="notifications-page container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Értesítések</h1>
        <p class="page-subtitle">Rendszerüzenetek, foglalások és óralemondások tájékoztatói</p>
      </div>
      <button
        class="btn btn-secondary btn-sm"
        :disabled="notificationStore.isLoading"
        @click="notificationStore.fetchNotifications()"
      >
        🔄 Frissítés
      </button>
    </div>

    <LoadingSpinner v-if="notificationStore.isLoading" text="Értesítések lekérdezése..." />

    <EmptyState
      v-else-if="notificationStore.notifications.length === 0"
      icon="🔔"
      title="Nincsenek értesítéseid"
      description="Amint egy diák foglal vagy lemond egy órát, vagy a tanár módosítja a foglalásodat, itt azonnal értesítést kapsz róla."
    />

    <div v-else class="notifications-list">
      <div
        v-for="notif in notificationStore.notifications"
        :key="notif.ertesites_ID"
        class="card notif-card"
        :class="{ 'notif-card--unread': !notif.olvasott }"
      >
        <div class="notif-content">
          <div class="notif-badge-indicator">
            <span v-if="!notif.olvasott" class="unread-dot" title="Új értesítés"></span>
            <span class="notif-icon">📬</span>
          </div>
          <div class="notif-text-area">
            <p class="notif-text">{{ notif.szoveg }}</p>
            <span class="notif-time">{{ formatHungarianDateTime(notif.createdAt) }}</span>
          </div>
        </div>

        <div class="notif-actions">
          <button
            v-if="!notif.olvasott"
            class="btn btn-sm btn-secondary"
            @click="handleMarkAsRead(notif.ertesites_ID)"
          >
            ✓ Olvasottnak jelölés
          </button>
          <span v-else class="read-status">Olvasva</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 800px;
}

.notif-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  transition: all 0.2s ease;
}

.notif-card--unread {
  border-left: 4px solid var(--color-coral);
  background-color: #fffaf9;
}

.notif-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.notif-badge-indicator {
  position: relative;
  display: flex;
  align-items: center;
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  background-color: var(--color-coral);
  border-radius: 50%;
  border: 2px solid #ffffff;
}

.notif-icon {
  font-size: 24px;
}

.notif-text-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notif-text {
  font-size: 14px;
  color: var(--color-text-dark);
  line-height: 1.4;
}

.notif-time {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.notif-actions {
  flex-shrink: 0;
}

.read-status {
  font-size: 12px;
  color: var(--color-text-secondary);
}

@media (max-width: 600px) {
  .notif-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .notif-actions {
    align-self: flex-end;
  }
}
</style>

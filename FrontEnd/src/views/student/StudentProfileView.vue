<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { studentApi } from '@/api/student.api';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const router = useRouter();
const authStore = useAuthStore();

const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);
const errorMessage = ref('');

function openDeleteModal() {
  isDeleteModalOpen.value = true;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
}

async function confirmDeleteProfile() {
  try {
    isDeleting.value = true;
    errorMessage.value = '';
    await studentApi.deleteProfile();
    
    // Kijelentkeztetés és átirányítás
    authStore.logout();
    router.push({
      name: 'landing',
      query: { message: 'A fiókod sikeresen törlésre (inaktiválásra) került.' }
    });
  } catch (err) {
    errorMessage.value = err.message || 'Hiba történt a profil törlése során';
    closeDeleteModal();
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <div class="student-profile container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Profilom</h1>
        <p class="page-subtitle">A fiókod adatai és fiókkezelés</p>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <div class="profile-cards">
      <!-- Személyes adatok kártya -->
      <div class="card profile-card">
        <div class="profile-header">
          <div class="profile-avatar">🧑‍🎓</div>
          <div>
            <h3 class="profile-name">{{ authStore.userName }}</h3>
            <span class="profile-badge">Diák</span>
          </div>
        </div>

        <div class="profile-details">
          <div class="detail-row">
            <span class="detail-label">E-mail cím:</span>
            <span class="detail-value">{{ authStore.userEmail }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Felhasználói azonosító:</span>
            <span class="detail-value">#{{ authStore.user?.id }}</span>
          </div>
        </div>
      </div>

      <!-- Veszélyzóna kártya: Saját profil törlése -->
      <div class="card danger-card">
        <div class="danger-header">
          <h3>Veszélyes zóna: Profil törlése</h3>
          <p>
            A profil törlésével a fiókod inaktiválásra kerül (soft delete). Minden jelenleg aktív órafoglalásod azonnal lemondásra kerül, és az órák felszabadulnak, az érintett tanárok pedig értesítést kapnak.
          </p>
        </div>

        <button class="btn btn-danger" @click="openDeleteModal">
          🗑️ Saját profil törlése
        </button>
      </div>
    </div>

    <!-- Megerősítő párbeszédablak -->
    <ConfirmDialog
      :is-open="isDeleteModalOpen"
      title="Profil végleges törlése"
      message="Biztosan törölni szeretnéd a diák profilodat? Ez a művelet visszavonhatatlan. Minden aktív foglalásod törlődik és azonnal kijelentkezel a rendszerből."
      confirm-text="Igen, törlöm a fiókomat"
      cancel-text="Mégse"
      :is-danger="true"
      :is-loading="isDeleting"
      @confirm="confirmDeleteProfile"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<style scoped>
.profile-cards {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 700px;
}

.profile-card {
  background: #ffffff;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.profile-avatar {
  font-size: 40px;
  width: 64px;
  height: 64px;
  background-color: var(--color-coral-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-name {
  font-size: 20px;
  color: var(--color-text-dark);
}

.profile-badge {
  display: inline-block;
  background: var(--status-approved-bg);
  color: var(--status-approved-text);
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 6px 0;
}

.detail-label {
  color: var(--color-text-secondary);
}

.detail-value {
  font-weight: 600;
  color: var(--color-text-dark);
}

.danger-card {
  border-left: 4px solid var(--status-cancelled);
  background: #ffffff;
}

.danger-header h3 {
  font-size: 17px;
  color: var(--status-cancelled);
  margin-bottom: 8px;
}

.danger-header p {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 16px;
}
</style>

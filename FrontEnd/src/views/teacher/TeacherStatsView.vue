<script setup>
import { ref, onMounted } from 'vue';
import { teacherApi } from '@/api/teacher.api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const stats = ref({
  total: 0,
  szabad: 0,
  foglalt: 0,
  jovahagyott: 0,
  lemondva: 0
});

const isLoading = ref(false);
const errorMessage = ref('');

async function loadStats() {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const res = await teacherApi.getStats();
    stats.value = res.data || {
      total: 0,
      szabad: 0,
      foglalt: 0,
      jovahagyott: 0,
      lemondva: 0
    };
  } catch (err) {
    errorMessage.value = err.message || 'Nem sikerült betölteni a statisztikákat';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="teacher-stats container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Tanári Kimutatás</h1>
        <p class="page-subtitle">Részletes statisztika a meghirdetett óráidról és állapotukról</p>
      </div>
      <router-link to="/teacher/new-lesson" class="btn btn-primary">
        + Új óra meghirdetése
      </router-link>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <LoadingSpinner v-if="isLoading" text="Statisztikák betöltése..." />

    <div v-else class="stats-container">
      <!-- Fő statisztika rács -->
      <div class="grid-4 stats-grid">
        <div class="card stat-card stat-card--total">
          <div class="stat-icon">📊</div>
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-label">Összes meghirdetett óra</div>
        </div>

        <div class="card stat-card stat-card--free">
          <div class="stat-icon">🟢</div>
          <div class="stat-number">{{ stats.szabad }}</div>
          <div class="stat-label">Szabad időpont</div>
        </div>

        <div class="card stat-card stat-card--pending">
          <div class="stat-icon">🟡</div>
          <div class="stat-number">{{ stats.foglalt }}</div>
          <div class="stat-label">Függőben lévő foglalás</div>
        </div>

        <div class="card stat-card stat-card--approved">
          <div class="stat-icon">🔵</div>
          <div class="stat-number">{{ stats.jovahagyott }}</div>
          <div class="stat-label">Jóváhagyott óra</div>
        </div>
      </div>

      <!-- További statisztika és gyors műveletek -->
      <div class="grid-2 details-grid">
        <div class="card cancelled-stat-card">
          <div class="stat-header">
            <h3>Lemondott órák</h3>
            <span class="cancelled-badge">{{ stats.lemondva }} db</span>
          </div>
          <p class="stat-desc">
            Ezeket az órákat vagy a diákok, vagy te mondtad le korábban.
          </p>
          <router-link to="/teacher" class="btn btn-secondary btn-sm" style="margin-top: 12px;">
            Órák listájának megnyitása
          </router-link>
        </div>

        <div class="card quick-actions-card">
          <h3>Gyors műveletek</h3>
          <p class="stat-desc">Itt gyorsan elérheted a legfontosabb tanári funkciókat:</p>
          <div class="actions-list">
            <router-link to="/teacher/new-lesson" class="btn btn-primary">
              + Új óra meghirdetése
            </router-link>
            <router-link to="/teacher" class="btn btn-secondary">
              Óráim és foglalások kezelése
            </router-link>
            <router-link to="/teacher/notifications" class="btn btn-secondary">
              Értesítések megtekintése
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stat-card {
  text-align: center;
  padding: 28px 20px;
  position: relative;
  overflow: hidden;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.stat-number {
  font-size: 36px;
  font-weight: 800;
  color: var(--color-text-dark);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.stat-card--total {
  border-bottom: 4px solid var(--color-coral);
}

.stat-card--free {
  border-bottom: 4px solid var(--status-free);
}

.stat-card--pending {
  border-bottom: 4px solid var(--status-pending);
}

.stat-card--approved {
  border-bottom: 4px solid var(--status-approved);
}

.details-grid {
  margin-top: 10px;
}

.cancelled-stat-card,
.quick-actions-card {
  padding: 26px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.cancelled-badge {
  background-color: var(--status-cancelled-bg);
  color: var(--status-cancelled-text);
  font-size: 14px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
}

.stat-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}
</style>

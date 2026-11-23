<script setup>
import { ref, onMounted, computed } from 'vue';
import { adminApi } from '@/api/admin.api';
import StatusBadge from '@/components/StatusBadge.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import { formatHungarianDateTime } from '@/utils/date';

const lessons = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const searchFilter = ref('');
const statusFilter = ref('all'); // 'all' | '1' (foglalt) | '2' (jovahagyott)

async function loadLessons() {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const res = await adminApi.getBookedLessons();
    lessons.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    errorMessage.value = err.message || 'Nem sikerült betölteni a foglalt órákat';
  } finally {
    isLoading.value = false;
  }
}

const filteredLessons = computed(() => {
  return lessons.value.filter((l) => {
    // Státusz szűrés
    if (statusFilter.value !== 'all' && String(l.statusz_id) !== statusFilter.value) {
      return false;
    }

    // Szöveges szűrés (tantárgy, tanár, diák)
    if (searchFilter.value.trim()) {
      const q = searchFilter.value.toLowerCase();
      const matchSubject = l.tantargy?.toLowerCase().includes(q);
      const matchTeacher = l.Teacher?.tanar_nev?.toLowerCase().includes(q);
      const matchStudent = l.Student?.diak_nev?.toLowerCase().includes(q);
      return matchSubject || matchTeacher || matchStudent;
    }

    return true;
  });
});

onMounted(() => {
  loadLessons();
});
</script>

<template>
  <div class="admin-lessons container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Foglalt és jóváhagyott órák</h1>
        <p class="page-subtitle">A rendszerben lévő összes aktív foglalás listája</p>
      </div>
      <button class="btn btn-secondary btn-sm" :disabled="isLoading" @click="loadLessons">
        🔄 Frissítés
      </button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Szűrő sáv -->
    <div class="card filter-card">
      <div class="filter-row">
        <div class="form-group search-group">
          <label for="admin-lesson-search">Keresés (tantárgy, tanár, diák)</label>
          <input
            id="admin-lesson-search"
            v-model="searchFilter"
            type="text"
            class="form-control"
            placeholder="Keresés..."
          />
        </div>

        <div class="form-group status-group">
          <label for="admin-status-filter">Státusz szűrés</label>
          <select id="admin-status-filter" v-model="statusFilter" class="form-control">
            <option value="all">Minden foglalás</option>
            <option value="1">Függőben lévő (1)</option>
            <option value="2">Jóváhagyott (2)</option>
          </select>
        </div>
      </div>
    </div>

    <LoadingSpinner v-if="isLoading" text="Órák betöltése..." />

    <EmptyState
      v-else-if="filteredLessons.length === 0"
      icon="📖"
      title="Nincs megjeleníthető foglalt óra"
      description="Jelenleg nincs a keresésnek megfelelő függőben lévő vagy jóváhagyott óra a rendszerben."
    />

    <div v-else class="card table-card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tantárgy</th>
              <th>Időpont</th>
              <th>Tanár</th>
              <th>Diák</th>
              <th>Státusz</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in filteredLessons" :key="l.ora_ID">
              <td><strong>#{{ l.ora_ID }}</strong></td>
              <td><strong>{{ l.tantargy }}</strong></td>
              <td>{{ formatHungarianDateTime(l.ora_TIME) }}</td>
              <td>
                <div v-if="l.Teacher" class="user-block">
                  <span class="user-name">{{ l.Teacher.tanar_nev }}</span>
                  <span class="user-email">{{ l.Teacher.tanar_email }}</span>
                </div>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <div v-if="l.Student" class="user-block">
                  <span class="user-name">{{ l.Student.diak_nev }}</span>
                  <span class="user-email">{{ l.Student.diak_email }}</span>
                </div>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <StatusBadge :status="l.statusz || l.statusz_id" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-card {
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.search-group {
  flex: 2;
  min-width: 240px;
  margin-bottom: 0;
}

.status-group {
  flex: 1;
  min-width: 180px;
  margin-bottom: 0;
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.user-block {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--color-text-dark);
}

.user-email {
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>

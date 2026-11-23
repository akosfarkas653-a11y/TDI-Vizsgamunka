<script setup>
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin.api';
import StatusBadge from '@/components/StatusBadge.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import { formatHungarianDateTime } from '@/utils/date';

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  },
  type: {
    type: String, // 'teacher' | 'student'
    required: true
  }
});

const overview = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');

const isTeacher = props.type === 'teacher';

async function loadOverview() {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    const res = isTeacher
      ? await adminApi.getTeacherOverview(props.id)
      : await adminApi.getStudentOverview(props.id);

    overview.value = res.data;
  } catch (err) {
    errorMessage.value = err.message || 'Nem sikerült betölteni a felhasználó részletes adatait';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadOverview();
});
</script>

<template>
  <div class="user-detail container">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          {{ isTeacher ? 'Tanár Részletes Áttekintése' : 'Diák Részletes Áttekintése' }}
        </h1>
        <p class="page-subtitle">Óraszámok és hozzárendelt órák részletes kimutatása</p>
      </div>
      <router-link
        :to="isTeacher ? '/admin/teachers' : '/admin/students'"
        class="btn btn-secondary"
      >
        ← Vissza a listához
      </router-link>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <LoadingSpinner v-if="isLoading" text="Adatok betöltése..." />

    <div v-else-if="overview" class="detail-content">
      <!-- Felhasználó alap adatai -->
      <div class="card user-info-card">
        <div class="user-avatar-lg">
          {{ isTeacher ? '👨‍🏫' : '🧑‍🎓' }}
        </div>
        <div class="user-meta">
          <h2>{{ isTeacher ? overview.teacher?.tanar_nev : overview.student?.diak_nev }}</h2>
          <p class="meta-email">
            {{ isTeacher ? overview.teacher?.tanar_email : overview.student?.diak_email }}
          </p>
          <div class="meta-badges">
            <span class="badge-role">{{ isTeacher ? 'Tanár' : 'Diák' }}</span>
            <span
              v-if="(isTeacher ? overview.teacher?.deleted : overview.student?.deleted)"
              class="badge-deleted"
            >
              Inaktív (Törölt)
            </span>
            <span v-else class="badge-active">Aktív fiók</span>
          </div>
        </div>
      </div>

      <!-- Statisztika kártyák -->
      <div class="grid-4 stats-grid" v-if="overview.stats">
        <div class="card stat-box stat-box--total">
          <span class="stat-num">{{ overview.stats.total }}</span>
          <span class="stat-name">Összes óra</span>
        </div>

        <div v-if="isTeacher" class="card stat-box stat-box--free">
          <span class="stat-num">{{ overview.stats.szabad }}</span>
          <span class="stat-name">Szabad</span>
        </div>

        <div class="card stat-box stat-box--pending">
          <span class="stat-num">{{ overview.stats.foglalt }}</span>
          <span class="stat-name">Függőben</span>
        </div>

        <div class="card stat-box stat-box--approved">
          <span class="stat-num">{{ overview.stats.jovahagyott }}</span>
          <span class="stat-name">Jóváhagyva</span>
        </div>

        <div class="card stat-box stat-box--cancelled">
          <span class="stat-num">{{ overview.stats.lemondva }}</span>
          <span class="stat-name">Lemondva</span>
        </div>
      </div>

      <!-- Kapcsolódó órák listája -->
      <div class="lessons-section">
        <h3 class="section-title">Kapcsolódó órák listája ({{ overview.lessons?.length || 0 }})</h3>

        <EmptyState
          v-if="!overview.lessons || overview.lessons.length === 0"
          icon="📂"
          title="Nincsenek órák rögzítve ennél a felhasználónál"
        />

        <div v-else class="card table-card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tantárgy</th>
                  <th>Időpont</th>
                  <th>{{ isTeacher ? 'Diák' : 'Tanár' }}</th>
                  <th>Státusz</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="l in overview.lessons" :key="l.ora_ID">
                  <td><strong>#{{ l.ora_ID }}</strong></td>
                  <td><strong>{{ l.tantargy }}</strong></td>
                  <td>{{ formatHungarianDateTime(l.ora_TIME) }}</td>
                  <td>
                    <template v-if="isTeacher">
                      <span v-if="l.Student">{{ l.Student.diak_nev }} ({{ l.Student.diak_email }})</span>
                      <span v-else class="text-muted">Még nincs jelentkező</span>
                    </template>
                    <template v-else>
                      <span v-if="l.Teacher">{{ l.Teacher.tanar_nev }} ({{ l.Teacher.tanar_email }})</span>
                      <span v-else class="text-muted">-</span>
                    </template>
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
    </div>
  </div>
</template>

<style scoped>
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-info-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 30px;
}

.user-avatar-lg {
  font-size: 48px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-coral-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-meta h2 {
  font-size: 22px;
  color: var(--color-text-dark);
  margin-bottom: 4px;
}

.meta-email {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}

.meta-badges {
  display: flex;
  gap: 8px;
}

.badge-role {
  background: #f1f5f9;
  color: var(--color-text-dark);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}

.badge-active {
  background: var(--status-free-bg);
  color: var(--status-free-text);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}

.badge-deleted {
  background: var(--status-cancelled-bg);
  color: var(--status-cancelled-text);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}

.stats-grid {
  gap: 16px;
}

.stat-box {
  text-align: center;
  padding: 20px;
}

.stat-num {
  font-size: 32px;
  font-weight: 800;
  color: var(--color-text-dark);
  display: block;
  margin-bottom: 6px;
}

.stat-name {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.stat-box--total {
  border-bottom: 4px solid var(--color-coral);
}
.stat-box--free {
  border-bottom: 4px solid var(--status-free);
}
.stat-box--pending {
  border-bottom: 4px solid var(--status-pending);
}
.stat-box--approved {
  border-bottom: 4px solid var(--status-approved);
}
.stat-box--cancelled {
  border-bottom: 4px solid var(--status-cancelled);
}

.section-title {
  font-size: 18px;
  color: var(--color-text-dark);
  margin-bottom: 14px;
}

.table-card {
  padding: 0;
  overflow: hidden;
}
</style>

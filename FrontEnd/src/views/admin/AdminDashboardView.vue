<script setup>
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin.api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const teacherName = ref('');
const teacherEmail = ref('');
const teacherPassword = ref('');
const isSubmitting = ref(false);
const formError = ref('');
const formSuccess = ref('');

// Áttekintő számok
const stats = ref({
  teacherCount: 0,
  studentCount: 0,
  lessonCount: 0
});
const isLoadingStats = ref(false);

async function loadStats() {
  try {
    isLoadingStats.value = true;
    const res = await adminApi.getStats();
    const data = res.data;

    stats.value = {
      teacherCount: data.teachers?.active || 0,
      studentCount: data.students?.active || 0,
      lessonCount: (data.lessons?.foglalt || 0) + (data.lessons?.jovahagyott || 0)
    };
  } catch (err) {
    console.warn('Admin statisztikák betöltése sikertelen:', err);
  } finally {
    isLoadingStats.value = false;
  }
}

async function handleCreateTeacher() {
  formError.value = '';
  formSuccess.value = '';

  if (!teacherName.value.trim() || !teacherEmail.value.trim() || !teacherPassword.value) {
    formError.value = 'Minden mező kitöltése kötelező!';
    return;
  }

  if (teacherPassword.value.length < 6) {
    formError.value = 'A jelszónak legalább 6 karakter hosszúnak kell lennie!';
    return;
  }

  try {
    isSubmitting.value = true;
    await adminApi.createTeacher({
      nev: teacherName.value.trim(),
      email: teacherEmail.value.trim().toLowerCase(),
      jelszo: teacherPassword.value
    });

    formSuccess.value = `Tanár sikeresen létrehozva: ${teacherName.value} (${teacherEmail.value})!`;
    teacherName.value = '';
    teacherEmail.value = '';
    teacherPassword.value = '';
    await loadStats();
  } catch (err) {
    formError.value = err.message || 'Hiba történt a tanár fiók létrehozásakor';
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="admin-dashboard container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Adminisztrációs Irányítópult</h1>
        <p class="page-subtitle">Rendszer áttekintés, tanári fiókok kezelése és statisztikák</p>
      </div>
    </div>

    <!-- Gyors statisztika kártyák -->
    <LoadingSpinner v-if="isLoadingStats" text="Adatok frissítése..." />
    <div v-else class="grid-3 stats-grid">
      <div class="card admin-stat-card">
        <div class="stat-icon">👨‍🏫</div>
        <div class="stat-number">{{ stats.teacherCount }}</div>
        <div class="stat-title">Aktív Tanár</div>
        <router-link to="/admin/teachers" class="stat-link">Tanárok kezelése →</router-link>
      </div>

      <div class="card admin-stat-card">
        <div class="stat-icon">🧑‍🎓</div>
        <div class="stat-number">{{ stats.studentCount }}</div>
        <div class="stat-title">Aktív Diák</div>
        <router-link to="/admin/students" class="stat-link">Diákok kezelése →</router-link>
      </div>

      <div class="card admin-stat-card">
        <div class="stat-icon">📖</div>
        <div class="stat-number">{{ stats.lessonCount }}</div>
        <div class="stat-title">Foglalt & Jóváhagyott Óra</div>
        <router-link to="/admin/lessons" class="stat-link">Órák megtekintése →</router-link>
      </div>
    </div>

    <!-- Tanár létrehozása űrlap -->
    <div class="card create-teacher-card">
      <div class="card-header">
        <span class="card-icon">➕</span>
        <div>
          <h3>Új Tanár Fiók Létrehozása</h3>
          <p class="card-sub">Tanárok csak adminisztrátor által hozhatók létre a rendszerben</p>
        </div>
      </div>

      <div v-if="formSuccess" class="alert alert-success">
        <span>✅</span>
        <span>{{ formSuccess }}</span>
      </div>

      <div v-if="formError" class="alert alert-danger">
        <span>⚠️</span>
        <span>{{ formError }}</span>
      </div>

      <form @submit.prevent="handleCreateTeacher" class="teacher-form">
        <div class="grid-3 form-fields">
          <div class="form-group">
            <label for="admin-teach-name">Tanár neve</label>
            <input
              id="admin-teach-name"
              v-model="teacherName"
              type="text"
              class="form-control"
              placeholder="Pl. Dr. Kovács István"
              required
            />
          </div>

          <div class="form-group">
            <label for="admin-teach-email">E-mail cím</label>
            <input
              id="admin-teach-email"
              v-model="teacherEmail"
              type="email"
              class="form-control"
              placeholder="tanar@iskola.hu"
              required
            />
          </div>

          <div class="form-group">
            <label for="admin-teach-pass">Kezdeti jelszó (min. 6 kar.)</label>
            <input
              id="admin-teach-pass"
              v-model="teacherPassword"
              type="password"
              class="form-control"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting">Létrehozás...</span>
            <span v-else>+ Tanár fiók létrehozása</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  margin-bottom: 30px;
}

.admin-stat-card {
  text-align: center;
  padding: 26px 20px;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 36px;
  font-weight: 800;
  color: var(--color-text-dark);
}

.stat-title {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 600;
  margin-bottom: 12px;
}

.stat-link {
  font-size: 13px;
  color: var(--color-coral);
  text-decoration: none;
  font-weight: 600;
}

.stat-link:hover {
  text-decoration: underline;
}

.create-teacher-card {
  padding: 28px;
  background: #ffffff;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.card-icon {
  font-size: 28px;
}

.card-header h3 {
  font-size: 18px;
  color: var(--color-text-dark);
}

.card-sub {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.form-fields {
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}
</style>

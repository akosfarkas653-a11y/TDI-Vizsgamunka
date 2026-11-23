<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { teacherApi } from '@/api/teacher.api';

const router = useRouter();

const tantargy = ref('');
const date = ref('');
const time = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const quickSubjects = [
  'Matematika',
  'Fizika',
  'Informatika',
  'Kémia',
  'Biológia',
  'Angol nyelv',
  'Német nyelv',
  'Történelem',
  'Magyar nyelv és irodalom'
];

function selectQuickSubject(subject) {
  tantargy.value = subject;
}

// Alapértelmezett dátum kitöltése a holnapi napra 10:00 órára
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const defaultDateStr = tomorrow.toISOString().substring(0, 10);
date.value = defaultDateStr;
time.value = '10:00';

async function handleCreateLesson() {
  errorMessage.value = '';
  successMessage.value = '';

  if (!tantargy.value.trim() || !date.value || !time.value) {
    errorMessage.value = 'Minden mező kitöltése kötelező (tantárgy, dátum, idő)!';
    return;
  }

  const dateTimeString = `${date.value}T${time.value}:00`;
  const lessonDate = new Date(dateTimeString);

  if (isNaN(lessonDate.getTime())) {
    errorMessage.value = 'Érvénytelen dátum vagy időpont formátum!';
    return;
  }

  try {
    isLoading.value = true;
    await teacherApi.createLesson({
      tantargy: tantargy.value.trim(),
      ora_TIME: lessonDate.toISOString()
    });

    successMessage.value = 'Az óra sikeresen meghirdetve! A diákok mostantól láthatják és lefoglalhatják.';
    // Űrlap részleges reset
    tantargy.value = '';
  } catch (err) {
    errorMessage.value = err.message || 'Hiba történt az óra meghirdetése során';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="teacher-new-lesson container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Új óra meghirdetése</h1>
        <p class="page-subtitle">Hirdess meg szabad időpontot, amire a diákok jelentkezhetnek</p>
      </div>
      <router-link to="/teacher" class="btn btn-secondary">
        ← Vissza az óráimhoz
      </router-link>
    </div>

    <div v-if="successMessage" class="alert alert-success">
      <span>✅</span>
      <div>
        <p>{{ successMessage }}</p>
        <div style="margin-top: 8px;">
          <router-link to="/teacher" class="btn btn-sm btn-primary">
            Ugrás az óráimhoz
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <div class="card form-card">
      <form @submit.prevent="handleCreateLesson">
        <div class="form-group">
          <label for="lesson-subject">Tantárgy neve</label>
          <input
            id="lesson-subject"
            v-model="tantargy"
            type="text"
            class="form-control"
            placeholder="Pl. Matematika emelt szint, Angol nyelv..."
            required
          />
          <div class="quick-tags">
            <span class="quick-tags-label">Gyakori tantárgyak:</span>
            <button
              v-for="subj in quickSubjects"
              :key="subj"
              type="button"
              class="tag-btn"
              @click="selectQuickSubject(subj)"
            >
              {{ subj }}
            </button>
          </div>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label for="lesson-date">Dátum</label>
            <input
              id="lesson-date"
              v-model="date"
              type="date"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label for="lesson-time">Időpont (óra:perc)</label>
            <input
              id="lesson-time"
              v-model="time"
              type="time"
              class="form-control"
              required
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading">Meghirdetés...</span>
            <span v-else>+ Időpont meghirdetése</span>
          </button>
          <router-link to="/teacher" class="btn btn-secondary">
            Mégse
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-card {
  max-width: 650px;
  background-color: #ffffff;
}

.quick-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.quick-tags-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.tag-btn {
  background: #f1f5f9;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 3px 10px;
  font-size: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tag-btn:hover {
  background: var(--color-coral-light);
  border-color: var(--color-coral);
  color: var(--color-coral);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
</style>

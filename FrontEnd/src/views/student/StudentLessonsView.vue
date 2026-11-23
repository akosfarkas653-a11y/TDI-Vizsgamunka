<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { studentApi } from '@/api/student.api';
import LessonCard from '@/components/LessonCard.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import { formatHungarianDateTime } from '@/utils/date';

const route = useRoute();

const lessons = ref([]);
const isLoading = ref(false);
const isBookingLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Szűrők
const searchSubject = ref(route.query.subject || '');
const searchTeacher = ref(route.query.teacher || '');

// Megerősítő párbeszédablak állapot
const isModalOpen = ref(false);
const selectedLesson = ref(null);

async function loadLessons() {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const res = await studentApi.getFreeLessons({
      subject: searchSubject.value.trim() || undefined,
      teacher: searchTeacher.value.trim() || undefined
    });
    lessons.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    errorMessage.value = err.message || 'Nem sikerült betölteni a szabad órákat';
  } finally {
    isLoading.value = false;
  }
}

function handleSearch() {
  loadLessons();
}

function handleReset() {
  searchSubject.value = '';
  searchTeacher.value = '';
  loadLessons();
}

function openBookingModal(lesson) {
  selectedLesson.value = lesson;
  isModalOpen.value = true;
}

function closeBookingModal() {
  selectedLesson.value = null;
  isModalOpen.value = false;
}

async function confirmBooking() {
  if (!selectedLesson.value) return;

  try {
    isBookingLoading.value = true;
    errorMessage.value = '';
    await studentApi.bookLesson(selectedLesson.value.ora_ID);
    
    successMessage.value = `Sikeres foglalás: ${selectedLesson.value.tantargy} (${formatHungarianDateTime(selectedLesson.value.ora_TIME)})! A foglalásod mostantól függőben van a tanár jóváhagyására.`;
    closeBookingModal();
    // Újratöltjük a szabad órákat
    await loadLessons();
  } catch (err) {
    errorMessage.value = err.message || 'Hiba történt az óra foglalása során';
  } finally {
    isBookingLoading.value = false;
  }
}

onMounted(() => {
  loadLessons();
});
</script>

<template>
  <div class="student-lessons container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Szabad órák keresése</h1>
        <p class="page-subtitle">Böngéssz a meghirdetett órák között és foglalj időpontot</p>
      </div>
    </div>

    <!-- Értesítő üzenetek -->
    <div v-if="successMessage" class="alert alert-success">
      <span>✅</span>
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Kereső / Szűrő doboz -->
    <div class="card filter-card">
      <form @submit.prevent="handleSearch" class="filter-form">
        <div class="form-group filter-group">
          <label for="filter-subject">Keresés tantárgyra</label>
          <input
            id="filter-subject"
            v-model="searchSubject"
            type="text"
            class="form-control"
            placeholder="Pl. Matematika, Fizika..."
          />
        </div>

        <div class="form-group filter-group">
          <label for="filter-teacher">Keresés tanár nevére</label>
          <input
            id="filter-teacher"
            v-model="searchTeacher"
            type="text"
            class="form-control"
            placeholder="Pl. Kovács..."
          />
        </div>

        <div class="filter-actions">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            🔍 Keresés
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="isLoading"
            @click="handleReset"
          >
            Visszaállítás
          </button>
        </div>
      </form>
    </div>

    <!-- Tartalom: Betöltő, Üres vagy Lista -->
    <LoadingSpinner v-if="isLoading" text="Szabad órák betöltése..." />

    <EmptyState
      v-else-if="lessons.length === 0"
      icon="📅"
      title="Nincs elérhető szabad óra"
      description="A megadott feltételekkel jelenleg nincs szabad óra. Próbálj meg más tantárgyra vagy tanárra keresni!"
    >
      <button class="btn btn-secondary btn-sm" @click="handleReset">
        Összes óra megjelenítése
      </button>
    </EmptyState>

    <div v-else class="grid-3 lessons-grid">
      <LessonCard
        v-for="lesson in lessons"
        :key="lesson.ora_ID"
        :lesson="lesson"
        :show-student="false"
      >
        <template #actions>
          <button
            class="btn btn-primary btn-sm btn-book-action"
            @click="openBookingModal(lesson)"
          >
            Időpont lefoglalása
          </button>
        </template>
      </LessonCard>
    </div>

    <!-- Megerősítő ablak foglaláshoz -->
    <ConfirmDialog
      :is-open="isModalOpen"
      title="Óra lefoglalása"
      :message="selectedLesson ? `Biztosan le szeretnéd foglalni a következő órát: ${selectedLesson.tantargy} (${formatHungarianDateTime(selectedLesson.ora_TIME)}) - Tanár: ${selectedLesson.Teacher?.tanar_nev}?` : ''"
      confirm-text="Foglalás megerősítése"
      cancel-text="Mégse"
      :is-loading="isBookingLoading"
      @confirm="confirmBooking"
      @cancel="closeBookingModal"
    />
  </div>
</template>

<style scoped>
.filter-card {
  margin-bottom: 24px;
  background-color: #ffffff;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 220px;
  margin-bottom: 0;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.lessons-grid {
  margin-top: 10px;
}

.btn-book-action {
  width: 100%;
}
</style>

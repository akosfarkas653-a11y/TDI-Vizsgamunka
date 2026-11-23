<script setup>
import { ref, onMounted, computed } from 'vue';
import { teacherApi } from '@/api/teacher.api';
import LessonCard from '@/components/LessonCard.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import { formatHungarianDateTime } from '@/utils/date';

const lessons = ref([]);
const isLoading = ref(false);
const isActionLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Szűrő tab (all, pending, approved, free, cancelled)
const activeTab = ref('all');

// Jóváhagyás / Lemondás Modalok
const isConfirmModalOpen = ref(false);
const modalActionType = ref('approve'); // 'approve' | 'cancel'
const activeLesson = ref(null);

async function loadLessons() {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const res = await teacherApi.getLessons();
    lessons.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    errorMessage.value = err.message || 'Nem sikerült betölteni a tanári órákat';
  } finally {
    isLoading.value = false;
  }
}

const filteredLessons = computed(() => {
  if (activeTab.value === 'all') return lessons.value;
  if (activeTab.value === 'free') return lessons.value.filter((l) => l.statusz_id === 0);
  if (activeTab.value === 'pending') return lessons.value.filter((l) => l.statusz_id === 1);
  if (activeTab.value === 'approved') return lessons.value.filter((l) => l.statusz_id === 2);
  if (activeTab.value === 'cancelled') return lessons.value.filter((l) => l.statusz_id === 3);
  return lessons.value;
});

function openApproveModal(lesson) {
  activeLesson.value = lesson;
  modalActionType.value = 'approve';
  isConfirmModalOpen.value = true;
}

function openCancelModal(lesson) {
  activeLesson.value = lesson;
  modalActionType.value = 'cancel';
  isConfirmModalOpen.value = true;
}

function closeModal() {
  activeLesson.value = null;
  isConfirmModalOpen.value = false;
}

async function handleConfirmAction() {
  if (!activeLesson.value) return;

  try {
    isActionLoading.value = true;
    errorMessage.value = '';

    if (modalActionType.value === 'approve') {
      await teacherApi.approveLesson(activeLesson.value.ora_ID);
      successMessage.value = `Óra sikeresen jóváhagyva! A diák (${activeLesson.value.Student?.diak_nev}) értesítést kapott.`;
    } else {
      await teacherApi.cancelLesson(activeLesson.value.ora_ID);
      successMessage.value = 'Az óra sikeresen lemondva.';
    }

    closeModal();
    await loadLessons();
  } catch (err) {
    errorMessage.value = err.message || 'Művelet sikertelen';
  } finally {
    isActionLoading.value = false;
  }
}

onMounted(() => {
  loadLessons();
});
</script>

<template>
  <div class="teacher-lessons container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Óráim kezelése</h1>
        <p class="page-subtitle">Kövesd nyomon a meghirdetett órákat, hagyd jóvá a diákok jelentkezéseit</p>
      </div>
      <router-link to="/teacher/new-lesson" class="btn btn-primary">
        + Új óra meghirdetése
      </router-link>
    </div>

    <!-- Értesítések -->
    <div v-if="successMessage" class="alert alert-success">
      <span>✅</span>
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Szűrő fülek -->
    <div class="tabs-bar">
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        Összes óra ({{ lessons.length }})
      </button>
      <button
        class="tab-btn tab-btn--pending"
        :class="{ 'tab-btn--active': activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        Függőben ({{ lessons.filter((l) => l.statusz_id === 1).length }})
      </button>
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'approved' }"
        @click="activeTab = 'approved'"
      >
        Jóváhagyott ({{ lessons.filter((l) => l.statusz_id === 2).length }})
      </button>
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'free' }"
        @click="activeTab = 'free'"
      >
        Szabad ({{ lessons.filter((l) => l.statusz_id === 0).length }})
      </button>
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'cancelled' }"
        @click="activeTab = 'cancelled'"
      >
        Lemondva ({{ lessons.filter((l) => l.statusz_id === 3).length }})
      </button>
    </div>

    <LoadingSpinner v-if="isLoading" text="Órák betöltése..." />

    <EmptyState
      v-else-if="filteredLessons.length === 0"
      icon="📅"
      title="Nincs megjeleníthető óra"
      description="Ebben a kategóriában jelenleg nincs egyetlen óra sem."
    >
      <router-link to="/teacher/new-lesson" class="btn btn-primary btn-sm">
        Új óra meghirdetése
      </router-link>
    </EmptyState>

    <div v-else class="grid-3 lessons-grid">
      <LessonCard
        v-for="lesson in filteredLessons"
        :key="lesson.ora_ID"
        :lesson="lesson"
        :show-teacher="false"
        :show-student="true"
      >
        <template #actions>
          <!-- Ha függőben van (1): Jóváhagyás és Lemondás -->
          <template v-if="lesson.statusz_id === 1">
            <button
              class="btn btn-success btn-sm btn-action-half"
              @click="openApproveModal(lesson)"
            >
              ✓ Jóváhagyás
            </button>
            <button
              class="btn btn-outline-danger btn-sm btn-action-half"
              @click="openCancelModal(lesson)"
            >
              ✕ Lemondás
            </button>
          </template>

          <!-- Ha szabad (0) vagy jóváhagyott (2): Lemondható/Törölhető -->
          <template v-else-if="lesson.statusz_id === 0 || lesson.statusz_id === 2">
            <button
              class="btn btn-outline-danger btn-sm btn-action-full"
              @click="openCancelModal(lesson)"
            >
              {{ lesson.statusz_id === 0 ? 'Időpont visszavonása' : 'Óra lemondása' }}
            </button>
          </template>

          <span v-else class="status-note text-muted">
            Ez az óra lemondott státuszban van.
          </span>
        </template>
      </LessonCard>
    </div>

    <!-- Megerősítő párbeszédablak -->
    <ConfirmDialog
      :is-open="isConfirmModalOpen"
      :title="modalActionType === 'approve' ? 'Foglalás jóváhagyása' : 'Óra lemondása'"
      :message="
        activeLesson
          ? modalActionType === 'approve'
            ? `Biztosan jóváhagyod ${activeLesson.Student?.diak_nev} (${activeLesson.Student?.diak_email}) foglalását erre az órára: ${activeLesson.tantargy} (${formatHungarianDateTime(activeLesson.ora_TIME)})?`
            : `Biztosan lemondod a(z) ${activeLesson.tantargy} órát? ${activeLesson.diak_id ? 'A foglalt diák értesítést kap a lemondásról.' : ''}`
          : ''
      "
      :confirm-text="modalActionType === 'approve' ? 'Jóváhagyás' : 'Lemondás'"
      cancel-text="Mégse"
      :is-danger="modalActionType === 'cancel'"
      :is-loading="isActionLoading"
      @confirm="handleConfirmAction"
      @cancel="closeModal"
    />
  </div>
</template>

<style scoped>
.tabs-bar {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 24px;
}

.tab-btn {
  background: #ffffff;
  border: 1px solid var(--color-border);
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  border-color: var(--color-coral);
  color: var(--color-coral);
}

.tab-btn--active {
  background-color: var(--color-coral);
  color: #ffffff !important;
  border-color: var(--color-coral);
}

.tab-btn--pending {
  position: relative;
}

.btn-action-half {
  flex: 1;
}

.btn-action-full {
  width: 100%;
}

.status-note {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-style: italic;
  padding: 4px 0;
}
</style>

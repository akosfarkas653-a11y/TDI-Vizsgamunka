<script setup>
import { ref, onMounted } from 'vue';
import { studentApi } from '@/api/student.api';
import LessonCard from '@/components/LessonCard.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import { formatHungarianDateTime } from '@/utils/date';

const bookings = ref([]);
const isLoading = ref(false);
const isCancelLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Lemondás modal állapot
const isCancelModalOpen = ref(false);
const lessonToCancel = ref(null);

async function loadBookings() {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const res = await studentApi.getMyBookings();
    bookings.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    errorMessage.value = err.message || 'Nem sikerült betölteni a foglalásaidat';
  } finally {
    isLoading.value = false;
  }
}

function openCancelModal(lesson) {
  lessonToCancel.value = lesson;
  isCancelModalOpen.value = true;
}

function closeCancelModal() {
  lessonToCancel.value = null;
  isCancelModalOpen.value = false;
}

async function confirmCancelBooking() {
  if (!lessonToCancel.value) return;

  try {
    isCancelLoading.value = true;
    errorMessage.value = '';
    await studentApi.cancelBooking(lessonToCancel.value.ora_ID);
    
    successMessage.value = `A foglalásod a következő órára sikeresen lemondva: ${lessonToCancel.value.tantargy} (${formatHungarianDateTime(lessonToCancel.value.ora_TIME)}). A tanár értesítést kapott.`;
    closeCancelModal();
    await loadBookings();
  } catch (err) {
    errorMessage.value = err.message || 'Hiba történt a lemondás során';
  } finally {
    isCancelLoading.value = false;
  }
}

onMounted(() => {
  loadBookings();
});
</script>

<template>
  <div class="student-bookings container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Saját foglalásaim</h1>
        <p class="page-subtitle">Kövesd nyomon óráid állapotát (függőben, jóváhagyva, lemondva)</p>
      </div>
      <router-link to="/student" class="btn btn-primary">
        + Új óra foglalása
      </router-link>
    </div>

    <div v-if="successMessage" class="alert alert-success">
      <span>✅</span>
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <LoadingSpinner v-if="isLoading" text="Foglalások betöltése..." />

    <EmptyState
      v-else-if="bookings.length === 0"
      icon="📚"
      title="Még nincs lefoglalt órád"
      description="Nézd meg a szabad órákat, és válassz számodra megfelelő tanárt és tantárgyat!"
    >
      <router-link to="/student" class="btn btn-primary btn-sm">
        Szabad órák keresése
      </router-link>
    </EmptyState>

    <div v-else class="grid-3">
      <LessonCard
        v-for="booking in bookings"
        :key="booking.ora_ID"
        :lesson="booking"
        :show-student="false"
      >
        <template #actions>
          <!-- Lemondás és üzenetek gombok, ha az óra függőben (1) vagy jóváhagyott (2) állapotban van -->
          <template v-if="booking.statusz_id === 1 || booking.statusz_id === 2">
            <router-link
              :to="{ name: 'student-messages', params: { lessonId: booking.ora_ID } }"
              class="btn btn-outline-primary btn-sm btn-action-btn"
            >
              💬 Üzenetek
            </router-link>
            <button
              class="btn btn-outline-danger btn-sm btn-action-btn"
              @click="openCancelModal(booking)"
            >
              Foglalás lemondása
            </button>
          </template>
          <span v-else-if="booking.statusz_id === 3" class="status-note text-muted">
            Ez az óra lemondott állapotban van.
          </span>
        </template>
      </LessonCard>
    </div>

    <!-- Lemondás Megerősítő Ablak -->
    <ConfirmDialog
      :is-open="isCancelModalOpen"
      title="Foglalás lemondása"
      :message="lessonToCancel ? `Biztosan lemondod ezt a foglalást: ${lessonToCancel.tantargy} (${formatHungarianDateTime(lessonToCancel.ora_TIME)})? A tanár azonnali értesítést kap erről.` : ''"
      confirm-text="Lemondás"
      cancel-text="Mégse"
      :is-danger="true"
      :is-loading="isCancelLoading"
      @confirm="confirmCancelBooking"
      @cancel="closeCancelModal"
    />
  </div>
</template>

<style scoped>
.btn-action-btn {
  flex: 1;
  text-align: center;
}

.status-note {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-style: italic;
  padding: 4px 0;
}
</style>

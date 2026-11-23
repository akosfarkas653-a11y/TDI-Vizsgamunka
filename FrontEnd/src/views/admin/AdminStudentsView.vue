<script setup>
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin.api';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import { formatHungarianDate } from '@/utils/date';

const students = ref([]);
const includeDeleted = ref(false);
const isLoading = ref(false);
const isDeleting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Soft delete modal
const isDeleteModalOpen = ref(false);
const studentToDelete = ref(null);

async function loadStudents() {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const res = await adminApi.getStudents(includeDeleted.value);
    students.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    errorMessage.value = err.message || 'Nem sikerült betölteni a diákokat';
  } finally {
    isLoading.value = false;
  }
}

function openDeleteModal(student) {
  studentToDelete.value = student;
  isDeleteModalOpen.value = true;
}

function closeDeleteModal() {
  studentToDelete.value = null;
  isDeleteModalOpen.value = false;
}

async function confirmDeleteStudent() {
  if (!studentToDelete.value) return;

  try {
    isDeleting.value = true;
    errorMessage.value = '';
    await adminApi.deleteStudent(studentToDelete.value.diak_ID);
    
    successMessage.value = `A(z) ${studentToDelete.value.diak_nev} diák fiókja sikeresen inaktiválva (soft delete). A foglalásai törlődtek, az órák felszabadultak és a tanárok értesítést kaptak.`;
    closeDeleteModal();
    await loadStudents();
  } catch (err) {
    errorMessage.value = err.message || 'Hiba történt a diák törlése során';
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  loadStudents();
});
</script>

<template>
  <div class="admin-students container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Diákok kezelése</h1>
        <p class="page-subtitle">A rendszerben regisztrált diákok listája és adatlapjai</p>
      </div>
      <div class="header-actions">
        <label class="toggle-label">
          <input
            type="checkbox"
            v-model="includeDeleted"
            @change="loadStudents"
          />
          <span>Törölt (inaktív) diákok megjelenítése</span>
        </label>
      </div>
    </div>

    <div v-if="successMessage" class="alert alert-success">
      <span>✅</span>
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <LoadingSpinner v-if="isLoading" text="Diákok betöltése..." />

    <EmptyState
      v-else-if="students.length === 0"
      icon="🧑‍🎓"
      title="Nincsenek diákok a rendszerben"
      description="Amint diákok regisztrálnak a felületen, itt fognak megjelenni."
    />

    <div v-else class="card table-card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Név</th>
              <th>E-mail</th>
              <th>Állapot</th>
              <th>Regisztráció</th>
              <th style="text-align: right;">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="student in students"
              :key="student.diak_ID"
              :class="{ 'row-deleted': student.deleted }"
            >
              <td><strong>#{{ student.diak_ID }}</strong></td>
              <td>
                <div class="user-cell">
                  <span class="user-avatar">🧑‍🎓</span>
                  <span>{{ student.diak_nev }}</span>
                </div>
              </td>
              <td>{{ student.diak_email }}</td>
              <td>
                <span v-if="student.deleted" class="badge-deleted">Inaktív (Törölt)</span>
                <span v-else class="badge-active">Aktív</span>
              </td>
              <td>{{ formatHungarianDate(student.createdAt) }}</td>
              <td style="text-align: right;">
                <div class="table-actions">
                  <router-link
                    :to="`/admin/students/${student.diak_ID}`"
                    class="btn btn-sm btn-secondary"
                  >
                    Részletek
                  </router-link>
                  <button
                    v-if="!student.deleted"
                    class="btn btn-sm btn-outline-danger"
                    @click="openDeleteModal(student)"
                  >
                    Inaktiválás
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Megerősítő párbeszédablak -->
    <ConfirmDialog
      :is-open="isDeleteModalOpen"
      title="Diák inaktiválása (Soft delete)"
      :message="studentToDelete ? `Biztosan inaktiválni szeretnéd a(z) ${studentToDelete.diak_nev} nevű diákot? Az aktív foglalásai felszabadulnak, az érintett tanárok pedig értesítést kapnak.` : ''"
      confirm-text="Diák inaktiválása"
      cancel-text="Mégse"
      :is-danger="true"
      :is-loading="isDeleting"
      @confirm="confirmDeleteStudent"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
  cursor: pointer;
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.user-avatar {
  font-size: 16px;
}

.badge-active {
  display: inline-block;
  background-color: var(--status-free-bg);
  color: var(--status-free-text);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
}

.badge-deleted {
  display: inline-block;
  background-color: var(--status-cancelled-bg);
  color: var(--status-cancelled-text);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
}

.row-deleted {
  opacity: 0.65;
  background-color: #fafafa;
}

.table-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin.api';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import { formatHungarianDate } from '@/utils/date';

const teachers = ref([]);
const includeDeleted = ref(false);
const isLoading = ref(false);
const isDeleting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Soft delete modal
const isDeleteModalOpen = ref(false);
const teacherToDelete = ref(null);

async function loadTeachers() {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const res = await adminApi.getTeachers(includeDeleted.value);
    teachers.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    errorMessage.value = err.message || 'Nem sikerült betölteni a tanárokat';
  } finally {
    isLoading.value = false;
  }
}

function openDeleteModal(teacher) {
  teacherToDelete.value = teacher;
  isDeleteModalOpen.value = true;
}

function closeDeleteModal() {
  teacherToDelete.value = null;
  isDeleteModalOpen.value = false;
}

async function confirmDeleteTeacher() {
  if (!teacherToDelete.value) return;

  try {
    isDeleting.value = true;
    errorMessage.value = '';
    await adminApi.deleteTeacher(teacherToDelete.value.tanar_ID);
    
    successMessage.value = `A(z) ${teacherToDelete.value.tanar_nev} tanár fiókja sikeresen inaktiválva (soft delete). A tanár órái lemondásra kerültek és a diákok értesítést kaptak.`;
    closeDeleteModal();
    await loadTeachers();
  } catch (err) {
    errorMessage.value = err.message || 'Hiba történt a tanár törlése során';
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  loadTeachers();
});
</script>

<template>
  <div class="admin-teachers container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Tanárok kezelése</h1>
        <p class="page-subtitle">A rendszerben lévő regisztrált tanárok listája és adatlapjai</p>
      </div>
      <div class="header-actions">
        <label class="toggle-label">
          <input
            type="checkbox"
            v-model="includeDeleted"
            @change="loadTeachers"
          />
          <span>Törölt (inaktív) tanárok megjelenítése</span>
        </label>
        <router-link to="/admin" class="btn btn-primary btn-sm">
          + Új tanár felvétele
        </router-link>
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

    <LoadingSpinner v-if="isLoading" text="Tanárok betöltése..." />

    <EmptyState
      v-else-if="teachers.length === 0"
      icon="👨‍🏫"
      title="Nincsenek tanárok a rendszerben"
      description="Hozz létre egy új tanári fiókot az irányítópulton!"
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
              <th>Létrehozva</th>
              <th style="text-align: right;">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="teacher in teachers"
              :key="teacher.tanar_ID"
              :class="{ 'row-deleted': teacher.deleted }"
            >
              <td><strong>#{{ teacher.tanar_ID }}</strong></td>
              <td>
                <div class="user-cell">
                  <span class="user-avatar">👨‍🏫</span>
                  <span>{{ teacher.tanar_nev }}</span>
                </div>
              </td>
              <td>{{ teacher.tanar_email }}</td>
              <td>
                <span v-if="teacher.deleted" class="badge-deleted">Inaktív (Törölt)</span>
                <span v-else class="badge-active">Aktív</span>
              </td>
              <td>{{ formatHungarianDate(teacher.createdAt) }}</td>
              <td style="text-align: right;">
                <div class="table-actions">
                  <router-link
                    :to="`/admin/teachers/${teacher.tanar_ID}`"
                    class="btn btn-sm btn-secondary"
                  >
                    Részletek
                  </router-link>
                  <button
                    v-if="!teacher.deleted"
                    class="btn btn-sm btn-outline-danger"
                    @click="openDeleteModal(teacher)"
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
      title="Tanár inaktiválása (Soft delete)"
      :message="teacherToDelete ? `Biztosan inaktiválni szeretnéd a(z) ${teacherToDelete.tanar_nev} nevű tanárt? Az aktív órái lemondásra kerülnek, a diákok pedig azonnali értesítést kapnak erről.` : ''"
      confirm-text="Tanár inaktiválása"
      cancel-text="Mégse"
      :is-danger="true"
      :is-loading="isDeleting"
      @confirm="confirmDeleteTeacher"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
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

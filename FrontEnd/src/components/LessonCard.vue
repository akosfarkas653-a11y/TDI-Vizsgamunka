<script setup>
import { computed } from 'vue';
import StatusBadge from './StatusBadge.vue';
import { formatHungarianDateTime } from '@/utils/date';

const props = defineProps({
  lesson: {
    type: Object,
    required: true
  },
  showTeacher: {
    type: Boolean,
    default: true
  },
  showStudent: {
    type: Boolean,
    default: true
  }
});

const formattedTime = computed(() => {
  return formatHungarianDateTime(props.lesson.ora_TIME);
});
</script>

<template>
  <div class="lesson-card card">
    <div class="lesson-card__header">
      <span class="lesson-card__subject">{{ lesson.tantargy }}</span>
      <StatusBadge :status="lesson.statusz || lesson.statusz_id" />
    </div>

    <div class="lesson-card__details">
      <div class="detail-item">
        <span class="detail-icon">📅</span>
        <span class="detail-text">{{ formattedTime }}</span>
      </div>

      <div v-if="showTeacher && lesson.Teacher" class="detail-item">
        <span class="detail-icon">👨‍🏫</span>
        <span class="detail-text">
          <strong>Tanár:</strong> {{ lesson.Teacher.tanar_nev }}
          <span class="detail-subtext">({{ lesson.Teacher.tanar_email }})</span>
        </span>
      </div>

      <div v-if="showStudent && lesson.Student" class="detail-item">
        <span class="detail-icon">🧑‍🎓</span>
        <span class="detail-text">
          <strong>Diák:</strong> {{ lesson.Student.diak_nev }}
          <span class="detail-subtext">({{ lesson.Student.diak_email }})</span>
        </span>
      </div>
    </div>

    <div v-if="$slots.actions" class="lesson-card__actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<style scoped>
.lesson-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  position: relative;
  overflow: hidden;
}

.lesson-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.lesson-card__subject {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-dark);
}

.lesson-card__details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.detail-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.detail-subtext {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-left: 4px;
}

.lesson-card__actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
  flex-wrap: wrap;
}
</style>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: [Number, String, Object],
    required: true
  }
});

// Státusz azonosító normalizálása (lehet objektum { statusz_ID, statusz_nev }, szám vagy string)
const statusId = computed(() => {
  if (typeof props.status === 'object' && props.status !== null) {
    return Number(props.status.statusz_ID);
  }
  return Number(props.status);
});

const config = computed(() => {
  switch (statusId.value) {
    case 0:
      return { label: 'Szabad', className: 'status-badge--free', icon: '🟢' };
    case 1:
      return { label: 'Függőben', className: 'status-badge--pending', icon: '🟡' };
    case 2:
      return { label: 'Jóváhagyva', className: 'status-badge--approved', icon: '🔵' };
    case 3:
      return { label: 'Lemondva', className: 'status-badge--cancelled', icon: '🔴' };
    default:
      return { label: 'Ismeretlen', className: 'status-badge--unknown', icon: '⚪' };
  }
});
</script>

<template>
  <span class="status-badge" :class="config.className">
    <span class="status-badge__dot"></span>
    <span class="status-badge__text">{{ config.label }}</span>
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-badge--free {
  background-color: var(--status-free-bg);
  color: var(--status-free-text);
}
.status-badge--free .status-badge__dot {
  background-color: var(--status-free);
}

.status-badge--pending {
  background-color: var(--status-pending-bg);
  color: var(--status-pending-text);
}
.status-badge--pending .status-badge__dot {
  background-color: var(--status-pending);
}

.status-badge--approved {
  background-color: var(--status-approved-bg);
  color: var(--status-approved-text);
}
.status-badge--approved .status-badge__dot {
  background-color: var(--status-approved);
}

.status-badge--cancelled {
  background-color: var(--status-cancelled-bg);
  color: var(--status-cancelled-text);
}
.status-badge--cancelled .status-badge__dot {
  background-color: var(--status-cancelled);
}

.status-badge--unknown {
  background-color: #f1f5f9;
  color: #64748b;
}
.status-badge--unknown .status-badge__dot {
  background-color: #94a3b8;
}
</style>

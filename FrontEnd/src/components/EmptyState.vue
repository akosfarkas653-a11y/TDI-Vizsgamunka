<script setup>
defineProps({
  icon: {
    type: String,
    default: '📂'
  },
  title: {
    type: String,
    default: 'Nincs megjeleníthető adat'
  },
  description: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div class="empty-state card">
    <span class="empty-state__icon">{{ icon }}</span>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__desc">{{ description }}</p>
    <div v-if="$slots.default" class="empty-state__action">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 48px 20px;
  background-color: #ffffff;
}

.empty-state__icon {
  font-size: 42px;
  display: block;
  margin-bottom: 12px;
}

.empty-state__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-dark);
  margin-bottom: 6px;
}

.empty-state__desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  max-width: 400px;
  margin: 0 auto;
}

.empty-state__action {
  margin-top: 18px;
}
</style>

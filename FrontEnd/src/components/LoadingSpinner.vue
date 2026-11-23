<script setup>
defineProps({
  text: {
    type: String,
    default: 'Betöltés...'
  }
});
</script>

<template>
  <div class="spinner-container">
    <div class="spinner"></div>
    <span v-if="text" class="spinner-text">{{ text }}</span>
  </div>
</template>

<style scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 107, 91, 0.2);
  border-radius: 50%;
  border-top-color: var(--color-coral);
  animation: spin 0.8s linear infinite;
}

.spinner-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

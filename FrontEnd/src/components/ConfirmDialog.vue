<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Megerősítés'
  },
  message: {
    type: String,
    default: 'Biztosan végrehajtod ezt a műveletet?'
  },
  confirmText: {
    type: String,
    default: 'Megerősítés'
  },
  cancelText: {
    type: String,
    default: 'Mégse'
  },
  isDanger: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel']);

function onKeydown(e) {
  if (e.key === 'Escape' && props.isOpen && !props.isLoading) {
    emit('cancel');
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-backdrop" @click.self="!isLoading && emit('cancel')">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-icon" :class="{ 'modal-icon--danger': isDanger }">
            <span v-if="isDanger">⚠️</span>
            <span v-else>❓</span>
          </div>
          <h3 class="modal-title">{{ title }}</h3>
        </div>

        <p class="modal-body">{{ message }}</p>

        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="isLoading"
            @click="emit('cancel')"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="btn"
            :class="isDanger ? 'btn-danger' : 'btn-primary'"
            :disabled="isLoading"
            @click="emit('confirm')"
          >
            <span v-if="isLoading">Folyamatban...</span>
            <span v-else>{{ confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}

.modal-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  padding: 28px;
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-modal);
  transform: translateY(0);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.modal-icon--danger {
  background-color: #fee2e2;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-dark);
}

.modal-body {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Animáció */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

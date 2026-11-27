<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { messageApi } from '@/api/message.api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import { formatHungarianDateTime } from '@/utils/date';

const props = defineProps({
  lessonId: {
    type: [String, Number],
    required: true
  }
});

const router = useRouter();

const lesson = ref(null);
const messages = ref([]);
const szoveg = ref('');
const isLoading = ref(false);
const isSending = ref(false);
const errorMessage = ref('');
const messagesContainer = ref(null);

const canSendMessage = computed(() => {
  if (!lesson.value || !lesson.value.statusz_nev) return false;
  return lesson.value.statusz_nev === 'foglalt' || lesson.value.statusz_nev === 'jovahagyott';
});

async function scrollToBottom() {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

async function loadThread() {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const res = await messageApi.getThread(props.lessonId);
    lesson.value = res.data.lesson;
    messages.value = Array.isArray(res.data.messages) ? res.data.messages : [];
    scrollToBottom();
  } catch (err) {
    errorMessage.value = err.response?.data?.error || err.message || 'Nem sikerült betölteni az üzeneteket';
  } finally {
    isLoading.value = false;
  }
}

async function handleSendMessage() {
  const trimmed = szoveg.value.trim();
  if (!trimmed || isSending.value) return;

  try {
    isSending.value = true;
    errorMessage.value = '';
    await messageApi.send({
      lessonId: props.lessonId,
      szoveg: trimmed
    });
    szoveg.value = '';
    await loadThread();
  } catch (err) {
    errorMessage.value = err.response?.data?.error || err.message || 'Nem sikerült elküldeni az üzenetet';
  } finally {
    isSending.value = false;
  }
}

onMounted(() => {
  loadThread();
});
</script>

<template>
  <div class="messages-view container">
    <!-- Fejléc -->
    <div class="page-header messages-header">
      <div class="header-details">
        <button class="btn btn-secondary btn-sm back-btn" @click="router.back()">
          ← Vissza
        </button>
        <div>
          <h1 class="page-title">
            Üzenetek
            <span v-if="lesson" class="subject-tag">: {{ lesson.tantargy }}</span>
          </h1>
          <p v-if="lesson" class="page-subtitle">
            <span>📅 {{ formatHungarianDateTime(lesson.ora_TIME) }}</span>
            <span class="partner-info">
              👤 Beszélgetőtárs: <strong>{{ lesson.partner_nev || '-' }}</strong>
            </span>
          </p>
        </div>
      </div>
      <button
        class="btn btn-secondary btn-sm"
        :disabled="isLoading"
        @click="loadThread"
      >
        🔄 Frissítés
      </button>
    </div>

    <!-- Hibaüzenet -->
    <div v-if="errorMessage" class="alert alert-danger">
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Betöltés jelző -->
    <LoadingSpinner v-if="isLoading && !lesson" text="Üzenetek betöltése..." />

    <div v-else class="messages-content card">
      <!-- Üzenetek listája -->
      <div v-if="messages.length === 0" class="empty-messages-wrapper">
        <EmptyState
          icon="💬"
          title="Még nincs üzenet. Írj elsőként!"
          description="Ezen a felületen egyeztethettek az órával kapcsolatos részletekről."
        />
      </div>

      <div v-else ref="messagesContainer" class="messages-list">
        <div
          v-for="msg in messages"
          :key="msg.uzenet_ID"
          class="message-row"
          :class="{ 'message-row--own': msg.sajat, 'message-row--partner': !msg.sajat }"
        >
          <div class="message-bubble" :class="{ 'message-bubble--own': msg.sajat }">
            <div class="message-meta">
              <span class="message-sender">{{ msg.felado_nev }}</span>
              <span class="message-time">{{ formatHungarianDateTime(msg.createdAt) }}</span>
            </div>
            <div class="message-text">{{ msg.szoveg }}</div>
          </div>
        </div>
      </div>

      <!-- Űrlap terület -->
      <div class="message-form-area">
        <div v-if="lesson && !canSendMessage" class="alert alert-warning lesson-closed-alert">
          <span>⚠️</span>
          <span>Ehhez az órához már nem küldhető üzenet.</span>
        </div>

        <form v-else @submit.prevent="handleSendMessage" class="send-form">
          <div class="form-group">
            <div class="textarea-header">
              <label for="szoveg" class="form-label">Új üzenet küldése:</label>
              <span class="char-count" :class="{ 'char-count--limit': szoveg.length >= 500 }">
                {{ szoveg.length }} / 500
              </span>
            </div>
            <textarea
              id="szoveg"
              v-model="szoveg"
              class="form-input message-textarea"
              rows="3"
              maxlength="500"
              placeholder="Írd ide az üzeneted..."
              :disabled="isSending"
            ></textarea>
          </div>
          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSending || !szoveg.trim()"
            >
              <span v-if="isSending">Küldés folyamatban...</span>
              <span v-else>Küldés</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.messages-view {
  max-width: 900px;
}

.messages-header {
  margin-bottom: 20px;
}

.header-details {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  white-space: nowrap;
}

.subject-tag {
  color: var(--color-coral);
}

.partner-info {
  margin-left: 12px;
}

.messages-content {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.empty-messages-wrapper {
  padding: 30px 20px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  max-height: 520px;
  overflow-y: auto;
  background-color: #fdfdfd;
}

.message-row {
  display: flex;
  width: 100%;
}

.message-row--own {
  justify-content: flex-end;
}

.message-row--partner {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #f1f5f9;
  border: 1px solid var(--color-border);
}

.message-bubble--own {
  background-color: #fff1ef;
  border-color: rgba(255, 107, 91, 0.3);
}

.message-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 12px;
}

.message-sender {
  font-weight: 600;
  color: var(--color-text-dark);
}

.message-bubble--own .message-sender {
  color: var(--color-coral);
}

.message-time {
  color: var(--color-text-secondary);
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-dark);
  white-space: pre-wrap;
  word-break: break-word;
}

.message-form-area {
  padding: 20px 24px;
  background-color: #ffffff;
  border-top: 1px solid var(--color-border);
}

.lesson-closed-alert {
  margin: 0;
}

.textarea-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.char-count {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.char-count--limit {
  color: var(--color-danger);
  font-weight: bold;
}

.message-textarea {
  resize: vertical;
  min-height: 70px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>

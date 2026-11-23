<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const nev = ref('');
const email = ref('');
const jelszo = ref('');
const jelszoUjra = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

async function handleRegister() {
  errorMessage.value = '';

  if (!nev.value.trim() || !email.value.trim() || !jelszo.value || !jelszoUjra.value) {
    errorMessage.value = 'Minden mező kitöltése kötelező!';
    return;
  }

  if (jelszo.value.length < 6) {
    errorMessage.value = 'A jelszónak legalább 6 karakter hosszúnak kell lennie!';
    return;
  }

  if (jelszo.value !== jelszoUjra.value) {
    errorMessage.value = 'A két jelszó nem egyezik meg!';
    return;
  }

  try {
    isLoading.value = true;
    await authStore.register({
      nev: nev.value.trim(),
      email: email.value.trim().toLowerCase(),
      jelszo: jelszo.value
    });

    router.push({ name: 'login', query: { registered: '1' } });
  } catch (err) {
    errorMessage.value = err.message || 'Hiba történt a regisztráció során';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <span class="auth-logo">🧑‍🎓</span>
        <h2 class="auth-title">Diák Regisztráció</h2>
        <p class="auth-subtitle">Hozz létre új diák fiókot az időpontok foglalásához</p>
      </div>

      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="reg-name">Teljes név</label>
          <input
            id="reg-name"
            v-model="nev"
            type="text"
            class="form-control"
            placeholder="Pl. Kovács Péter"
            required
          />
        </div>

        <div class="form-group">
          <label for="reg-email">E-mail cím</label>
          <input
            id="reg-email"
            v-model="email"
            type="email"
            class="form-control"
            placeholder="pelda@email.hu"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="reg-password">Jelszó (legalább 6 karakter)</label>
          <input
            id="reg-password"
            v-model="jelszo"
            type="password"
            class="form-control"
            placeholder="••••••••"
            autocomplete="new-password"
            required
          />
        </div>

        <div class="form-group">
          <label for="reg-password-again">Jelszó újra</label>
          <input
            id="reg-password-again"
            v-model="jelszoUjra"
            type="password"
            class="form-control"
            placeholder="••••••••"
            autocomplete="new-password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary btn-submit" :disabled="isLoading">
          <span v-if="isLoading">Regisztráció...</span>
          <span v-else>REGISZTRÁCIÓ</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>Már van fiókod? <router-link to="/login">Jelentkezz be!</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: var(--color-bg);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: 36px 32px;
}

.auth-header {
  text-align: center;
  margin-bottom: 26px;
}

.auth-logo {
  font-size: 38px;
  display: inline-block;
  margin-bottom: 8px;
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-dark);
}

.auth-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 6px;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-top: 8px;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  font-size: 14px;
  color: var(--color-text-muted);
}

.auth-footer a {
  color: var(--color-coral);
  font-weight: 600;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>

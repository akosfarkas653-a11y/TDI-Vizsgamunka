<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const jelszo = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

onMounted(() => {
  if (route.query.expired === '1') {
    errorMessage.value = 'A bejelentkezési munkamenet lejárt. Kérjük, lépj be újra!';
  } else if (route.query.message) {
    errorMessage.value = String(route.query.message);
  } else if (route.query.registered === '1') {
    successMessage.value = 'Sikeres regisztráció! Most már bejelentkezhetsz.';
  }
});

async function handleLogin() {
  errorMessage.value = '';
  successMessage.value = '';

  if (!email.value.trim() || !jelszo.value) {
    errorMessage.value = 'Kérjük, tölts ki minden mezőt!';
    return;
  }

  try {
    isLoading.value = true;
    const result = await authStore.login({
      email: email.value.trim(),
      jelszo: jelszo.value
    });

    const userRole = result.user?.role;
    const redirectUrl = route.query.redirect;

    if (redirectUrl) {
      router.push(redirectUrl);
    } else if (userRole === 'student') {
      router.push({ name: 'student-lessons' });
    } else if (userRole === 'teacher') {
      router.push({ name: 'teacher-lessons' });
    } else if (userRole === 'admin') {
      router.push({ name: 'admin-dashboard' });
    } else {
      router.push('/');
    }
  } catch (err) {
    errorMessage.value = err.message || 'Hiba történt a bejelentkezés során';
  } finally {
    isLoading.value = false;
  }
}

// Gyors tesztkitöltő demóhoz
function fillCredentials(identifier, pass) {
  email.value = identifier;
  jelszo.value = pass;
  errorMessage.value = '';
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <span class="auth-logo">📚</span>
        <h2 class="auth-title">Bejelentkezés</h2>
        <p class="auth-subtitle">Lépj be diák, tanár vagy adminisztrátori fiókodba</p>
      </div>

      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="login-email">Azonosító (E-mail cím vagy Admin név)</label>
          <input
            id="login-email"
            v-model="email"
            type="text"
            class="form-control"
            placeholder="pelda@email.hu vagy 'admin'"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="login-password">Jelszó</label>
          <input
            id="login-password"
            v-model="jelszo"
            type="password"
            class="form-control"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary btn-submit" :disabled="isLoading">
          <span v-if="isLoading">Bejelentkezés...</span>
          <span v-else>BEJELENTKEZÉS</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>Még nincs fiókod? <router-link to="/register">Regisztrálj diákként!</router-link></p>
      </div>

      <!-- Gyors belépés tesztadatokkal (megkönnyíti a kipróbálást) -->
      <div class="quick-demo-box">
        <span class="quick-title">⚡ Gyors tesztkitöltés (adatbázis tesztfiókok):</span>
        <div class="quick-buttons">
          <button
            type="button"
            class="btn btn-sm btn-secondary"
            @click="fillCredentials('nagy.anna@example.com', 'password123')"
          >
            🧑‍🎓 Diák
          </button>
          <button
            type="button"
            class="btn btn-sm btn-secondary"
            @click="fillCredentials('kovacs.istvan@example.com', 'password123')"
          >
            👨‍🏫 Tanár
          </button>
          <button
            type="button"
            class="btn btn-sm btn-secondary"
            @click="fillCredentials('admin', 'admin')"
          >
            🛡️ Admin
          </button>
        </div>
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

.quick-demo-box {
  margin-top: 24px;
  padding: 14px;
  background-color: #f8fafc;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--color-border);
}

.quick-title {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
  font-weight: 600;
}

.quick-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>

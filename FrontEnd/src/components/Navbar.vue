<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const isMobileMenuOpen = ref(false);

const roleLabel = computed(() => {
  if (authStore.isAdmin) return 'Adminisztrátor';
  if (authStore.isTeacher) return 'Tanár';
  if (authStore.isStudent) return 'Diák';
  return '';
});

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth && !authStore.isAdmin) {
      notificationStore.fetchNotifications();
    }
  },
  { immediate: true }
);

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function handleLogout() {
  authStore.logout();
  notificationStore.clear();
  isMobileMenuOpen.value = false;
  router.push({ name: 'landing' });
}

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  }
);
</script>

<template>
  <header class="navbar">
    <div class="logo">
      <span class="logo-icon">📚</span>
      <strong>TDI</strong>
    </div>

    <!-- Mobil menü gomb -->
    <button class="mobile-toggle" @click="toggleMobileMenu" aria-label="Menü megnyitása">
      <span :class="['hamburger', { 'is-active': isMobileMenuOpen }]"></span>
    </button>

    <!-- Navigáció linkek -->
    <nav class="nav-links" :class="{ 'nav-links--open': isMobileMenuOpen }">
      <!-- Publikus navigáció az eredeti landingpage.html szerint -->
      <template v-if="!authStore.isAuthenticated">
        <router-link to="/">Főoldal</router-link>
        <a href="#tantargyak">Tantárgyak ▾</a>
        <a href="#rolunk">Rólunk</a>
        <a href="#blog">Blog</a>
      </template>

      <!-- Diák menüpontok -->
      <template v-else-if="authStore.isStudent">
        <router-link to="/student">Szabad órák</router-link>
        <router-link to="/student/my-bookings">Saját foglalásaim</router-link>
        <router-link to="/student/notifications" class="nav-link-badge">
          Értesítések
          <span v-if="notificationStore.unreadCount > 0" class="badge-count">
            {{ notificationStore.unreadCount }}
          </span>
        </router-link>
        <router-link to="/student/profile">Profilom</router-link>
      </template>

      <!-- Tanár menüpontok -->
      <template v-else-if="authStore.isTeacher">
        <router-link to="/teacher">Óráim</router-link>
        <router-link to="/teacher/new-lesson">+ Új óra</router-link>
        <router-link to="/teacher/stats">Statisztika</router-link>
        <router-link to="/teacher/notifications" class="nav-link-badge">
          Értesítések
          <span v-if="notificationStore.unreadCount > 0" class="badge-count">
            {{ notificationStore.unreadCount }}
          </span>
        </router-link>
      </template>

      <!-- Admin menüpontok -->
      <template v-else-if="authStore.isAdmin">
        <router-link to="/admin">Áttekintés</router-link>
        <router-link to="/admin/teachers">Tanárok</router-link>
        <router-link to="/admin/students">Diákok</router-link>
        <router-link to="/admin/lessons">Foglalt órák</router-link>
      </template>

      <!-- Felhasználói állapot -->
      <div v-if="authStore.isAuthenticated" class="user-panel">
        <span class="user-name">{{ authStore.userName }} ({{ roleLabel }})</span>
        <button class="btn-logout" @click="handleLogout">Kilépés</button>
      </div>
    </nav>

    <!-- Bejelentkezés gomb kijelentkezett állapotban -->
    <div v-if="!authStore.isAuthenticated" class="nav-btn">
      <router-link to="/login" class="btn-login">BEJELENTKEZÉS</router-link>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  color: #1a1a1a;
  text-decoration: none;
}

.logo-icon {
  font-size: 20px;
}

.nav-links {
  display: flex;
  gap: 30px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  font-size: 15px;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-exact-active {
  color: #ff6b5b;
}

.nav-link-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.badge-count {
  background-color: #ff6b5b;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
}

.btn-login {
  background-color: #ff6b5b;
  color: white;
  padding: 10px 25px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 0.2s;
  display: inline-block;
}

.btn-login:hover {
  background-color: #e55342;
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 10px;
  padding-left: 14px;
  border-left: 1px solid #e2e8f0;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a202c;
}

.btn-logout {
  background: #edf2f7;
  color: #4a5568;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-logout:hover {
  background: #e2e8f0;
  color: #1a1a1a;
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.hamburger {
  display: block;
  width: 22px;
  height: 2px;
  background-color: #1a1a1a;
  position: relative;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 2px;
  background-color: #1a1a1a;
}

.hamburger::before {
  top: -6px;
}

.hamburger::after {
  top: 6px;
}

@media (max-width: 900px) {
  .navbar {
    padding: 16px 20px;
  }
  .mobile-toggle {
    display: block;
  }
  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #ffffff;
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
    gap: 16px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
    display: none;
  }
  .nav-links--open {
    display: flex;
  }
  .user-panel {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
    width: 100%;
    justify-content: space-between;
  }
}
</style>

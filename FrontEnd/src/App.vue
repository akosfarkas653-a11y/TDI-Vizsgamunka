<script setup>
import Navbar from '@/components/Navbar.vue';
</script>

<template>
  <div class="app-layout">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
    <footer class="app-footer">
      <div class="container footer-content">
        <p>&copy; 2026 TDI - Tanár-Diák-Interface. Minden jog fenntartva.</p>
        <div class="footer-links">
          <span>Oktatási Segédplatform</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}

.app-footer {
  background-color: #ffffff;
  border-top: 1px solid var(--color-border);
  padding: 24px 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>

<template>
  <div class="not-found-page container">
    <div class="card not-found-card">
      <span class="not-found-code">404</span>
      <h2 class="not-found-title">Az oldal nem található</h2>
      <p class="not-found-desc">
        A keresett oldal nem létezik vagy át lett helyezve.
      </p>
      <router-link to="/" class="btn btn-primary btn-pill">
        Vissza a főoldalra
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  padding: 80px 20px;
  display: flex;
  justify-content: center;
}

.not-found-card {
  text-align: center;
  max-width: 500px;
  padding: 50px 30px;
}

.not-found-code {
  font-size: 72px;
  font-weight: 800;
  color: var(--color-coral);
  display: block;
  line-height: 1;
  margin-bottom: 12px;
}

.not-found-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin-bottom: 12px;
}

.not-found-desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}
</style>

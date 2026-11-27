<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { publicApi } from '@/api/public.api';

const router = useRouter();
const authStore = useAuthStore();

const subjects = ref([]);
const teachers = ref([]);
const selectedSubject = ref('');
const selectedTeacher = ref('');
const isLoadingFilters = ref(false);
const filterError = ref('');

onMounted(async () => {
  try {
    isLoadingFilters.value = true;
    filterError.value = '';
    const res = await publicApi.getFilters();
    subjects.value = Array.isArray(res.data?.subjects) ? res.data.subjects : [];
    teachers.value = Array.isArray(res.data?.teachers) ? res.data.teachers : [];
  } catch (err) {
    console.warn('Szűrők betöltése sikertelen:', err);
    filterError.value = 'A szűrők jelenleg nem tölthetők be.';
    subjects.value = [];
    teachers.value = [];
  } finally {
    isLoadingFilters.value = false;
  }
});

function handleSearchSubmit() {
  const queryParams = {};
  if (selectedSubject.value) queryParams.subject = selectedSubject.value;
  if (selectedTeacher.value) queryParams.teacher = selectedTeacher.value;

  if (!authStore.isAuthenticated) {
    const params = new URLSearchParams();
    if (selectedSubject.value) params.append('subject', selectedSubject.value);
    if (selectedTeacher.value) params.append('teacher', selectedTeacher.value);
    const queryString = params.toString();
    const redirectPath = queryString ? `/student?${queryString}` : '/student';

    router.push({
      name: 'login',
      query: {
        redirect: redirectPath,
        message: 'A szabad órák kereséséhez kérjük, jelentkezz be!'
      }
    });
    return;
  }

  if (authStore.isStudent) {
    router.push({
      name: 'student-lessons',
      query: queryParams
    });
  } else if (authStore.isTeacher) {
    router.push({ name: 'teacher-lessons' });
  } else if (authStore.isAdmin) {
    router.push({ name: 'admin-dashboard' });
  }
}
</script>

<template>
  <div class="landing-page">
    <!-- Hero Szekció (Háttérkép + Fő tartalom) -->
    <section class="hero">
      <div class="hero-content">
        <!-- Bal oldal: Szöveg és Kereső Űrlap -->
        <div class="hero-text-card">
          <h1>Találd Meg A Tökéletes Magántanárod!</h1>
          <p>Személyre szabott magánórák minden tantárgyból. Foglalj időpontot egyszerűen és gyorsan online!</p>

          <!-- Keresés Doboz -->
          <div class="booking-box">
            <h3>FOGLALJ IDŐPONTOT MOST</h3>
            <form @submit.prevent="handleSearchSubmit">
              <div class="form-group">
                <label for="subject-select">Válassz tantárgyat:</label>
                <select id="subject-select" v-model="selectedSubject">
                  <option value="">Összes tantárgy</option>
                  <option v-for="subj in subjects" :key="subj" :value="subj">
                    {{ subj }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="teacher-select">Válassz tanárt:</label>
                <select id="teacher-select" v-model="selectedTeacher">
                  <option value="">Összes tanár</option>
                  <option v-for="teach in teachers" :key="teach" :value="teach">
                    {{ teach }}
                  </option>
                </select>
              </div>

              <p v-if="filterError" class="filter-error-text">
                {{ filterError }}
              </p>

              <button type="submit" class="btn-book">Óra keresése</button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Alsó Információs Kártyák -->
    <section id="rolunk" class="features">
      <div class="feature-card">
        <h3>Képzett Tanárok</h3>
        <p>Képzett tanáraink minden tanárról átfogó értékeléssel rendelkeznek.</p>
      </div>
      <div class="feature-card">
        <h3>Rugalmas Időpontok</h3>
        <p>Számodra szabott időbeosztás, online vagy személyes formában.</p>
      </div>
      <div class="feature-card">
        <h3>Személyre Szabott Tanterv</h3>
        <p>A tempódhoz és céljaidhoz igazított egyéni fejlesztés.</p>
      </div>
      <div class="feature-card">
        <h3>Biztonságos Online Felület</h3>
        <p>Biztonságos online felület és egyszerű fizetési lehetőségek.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero Szekció */
.hero {
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
    url('@/assets/landinghatter.jfif') no-repeat center center / cover;
  min-height: 80vh;
  padding: 50px;
  display: flex;
  align-items: center;
}

.hero-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-text-card {
  max-width: 500px;
}

.hero-text-card h1 {
  font-size: 42px;
  color: #f8e091;
  margin-bottom: 15px;
  line-height: 1.2;
  font-weight: 700;
}

.hero-text-card p {
  font-size: 16px;
  color: #f8e091;
  margin-bottom: 25px;
  line-height: 1.5;
}

/* Foglalás Doboz (Glassmorphism / Fehér áttetsző doboz) */
.booking-box {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.booking-box h3 {
  font-size: 14px;
  letter-spacing: 1px;
  color: #1a202c;
  margin-bottom: 15px;
  font-weight: 700;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  color: #333;
  outline: none;
}

.form-group select:focus,
.form-group input:focus {
  border-color: #ff6b5b;
}

.filter-error-text {
  font-size: 12px;
  color: #e53e3e;
  margin-top: 5px;
  margin-bottom: 5px;
}

.btn-book {
  width: 100%;
  background-color: #ff6b5b;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.2s;
}

.btn-book:hover {
  background-color: #e55342;
}

/* Alsó kártyák */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  padding: 40px 50px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.feature-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #1a202c;
  font-weight: 700;
}

.feature-card p {
  font-size: 14px;
  color: #718096;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .hero {
    padding: 30px 20px;
  }
  .hero-text-card h1 {
    font-size: 32px;
  }
  .features {
    padding: 30px 20px;
  }
}
</style>

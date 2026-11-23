<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { studentApi } from '@/api/student.api';

const router = useRouter();
const authStore = useAuthStore();

const availableLessons = ref([]);
const selectedSubject = ref('Matematika');
const selectedTeacher = ref('Kovács István');
const isLoadingLessons = ref(false);

const defaultSubjects = ['Matematika', 'Fizika', 'Angol', 'Informatika', 'Kémia', 'Történelem'];
const defaultTeachers = ['Kovács István', 'Tóth Erzsébet', 'Horváth Péter'];

onMounted(async () => {
  if (authStore.isStudent) {
    try {
      isLoadingLessons.value = true;
      const res = await studentApi.getFreeLessons();
      availableLessons.value = res.data || [];
    } catch (err) {
      console.warn('Szabad órák betöltése a landing page-en sikertelen:', err);
    } finally {
      isLoadingLessons.value = false;
    }
  }
});

const subjectsList = computed(() => {
  if (availableLessons.value.length > 0) {
    const set = new Set(availableLessons.value.map((l) => l.tantargy));
    return Array.from(set);
  }
  return defaultSubjects;
});

const teachersList = computed(() => {
  if (availableLessons.value.length > 0) {
    const set = new Set(
      availableLessons.value
        .map((l) => l.Teacher?.tanar_nev)
        .filter(Boolean)
    );
    return Array.from(set);
  }
  return defaultTeachers;
});

function handleBookingSubmit() {
  if (!authStore.isAuthenticated) {
    router.push({
      name: 'login',
      query: { message: 'Időpont foglalásához kérjük, jelentkezz be fiókodba!' }
    });
    return;
  }

  if (authStore.isStudent) {
    router.push({
      name: 'student-lessons',
      query: {
        subject: selectedSubject.value || undefined,
        teacher: selectedTeacher.value || undefined
      }
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
        <!-- Bal oldal: Szöveg és Foglaló Űrlap -->
        <div class="hero-text-card">
          <h1>Találd Meg A Tökéletes Magántanárod!</h1>
          <p>Személyre szabott magánórák minden tantárgyból. Foglalj időpontot egyszerűen és gyorsan online!</p>

          <!-- Foglalás Doboz -->
          <div class="booking-box">
            <h3>FOGLALJ IDŐPONTOT MOST</h3>
            <form @submit.prevent="handleBookingSubmit">
              <div class="form-group">
                <label for="subject-select">Válassz tantárgyat:</label>
                <select id="subject-select" v-model="selectedSubject">
                  <option v-for="subj in subjectsList" :key="subj" :value="subj">
                    {{ subj }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="teacher-select">Válassz tanárt:</label>
                <select id="teacher-select" v-model="selectedTeacher">
                  <option v-for="teach in teachersList" :key="teach" :value="teach">
                    {{ teach }}
                  </option>
                </select>
              </div>

              <button type="submit" class="btn-book">IDŐPONT FOGLALÁSA</button>
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
  opacity: 95%;
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

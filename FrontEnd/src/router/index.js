import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  // Publikus útvonalak
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/public/LandingView.vue'),
    meta: { title: 'Főoldal' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/public/LoginView.vue'),
    meta: { guestOnly: true, title: 'Bejelentkezés' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/public/RegisterView.vue'),
    meta: { guestOnly: true, title: 'Diák regisztráció' }
  },

  // Diák útvonalak
  {
    path: '/student',
    name: 'student-lessons',
    component: () => import('@/views/student/StudentLessonsView.vue'),
    meta: { requiresAuth: true, role: 'student', title: 'Szabad órák keresése' }
  },
  {
    path: '/student/my-bookings',
    name: 'student-bookings',
    component: () => import('@/views/student/StudentBookingsView.vue'),
    meta: { requiresAuth: true, role: 'student', title: 'Saját foglalásaim' }
  },
  {
    path: '/student/notifications',
    name: 'student-notifications',
    component: () => import('@/views/shared/NotificationsView.vue'),
    meta: { requiresAuth: true, role: 'student', title: 'Értesítések' }
  },
  {
    path: '/student/profile',
    name: 'student-profile',
    component: () => import('@/views/student/StudentProfileView.vue'),
    meta: { requiresAuth: true, role: 'student', title: 'Profil beállítások' }
  },

  // Tanár útvonalak
  {
    path: '/teacher',
    name: 'teacher-lessons',
    component: () => import('@/views/teacher/TeacherLessonsView.vue'),
    meta: { requiresAuth: true, role: 'teacher', title: 'Óráim kezelése' }
  },
  {
    path: '/teacher/new-lesson',
    name: 'teacher-new-lesson',
    component: () => import('@/views/teacher/TeacherNewLessonView.vue'),
    meta: { requiresAuth: true, role: 'teacher', title: 'Új óra meghirdetése' }
  },
  {
    path: '/teacher/stats',
    name: 'teacher-stats',
    component: () => import('@/views/teacher/TeacherStatsView.vue'),
    meta: { requiresAuth: true, role: 'teacher', title: 'Tanári statisztika' }
  },
  {
    path: '/teacher/notifications',
    name: 'teacher-notifications',
    component: () => import('@/views/shared/NotificationsView.vue'),
    meta: { requiresAuth: true, role: 'teacher', title: 'Értesítések' }
  },

  // Adminisztrátor útvonalak
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true, role: 'admin', title: 'Adminisztrációs felület' }
  },
  {
    path: '/admin/teachers',
    name: 'admin-teachers',
    component: () => import('@/views/admin/AdminTeachersView.vue'),
    meta: { requiresAuth: true, role: 'admin', title: 'Tanárok listája' }
  },
  {
    path: '/admin/students',
    name: 'admin-students',
    component: () => import('@/views/admin/AdminStudentsView.vue'),
    meta: { requiresAuth: true, role: 'admin', title: 'Diákok listája' }
  },
  {
    path: '/admin/lessons',
    name: 'admin-lessons',
    component: () => import('@/views/admin/AdminLessonsView.vue'),
    meta: { requiresAuth: true, role: 'admin', title: 'Foglalt órák' }
  },
  {
    path: '/admin/teachers/:id',
    name: 'admin-teacher-detail',
    component: () => import('@/views/admin/AdminUserDetailView.vue'),
    props: (route) => ({ id: route.params.id, type: 'teacher' }),
    meta: { requiresAuth: true, role: 'admin', title: 'Tanár adatlap' }
  },
  {
    path: '/admin/students/:id',
    name: 'admin-student-detail',
    component: () => import('@/views/admin/AdminUserDetailView.vue'),
    props: (route) => ({ id: route.params.id, type: 'student' }),
    meta: { requiresAuth: true, role: 'admin', title: 'Diák adatlap' }
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/shared/NotFoundView.vue'),
    meta: { title: '404 - Az oldal nem található' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

// Szerepkör szerinti alapértelmezett kezdőoldal
function getDefaultRouteForRole(role) {
  switch (role) {
    case 'student':
      return { name: 'student-lessons' };
    case 'teacher':
      return { name: 'teacher-lessons' };
    case 'admin':
      return { name: 'admin-dashboard' };
    default:
      return { name: 'landing' };
  }
}

// Navigációs őr (Router Guards)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.role;

  // Cím beállítása
  document.title = to.meta.title ? `${to.meta.title} - TDI` : 'TDI - Tanár-Diák-Interface';

  // Ha csak vendégeknek szól (login, register), de már be van lépve
  if (to.meta.guestOnly && isAuthenticated) {
    return next(getDefaultRouteForRole(userRole));
  }

  // Ha védelem szükséges
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    // Ha szerepkörhöz kötött, és nem egyezik
    if (to.meta.role && to.meta.role !== userRole) {
      return next(getDefaultRouteForRole(userRole));
    }
  }

  next();
});

export default router;

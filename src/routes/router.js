import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '../components/LoginView.vue';
import DashboardView from '../components/DashboardView.vue';

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  { 
    path: '/', 
    name: 'dashboard', 
    component: DashboardView, 
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next({ name: 'login' });
  } else if ((to.name === 'login' || to.path === '/login') && token) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;

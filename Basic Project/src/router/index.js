import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import IndexView from '@/views/IndexView.vue'

const routes = [
  { path: '/', redirect: { name: 'login' } },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/index', name: 'index', component: IndexView, meta: { requiresAuth: true } },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authed = !!localStorage.getItem('token')
  if (to.meta.requiresAuth && !authed) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router



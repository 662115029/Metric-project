import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import IndexView from '@/views/IndexView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import CartView from '@/views/CartView.vue'
import GameListView from '@/views/GameListView.vue'
import libraryView from '@/views/libraryView.vue'
import HelpView from '@/views/HelpView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import AdminLoginView from '@/views/AdminLoginView.vue'

const routes = [
  { path: '/', redirect: { name: 'login' } },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/index', name: 'index', component: IndexView, meta: { requiresAuth: true } },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
  { path: '/categories', name: 'categories', component: CategoriesView },
  { path: '/cart', name: 'cart', component: CartView },
  { path: '/gamelist', name: 'gamelist', component: GameListView },
  { path: '/library', name: 'library', component: libraryView },
  { path: '/help', name: 'help', component: HelpView },
  { path: '/forgot-link', name: 'forgot-link', component: ForgotPasswordView },

  // --- admin ---
  { path: '/admin/login', name: 'adminlogin', component: AdminLoginView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// guards
router.beforeEach((to, _from, next) => {
  const authed = !!localStorage.getItem('token')
  const adminAuthed = !!localStorage.getItem('adminToken')

  if (to.meta.requiresAuth && !authed) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }
  if (to.meta.requiresAdmin && !adminAuthed) {
    return next({ name: 'adminlogin', query: { redirect: to.fullPath } })
  }
  next()
})

export default router



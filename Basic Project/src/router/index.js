import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import IndexView from '@/views/IndexView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import CartView from '@/views/CartView.vue'
import GameListView from '@/views/GameListView.vue'
import libraryView from '@/views/libraryView.vue'
import HelpView from '@/views/HelpView.vue'

const routes = [
  { path: '/', redirect: { name: 'login' } },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/index', name: 'index', component: IndexView, meta: { requiresAuth: true } },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
  { path: '/categories', name: 'categories', component: CategoriesView },
  { path: '/cart', name: 'cart', component: CartView },
  { path: '/gamelist', name: 'gamelist', component: GameListView },
  { path: '/library', name: 'library', component: libraryView },
  { path: '/help', name: 'help', component: HelpView }
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



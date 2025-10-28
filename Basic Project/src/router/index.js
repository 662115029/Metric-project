import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import AdminLayout from '@/components/layouts/AdminLayout.vue'
import LoginView from '@/views/LoginView.vue'
import IndexView from '@/views/IndexView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import CartView from '@/views/CartView.vue'
import GameListView from '@/views/GameListView.vue'
import libraryView from '@/views/libraryView.vue'
import HelpView from '@/views/HelpView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import AdminLoginView from '@/adminviews/AdminLoginView.vue'
import DashboardView from '@/adminviews/DashboardView.vue'
import AddGameView from '@/adminviews/AddGameView.vue'
import AddCategoryView from '@/adminviews/AddCategoryView.vue'
import CategoryManagementView from '@/adminviews/CategoryManagementView.vue'
import GameManagementView from '@/adminviews/GameManagementView.vue'
import UpdateCategoryView from '@/adminviews/UpdateCategoryView.vue'
import UpdateGameView from '@/adminviews/UpdateGameView.vue'

const routes = [
  { path: '/', redirect: { name: 'login' } },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
  { path: '/forgot-link', name: 'forgot-link', component: ForgotPasswordView },
  // --- User ---
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '/index', name: 'index', component: IndexView, meta: { requiresAuth: true } },
      { path: '/categories', name: 'categories', component: CategoriesView },
      { path: '/cart', name: 'cart', component: CartView },
      { path: '/gamelist', name: 'gamelist', component: GameListView },
      { path: '/library', name: 'library', component: libraryView },
      { path: '/help', name: 'help', component: HelpView },
    ],
  },

{ path: '/admin/login', name: 'adminlogin', component: AdminLoginView },
{
  path: '/admin/adminviews',
  component: AdminLayout, // Navbar แอดมินจะโชว์ให้ทุกหน้าภายใต้ /admin/adminviews โดยอัตโนมัติ
  meta: { requiresAdmin: true },
  children: [
    { path: 'dashboard', name: 'admindashboard', component: DashboardView },
    { path: 'GameManagement', name: 'GameManagement', component: GameManagementView },
    { path: 'AddGame', name: 'AddGame', component: AddGameView },
    { path: 'CategoryManagement', name: 'CategoryManagement', component: CategoryManagementView },
    { path: 'AddCategory', name: 'AddCategory', component: AddCategoryView },
    { path: 'UpdateCategory', name: 'UpdateCategory', component: UpdateCategoryView },
    { path: 'UpdateGame', name: 'UpdateGame', component: UpdateGameView },
  ],
},
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



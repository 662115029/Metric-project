import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'

const routes = [
  { path: '/', name: 'login', component: LoginView },
]

export default createRouter({
  history: createWebHistory(), // หรือ createWebHistory(import.meta.env.BASE_URL)
  routes,
})

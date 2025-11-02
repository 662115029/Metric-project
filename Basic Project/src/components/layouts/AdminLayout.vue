<template>
  <div class="min-h-screen bg-gray-900 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 shadow-lg flex flex-col">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-white mb-8">
          🎮 Admin Panel
        </h2>

        <nav class="space-y-2">
          <RouterLink 
            :to="{ name: 'admindashboard' }" 
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
            active-class="bg-blue-600 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </RouterLink>

          <RouterLink 
            :to="{ name: 'GameManagement' }" 
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
            active-class="bg-blue-600 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Manage Games</span>
          </RouterLink>

          <RouterLink 
            :to="{ name: 'AddGame' }" 
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
            active-class="bg-blue-600 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Game</span>
          </RouterLink>

          <RouterLink 
            :to="{ name: 'CategoryManagement' }" 
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
            active-class="bg-blue-600 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Manage Categories</span>
          </RouterLink>

          <RouterLink 
            :to="{ name: 'AddCategory' }" 
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
            active-class="bg-blue-600 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Category</span>
          </RouterLink>
        </nav>
      </div>

      <!-- Logout Button at Bottom -->
      <div class="mt-auto p-6">
        <button 
          @click="handleLogout"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <!-- Top Bar -->
      <header class="bg-gray-800 shadow-lg">
        <div class="px-6 py-4 flex justify-between items-center">
          <h1 class="text-xl font-semibold text-white">
            {{ pageTitle }}
          </h1>
          
          <div class="flex items-center space-x-4">
            <span class="text-gray-400">Admin: {{ adminUsername }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authAPI } from '@/services/api'

const router = useRouter()
const route = useRoute()

const adminUsername = computed(() => {
  return localStorage.getItem('username') || 'Admin'
})

const pageTitle = computed(() => {
  const titles = {
    'admindashboard': 'Dashboard',
    'GameManagement': 'Game Management',
    'AddGame': 'Add New Game',
    'CategoryManagement': 'Category Management',
    'AddCategory': 'Add New Category',
    'UpdateCategory': 'Update Category',
    'UpdateGame': 'Update Game'
  }
  return titles[route.name] || 'Admin Panel'
})

const handleLogout = async () => {
  try {
    await authAPI.logout()
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    router.push({ name: 'adminlogin' })
  }
}
</script>

<style scoped>
/* Ensure sidebar stays fixed and content scrolls */
aside {
  position: sticky;
  top: 0;
  height: 100vh;
}
</style>
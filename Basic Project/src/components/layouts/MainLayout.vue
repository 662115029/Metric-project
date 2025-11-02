<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Main Navigation -->
    <nav class="bg-gray-800 shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex items-center">
            <RouterLink :to="{ name: 'index' }" class="text-2xl font-bold text-white">
              🎮 GameStore
            </RouterLink>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex space-x-6">
            <RouterLink 
              :to="{ name: 'index' }" 
              class="text-gray-300 hover:text-white transition"
              active-class="text-white font-semibold"
            >
              Home
            </RouterLink>
            <RouterLink 
              :to="{ name: 'categories' }" 
              class="text-gray-300 hover:text-white transition"
              active-class="text-white font-semibold"
            >
              Categories
            </RouterLink>
            <RouterLink 
              :to="{ name: 'gamelist' }" 
              class="text-gray-300 hover:text-white transition"
              active-class="text-white font-semibold"
            >
              Games
            </RouterLink>
            <RouterLink 
              :to="{ name: 'library' }" 
              class="text-gray-300 hover:text-white transition"
              active-class="text-white font-semibold"
            >
              Library
            </RouterLink>
            <RouterLink 
              :to="{ name: 'help' }" 
              class="text-gray-300 hover:text-white transition"
              active-class="text-white font-semibold"
            >
              Help
            </RouterLink>
          </div>

          <!-- Right side buttons -->
          <div class="flex items-center space-x-4">
            <!-- Cart Button -->
            <RouterLink 
              :to="{ name: 'cart' }" 
              class="relative text-gray-300 hover:text-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span v-if="cartCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ cartCount }}
              </span>
            </RouterLink>

            <!-- User Menu -->
            <div class="relative">
              <button 
                @click="toggleUserMenu" 
                class="flex items-center space-x-2 text-gray-300 hover:text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{{ username }}</span>
              </button>

              <!-- Dropdown Menu -->
              <div 
                v-if="showUserMenu" 
                class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-2 z-50"
              >
                <RouterLink 
                  :to="{ name: 'library' }" 
                  class="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                  @click="closeUserMenu"
                >
                  My Library
                </RouterLink>
                <button 
                  @click="handleLogout" 
                  class="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Logout
                </button>
              </div>
            </div>

            <!-- Mobile Menu Button -->
            <button 
              @click="toggleMobileMenu" 
              class="md:hidden text-gray-300 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div v-if="showMobileMenu" class="md:hidden py-4 space-y-2">
          <RouterLink 
            :to="{ name: 'index' }" 
            class="block text-gray-300 hover:text-white py-2"
            @click="closeMobileMenu"
          >
            Home
          </RouterLink>
          <RouterLink 
            :to="{ name: 'categories' }" 
            class="block text-gray-300 hover:text-white py-2"
            @click="closeMobileMenu"
          >
            Categories
          </RouterLink>
          <RouterLink 
            :to="{ name: 'gamelist' }" 
            class="block text-gray-300 hover:text-white py-2"
            @click="closeMobileMenu"
          >
            Games
          </RouterLink>
          <RouterLink 
            :to="{ name: 'library' }" 
            class="block text-gray-300 hover:text-white py-2"
            @click="closeMobileMenu"
          >
            Library
          </RouterLink>
          <RouterLink 
            :to="{ name: 'help' }" 
            class="block text-gray-300 hover:text-white py-2"
            @click="closeMobileMenu"
          >
            Help
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-400 py-6 mt-12">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2025 GameStore. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/services/api'

const router = useRouter()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const cartCount = ref(0)

const username = computed(() => {
  return localStorage.getItem('username') || 'User'
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const handleLogout = async () => {
  try {
    await authAPI.logout()
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    router.push({ name: 'login' })
  }
}

// Close dropdowns when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showUserMenu.value = false
    }
  })
})
</script>

<style scoped>
/* Custom styles if needed */
</style>

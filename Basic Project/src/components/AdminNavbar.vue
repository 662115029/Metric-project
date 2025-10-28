<template>
  <nav class="navbar">
    <button
      class="menu-toggle"
      id="mobile-menu"
      @click="isOpen = !isOpen"
      aria-label="Toggle navigation"
      :aria-expanded="isOpen"
    >
      <span class="bar"></span><span class="bar"></span><span class="bar"></span>
    </button>

    <ul class="nav-links" :class="{ active: isOpen }">
      <!-- Game Management -->
      <li class="dropdown" @mouseenter="hover('game', true)" @mouseleave="hover('game', false)">
        <router-link :to="{ name: 'GameManagement' }">Game Management ▾</router-link>
        <ul class="dropdown-menu" :class="{ show: (isOpen && isMobile) || openDropdown === 'game' }">
          <li><router-link :to="{ name: 'AddGame' }">Add Games</router-link></li>
          <li><router-link :to="{ name: 'UpdateGame' }">Update Games</router-link></li>
        </ul>
      </li>

      <!-- Category Management -->
      <li class="dropdown" @mouseenter="hover('cat', true)" @mouseleave="hover('cat', false)">
        <router-link :to="{ name: 'CategoryManagement' }">Category Management ▾</router-link>
        <ul class="dropdown-menu" :class="{ show: (isOpen && isMobile) || openDropdown === 'cat' }">
          <!-- ชื่อ route ตามที่ให้มาเป๊ะ ๆ -->
          <li><router-link :to="{ name: 'AddCategory' }">Add Category</router-link></li>
          <li><router-link :to="{ name: 'UpdateCategory' }">Update Category</router-link></li>
        </ul>
      </li>

      <li>
        <button type="button" @click="logoutAdmin">Logout</button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isOpen = ref(false)
const openDropdown = ref('')

const isMobile = computed(() => window.innerWidth <= 768)

function hover(which, state) {
  if (!isMobile.value) openDropdown.value = state ? which : ''
}

function handleResize() {
  if (!isMobile.value) isOpen.value = false
  openDropdown.value = ''
}

onMounted(() => window.addEventListener('resize', handleResize))
onBeforeUnmount(() => window.removeEventListener('resize', handleResize))

function logoutAdmin() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminProfile')
  router.replace({ name: 'adminlogin' })
}
</script>


<style scoped>
.navbar {
  padding: 20px 60px 20px 60px;
  margin-bottom: 10px;
  background-color: #281616;
}

.nav-links {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
}

.nav-links li {
  margin: 0 15px;
  position: relative;
}

.nav-links li a,
button {
  color: white;
  text-decoration: none;
  font-size: 18px;
  padding: 15px 15px;
  display: inline-block;
  transition: all 0.3s ease;
  background-color: #333;
  border-radius: 15px;
}

.nav-links li a:hover {
  background-color: #777;
  transform: translateY(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

button {
  border-style: none;
}

/* Dropdown Menu */
.dropdown-menu {
  display: none;
  position: absolute;
  background-color: #444;
  list-style: none;
  padding: 20px 5px;
  min-width: 200px;
  top: 100%;
  left: 0;
  border-radius: 15px;
  z-index: 600;
}

.dropdown-menu li {
  display: block;
  text-align: left;
  margin-bottom: 10px;
}

.dropdown-menu li a {
  display: block;
  padding: 10px;
  color: white;
  margin-bottom: 30px;
}

.dropdown-menu li a:hover {
  background-color: #666;
}

button:hover {
  background-color: #666;
}

/* Hover show for desktop */
.dropdown:hover .dropdown-menu {
  display: block;
}

/* Mobile Menu Styles */
.menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  background: transparent;
  border: none;
}

.menu-toggle .bar {
  width: 30px;
  height: 3px;
  background-color: white;
  margin: 5px 0;
}

@media screen and (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }
  .nav-links {
    display: none;
    flex-direction: column;
    width: 100%;
  }
  .nav-links.active {
    display: flex;
  }
  .dropdown-menu {
    position: relative;
  }
  .dropdown-menu.show {
    display: block;
  }
}
</style>
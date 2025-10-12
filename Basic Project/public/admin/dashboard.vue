<template>
  <div class="admin-container">
    <h1>Admin Dashboard</h1>
    <div class="admin-buttons">
      <!-- If using Vue Router, set USE_ROUTER = true below -->
      <button @click="goTo('game')">Game Management</button>
      <button @click="goTo('category')">Category Management</button>
      <button @click="logoutAdmin">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
// Toggle this if you use Vue Router
const USE_ROUTER = false
// import { useRouter } from 'vue-router'
// const router = useRouter()

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

onMounted(() => {
  const token = localStorage.getItem('adminToken')
  if (!token) {
    // If you use router: router.replace({ name: 'AdminLogin' })
    window.location.href = '../admin-login.html'
  }
})

function goTo(where) {
  if (USE_ROUTER) {
    // Map to your route names/paths
    // const map = { game: { name: 'GameManagement' }, category: { name: 'CategoryManagement' } }
    // router.push(map[where])
  } else {
    const map = {
      game: 'game-management.html',
      category: 'category-management.html',
    }
    window.location.href = map[where]
  }
}

function logoutAdmin() {
  // Use the same keys across the app for consistency
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminProfile')
  // If router is used: router.replace({ name: 'AdminLogin' })
  window.location.href = '../admin-login.html'
}
</script>

<style scoped>
:root { color-scheme: dark; }
body {
  background-color: #250101;
  margin: 0;
}

.admin-container {
  background-color: #250101;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
}

h1 {
  font-size: 40px;
  color: white;
  margin-bottom: 20px;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}

.admin-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 400px;
}

button {
  background-color: white;
  padding: 15px 20px;
  font-size: 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: background-color 0.1s ease-in-out, transform 0.15s ease;
}

button:hover {
  background-color: #d1d1d1;
  transform: scale(1.05) translateY(-3px);
}

@media screen and (max-width: 600px) {
  h1 { font-size: 28px; }
  button { font-size: 18px; padding: 12px; }
}
</style>

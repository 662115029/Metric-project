<template>
  <div class="admin-container">
    <h1>Admin Dashboard</h1>
    <div class="admin-buttons">
      <button @click="goTo('game')">Game Management</button>
      <button @click="goTo('category')">Category Management</button>
      <button @click="logoutAdmin">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const token = localStorage.getItem('adminToken')
  if (!token) {
    router.replace({ name: 'adminlogin' })
  }
})

function goTo(where) {
  // map ให้ตรงกับชื่อ route ใน router ของคุณ
  const map = {
    game: { name: 'GameManagement' },      // path: /admin/GameManagement
    category: { name: 'CategoryManagement' } 
  }
  router.push(map[where])
}

function logoutAdmin() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminProfile')
  router.replace({ name: 'adminlogin' })
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
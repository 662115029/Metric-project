<template>
  <div class="login-page">
    <div class="login-container">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin" id="loginForm">
        <input type="text" v-model="username" id="loginUsername" placeholder="Username" required />
        <input type="password" v-model="password" id="loginPassword" placeholder="Password" required />
        <button type="submit">Login</button>
        <button type="button" @click="goToRegister" id="goToRegister">Register</button>
        <RouterLink class="forgot-link" :to="{ name: 'forgot-link' }">Forgot email/password?</RouterLink>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')

// ตัวอย่างเงื่อนไขที่รองรับหลายรูปแบบ
const SPECIAL_ADMIN_CODES = ['#root', '#admin', '9999']
const isAdminId = (u) => {
  const s = (u || '').trim()
  return s.startsWith('admin:') || SPECIAL_ADMIN_CODES.includes(s)
}

const handleLogin = async () => {
  // ถ้าเป็นไอดี/รหัสพิเศษ → ไปหน้า AdminLogin ทันที
  if (isAdminId(username.value)) {
    router.push({ name: 'adminlogin', query: { from: 'login' } })
    return
  }

  // …ลอจิกล็อกอินผู้ใช้ทั่วไป…
  // ตัวอย่างจำลอง:
  localStorage.setItem('token', 'dummy-token')
  const redirect = route.query.redirect?.toString()
  router.push(redirect || { name: 'index' })
}
</script>


<style scoped>
/* สไตล์ของหน้า login ตามต้องการ */
</style>

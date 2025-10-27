<template>
  <div class="login-page">
    <div class="login-container">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin" id="loginForm">
        <input type="text" v-model="username" id="loginUsername" placeholder="Username" required />
        <input type="password" v-model="password" id="loginPassword" placeholder="Password" required />
        <button type="submit">Login</button>
        <button type="button" @click="goToRegister" id="goToRegister">Register</button>
        <RouterLink class="forgot-link" :to="{ name: 'register' }">Forgot email/password?</RouterLink>
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

const handleLogin = async () => {
  // TODO: เรียก API จริง
  localStorage.setItem('token', 'dummy-token')

  const redirect = route.query.redirect?.toString()
  router.push(redirect || { name: 'index' })
}

const goToRegister = () => {
  router.push({ name: 'register' })
}
</script>

<style scoped>
/* สไตล์ของหน้า login ตามต้องการ */
</style>

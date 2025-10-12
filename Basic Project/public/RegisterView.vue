<template>
  <div class="login-container">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <input type="text" v-model="username" placeholder="Username" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Register</button>
      <button type="button" @click="goToLogin">Back to Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const router = useRouter()

const register = () => {
  console.log('Registering user:', username.value, password.value)
  // logic for the registraction thing but idk what to put here cause it wasnt really in the og code. so imma just leave this blank
}

const goToLogin = () => {
  router.push('/login')
}
</script>
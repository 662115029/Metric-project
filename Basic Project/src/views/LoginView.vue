<template>
  <div class="login-page">
    <div class="login-container">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin" id="loginForm">
        <input
          type="text"
          v-model="username"
          id="loginUsername"
          placeholder="Username"
          required
        />
        <input
          type="password"
          v-model="password"
          id="loginPassword"
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        <button type="button" @click="goToRegister" id="goToRegister">
          Register
        </button>
        <a href="forgot-password.html" class="forgot-link"
          >Forgot email/password?</a
        >
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"

// Reactive form data
const username = ref("")
const password = ref("")

// Handle login submit
const handleLogin = () => {
  // You can call your old JS function here, or implement directly
  // For example, if authentication.js exposes login():
  if (window.login) {
    window.login(username.value, password.value)
  } else {
    console.log("Login attempted:", username.value, password.value)
  }
}

// Navigate to register page
const goToRegister = () => {
  // If you have a route, use router.push; otherwise use window.location
  window.location.href = "register.html"
}
</script>
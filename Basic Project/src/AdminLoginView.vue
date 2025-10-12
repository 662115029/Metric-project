<template>
  <div class="login-page">
    <div class="admin-login-container">
      <h2>Admin Login</h2>
      <form @submit.prevent="onSubmit" id="adminLoginForm">
        <input
          id="adminUsername"
          type="text"
          v-model.trim="username"
          placeholder="Username"
          autocomplete="username"
          required
        />
        <input
          id="adminPassword"
          :type="showPass ? 'text' : 'password'"
          v-model="password"
          placeholder="Password"
          autocomplete="current-password"
          required
        />
        <label class="show-pass">
          <input type="checkbox" v-model="showPass" /> Show password
        </label>
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Logging in…' : 'Login' }}
        </button>
      </form>
      <p id="adminLoginError" :class="{ error: !!error }">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// If you use Vue Router, uncomment and use it to navigate after login
// import { useRouter } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

const username = ref('')
const password = ref('')
const showPass = ref(false)
const isSubmitting = ref(false)
const error = ref('')

// const router = useRouter()

const onSubmit = async () => {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password.'
    return
  }

  isSubmitting.value = true
  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Login failed')

    // Expect token from server response
    if (!data.token) throw new Error('No token returned from server')

    localStorage.setItem('adminToken', data.token)

    // Optional: also store basic profile if returned
    if (data.admin) localStorage.setItem('adminProfile', JSON.stringify(data.admin))

    // Navigate to admin dashboard or desired page
    // await router.push({ name: 'AdminDashboard' })
    // If you don't use router, you can do a plain redirect:
    // window.location.href = '/admin/index.html'
    alert('Login successful!')
  } catch (e) {
    error.value = e.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Keep your global stylesheet if you have one: ./assets/css/admin-styles.css */
.login-page {
  background-color: #250101;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.admin-login-container {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(to bottom, #ddd 30%, #281616 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}

h2 {
  text-align: center;
  margin: 0 0 4px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input[type="text"],
input[type="password"],
input[type="email"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.show-pass {
  color: #111;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

button[type="submit"] {
  background: #222;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 16px;
  cursor: pointer;
}

button[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

#error,
#error.error,
#adminLoginError.error {
  color: #ffdddd;
  background: rgba(255, 0, 0, 0.18);
  border: 1px solid rgba(255, 0, 0, 0.35);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 4px 0 0;
  word-break: break-word;
}
</style>
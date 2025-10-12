<template>
  <div class="login-page">
    <div class="login-container">
      <h2>Register</h2>
      <form @submit.prevent="register">
        <input
          type="text"
          v-model="username"
          placeholder="Username"
          required
        />
        <input
          type="password"
          v-model="password"
          placeholder="Password"
          required
        />
        <button type="submit">Register</button>
        <button type="button" @click="goToLogin">Back to Login</button>
      </form>
      <div v-if="message" :style="{ color: messageColor, marginTop: '15px' }">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RegisterView",
  data() {
    return {
      username: "",
      password: "",
      message: "",
      messageColor: "green",
    };
  },
  methods: {
    async register() {
      this.message = "";
      try {
        // Replace with your actual API endpoint
        const response = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          this.message = "Registration successful! Redirecting to login...";
          this.messageColor = "green";
          setTimeout(() => {
            this.goToLogin();
          }, 1500);
        } else {
          this.message = data.message || "Registration failed.";
          this.messageColor = "red";
        }
      } catch (err) {
        this.message = "Network error. Please try again.";
        this.messageColor = "red";
      }
    },
    goToLogin() {
      // If using Vue Router:
      this.$router.push("/login");
      // If not using Vue Router, use: window.location.href = '/login.html'
    },
  },
};
</script>
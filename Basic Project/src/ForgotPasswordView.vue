//* im not sure abt this one most of the css is from the css page but it needs to be turned to tailwind so idk *//


<template>
  <div class="login-page">
    <div class="login-container">
      <h2>Forgot Password</h2>
      <form @submit.prevent="submitForm">
        <input
          type="email"
          v-model="email"
          placeholder="Enter your email"
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      <div v-if="message" :style="{ color: messageColor, marginTop: '15px' }">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ForgotPasswordView",
  data() {
    return {
      email: "",
      message: "",
      messageColor: "green",
    };
  },
  methods: {
    async submitForm() {
      this.message = "";
      try {
        // Replace with your actual API endpoint
        const response = await fetch("http://localhost:3000/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email }),
        });
        const data = await response.json();
        if (response.ok) {
          this.message = "If this email exists, a reset link has been sent.";
          this.messageColor = "green";
        } else {
          this.message = data.message || "An error occurred.";
          this.messageColor = "red";
        }
      } catch (err) {
        this.message = "Network error. Please try again.";
        this.messageColor = "red";
      }
    },
  },
};
</script>
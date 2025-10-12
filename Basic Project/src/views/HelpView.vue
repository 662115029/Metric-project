<!--
**********************************************************************************
THIS PAGE MUST INCLUDE:
**********************************************************************************
 - An address!
 - Use of a map API to pin the location of the shop specified by the listed
   address!
 - A form box for customers to send an email to the shop!
**********************************************************************************
-->
<template>
  <div>
    <!-- Navbar -->
    <div id="navbar-container"></div>

    <div class="container">
      <h2 style="color: white;">Contact Us</h2>
      <p style="color: white;">
        We'd love to hear from you! Use the form below to get in touch or visit us at our store.
      </p>

      <div class="contact-grid">
        <!-- Contact Info -->
        <div class="contact-info">
          <h3>Store Address</h3>
          <div class="info-item">
            <i class="fas fa-map-marker-alt"></i>
            <p>
              1201 Mason St<br />
              Gaming District<br />
              San Francisco, CA 94108
            </p>
          </div>

          <div class="info-item">
            <i class="fas fa-phone"></i>
            <p>(830) 476-5664</p>
          </div>

          <div class="info-item">
            <i class="fas fa-envelope"></i>
            <p>support@gamestore.com</p>
          </div>

          <div class="info-item">
            <i class="fas fa-clock"></i>
            <p>
              Monday - Friday: 9am - 4pm<br />
              Saturday: 1am - 4pm<br />
              Sunday: Closed
            </p>
          </div>

          <div class="map-container">
            <div id="map"></div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="contact-form">
          <h3>Send us a message!</h3>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="name">Name</label>
              <input type="text" id="name" v-model="form.name" required />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="form.email" required />
            </div>

            <div class="form-group">
              <label for="subject">Subject</label>
              <input type="text" id="subject" v-model="form.subject" required />
            </div>

            <div class="form-group">
              <label for="message">Message</label>
              <textarea id="message" v-model="form.message" required></textarea>
            </div>

            <button type="submit">Send Message</button>

            <div
              class="success-message"
              v-show="successMessage"
            >
              {{ successMessage }}
            </div>

            <div
              class="error-message"
              v-show="errorMessage"
            >
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Form state
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const successMessage = ref('')
const errorMessage = ref('')

// Form submission handler
function handleSubmit() {
  successMessage.value = ''
  errorMessage.value = ''

  // Simulate API call
  setTimeout(() => {
    if (form.value.name && form.value.email && form.value.message) {
      successMessage.value = "Your message has been sent successfully! We'll get back to you soon."
      errorMessage.value = ''
      // Clear form
      form.value = { name: '', email: '', subject: '', message: '' }
    } else {
      errorMessage.value = 'Sorry, there was an error sending your message. Please try again later.'
      successMessage.value = ''
    }
  }, 500)
}

// Google Map
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.7917, lng: -122.4074 },
    zoom: 15,
  })

  new google.maps.Marker({
    position: { lat: 37.7917, lng: -122.4074 },
    map,
    title: "Game Store",
  })
}

onMounted(() => {
  // Load navbar if still using old navbar.js
  if (window.loadNavbar) {
    window.loadNavbar()
  }

  // Initialize Google Map after script loads
  if (window.google) {
    initMap()
  } else {
    window.initMap = initMap
  }
})
</script>

<style scoped>
/* Keep all original CSS */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  color: #333;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
header {
  background-color: #2c3e50;
  color: white;
  padding: 20px 0;
  text-align: center;
}
h1,
h2 {
  margin: 0;
}
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 30px;
}
@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
.contact-info,
.contact-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.map-container {
  height: 300px;
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
}
#map {
  height: 100%;
  width: 100%;
}
.info-item {
  margin-bottom: 20px;
}
.info-item i {
  margin-right: 10px;
  color: #3498db;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}
textarea {
  height: 150px;
  resize: vertical;
}
button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #2980b9;
}
.success-message {
  color: #27ae60;
  font-weight: bold;
  margin-top: 15px;
  display: block;
}
.error-message {
  color: #e74c3c;
  font-weight: bold;
  margin-top: 15px;
  display: block;
}
</style>
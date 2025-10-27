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

    <div class="max-w-6xl mx-auto px-5 py-5">
      <h2 class="text-white text-3xl m-0 mb-4">Contact Us</h2>
      <p class="text-white mb-8">
        We'd love to hear from you! Use the form below to get in touch or visit us at our store.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <!-- Contact Info -->
        <div class="bg-white p-8 rounded-lg shadow-md">
          <h3 class="text-xl font-bold mb-6 text-gray-800">Store Address</h3>
          
          <div class="mb-5 flex items-start">
            <i class="fas fa-map-marker-alt mr-2.5 text-blue-500"></i>
            <p class="text-gray-700">
              1201 Mason St<br />
              Gaming District<br />
              San Francisco, CA 94108
            </p>
          </div>

          <div class="mb-5 flex items-start">
            <i class="fas fa-phone mr-2.5 text-blue-500"></i>
            <p class="text-gray-700">(830) 476-5664</p>
          </div>

          <div class="mb-5 flex items-start">
            <i class="fas fa-envelope mr-2.5 text-blue-500"></i>
            <p class="text-gray-700">support@gamestore.com</p>
          </div>

          <div class="mb-5 flex items-start">
            <i class="fas fa-clock mr-2.5 text-blue-500"></i>
            <p class="text-gray-700">
              Monday - Friday: 9am - 4pm<br />
              Saturday: 1am - 4pm<br />
              Sunday: Closed
            </p>
          </div>

          <div class="h-[300px] mt-5 rounded-lg overflow-hidden">
            <div id="map" class="h-full w-full"></div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="bg-white p-8 rounded-lg shadow-md">
          <h3 class="text-xl font-bold mb-6 text-gray-800">Send us a message!</h3>
          <form @submit.prevent="handleSubmit">
            <div class="mb-5">
              <label for="name" class="block mb-1 font-bold text-gray-700">Name</label>
              <input 
                type="text" 
                id="name" 
                v-model="form.name" 
                required 
                class="w-full p-2.5 border border-gray-300 rounded text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="mb-5">
              <label for="email" class="block mb-1 font-bold text-gray-700">Email</label>
              <input 
                type="email" 
                id="email" 
                v-model="form.email" 
                required 
                class="w-full p-2.5 border border-gray-300 rounded text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="mb-5">
              <label for="subject" class="block mb-1 font-bold text-gray-700">Subject</label>
              <input 
                type="text" 
                id="subject" 
                v-model="form.subject" 
                required 
                class="w-full p-2.5 border border-gray-300 rounded text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="mb-5">
              <label for="message" class="block mb-1 font-bold text-gray-700">Message</label>
              <textarea 
                id="message" 
                v-model="form.message" 
                required 
                class="w-full p-2.5 border border-gray-300 rounded text-base h-[150px] resize-y text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button 
              type="submit" 
              class="bg-blue-500 text-white border-none py-3 px-5 rounded cursor-pointer text-base transition-colors duration-300 hover:bg-blue-600"
            >
              Send Message
            </button>

            <div
              class="text-green-600 font-bold mt-4 block"
              v-show="successMessage"
            >
              {{ successMessage }}
            </div>

            <div
              class="text-red-600 font-bold mt-4 block"
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
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  color: #333;
}
</style>
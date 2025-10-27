<template>
  <div>
    <!-- Navbar -->
    <div id="navbar-container"></div>

    <div class="max-w-6xl mx-auto px-5 py-5">
      <h1 class="text-5xl mb-8">Your Shopping Cart</h1>
      <div class="md:flex md:gap-5">
        <!-- Cart Items -->
        <div class="md:flex-[3]">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="bg-neutral-800 mb-5 p-5 rounded flex items-center"
          >
            <img :src="item.image" alt="Game" class="w-30 h-30 mr-5 object-cover" />
            <div class="flex-grow">
              <h3 class="text-xl font-semibold">{{ item.name }}</h3>
              <p class="my-1 text-neutral-400">{{ item.description }}</p>
            </div>
            <div class="text-2xl font-bold ml-auto text-right">${{ item.price.toFixed(2) }}</div>
          </div>

          <div v-if="!cartItems.length" class="text-center">
            <p>Your cart is empty.</p>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="md:flex-[1] mt-5 md:mt-0">
          <div class="flex flex-wrap gap-2">
            <div class="w-[48%] h-20 bg-white rounded flex justify-center items-center">
              <img src="@/assets/images/mastercard.jpg" alt="Mastercard" class="max-w-[80%] max-h-[80%]" />
            </div>
            <div class="w-[48%] h-20 bg-white rounded flex justify-center items-center">
              <img src="@/assets/images/visa.png" alt="Visa" class="max-w-[80%] max-h-[80%]" />
            </div>
            <div class="w-[48%] h-20 bg-white rounded flex justify-center items-center">
              <img src="@/assets/images/paypal.jpg" alt="PayPal" class="max-w-[80%] max-h-[80%]" />
            </div>
            <div class="w-[48%] h-20 bg-white rounded flex justify-center items-center">
              <img src="@/assets/images/google_pay.jpg" alt="Google Pay" class="max-w-[80%] max-h-[80%]" />
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="bg-neutral-800 p-5 rounded mb-5 mt-5">
        <div class="text-2xl font-bold mb-2">
          Total: $<span>{{ totalPrice.toFixed(2) }}</span>
        </div>
        <div class="text-neutral-400 mb-5">
          You may be taxed depending on which payment method selected
        </div>
        <button class="bg-red-950 text-white border-none py-4 px-6 text-base cursor-pointer rounded mb-5 w-full hover:bg-red-900" @click="proceedToPayment">Continue To Payment</button>
        <button class="bg-red-950 text-white border-none py-4 px-6 text-base cursor-pointer rounded mb-5 w-full hover:bg-red-900" @click="clearCart">Remove All Items</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Sample cart data (you can replace this with Pinia or localStorage)
const cartItems = ref([
  { id: 1, name: 'Elden Ring', description: 'Action RPG', price: 59.99, image: 'assets/images/eldenring.jpg' },
  { id: 2, name: 'Hollow Knight', description: 'Metroidvania Adventure', price: 14.99, image: 'assets/images/hollowknight.jpg' },
])

const totalPrice = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.price, 0)
)

function clearCart() {
  cartItems.value = []
}

function proceedToPayment() {
  alert('Proceeding to payment...')
}

// Optional: Mount navbar JS if you're still using your old navbar.js script
onMounted(() => {
  if (window.loadNavbar) {
    window.loadNavbar()
  }
})
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
  background-color: #2a0808;
  color: white;
  margin: 0;
  padding: 0;
}
</style>
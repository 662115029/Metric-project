<template>
  <div>
    <!-- Navbar -->
    <div id="navbar-container"></div>

    <div class="container">
      <h1>Your Shopping Cart</h1>
      <div class="cart-container">
        <!-- Cart Items -->
        <div class="cart-main">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="cart-item"
          >
            <img :src="item.image" alt="Game" class="item-image" />
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
            </div>
            <div class="item-price">${{ item.price.toFixed(2) }}</div>
          </div>

          <div v-if="!cartItems.length" class="text-center">
            <p>Your cart is empty.</p>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="cart-sidebar">
          <div class="payment-methods">
            <div class="payment-method">
              <img src="assets/images/mastercard.jfif" alt="Mastercard" />
            </div>
            <div class="payment-method">
              <img src="assets/images/visa.png" alt="Visa" />
            </div>
            <div class="payment-method">
              <img src="assets/images/paypal.jfif" alt="PayPal" />
            </div>
            <div class="payment-method">
              <img src="assets/images/google_pay.jfif" alt="Google Pay" />
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="cart-summary">
        <div class="cart-total">
          Total: $<span>{{ totalPrice.toFixed(2) }}</span>
        </div>
        <div class="tax-note">
          You may be taxed depending on which payment method selected
        </div>
        <button class="button" @click="proceedToPayment">Continue To Payment</button>
        <button class="button" @click="clearCart">Remove All Items</button>
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

// Optional: Mount navbar JS if you’re still using your old navbar.js script
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
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
h1 {
  font-size: 42px;
  margin-bottom: 30px;
}
.cart-item {
  background-color: #2c2c2c;
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
}
.item-image {
  width: 120px;
  height: 120px;
  margin-right: 20px;
  object-fit: cover;
}
.item-details {
  flex-grow: 1;
}
.item-details p {
  margin: 5px 0;
  color: #aaa;
}
.item-price {
  font-size: 24px;
  font-weight: bold;
  margin-left: auto;
  text-align: right;
}
.item-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.action-link {
  color: white;
  text-decoration: underline;
  margin-left: 10px;
  cursor: pointer;
}
.button {
  background-color: #4a1010;
  color: white;
  border: none;
  padding: 15px 25px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 20px;
  width: 100%;
}
.button:hover {
  background-color: #691818;
}
.cart-summary {
  background-color: #2c2c2c;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 20px;
}
.cart-total {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}
.tax-note {
  color: #aaa;
  margin-bottom: 20px;
}
.payment-methods {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.payment-method {
  width: 48%;
  height: 80px;
  background-color: white;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.payment-method img {
  max-width: 80%;
  max-height: 80%;
}
@media (min-width: 768px) {
  .cart-container {
    display: flex;
    gap: 20px;
  }
  .cart-main {
    flex: 3;
  }
  .cart-sidebar {
    flex: 1;
  }
}
</style>
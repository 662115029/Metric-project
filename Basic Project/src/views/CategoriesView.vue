<template>
  <div>
    <!-- Navbar -->
    <div id="navbar-container"></div>

    <!-- Search Bar -->
    <div class="text-center my-5">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search..."
        class="p-2.5 w-4/5 max-w-md rounded border-0"
      />
    </div>

    <!-- Categories -->
    <div v-if="!showGames" class="flex flex-wrap justify-center">
      <div
        v-for="category in filteredCategories"
        :key="category.id"
        class="flex flex-col bg-gradient-to-b from-[#2C2C2C] via-[#281616] to-[#250101] rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out cursor-pointer m-4 p-2.5 text-center hover:-translate-y-1 hover:shadow-2xl"
        @click="selectCategory(category)"
      >
        <img :src="category.image" alt="Category" class="w-full h-[200px] object-cover border-b-2 border-[#444]" />
        <div class="text-xl font-bold my-2.5 text-white text-center">{{ category.name }}</div>
      </div>
    </div>

    <!-- Games List -->
    <div v-else class="flex flex-wrap justify-center">
      <button 
        id="back-to-categories" 
        @click="showCategories"
        class="bg-[#4a1010] text-white border-0 py-2.5 px-5 text-base cursor-pointer rounded my-5 mx-auto block hover:bg-[#691818]"
      >
        Back to Categories
      </button>
      <div id="games-list" class="flex flex-wrap justify-center w-full">
        <div
          v-for="game in selectedCategory.games"
          :key="game.id"
          class="flex flex-col bg-gradient-to-b from-[#2C2C2C] via-[#281616] to-[#250101] rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out cursor-pointer m-4 p-2.5 text-center hover:-translate-y-1 hover:shadow-2xl"
        >
          <img :src="game.image" alt="Game" class="w-full h-[200px] object-cover border-b-2 border-[#444]" />
          <div class="text-xl font-bold my-2.5 text-white text-center">{{ game.title }}</div>
          <div class="text-base text-white">
            <template v-if="game.promoPrice">
              <del class="text-[#ff6b6b] mr-1">${{ game.originalPrice.toFixed(2) }}</del>
              <span class="text-[#45a049] font-bold">${{ game.promoPrice.toFixed(2) }}</span>
            </template>
            <template v-else>
              <span class="text-white font-bold">${{ game.price.toFixed(2) }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'

// Example category + game data (replace with API or Pinia later)
const categories = ref([
  {
    id: 1,
    name: 'Action',
    image: new URL('@/assets/images/action.jpg', import.meta.url).href,
    games: [
      { id: 101, title: 'Elden Ring', price: 59.99, image: new URL('@/assets/images/eldenring.jpg', import.meta.url).href },
      { id: 102, title: 'God of War', promoPrice: 39.99, originalPrice: 49.99, image: new URL('@/assets/images/godofwar.jpg', import.meta.url).href },
    ],
  },
  {
    id: 2,
    name: 'Adventure',
    image: new URL('@/assets/images/adventure.jpg', import.meta.url).href,
    games: [
      { id: 201, title: 'Zelda: Breath of the Wild', price: 69.99, image: new URL('@/assets/images/zelda.jpg', import.meta.url).href },
      { id: 202, title: 'Hollow Knight', price: 14.99, image: new URL('@/assets/images/hollowknight.jpg', import.meta.url).href },
    ],
  },
])

const showGames = ref(false)
const selectedCategory = ref(null)
const searchQuery = ref('')

const filteredCategories = computed(() => {
  return categories.value.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

function selectCategory(category) {
  selectedCategory.value = category
  showGames.value = true
}

function showCategories() {
  showGames.value = false
}

// Load navbar if still using old navbar.js
onMounted(() => {
  if (window.loadNavbar) {
    window.loadNavbar()
  }
})
</script>
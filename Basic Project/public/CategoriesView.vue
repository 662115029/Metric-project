<!--
**********************************************************************************
THIS PAGE MUST INCLUDE:
**********************************************************************************
 - A PRODUCT LIST of the products only from the selected category, or from the 
   search!
 - A redirection to the product's page after selecting it from the PRODUCT LIST!
 - Products displayed must have original and promotional price visible at ALL
   TIMES and on EVERY PAGE!
**********************************************************************************
-->
<template>
  <div>
    <!-- Navbar -->
    <div id="navbar-container"></div>

    <!-- Search Bar -->
    <div class="search-bar-container">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search..."
        class="search-bar"
      />
    </div>

    <!-- Categories -->
    <div v-if="!showGames" class="categories">
      <div
        v-for="category in filteredCategories"
        :key="category.id"
        class="game-item"
        @click="selectCategory(category)"
      >
        <img :src="category.image" alt="Category" class="game-image" />
        <div class="game-title">{{ category.name }}</div>
      </div>
    </div>

    <!-- Games List -->
    <div v-else class="games-container">
      <button id="back-to-categories" @click="showCategories">Back to Categories</button>
      <div id="games-list" class="flex flex-wrap justify-center">
        <div
          v-for="game in selectedCategory.games"
          :key="game.id"
          class="game-item"
        >
          <img :src="game.image" alt="Game" class="game-image" />
          <div class="game-title">{{ game.title }}</div>
          <div class="game-price">
            <template v-if="game.promoPrice">
              <del>${{ game.originalPrice.toFixed(2) }}</del>
              <span class="promo-price">${{ game.promoPrice.toFixed(2) }}</span>
            </template>
            <template v-else>
              <span class="normal-price">${{ game.price.toFixed(2) }}</span>
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
    image: 'assets/images/action.jpg',
    games: [
      { id: 101, title: 'Elden Ring', price: 59.99, image: 'assets/images/eldenring.jpg' },
      { id: 102, title: 'God of War', promoPrice: 39.99, originalPrice: 49.99, image: 'assets/images/godofwar.jpg' },
    ],
  },
  {
    id: 2,
    name: 'Adventure',
    image: 'assets/images/adventure.jpg',
    games: [
      { id: 201, title: 'Zelda: Breath of the Wild', price: 69.99, image: 'assets/images/zelda.jpg' },
      { id: 202, title: 'Hollow Knight', price: 14.99, image: 'assets/images/hollowknight.jpg' },
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

<style scoped>
/* Game Item Styling */
.game-item {
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #2C2C2C 0%, #281616 100%, #250101 100%);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  margin: 15px;
  padding: 10px;
  text-align: center;
}

.game-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

/* Game Image Styling */
.game-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 2px solid #444;
}

/* Game Title Styling */
.game-title {
  font-size: 1.2em;
  font-weight: bold;
  margin: 10px 0;
  color: #fff;
  text-align: center;
}

/* Game Price Styling */
.game-price {
  font-size: 1em;
  color: #fff;
}

.game-price del {
  color: #ff6b6b;
  margin-right: 5px;
}

.promo-price {
  color: #45a049;
  font-weight: bold;
}

.normal-price {
  color: #fff;
  font-weight: bold;
}

/* Extra Layout Styling */
.categories,
.games-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.search-bar-container {
  text-align: center;
  margin: 20px;
}

.search-bar {
  padding: 10px;
  width: 80%;
  max-width: 400px;
  border-radius: 5px;
  border: none;
}

#back-to-categories {
  background-color: #4a1010;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  margin: 20px auto;
  display: block;
}

#back-to-categories:hover {
  background-color: #691818;
}
</style>
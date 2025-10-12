<template>
  <div>
    <!-- Calls the Navbar -->
    <div id="navbar-container"></div>

    <!-- Library list / User's purchased games -->
    <div class="purchased-games">
      <p v-if="!userId">Please log in to view your library.</p>
      <p v-else-if="loading">Loading purchased games...</p>
      <p v-else-if="error">{{ error }}</p>
      <p v-else-if="games.length === 0">No games purchased yet.</p>

      <div
        v-else
        class="purchased-game"
        v-for="game in games"
        :key="game.id"
      >
        <img :src="game.thumbnail" :alt="game.title" />
        <h3>{{ game.title }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Get logged-in user ID
const userId = localStorage.getItem("userId")

// Reactive state
const games = ref([])
const loading = ref(true)
const error = ref("")

// Fetch purchased games
onMounted(async () => {
  if (!userId) {
    loading.value = false
    return
  }

  try {
    const response = await fetch(`/api/purchased-games/${userId}`)
    if (!response.ok) throw new Error("Failed to load purchased games.")
    const data = await response.json()
    games.value = data
  } catch (err) {
    console.error(err)
    error.value = "Failed to load games."
  } finally {
    loading.value = false
  }

  // Run navbar script if needed
  if (window.loadNavbar) window.loadNavbar()
})
</script>
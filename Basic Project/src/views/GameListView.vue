<!--
**********************************************************************************
THIS PAGE MUST INCLUDE:
**********************************************************************************
 - A list of all products from all categories!
 - One page limits the display of products up to 15 products! Use DOM events to 
   manage pagination of products!
 - Products displayed must have original and promotional price visible at ALL
   TIMES and on EVERY PAGE!
**********************************************************************************
-->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const games = ref<any[]>([]);
const filteredGames = ref<any[]>([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 6;

const totalPages = computed(() => Math.ceil(filteredGames.value.length / itemsPerPage));

const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredGames.value.slice(start, start + itemsPerPage);
});

async function fetchGames() {
  try {
    const response = await fetch("http://localhost:3000/api/games");
    if (!response.ok) throw new Error("Failed to load games");
    games.value = await response.json();
    filteredGames.value = games.value;
  } catch (err) {
    console.error("Error fetching games:", err);
  }
}

function filterGames() {
  const query = searchQuery.value.toLowerCase();
  filteredGames.value = games.value.filter(
    (g) =>
      g.title.toLowerCase().includes(query) ||
      (g.category && g.category.toLowerCase().includes(query))
  );
  currentPage.value = 1;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function viewGame(gameId: number) {
  router.push({ path: "/game", query: { id: gameId } });
}

onMounted(fetchGames);
</script>

<template>
  <div class="min-h-screen bg-[#250101] text-white p-6">
    <!-- Search bar -->
    <div class="flex justify-center mb-6">
      <input
        v-model="searchQuery"
        @input="filterGames"
        type="search"
        placeholder="Search for a game..."
        class="w-full max-w-lg bg-[#2C2C2C] text-white px-4 py-3 rounded-md border border-[#444] focus:outline-none focus:ring-2 focus:ring-red-500"
      />
    </div>

    <!-- Game list -->
    <div v-if="paginatedGames.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="game in paginatedGames"
        :key="game.id"
        class="bg-[#700000] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
        @click="viewGame(game.id)"
      >
        <img
          :src="game.thumbnail"
          :alt="game.title"
          class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <h3 class="text-lg font-bold mb-2">{{ game.title }}</h3>
          <p class="text-sm text-gray-300 mb-2 truncate">
            {{ game.description || "No description available." }}
          </p>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">
              {{ game.category || "Unknown" }}
            </span>
            <span class="font-semibold text-white">
              ${{ (parseFloat(game.promo_price) || parseFloat(game.price)).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- No results -->
    <div v-else class="text-center text-gray-300 text-lg mt-10">
      No games found.
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-center gap-4 mt-10">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="bg-[#333] hover:bg-[#444] disabled:bg-[#222] px-4 py-2 rounded-md transition"
      >
        ← Prev
      </button>

      <span class="text-sm text-gray-300">
        Page {{ currentPage }} of {{ totalPages }}
      </span>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="bg-[#333] hover:bg-[#444] disabled:bg-[#222] px-4 py-2 rounded-md transition"
      >
        Next →
      </button>
    </div>
  </div>
</template>
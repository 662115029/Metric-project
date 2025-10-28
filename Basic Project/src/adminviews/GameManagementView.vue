<template>
  <div>
    <!-- Optional: include your AdminNavbar component here -->
    <!-- <AdminNavbar /> -->

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 p-4">
      <!-- Left Column -->
      <div>
        <h2 class="m-0 mb-3 text-xl font-bold">Game Management</h2>
        <div class="grid gap-3">
          <div>
            <Anchor :to="links.game.add">
              <div class="block p-3.5 px-4 rounded-xl bg-gradient-to-b from-[#ddd] via-[#ddd] to-[#281616] text-[#111] no-underline hover:opacity-90 transition-opacity">
                <h3 class="m-0 mb-1 font-semibold">Add a New Game</h3>
                <p class="m-0 text-sm text-gray-700">Create a new listing for a game and give it the proper tags to stand out.</p>
              </div>
            </Anchor>
          </div>
          <div>
            <Anchor :to="links.game.update">
              <div class="block p-3.5 px-4 rounded-xl bg-gradient-to-b from-[#ddd] via-[#ddd] to-[#281616] text-[#111] no-underline hover:opacity-90 transition-opacity">
                <h3 class="m-0 mb-1 font-semibold">Update Selected Game</h3>
                <p class="m-0 text-sm text-gray-700">Change the listing for an existing game and update its information, media, or price.</p>
              </div>
            </Anchor>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div>
        <h2 class="m-0 mb-3 text-xl font-bold">Game List</h2>

        <!-- Search + Category Filter -->
        <div class="flex gap-2.5 mb-3">
          <input
            type="search"
            id="search-bar"
            v-model.trim="query"
            placeholder="Search for a game..."
            @input="debounceSearch()"
            class="flex-1 py-2.5 px-3 rounded-lg border border-gray-300 box-border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select 
            id="category-filter" 
            v-model="categoryId" 
            @change="applyFilters"
            class="flex-1 py-2.5 px-3 rounded-lg border border-gray-300 box-border focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All categories</option>
            <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
          </select>
        </div>

        <!-- List -->
        <div class="grid gap-3">
          <div v-if="isLoading" class="text-gray-600 p-3">Loading games…</div>
          <div v-else-if="!filteredGames.length" class="text-gray-600 p-3">No games found</div>

          <article 
            v-else 
            v-for="g in filteredGames" 
            :key="g.id" 
            class="grid grid-cols-[120px_1fr] gap-3 bg-white border border-gray-300 rounded-lg p-2.5"
          >
            <img
              v-if="g.thumbnailUrl || g.thumbnail"
              :src="g.thumbnailUrl || g.thumbnail"
              alt="thumbnail"
              class="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
            <div>
              <h3 class="m-0 mb-1 font-bold text-base">{{ g.title }}</h3>
              <div class="text-gray-600 mb-1.5 text-sm">
                <span v-if="g.developer">{{ g.developer }}</span>
                <span v-if="g.release_date"> · {{ formatDate(g.release_date) }}</span>
              </div>
              <div class="flex gap-2 items-baseline mb-1.5">
                <span class="font-bold text-green-600" v-if="Number(g.promo_price) > 0">
                  ${{ Number(g.promo_price).toFixed(2) }}
                </span>
                <span :class="{ 'line-through text-gray-500': Number(g.promo_price) > 0 }">
                  ${{ Number(g.price || 0).toFixed(2) }}
                </span>
              </div>
              <p class="text-gray-800 m-0 mt-1.5 text-sm" v-if="g.description">{{ g.description }}</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// import AdminNavbar from '@/components/AdminNavbar.vue'

// Toggle router usage
const USE_ROUTER = false
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

// Lightweight Anchor component; replace with <RouterLink> if using Vue Router
const Anchor = {
  props: { to: { type: [String, Object], required: true } },
  render() {
    if (typeof this.to === 'string') {
      return (<a href={this.to}>{this.$slots.default?.()}</a>)
    }
    return (<a href="#">{this.$slots.default?.()}</a>)
  },
}

const links = {
  game: {
    add: USE_ROUTER ? { name: 'AddGame' } : './add-game.html',
    update: USE_ROUTER ? { name: 'UpdateGame' } : './update-game.html',
  },
}

const categories = ref([])
const games = ref([])
const isLoading = ref(false)

const query = ref('')
const categoryId = ref('')

// Derived
const filteredGames = computed(() => {
  const q = query.value.toLowerCase()
  return games.value.filter(g => {
    const matchQ = !q ||
      String(g.title || '').toLowerCase().includes(q) ||
      String(g.developer || '').toLowerCase().includes(q) ||
      String(g.description || '').toLowerCase().includes(q)
    const matchCat = !categoryId.value || String(g.category_id) === String(categoryId.value)
    return matchQ && matchCat
  })
})

let inputTimer
function debounceSearch() {
  clearTimeout(inputTimer)
  inputTimer = setTimeout(applyFilters, 150)
}

function applyFilters() {
  // computed already reacts; this exists to debounce and allow future server-side query
}

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`)
    const data = await res.json()
    categories.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error loading categories:', e)
    categories.value = []
  }
}

async function loadGames() {
  isLoading.value = true
  try {
    // Try common endpoints
    // 1) GET /api/games
    // Optional: support server-side filter by category & q if backend supports
    let url = `${API_BASE}/api/games`
    const res = await fetch(url)
    const data = await res.json()
    games.value = Array.isArray(data) ? data : (Array.isArray(data.games) ? data.games : [])
  } catch (e) {
    console.error('Error loading games:', e)
    games.value = []
  } finally {
    isLoading.value = false
  }
}

function formatDate(d) {
  try {
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return String(d)
    return date.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch { return String(d) }
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadGames()])
})
</script>
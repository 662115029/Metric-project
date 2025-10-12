<template>
  <div>
    <!-- Optional: include your AdminNavbar component here -->
    <!-- <AdminNavbar /> -->

    <div class="main-container">
      <!-- Left Column -->
      <div class="left-column">
        <h2 class="column-title">Game Management</h2>
        <div class="links-container">
          <div class="link-item">
            <Anchor :to="links.game.add">
              <h3>Add a New Game</h3>
              <p>Create a new listing for a game and give it the proper tags to stand out.</p>
            </Anchor>
          </div>
          <div class="link-item">
            <Anchor :to="links.game.update">
              <h3>Update Selected Game</h3>
              <p>Change the listing for an existing game and update its information, media, or price.</p>
            </Anchor>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <h2 class="column-title">Game List</h2>

        <!-- Search + Category Filter -->
        <div class="search-bar-container">
          <input
            type="search"
            id="search-bar"
            v-model.trim="query"
            placeholder="Search for a game..."
            @input="debounceSearch()"
          />
          <select id="category-filter" v-model="categoryId" @change="applyFilters">
            <option value="">All categories</option>
            <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
          </select>
        </div>

        <!-- List -->
        <div class="game-list">
          <div v-if="isLoading" class="loading">Loading games…</div>
          <div v-else-if="!filteredGames.length" class="empty">No games found</div>

          <article v-else v-for="g in filteredGames" :key="g.id" class="game-row">
            <img
              v-if="g.thumbnailUrl || g.thumbnail"
              :src="g.thumbnailUrl || g.thumbnail"
              alt="thumbnail"
              class="thumb"
              loading="lazy"
            />
            <div class="meta">
              <h3 class="title">{{ g.title }}</h3>
              <div class="sub">
                <span class="dev" v-if="g.developer">{{ g.developer }}</span>
                <span class="release" v-if="g.release_date"> · {{ formatDate(g.release_date) }}</span>
              </div>
              <div class="price-row">
                <span class="price promo" v-if="Number(g.promo_price) > 0">
                  ${{ Number(g.promo_price).toFixed(2) }}
                </span>
                <span :class="{ strike: Number(g.promo_price) > 0 }">
                  ${{ Number(g.price || 0).toFixed(2) }}
                </span>
              </div>
              <p class="desc" v-if="g.description">{{ g.description }}</p>
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

<style scoped>
.main-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  padding: 16px;
}

.left-column .column-title,
.right-column .column-title {
  margin: 0 0 12px;
}

.links-container { display: grid; gap: 12px; }

.link-item a {
  display: block;
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(to bottom, #ddd 30%, #281616 100%);
  color: #111;
  text-decoration: none;
}
.link-item a:hover { opacity: 0.92; }

.search-bar-container { display: flex; gap: 10px; margin-bottom: 12px; }
#search-bar, #category-filter {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.game-list { display: grid; gap: 12px; }
.game-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
}
.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
.meta .title { margin: 0 0 4px; }
.sub { color: #555; margin-bottom: 6px; }
.price-row { display: flex; gap: 8px; align-items: baseline; }
.price-row .strike { text-decoration: line-through; color: #777; }
.desc { color: #333; margin: 6px 0 0; }

.loading, .empty { color: #555; padding: 12px; }

@media (max-width: 900px) {
  .main-container { grid-template-columns: 1fr; }
}
</style>

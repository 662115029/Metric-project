<template>
  <div>
    <!-- Optional: If you already integrated AdminNavbar.vue, import and use it here -->
    <!-- <AdminNavbar /> -->

    <div class="main-container">
      <!-- Left Column -->
      <div class="left-column">
        <h2 class="column-title">Category Management</h2>
        <div class="links-container">
          <div class="link-item">
            <Anchor :to="links.category.add">
              <h3>Add a New Category</h3>
              <p>Create a new game category for the store</p>
            </Anchor>
          </div>
          <div class="link-item">
            <Anchor :to="links.category.update">
              <h3>Update a Category</h3>
              <p>Change or update category information</p>
            </Anchor>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <h2 class="column-title">Category List</h2>

        <div class="search-bar-container">
          <input
            type="search"
            id="search-bar"
            v-model.trim="query"
            placeholder="Search for a category..."
            @input="onSearch"
          />
        </div>

        <!-- Categories -->
        <div class="categories" v-show="!showingGames">
          <div
            v-if="isLoading && !categories.length"
            class="loading"
          >Loading categories…</div>

          <div v-else-if="!filteredCategories.length" class="empty">No categories</div>

          <div
            v-else
            class="category-list"
          >
            <button
              v-for="cat in filteredCategories"
              :key="cat.id"
              class="category-item"
              @click="openCategory(cat)"
            >
              <div class="name">{{ cat.name }}</div>
              <small v-if="cat.description" class="desc">{{ cat.description }}</small>
            </button>
          </div>
        </div>

        <!-- Games under a Category -->
        <div class="games-container" v-show="showingGames">
          <button class="back" @click="showCategories">Back to Categories</button>
          <h3 class="games-title">{{ activeCategory?.name }} · Games</h3>

          <div v-if="isLoadingGames" class="loading">Loading games…</div>
          <div v-else-if="!games.length" class="empty">No games in this category</div>

          <div class="games-list" v-else>
            <article v-for="g in games" :key="g.id" class="game-card">
              <img
                v-if="g.thumbnailUrl || g.thumbnail"
                class="thumb"
                :src="g.thumbnailUrl || g.thumbnail"
                alt="thumbnail"
                loading="lazy"
              />
              <div class="meta">
                <h4 class="title">{{ g.title }}</h4>
                <div class="price-row">
                  <span class="price" v-if="g.promo_price && Number(g.promo_price) > 0">
                    ${{ Number(g.promo_price).toFixed(2) }}
                  </span>
                  <span :class="{ strike: g.promo_price && Number(g.promo_price) > 0 }">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// import AdminNavbar from '@/components/AdminNavbar.vue'

// If you use Vue Router, set USE_ROUTER = true and turn Anchor into RouterLink
const USE_ROUTER = false
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

const links = {
  category: {
    add: USE_ROUTER ? { name: 'AddCategory' } : './add-category.html',
    update: USE_ROUTER ? { name: 'UpdateCategory' } : './update-category.html',
  },
}

// lightweight Anchor that supports string href immediately; swap with <RouterLink> if you use router
const Anchor = {
  props: { to: { type: [String, Object], required: true } },
  render() {
    if (typeof this.to === 'string') {
      return (
        <a href={this.to}>
          {this.$slots.default?.()}
        </a>
      )
    }
    return (
      <a href="#">{this.$slots.default?.()}</a>
    )
  },
}

const categories = ref([])
const isLoading = ref(false)
const query = ref('')

const showingGames = ref(false)
const activeCategory = ref(null)
const games = ref([])
const isLoadingGames = ref(false)

const filteredCategories = computed(() => {
  const q = query.value.toLowerCase()
  if (!q) return categories.value
  return categories.value.filter(c =>
    String(c.name || '').toLowerCase().includes(q) ||
    String(c.description || '').toLowerCase().includes(q)
  )
})

let searchTimer
const onSearch = () => {
  // debounce UI search (client-side)
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {}, 150)
}

async function loadCategories() {
  isLoading.value = true
  try {
    const res = await fetch(`${API_BASE}/api/categories`)
    const data = await res.json()
    categories.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error fetching categories:', e)
    categories.value = []
  } finally {
    isLoading.value = false
  }
}

function showCategories() {
  showingGames.value = false
  activeCategory.value = null
  games.value = []
}

async function openCategory(cat) {
  activeCategory.value = cat
  showingGames.value = true
  games.value = []
  isLoadingGames.value = true
  try {
    // Adjust to your backend route; common patterns:
    // 1) GET /api/categories/:id/games
    // 2) GET /api/games?category_id=:id
    const url1 = `${API_BASE}/api/categories/${cat.id}/games`
    const url2 = `${API_BASE}/api/games?category_id=${encodeURIComponent(cat.id)}`

    let res = await fetch(url1)
    if (!res.ok) {
      // fallback to pattern 2
      res = await fetch(url2)
    }
    const data = await res.json().catch(() => [])
    games.value = Array.isArray(data) ? data : (Array.isArray(data.games) ? data.games : [])
  } catch (e) {
    console.error('Error fetching games:', e)
    games.value = []
  } finally {
    isLoadingGames.value = false
  }
}

onMounted(loadCategories)
</script>

<style scoped>
/* You can also import your ./assets/css/admin-styles.css globally in main.css */

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

.links-container {
  display: grid;
  gap: 12px;
}

.link-item a {
  display: block;
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(to bottom, #ddd 30%, #281616 100%);
  color: #111;
  text-decoration: none;
}

.link-item a:hover { opacity: 0.92; }

/* Right column */
.search-bar-container { margin-bottom: 12px; }
#search-bar {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.category-list { display: grid; gap: 10px; }
.category-item {
  text-align: left;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
}
.category-item:hover { background: #f7f7f7; }
.category-item .name { font-weight: 700; }
.category-item .desc { color: #555; }

.games-container .back {
  margin-bottom: 12px;
}

.games-title { margin: 6px 0 14px; }

.games-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.game-card {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
}
.game-card .thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
.game-card .meta .title { margin: 0 0 6px; }
.price-row { display: flex; gap: 8px; align-items: baseline; }
.price-row .strike { text-decoration: line-through; color: #777; }

.loading, .empty { color: #555; padding: 12px; }

@media (max-width: 900px) {
  .main-container { grid-template-columns: 1fr; }
}
</style>
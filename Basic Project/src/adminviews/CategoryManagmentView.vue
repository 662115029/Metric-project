<template>
  <div>
    <!-- Optional: If you already integrated AdminNavbar.vue, import and use it here -->
    <!-- <AdminNavbar /> -->

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 p-4">
      <!-- Left Column -->
      <div>
        <h2 class="m-0 mb-3 text-xl font-bold">Category Management</h2>
        <div class="grid gap-3">
          <div>
            <Anchor :to="links.category.add">
              <div class="block p-3.5 px-4 rounded-xl bg-gradient-to-b from-[#ddd] via-[#ddd] to-[#281616] text-[#111] no-underline hover:opacity-90 transition-opacity">
                <h3 class="m-0 mb-1 font-semibold">Add a New Category</h3>
                <p class="m-0 text-sm text-gray-700">Create a new game category for the store</p>
              </div>
            </Anchor>
          </div>
          <div>
            <Anchor :to="links.category.update">
              <div class="block p-3.5 px-4 rounded-xl bg-gradient-to-b from-[#ddd] via-[#ddd] to-[#281616] text-[#111] no-underline hover:opacity-90 transition-opacity">
                <h3 class="m-0 mb-1 font-semibold">Update a Category</h3>
                <p class="m-0 text-sm text-gray-700">Change or update category information</p>
              </div>
            </Anchor>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div>
        <h2 class="m-0 mb-3 text-xl font-bold">Category List</h2>

        <div class="mb-3">
          <input
            type="search"
            id="search-bar"
            v-model.trim="query"
            placeholder="Search for a category..."
            @input="onSearch"
            class="w-full py-2.5 px-3 rounded-lg border border-gray-300 box-border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Categories -->
        <div v-show="!showingGames">
          <div
            v-if="isLoading && !categories.length"
            class="text-gray-600 p-3"
          >Loading categories…</div>

          <div v-else-if="!filteredCategories.length" class="text-gray-600 p-3">No categories</div>

          <div
            v-else
            class="grid gap-2.5"
          >
            <button
              v-for="cat in filteredCategories"
              :key="cat.id"
              class="text-left bg-white border border-gray-300 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
              @click="openCategory(cat)"
            >
              <div class="font-bold">{{ cat.name }}</div>
              <small v-if="cat.description" class="text-gray-600">{{ cat.description }}</small>
            </button>
          </div>
        </div>

        <!-- Games under a Category -->
        <div v-show="showingGames">
          <button 
            class="mb-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer border-none" 
            @click="showCategories"
          >
            Back to Categories
          </button>
          <h3 class="my-1.5 mb-3.5 text-lg font-semibold">{{ activeCategory?.name }} · Games</h3>

          <div v-if="isLoadingGames" class="text-gray-600 p-3">Loading games…</div>
          <div v-else-if="!games.length" class="text-gray-600 p-3">No games in this category</div>

          <div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3" v-else>
            <article 
              v-for="g in games" 
              :key="g.id" 
              class="grid grid-cols-[96px_1fr] gap-2.5 bg-white border border-gray-300 rounded-lg p-2.5"
            >
              <img
                v-if="g.thumbnailUrl || g.thumbnail"
                class="w-full h-full object-cover rounded-lg"
                :src="g.thumbnailUrl || g.thumbnail"
                alt="thumbnail"
                loading="lazy"
              />
              <div>
                <h4 class="m-0 mb-1.5 font-semibold text-sm">{{ g.title }}</h4>
                <div class="flex gap-2 items-baseline mb-1">
                  <span class="font-bold text-green-600" v-if="g.promo_price && Number(g.promo_price) > 0">
                    ${{ Number(g.promo_price).toFixed(2) }}
                  </span>
                  <span :class="{ 'line-through text-gray-500': g.promo_price && Number(g.promo_price) > 0 }">
                    ${{ Number(g.price || 0).toFixed(2) }}
                  </span>
                </div>
                <p class="text-xs text-gray-600 m-0 line-clamp-2" v-if="g.description">{{ g.description }}</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
// import { RouterLink } from 'vue-router' // ถ้าในอนาคตจะเปิด router ให้ปลดคอมเมนต์

// ถ้าใช้ Vue Router ให้เปลี่ยนเป็น true แล้วใช้ RouterLink
const USE_ROUTER = false
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

// ------------------------------
// Lightweight Anchor component (no JSX)
// ------------------------------
const Anchor = {
  name: 'Anchor',
  props: { to: { type: [String, Object], required: true } },
  setup(props, { slots }) {
    return () => {
      const children = slots.default ? slots.default() : []
      if (typeof props.to === 'string') {
        return h('a', { href: props.to }, children)
      }
      // ถ้าคุณเปิด router แล้วอยากให้รองรับ object เช่น { name: 'AddCategory' }
      // if (USE_ROUTER && typeof props.to === 'object') {
      //   return h(RouterLink, { to: props.to }, children)
      // }
      return h('a', { href: '#' }, children)
    }
  },
}
// ------------------------------

const links = {
  category: {
    add: USE_ROUTER ? { name: 'AddCategory' } : './add-category.html',
    update: USE_ROUTER ? { name: 'UpdateCategory' } : './update-category.html',
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
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {}, 150) // debounce client-side search
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
    const url1 = `${API_BASE}/api/categories/${cat.id}/games`
    const url2 = `${API_BASE}/api/games?category_id=${encodeURIComponent(cat.id)}`
    let res = await fetch(url1)
    if (!res.ok) res = await fetch(url2)
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

<template>
  <div class="flex justify-center items-center min-h-screen p-5 bg-[#250101]">
    <div class="bg-gradient-to-b from-[#ddd] from-30% to-[#281616] p-5 rounded-[10px] shadow-lg text-center w-full max-w-[800px] flex flex-col md:flex-row gap-5 box-border">
      <!-- Left Column -->
      <div class="flex flex-col justify-center items-center gap-[15px] w-full md:w-1/2">
        <h1 class="text-[30px] md:text-[26px] lg:text-[30px] pt-10 md:pt-10 mb-[10px] text-black font-['Gill_Sans',sans-serif]">
          Update Game Info
        </h1>
        
        <form id="gameForm" @submit.prevent="onSubmit" class="flex flex-col items-center w-full gap-[10px]">
          <label for="gameSelect" class="flex flex-col text-left text-base w-full max-w-[250px] font-['Gill_Sans',sans-serif]">
            Select Game:
            <select 
              id="gameSelect" 
              v-model="selectedGameId" 
              required 
              @change="onPickGame"
              class="p-[10px] text-base border border-[#ccc] rounded-[5px] w-auto"
            >
              <option value="">Select a game</option>
              <option v-for="g in games" :key="gameKey(g)" :value="String(gameKey(g))">
                {{ g.title }}
              </option>
            </select>
          </label>

          <label class="flex flex-col text-left text-base w-full max-w-[250px] font-['Gill_Sans',sans-serif]">
            Title:
            <input 
              type="text" 
              id="gameTitle" 
              v-model.trim="title" 
              required 
              class="p-[10px] md:p-2 text-base md:text-sm border border-[#ccc] rounded-[5px] w-auto"
            />
          </label>

          <label class="flex flex-col text-left text-base w-full max-w-[250px] font-['Gill_Sans',sans-serif]">
            Release Date:
            <input 
              type="date" 
              id="gameReleaseDate" 
              v-model="releaseDate" 
              required 
              class="p-[10px] md:p-2 text-base md:text-sm border border-[#ccc] rounded-[5px] w-auto"
            />
          </label>

          <label class="flex flex-col text-left text-base w-full max-w-[250px] font-['Gill_Sans',sans-serif]">
            Price:
            <input 
              type="number" 
              id="gamePrice" 
              step="0.01" 
              v-model.number="price" 
              required 
              class="p-[10px] md:p-2 text-base md:text-sm border border-[#ccc] rounded-[5px] w-auto"
            />
          </label>

          <label class="flex flex-col text-left text-base w-full max-w-[250px] font-['Gill_Sans',sans-serif]">
            Promotional Price:
            <input 
              type="number" 
              id="gamePromoPrice" 
              step="0.01" 
              v-model.number="promoPrice" 
              required 
              class="p-[10px] md:p-2 text-base md:text-sm border border-[#ccc] rounded-[5px] w-auto"
            />
          </label>

          <label class="flex flex-col text-left text-base w-full max-w-[250px] font-['Gill_Sans',sans-serif]">
            Developer:
            <input 
              type="text" 
              id="gameDeveloper" 
              v-model.trim="developer" 
              required 
              class="p-[10px] md:p-2 text-base md:text-sm border border-[#ccc] rounded-[5px] w-auto"
            />
          </label>

          <label class="flex flex-col text-left text-base w-full max-w-[250px] font-['Gill_Sans',sans-serif]">
            Description:
            <textarea 
              id="gameDescription" 
              v-model.trim="description" 
              required 
              class="p-[10px] md:p-2 text-base md:text-sm border border-[#ccc] rounded-[5px] w-auto h-20 resize-none"
            />
          </label>

          <label for="category" class="flex flex-col text-left text-base w-full max-w-[250px] font-['Gill_Sans',sans-serif]">
            Category:
            <select 
              id="category" 
              name="category" 
              v-model="categoryId" 
              required
              class="p-[10px] text-base border border-[#ccc] rounded-[5px] w-auto"
            >
              <option value="">Select a category</option>
              <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
            </select>
          </label>

          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="bg-white p-[10px_15px] md:p-[10px_15px] text-lg md:text-base rounded-[5px] border-0 cursor-pointer transition-colors duration-300 text-black hover:bg-[#d1d1d1] disabled:opacity-50 disabled:cursor-not-allowed font-['Gill_Sans',sans-serif]"
          >
            {{ isSubmitting ? 'Updating…' : 'Update info' }}
          </button>
          
          <a 
            href="./game-management.html"
            class="bg-white p-[10px_15px] text-lg rounded-[5px] cursor-pointer transition-colors duration-300 no-underline text-black hover:bg-[#d1d1d1] font-['Gill_Sans',sans-serif]"
          >
            Return to action selection
          </a>
        </form>
      </div>

      <!-- Right Column -->
      <div class="flex flex-col items-center justify-center w-full md:w-1/2 p-0">
        <div 
          class="bg-white p-[30px] md:p-5 rounded-[10px] border-2 border-gray-500 text-center cursor-pointer w-4/5 h-full my-5"
          id="dropZone"
          @click="openPicker"
          @dragover.prevent
          @dragenter.prevent
          @drop.prevent="onDrop"
        >
          <p class="font-['Gill_Sans',sans-serif]">Drag & Drop an image or click to upload</p>
          <input 
            ref="fileInput" 
            type="file" 
            id="gameThumbnail" 
            accept="image/*" 
            hidden 
            @change="onFileChange" 
          />
        </div>
        <img 
          v-if="previewUrl" 
          id="previewImage" 
          :src="previewUrl" 
          alt="Preview" 
          class="mt-[15px] max-w-full md:max-w-[80%] rounded-[5px]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

// ===== State =====
const games = ref([])
const categories = ref([])

const selectedGameId = ref('')
const title = ref('')
const releaseDate = ref('')
const price = ref(null)
const promoPrice = ref(null)
const developer = ref('')
const description = ref('')
const categoryId = ref('')

const fileInput = ref(null)
const file = ref(null)
const previewUrl = ref('')
const isSubmitting = ref(false)

// Some APIs use id, some use game_id; normalize a getter
const gameKey = (g) => g.game_id ?? g.id ?? g._id

// ===== File handling =====
function openPicker() { fileInput.value?.click() }

function setPreviewFromFile(f) {
  if (!f) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(f)
}

function onFileChange(e) {
  const f = e.target.files?.[0]
  if (f) { file.value = f; setPreviewFromFile(f) }
}

function onDrop(e) {
  const f = e.dataTransfer?.files?.[0]
  if (f) {
    file.value = f
    if (fileInput.value) fileInput.value.files = e.dataTransfer.files
    setPreviewFromFile(f)
  }
}

// ===== Loaders =====
async function loadGames() {
  try {
    const res = await fetch(`${API_BASE}/api/games`)
    const data = await res.json()
    games.value = Array.isArray(data) ? data : (Array.isArray(data.games) ? data.games : [])
  } catch (e) {
    console.error('Error fetching games:', e)
    games.value = []
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`)
    const data = await res.json()
    categories.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error fetching categories:', e)
    categories.value = []
  }
}

// ===== Populate when selecting a game =====
onMounted(async () => {
  await Promise.all([loadGames(), loadCategories()])
})

function onPickGame() {
  const g = games.value.find(x => String(gameKey(x)) === String(selectedGameId.value))
  if (!g) return

  title.value = g.title ?? ''
  // Ensure date is formatted as yyyy-mm-dd for input[type=date]
  try {
    const d = new Date(g.release_date)
    if (!isNaN(d)) {
      releaseDate.value = new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10)
    } else {
      releaseDate.value = ''
    }
  } catch { releaseDate.value = '' }

  price.value = g.price ?? null
  promoPrice.value = g.promo_price ?? 0
  developer.value = g.developer ?? ''
  description.value = g.description ?? ''
  categoryId.value = String(g.category_id ?? '')

  // Show current thumbnail if provided by backend
  const url = g.thumbnailUrl || g.thumbnail || ''
  if (url) {
    // If we previously created an object URL, revoke it first
    if (previewUrl.value && previewUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = url
  } else {
    if (previewUrl.value && previewUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }

  // Clear file input selection
  file.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// ===== Submit =====
async function onSubmit() {
  const token = localStorage.getItem('adminToken')
  if (!token) { alert('You must be logged in as an admin to update games'); return }
  if (!selectedGameId.value) { alert('Please select a game'); return }

  const fd = new FormData()
  fd.append('title', title.value)
  fd.append('release_date', releaseDate.value)
  fd.append('price', price.value ?? 0)
  fd.append('promo_price', promoPrice.value ?? 0)
  fd.append('developer', developer.value)
  fd.append('description', description.value)
  if (file.value) fd.append('thumbnail', file.value)
  fd.append('category_id', categoryId.value)

  isSubmitting.value = true
  try {
    const id = encodeURIComponent(selectedGameId.value)
    const res = await fetch(`${API_BASE}/api/games/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Failed to update game')

    alert('Game updated successfully!')
  } catch (e) {
    alert(`Error: ${e.message}`)
  } finally {
    isSubmitting.value = false
  }
}

onBeforeUnmount(() => {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>
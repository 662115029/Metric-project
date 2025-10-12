<template>
  <div class="admin-container">
    <!-- Left Column -->
    <div class="left-column">
      <h1>Update Game Info</h1>
      <form id="gameForm" @submit.prevent="onSubmit">
        <label for="gameSelect">Select Game:</label>
        <select id="gameSelect" v-model="selectedGameId" required @change="onPickGame">
          <option value="">Select a game</option>
          <option v-for="g in games" :key="gameKey(g)" :value="String(gameKey(g))">
            {{ g.title }}
          </option>
        </select>

        <label>Title:
          <input type="text" id="gameTitle" v-model.trim="title" required />
        </label>

        <label>Release Date:
          <input type="date" id="gameReleaseDate" v-model="releaseDate" required />
        </label>

        <label>Price:
          <input type="number" id="gamePrice" step="0.01" v-model.number="price" required />
        </label>

        <label>Promotional Price:
          <input type="number" id="gamePromoPrice" step="0.01" v-model.number="promoPrice" required />
        </label>

        <label>Developer:
          <input type="text" id="gameDeveloper" v-model.trim="developer" required />
        </label>

        <label>Description:
          <textarea id="gameDescription" v-model.trim="description" required />
        </label>

        <label for="category">Category:</label>
        <select id="category" name="category" v-model="categoryId" required>
          <option value="">Select a category</option>
          <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
        </select>

        <button type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Updating…' : 'Update info' }}</button>
        <a href="./game-management.html">Return to action selection</a>
      </form>
    </div>

    <!-- Right Column -->
    <div class="right-column">
      <div class="upload-box" id="dropZone"
           @click="openPicker"
           @dragover.prevent
           @dragenter.prevent
           @drop.prevent="onDrop">
        <p>Drag & Drop an image or click to upload</p>
        <input ref="fileInput" type="file" id="gameThumbnail" accept="image/*" hidden @change="onFileChange" />
      </div>
      <img v-if="previewUrl" id="previewImage" :src="previewUrl" alt="Preview" style="max-width:200px;" />
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

<style scoped>
body {
  color: black;
  background-color: #250101;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  padding: 20px;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}

.admin-container {
  background: linear-gradient(to bottom, #ddd 30%, #281616 100%);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 100%;
  max-width: 800px; /* Adjusted for two columns */
  display: flex;
  flex-direction: row; /* Creates a two-column layout */
  gap: 20px;
  box-sizing: border-box;
}

.left-column { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 15px; width: 50%; }

h1 { font-size: 30px; padding-top: 10px; margin-bottom: 10px; color: black; }

form { display: flex; flex-direction: column; align-items: center; width: 100%; gap: 10px; }

label { display: flex; flex-direction: column; text-align: left; font-size: 16px; width: 100%; max-width: 250px; }

input, textarea, select { padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 5px; width: auto; }

textarea { height: 80px; resize: none; }

button, a { background-color: white; padding: 10px 15px; font-size: 18px; border-radius: 5px; border: none; cursor: pointer; transition: background-color 0.3s ease; text-decoration: none; color: black; }

button:hover { background-color: #d1d1d1; }

.right-column { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 50%; padding: 0; }

.upload-box { background: white; padding: 30px; border-radius: 10px; border: 2px solid gray; text-align: center; cursor: pointer; width: 80%; height: 100%; margin: 20px 0; }

#previewImage { margin-top: 15px; max-width: 100%; border-radius: 5px; }

@media (max-width: 900px) {
  .admin-container { flex-direction: column; max-width: 90%; }
  .left-column, .right-column { width: 100%; }
  h1 { font-size: 26px; padding-top: 40px; }
}

@media (max-width: 600px) {
  .left-column { gap: 10px; }
  input, textarea { font-size: 14px; padding: 8px; }
  button { font-size: 16px; }
  .upload-box { padding: 20px; }
  #previewImage { max-width: 80%; }
}
</style>

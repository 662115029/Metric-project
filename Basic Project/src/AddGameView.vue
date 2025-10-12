<template>
  <div class="page">
    <h2>Add New Game</h2>

    <form class="form" @submit.prevent="onSubmit" enctype="multipart/form-data">
      <label for="title">Game Title:</label>
      <input id="title" type="text" v-model.trim="title" required />

      <label for="release_date">Release Date:</label>
      <input id="release_date" type="date" v-model="releaseDate" required />

      <label for="price">Price ($):</label>
      <input id="price" type="number" step="0.01" v-model.number="price" required />

      <label for="promo_price">Promotional Price ($):</label>
      <input id="promo_price" type="number" step="0.01" v-model.number="promoPrice" />

      <label for="developer">Developer:</label>
      <input id="developer" type="text" v-model.trim="developer" required />

      <label for="description">Description:</label>
      <textarea id="description" rows="4" v-model.trim="description" required />

      <label>Game Thumbnail:</label>
      <div
        class="upload-box"
        id="dropZone"
        @click="openPicker"
        @dragover.prevent
        @dragenter.prevent
        @drop.prevent="onDrop"
      >
        <p>Drag & Drop an image or click to upload</p>
        <input ref="fileInput" type="file" id="thumbnail" accept="image/*" hidden @change="onFileChange" />
      </div>
      <img v-if="previewUrl" :src="previewUrl" id="previewImage" alt="Preview" />

      <label for="category">Category:</label>
      <select id="category" v-model="categoryId" required>
        <option value="">Select a category</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>

      <button type="submit" :disabled="isSubmitting || isLoadingCat">
        {{ isSubmitting ? 'Submitting…' : 'Add Game' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// ====== State ======
const title = ref('')
const releaseDate = ref('')
const price = ref(null)
const promoPrice = ref(0)
const developer = ref('')
const description = ref('')
const categoryId = ref('')

const fileInput = ref(null)
const file = ref(null)
const previewUrl = ref('')

const categories = ref([])
const isLoadingCat = ref(false)
const isSubmitting = ref(false)

// ====== Config ======
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

// ====== File handling ======
const openPicker = () => fileInput.value?.click()

const setPreview = (f) => {
  if (!f) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(f)
}

const onFileChange = (e) => {
  const f = e.target.files?.[0]
  if (f) {
    file.value = f
    setPreview(f)
  }
}

const onDrop = (e) => {
  const f = e.dataTransfer?.files?.[0]
  if (f) {
    file.value = f
    if (fileInput.value) fileInput.value.files = e.dataTransfer.files
    setPreview(f)
  }
}

// ====== Load categories ======
const loadCategories = async () => {
  isLoadingCat.value = true
  try {
    const res = await fetch(`${API_BASE}/api/categories`)
    const data = await res.json()
    categories.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error fetching categories:', err)
    categories.value = []
  } finally {
    isLoadingCat.value = false
  }
}

onMounted(loadCategories)

// ====== Submit ======
const onSubmit = async () => {
  const token = localStorage.getItem('adminToken')
  if (!token) {
    alert('You must be logged in as an admin to add games')
    return
  }
  if (!file.value) {
    alert('Please select a thumbnail image')
    return
  }

  const fd = new FormData()
  fd.append('title', title.value)
  fd.append('release_date', releaseDate.value)
  fd.append('price', price.value ?? '')
  fd.append('promo_price', promoPrice.value ?? 0)
  fd.append('developer', developer.value)
  fd.append('description', description.value)
  fd.append('thumbnail', file.value)
  fd.append('category_id', categoryId.value)

  isSubmitting.value = true
  try {
    const res = await fetch(`${API_BASE}/api/add-game`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })

    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { data = {} }

    if (!res.ok) throw new Error(data.message || 'Unknown error')

    alert('Game added successfully!')
    resetForm()
  } catch (err) {
    console.error('Submit error:', err)
    alert(`Error: ${err.message}`)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  title.value = ''
  releaseDate.value = ''
  price.value = null
  promoPrice.value = 0
  developer.value = ''
  description.value = ''
  categoryId.value = ''
  file.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  fileInput.value && (fileInput.value.value = '')
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<style scoped>
.page {
  font-family: Arial, sans-serif;
  margin: 20px;
  padding: 20px;
  background-color: #250101;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h2 {
  text-align: center;
  color: white;
}

.form {
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
  background: linear-gradient(to bottom, #ddd 30%, #281616 100%);
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

input,
textarea,
select {
  width: 80%;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: block;
  text-align: center;
}

button {
  background: #28a745;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  width: 100%;
}

button:hover {
  background: #218838;
}

.upload-box {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
  width: 80%;
  margin: 10px 0;
}

#previewImage {
  margin-top: 10px;
  max-width: 100%;
  border-radius: 5px;
}
</style>
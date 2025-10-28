<template>
  <div class="min-h-screen bg-[#250101] flex flex-col items-center p-5">
    <h2 class="text-center text-white text-2xl font-bold mb-5">Add New Game</h2>

    <form 
      class="w-full max-w-[500px] bg-gradient-to-b from-[#ddd] via-[#ddd] to-[#281616] p-5 rounded-lg flex flex-col items-center" 
      @submit.prevent="onSubmit" 
      enctype="multipart/form-data"
    >
      <label for="title" class="text-gray-800 font-medium mb-1">Game Title:</label>
      <input 
        id="title" 
        type="text" 
        v-model.trim="title" 
        required 
        class="w-4/5 my-2.5 px-2.5 py-2.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label for="release_date" class="text-gray-800 font-medium mb-1 mt-2">Release Date:</label>
      <input 
        id="release_date" 
        type="date" 
        v-model="releaseDate" 
        required 
        class="w-4/5 my-2.5 px-2.5 py-2.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label for="price" class="text-gray-800 font-medium mb-1 mt-2">Price ($):</label>
      <input 
        id="price" 
        type="number" 
        step="0.01" 
        v-model.number="price" 
        required 
        class="w-4/5 my-2.5 px-2.5 py-2.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label for="promo_price" class="text-gray-800 font-medium mb-1 mt-2">Promotional Price ($):</label>
      <input 
        id="promo_price" 
        type="number" 
        step="0.01" 
        v-model.number="promoPrice" 
        class="w-4/5 my-2.5 px-2.5 py-2.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label for="developer" class="text-gray-800 font-medium mb-1 mt-2">Developer:</label>
      <input 
        id="developer" 
        type="text" 
        v-model.trim="developer" 
        required 
        class="w-4/5 my-2.5 px-2.5 py-2.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label for="description" class="text-gray-800 font-medium mb-1 mt-2">Description:</label>
      <textarea 
        id="description" 
        rows="4" 
        v-model.trim="description" 
        required 
        class="w-4/5 my-2.5 px-2.5 py-2.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label class="text-gray-800 font-medium mb-1 mt-2">Game Thumbnail:</label>
      <div
        class="bg-white p-5 rounded text-center cursor-pointer w-4/5 my-2.5 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
        id="dropZone"
        @click="openPicker"
        @dragover.prevent
        @dragenter.prevent
        @drop.prevent="onDrop"
      >
        <p class="text-gray-600">Drag & Drop an image or click to upload</p>
        <input 
          ref="fileInput" 
          type="file" 
          id="thumbnail" 
          accept="image/*" 
          hidden 
          @change="onFileChange" 
        />
      </div>
      <img 
        v-if="previewUrl" 
        :src="previewUrl" 
        id="previewImage" 
        alt="Preview" 
        class="mt-2.5 max-w-full rounded"
      />

      <label for="category" class="text-gray-800 font-medium mb-1 mt-2">Category:</label>
      <select 
        id="category" 
        v-model="categoryId" 
        required 
        class="w-4/5 my-2.5 px-2.5 py-2.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a category</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>

      <button 
        type="submit" 
        :disabled="isSubmitting || isLoadingCat"
        class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2.5 px-5 border-none cursor-pointer w-full rounded mt-4 transition-colors"
      >
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
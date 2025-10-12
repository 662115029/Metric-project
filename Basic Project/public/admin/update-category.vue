<template>
  <div class="admin-container">
    <h1>Update Category Information</h1>

    <form id="categoryForm" @submit.prevent="onSubmit">
      <label for="categorySelect">Select Category:</label>
      <select id="categorySelect" v-model="selectedId" required @change="onPick">
        <option value="">Select a category</option>
        <option v-for="c in categories" :key="c.id" :value="String(c.id)">
          {{ c.name }}
        </option>
      </select>

      <label>
        Category Name:
        <input type="text" id="categoryName" v-model.trim="name" required />
      </label>

      <div class="upload-box" id="dropZone"
           @click="openPicker"
           @dragover.prevent
           @dragenter.prevent
           @drop.prevent="onDrop">
        <p>Drag & Drop an image or click to upload</p>
        <input ref="fileInput" type="file" id="categoryIcon" accept="image/*" hidden @change="onFileChange" />
      </div>

      <img v-if="previewUrl" :src="previewUrl" id="previewImage" alt="Preview" />

      <button type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Updating…' : 'Update Category' }}</button>

      <!-- If using Router, replace with <RouterLink> -->
      <a href="./category-management.html">Return to action selection</a>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

const categories = ref([])
const selectedId = ref('')
const name = ref('')

const fileInput = ref(null)
const file = ref(null)
const previewUrl = ref('')
const isSubmitting = ref(false)

function openPicker() { fileInput.value?.click() }

function setPreview(f) {
  if (!f) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(f)
}

function onFileChange(e) {
  const f = e.target.files?.[0]
  if (f) { file.value = f; setPreview(f) }
}

function onDrop(e) {
  const f = e.dataTransfer?.files?.[0]
  if (f) {
    file.value = f
    if (fileInput.value) fileInput.value.files = e.dataTransfer.files
    setPreview(f)
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

function onPick() {
  const c = categories.value.find(x => String(x.id) === String(selectedId.value))
  if (c) {
    name.value = c.name || ''
    // If backend returns existing icon URL, you could show it here (optional)
    // previewUrl.value = c.iconUrl || ''
  } else {
    name.value = ''
  }
}

async function onSubmit() {
  const token = localStorage.getItem('adminToken')
  if (!token) { alert('You must be logged in as an admin to update categories'); return }
  if (!selectedId.value) { alert('Please select a category'); return }

  const fd = new FormData()
  fd.append('category_name', name.value)
  if (file.value) fd.append('icon', file.value)

  isSubmitting.value = true
  try {
    const res = await fetch(`${API_BASE}/api/categories/${encodeURIComponent(selectedId.value)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Failed to update category')

    alert('Category updated successfully!')
    // Optional refresh list / clear file
    await loadCategories()
    file.value = null
    if (previewUrl.value) { URL.revokeObjectURL(previewUrl.value); previewUrl.value = '' }
  } catch (e) {
    alert(`Error: ${e.message}`)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(loadCategories)

onBeforeUnmount(() => { if (previewUrl.value) URL.revokeObjectURL(previewUrl.value) })
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
  font-family: 'Gill Sans', Calibri, sans-serif;
}

.admin-container {
  background: linear-gradient(to bottom, #ddd 30%, #281616 100%);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-sizing: border-box;
  min-height: 500px; /* Increased height */
}

h1 { font-size: 28px; margin-bottom: 15px; }

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 10px;
  text-align: center;
}

label { font-size: 16px; width: 100%; max-width: 250px; display: inline-block; text-align: left; }

input, textarea, select {
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  max-width: 450px;
  box-sizing: border-box;
}

textarea { height: 80px; resize: none; }

.upload-box {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  width: auto;
  max-width: 240px;
  margin: 20px 0;
}

#previewImage {
  margin-top: 10px;
  max-width: 100%;
  border-radius: 5px;
}

button, a {
  background-color: white;
  padding: 10px 15px;
  font-size: 18px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
  color: black;
}

button:hover { background-color: #d1d1d1; }

@media (max-width: 600px) { .admin-container { max-width: 90%; } }
</style>

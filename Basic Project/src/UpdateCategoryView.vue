<template>
  <div class="text-black bg-[#250101] flex justify-center items-center min-h-screen m-0 p-5 font-['Gill_Sans',Calibri,sans-serif]">
    <div class="bg-gradient-to-b from-[#ddd] via-[#ddd] to-[#281616] p-5 rounded-lg shadow-[0px_4px_8px_rgba(0,0,0,0.2)] text-center w-full max-w-[400px] flex flex-col items-center gap-5 box-border min-h-[500px] sm:max-w-[90%]">
      <h1 class="text-[28px] mb-3.5 font-bold">Update Category Information</h1>

      <form 
        id="categoryForm" 
        @submit.prevent="onSubmit"
        class="flex flex-col items-center w-full gap-2.5 text-center"
      >
        <label for="categorySelect" class="text-base w-full max-w-[250px] inline-block text-left font-medium">
          Select Category:
        </label>
        <select 
          id="categorySelect" 
          v-model="selectedId" 
          required 
          @change="onPick"
          class="py-2 px-3 text-base border border-gray-300 rounded w-full max-w-[450px] box-border focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          <option v-for="c in categories" :key="c.id" :value="String(c.id)">
            {{ c.name }}
          </option>
        </select>

        <label class="text-base w-full max-w-[250px] inline-block text-left font-medium mt-2">
          Category Name:
          <input 
            type="text" 
            id="categoryName" 
            v-model.trim="name" 
            required 
            class="py-2 px-3 text-base border border-gray-300 rounded w-full max-w-[450px] box-border mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <div 
          class="bg-white p-7 rounded-lg text-center cursor-pointer w-auto max-w-[240px] my-5 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors" 
          id="dropZone"
          @click="openPicker"
          @dragover.prevent
          @dragenter.prevent
          @drop.prevent="onDrop"
        >
          <p class="m-0 text-gray-600">Drag & Drop an image or click to upload</p>
          <input 
            ref="fileInput" 
            type="file" 
            id="categoryIcon" 
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

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="bg-white hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed py-2.5 px-4 text-lg rounded border-none cursor-pointer transition-colors text-black mt-2"
        >
          {{ isSubmitting ? 'Updating…' : 'Update Category' }}
        </button>

        <!-- If using Router, replace with <RouterLink> -->
        <a 
          href="./category-management.html"
          class="bg-white hover:bg-gray-300 py-2.5 px-4 text-lg rounded border-none cursor-pointer transition-colors no-underline text-black inline-block"
        >
          Return to action selection
        </a>
      </form>
    </div>
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
<template>
  <div class="flex justify-center items-center min-h-screen bg-[#250101] p-5">
    <div class="bg-gradient-to-b from-[#ddd] from-30% to-[#281616] p-5 rounded-xl shadow-lg text-center w-full max-w-md flex flex-col items-center gap-5 min-h-[500px]">
      <h1 class="text-3xl mb-4 text-black">Enter New Category Information</h1>

      <form @submit.prevent="onSubmit" class="flex flex-col items-center w-full gap-2.5 text-center">
        <label class="text-base w-full max-w-[250px] inline-block text-left text-black">
          Category Name:
          <input 
            type="text" 
            v-model.trim="categoryName" 
            required 
            class="p-2 text-base border border-gray-300 rounded w-full max-w-[450px] box-border text-black mt-1"
          />
        </label>

        <div
          class="bg-white p-8 rounded-xl text-center cursor-pointer w-auto max-w-[240px] my-5"
          id="dropZone"
          @click="openFilePicker"
          @dragover.prevent
          @dragenter.prevent
          @drop.prevent="onDrop"
        >
          <p class="text-black">Drag & Drop an image or click to upload</p>
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
          class="bg-white py-2.5 px-4 text-lg rounded border-none cursor-pointer transition-colors duration-300 text-black hover:bg-[#d1d1d1] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Adding…' : 'Add Category' }}
        </button>

        <!-- If you use Vue Router, replace with <RouterLink> -->
        <a 
          href="./category-management.html"
          class="bg-white py-2.5 px-4 text-lg rounded border-none cursor-pointer transition-colors duration-300 no-underline text-black hover:bg-[#d1d1d1]"
        >
          Return to action selection
        </a>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

// ====== State ======
const categoryName = ref('')
const fileInput = ref(null)
const file = ref(null)
const previewUrl = ref('')
const isSubmitting = ref(false)

// ====== Config ======
// Prefer .env files in Vite: VITE_API_BASE=http://localhost:3000
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

// ====== Methods ======
const openFilePicker = () => {
  fileInput.value?.click()
}

const setPreviewFromFile = (f) => {
  if (!f) return
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = URL.createObjectURL(f)
}

const onFileChange = (e) => {
  const f = e.target.files?.[0]
  if (f) {
    file.value = f
    setPreviewFromFile(f)
  }
}

const onDrop = (e) => {
  const f = e.dataTransfer?.files?.[0]
  if (f) {
    file.value = f
    // reflect in the hidden input for consistency
    if (fileInput.value) fileInput.value.files = e.dataTransfer.files
    setPreviewFromFile(f)
  }
}

const adminToken = computed(() => localStorage.getItem('adminToken'))

const onSubmit = async () => {
  if (!adminToken.value) {
    alert('You must be logged in as an admin to add categories')
    return
  }
  if (!categoryName.value) {
    alert('Please enter a category name')
    return
  }

  const formData = new FormData()
  formData.append('category_name', categoryName.value)
  if (file.value) formData.append('icon', file.value)

  isSubmitting.value = true
  try {
    const res = await fetch(`${API_BASE}/api/add-category`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken.value}`,
      },
      body: formData,
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Failed to add category')

    alert('Category added successfully!')
    // Reset form
    categoryName.value = ''
    file.value = null
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
    // If you want a redirect, use Vue Router here
    // router.push({ name: 'CategoryManagement' })
  } catch (err) {
    alert(`Error: ${err.message}`)
  } finally {
    isSubmitting.value = false
  }
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<style scoped>
body {
  color: black;
  background-color: #250101;
  font-family: 'Gill Sans', Calibri, sans-serif;
}
</style>
<template>
  <div class="admin-container">
    <h1>Enter New Category Information</h1>

    <form @submit.prevent="onSubmit" id="categoryForm">
      <label>
        Category Name:
        <input type="text" v-model.trim="categoryName" required />
      </label>

      <div
        class="upload-box"
        id="dropZone"
        @click="openFilePicker"
        @dragover.prevent
        @dragenter.prevent
        @drop.prevent="onDrop"
      >
        <p>Drag & Drop an image or click to upload</p>
        <input
          ref="fileInput"
          type="file"
          id="categoryIcon"
          accept="image/*"
          hidden
          @change="onFileChange"
        />
      </div>

      <img v-if="previewUrl" :src="previewUrl" id="previewImage" alt="Preview" />

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Adding…' : 'Add Category' }}
      </button>

      <!-- If you use Vue Router, replace with <RouterLink> -->
      <a href="./category-management.html">Return to action selection</a>
    </form>
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

h1 {
  font-size: 28px;
  margin-bottom: 15px;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 10px;
  text-align: center; /* Centering the input and label elements */
}

label {
  font-size: 16px;
  width: 100%;
  max-width: 250px;
  display: inline-block; /* Ensure label takes up full width */
  text-align: left; /* Align the label text to the left */
}

input,
textarea {
  padding: 8px 12px; /* Reduced padding */
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%; /* Full width */
  max-width: 450px; /* Consistent */
  box-sizing: border-box; /* Includes padding */
}

textarea {
  height: 80px;
  resize: none;
}

.upload-box {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  width: auto;
  max-width: 240px; /* Same as input width */
  margin: 20px 0;
}

#previewImage {
  margin-top: 10px;
  max-width: 100%;
  border-radius: 5px;
}

button,
a {
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

button:hover {
  background-color: #d1d1d1;
}

@media (max-width: 600px) {
  .admin-container {
    max-width: 90%;
  }
}
</style>
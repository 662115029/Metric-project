// src/services/api.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('adminToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// =============================================
// AUTH API
// =============================================

export const authAPI = {
  register: (username, password) => 
    api.post('/register', { username, password }),
  
  login: (username, password) => 
    api.post('/login', { username, password }),
  
  adminLogin: (username, password) => 
    api.post('/admin-login', { username, password }),
  
  logout: () => 
    api.post('/logout')
}

// =============================================
// GAMES API
// =============================================

export const gamesAPI = {
  getAll: (categoryId = null) => 
    api.get('/games', { params: categoryId ? { category_id: categoryId } : {} }),
  
  getById: (gameId) => 
    api.get(`/games/${gameId}`),
  
  add: (formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } }
    return api.post('/add-game', formData, config)
  },
  
  update: (gameId, formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } }
    return api.put(`/games/${gameId}`, formData, config)
  },
  
  delete: (gameId) => 
    api.delete(`/games/${gameId}`)
}

// =============================================
// CATEGORIES API
// =============================================

export const categoriesAPI = {
  getAll: () => 
    api.get('/categories'),
  
  add: (formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } }
    return api.post('/add-category', formData, config)
  },
  
  update: (categoryId, formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } }
    return api.put(`/categories/${categoryId}`, formData, config)
  },
  
  delete: (categoryId) => 
    api.delete(`/categories/${categoryId}`)
}

// =============================================
// CART API
// =============================================

export const cartAPI = {
  get: () => 
    api.get('/cart'),
  
  add: (gameId, quantity = 1) => 
    api.post('/cart/add', { game_id: gameId, quantity }),
  
  clear: () => 
    api.delete('/cart/clear')
}

// =============================================
// PURCHASE API
// =============================================

export const purchaseAPI = {
  complete: (games) => 
    api.post('/purchased_games/add', { games }),
  
  getUserPurchases: (userId) => 
    api.get(`/purchased-games/${userId}`)
}

export default api
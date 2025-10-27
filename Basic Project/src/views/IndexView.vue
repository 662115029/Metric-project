<!--
**********************************************************************************
THIS PAGE MUST INCLUDE:
 - At least 2 interactive techniques (Carousel, Search+Sort, Quick View Modal)
 - At least 2 Bootstrap components (Carousel, Cards, Modal, Navbar)
 - Products show original & promotional price ALWAYS
**********************************************************************************
-->
<template>
  <div class="custom-bg">
    <!-- Navbar slot (โหลดด้วย window.loadNavbar ถ้ามี) -->
    <div id="navbar-container"></div>

    <!-- Sale Banner - Bootstrap Carousel -->
    <div class="container mt-4">
      <h2 class="text-center text-warning">SALES</h2>

      <div id="saleCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
        <div class="carousel-inner" id="saleBanner">
          <div class="carousel-item" :class="{ active: index === 0 }" v-for="(sale, index) in sales" :key="sale.id">
            <div class="sale-game-container">
              <div class="game-cover">
                <img :src="sale.image" :alt="sale.title" />
              </div>
              <div class="game-info">
                <div class="game-title">{{ sale.title }}</div>
                <div class="price-container">
                  <div class="original-price">{{ sale.originalPrice }}</div>
                  <div class="arrow">→</div>
                  <div class="sale-price">{{ sale.salePrice }}</div>
                </div>
                <div class="discount-label">{{ sale.discount }}</div>
                <button class="btn btn-outline-light mt-3" @click="openQuickView(sale)">Quick View</button>
              </div>
            </div>
          </div>
        </div>

        <button class="carousel-control-prev" type="button" data-bs-target="#saleCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#saleCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>

    <!-- Controls: Search + Sort -->
    <div class="container mt-5">
      <div class="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
        <input class="form-control" v-model="search" placeholder="Search featured games..." />
        <select class="form-select w-auto" v-model="sortBy">
          <option value="title">Sort: Title</option>
          <option value="priceAsc">Sort: Price ↑</option>
          <option value="priceDesc">Sort: Price ↓</option>
          <option value="discountDesc">Sort: Discount % ↓</option>
        </select>
      </div>
    </div>

    <!-- Featured Section -->
    <h2 class="section-heading mt-4 text-center text-success">Featured</h2>
    <div class="container">
      <div class="row g-4" id="gameList">
        <div class="col-md-3" v-for="game in sortedAndFiltered" :key="game.id">
          <div class="card h-100 shadow-sm game-item">
            <img class="card-img-top game-image" :src="game.image" :alt="game.title" />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ game.title }}</h5>

              <!-- แสดงราคาเต็มและราคาลดเสมอ -->
              <div class="d-flex align-items-baseline gap-2 mb-2">
                <span class="text-decoration-line-through text-danger fw-semibold">{{ game.originalPrice }}</span>
                <span class="fw-bold">{{ game.salePrice }}</span>
                <span class="badge bg-warning text-dark ms-auto">{{ game.discount }}</span>
              </div>

              <div class="d-flex gap-2 mt-auto">
                <button class="btn btn-primary w-100" @click="addToCart(game)">Add to Cart</button>
                <button class="btn btn-outline-secondary" @click="openQuickView(game)">👁</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast แสดงสถานะเพิ่มสินค้า (Interactive) -->
      <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1080">
        <div ref="toastEl" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <strong class="me-auto">Cart</strong>
            <small>now</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            {{ toastMsg }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Quick View (Bootstrap Modal) -->
    <div class="modal fade" id="quickViewModal" tabindex="-1" aria-hidden="true" ref="modalEl">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modalItem?.title || 'Quick View' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"/>
          </div>
          <div class="modal-body">
            <img v-if="modalItem" :src="modalItem.image" :alt="modalItem.title" class="img-fluid rounded mb-3" />
            <p v-if="modalItem">
              <span class="text-decoration-line-through text-danger me-2">{{ modalItem.originalPrice }}</span>
              <span class="fw-bold">{{ modalItem.salePrice }}</span>
              <span class="badge bg-warning text-dark ms-2">{{ modalItem.discount }}</span>
            </p>
            <p v-if="modalItem">{{ modalItem.description || 'No description.' }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button class="btn btn-primary" @click="addToCart(modalItem)">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Modal, Toast } from 'bootstrap'

// --- Sales (carousel) ---
const sales = ref([
  { id: 1, title: 'Cyber Adventure', image: 'assets/images/sale1.jpg', originalPrice: '$59.99', salePrice: '$29.99', discount: '50% OFF', description: 'Open-world sci-fi action.' },
  { id: 2, title: 'Space Warriors', image: 'assets/images/sale2.jpg', originalPrice: '$49.99', salePrice: '$24.99', discount: '50% OFF', description: 'Epic space battles.' },
])

// --- Featured (cards) — มีราคาเต็ม+ราคาลดเสมอ ---
const featuredGames = ref([
  { id: 101, title: 'Legend Quest',   image: 'assets/images/game1.jpg', originalPrice: '$49.99', salePrice: '$39.99', discount: '20% OFF' },
  { id: 102, title: 'Battlefield',    image: 'assets/images/game2.jpg', originalPrice: '$59.99', salePrice: '$49.99', discount: '17% OFF' },
  { id: 103, title: 'Sky Fighters',   image: 'assets/images/game3.jpg', originalPrice: '$69.99', salePrice: '$59.99', discount: '14% OFF' },
  { id: 104, title: 'Racing Pro',     image: 'assets/images/game4.jpg', originalPrice: '$39.99', salePrice: '$29.99', discount: '25% OFF' },
])

// Interactive: Search + Sort
const search = ref('')
const sortBy = ref('title')
const sortedAndFiltered = computed(() => {
  const norm = (s) => s.toLowerCase()
  let list = featuredGames.value.filter(g => norm(g.title).includes(norm(search.value)))

  const priceNum = (p) => Number((p || '0').replace(/[^0-9.]/g, '')) || 0
  const discountNum = (d) => Number((d || '0').replace(/[^0-9]/g, '')) || 0

  if (sortBy.value === 'title') list.sort((a,b)=> a.title.localeCompare(b.title))
  if (sortBy.value === 'priceAsc') list.sort((a,b)=> priceNum(a.salePrice) - priceNum(b.salePrice))
  if (sortBy.value === 'priceDesc') list.sort((a,b)=> priceNum(b.salePrice) - priceNum(a.salePrice))
  if (sortBy.value === 'discountDesc') list.sort((a,b)=> discountNum(b.discount) - discountNum(a.discount))

  return list
})

// Interactive: Modal + Toast
let modal, toast
const modalItem = ref(null)
const toastMsg = ref('')
const modalEl = ref(null)
const toastEl = ref(null)

const openQuickView = (item) => {
  modalItem.value = item
  modal?.show()
}
const addToCart = (item) => {
  toastMsg.value = `Added "${item.title}" to cart`
  toast?.show()
}

onMounted(async () => {
  if (window.loadNavbar) window.loadNavbar()

  // Bootstrap JS objects (assumes Bootstrap JS loaded in index.html)
  const { Modal, Toast } = await import('bootstrap')
  modal = new Modal(modalEl.value)
  toast = new Toast(toastEl.value)
})
</script>

<style scoped>
/* ใช้สไตล์เดิมของคุณ + เพิ่มเล็กน้อยให้เข้ากับการ์ด */
.carousel-item { background-color: rgba(0,0,0,0.5); }
.sale-game-container { display:flex; align-items:center; padding:20px; min-height:400px; }
.game-cover{ width:40%; display:flex; justify-content:center; }
.game-cover img{ max-width:100%; object-fit:contain; border-radius:5px; }
.game-info{ width:60%; padding:20px 40px; color:#fff; background:rgba(30,30,30,.7); border-radius:0 10px 10px 0; }
.game-title{ font-size:2rem; font-weight:700; }
.price-container{ display:flex; gap:12px; align-items:center; margin-top:10px; }
.original-price{ font-size:1.6rem; color:#ff5555; text-decoration:line-through; }
.sale-price{ font-size:1.6rem; font-weight:700; }
.discount-label{ font-size:1rem; color:#000; background:#ffcc00; padding:.2rem .6rem; border-radius:.5rem; display:inline-block; margin-top:8px; }
.game-item:hover { transform: translateY(-2px); transition: .2s ease; }
</style>

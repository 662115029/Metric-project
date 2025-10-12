<!--
**********************************************************************************
THIS PAGE MUST INCLUDE:
**********************************************************************************
 - At least 2 interactive techniques!
 - At least 2 Bootstrap components!
 - Products displayed must have original and promotional price visible at ALL
   TIMES and on EVERY PAGE!
**********************************************************************************
-->
<template>
  <div class="custom-bg">
    <!-- Navbar -->
    <div id="navbar-container"></div>

    <!-- Sale Banner using Bootstrap Carousel -->
    <div class="container mt-4">
      <h2 class="text-center text-warning">SALES</h2>
      <div
        id="saleCarousel"
        class="carousel slide"
        data-bs-ride="carousel"
        data-bs-interval="5000"
      >
        <div class="carousel-inner" id="saleBanner">
          <div
            class="carousel-item"
            :class="{ active: index === 0 }"
            v-for="(sale, index) in sales"
            :key="sale.id"
          >
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
              </div>
            </div>
          </div>
        </div>

        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#saleCarousel"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#saleCarousel"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>

    <!-- Featured Section -->
    <h2 class="section-heading mt-5 text-center text-success">Featured</h2>
    <div class="container">
      <div class="row" id="gameList">
        <div
          class="col-md-3 mb-4"
          v-for="game in featuredGames"
          :key="game.id"
        >
          <div class="game-item">
            <img class="game-image" :src="game.image" :alt="game.title" />
            <div class="game-title">{{ game.title }}</div>
            <div class="game-price">{{ game.price }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Example data for sales (replace with your API/fetch logic)
const sales = ref([
  {
    id: 1,
    title: 'Cyber Adventure',
    image: 'assets/images/sale1.jpg',
    originalPrice: '$59.99',
    salePrice: '$29.99',
    discount: '50% OFF',
  },
  {
    id: 2,
    title: 'Space Warriors',
    image: 'assets/images/sale2.jpg',
    originalPrice: '$49.99',
    salePrice: '$24.99',
    discount: '50% OFF',
  },
])

// Example data for featured games
const featuredGames = ref([
  { id: 1, title: 'Legend Quest', image: 'assets/images/game1.jpg', price: '$39.99' },
  { id: 2, title: 'Battlefield', image: 'assets/images/game2.jpg', price: '$49.99' },
  { id: 3, title: 'Sky Fighters', image: 'assets/images/game3.jpg', price: '$59.99' },
  { id: 4, title: 'Racing Pro', image: 'assets/images/game4.jpg', price: '$29.99' },
])

onMounted(() => {
  if (window.loadNavbar) {
    window.loadNavbar()
  }
})
</script>

<style scoped>
/* Keep all your original CSS */
.sales-banner-container {
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  overflow: hidden;
  margin: 20px auto;
  max-width: 1000px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}

.sales-heading {
  color: white;
  font-size: 3.5rem;
  font-weight: 700;
  text-align: center;
  margin: 15px 0;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  letter-spacing: 2px;
}

.carousel-item {
  background-color: rgba(0, 0, 0, 0.5);
}

.sale-game-container {
  display: flex;
  align-items: center;
  padding: 20px;
  height: 400px;
}

.game-cover {
  width: 40%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.game-cover img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  border-radius: 5px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
}

.game-info {
  width: 60%;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  background-color: rgba(30, 30, 30, 0.7);
  height: 100%;
  border-radius: 0 10px 10px 0;
}

.game-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 30px;
  text-transform: uppercase;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.original-price {
  font-size: 2.5rem;
  color: #ff5555;
  font-weight: 600;
  text-decoration: line-through;
}

.arrow {
  font-size: 2.5rem;
  color: white;
}

.sale-price {
  font-size: 2.5rem;
  color: #55ff55;
  font-weight: 700;
}

.discount-label {
  font-size: 1.5rem;
  color: #ffcc00;
  font-weight: 600;
}

.carousel-control-prev,
.carousel-control-next {
  width: 5%;
  opacity: 0.8;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  padding: 15px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .sale-game-container {
    flex-direction: column;
    height: auto;
  }

  .game-cover,
  .game-info {
    width: 100%;
  }

  .game-cover {
    height: 200px;
  }

  .game-info {
    border-radius: 0 0 10px 10px;
  }

  .game-title {
    font-size: 2rem;
    margin-bottom: 15px;
  }

  .original-price,
  .arrow,
  .sale-price {
    font-size: 1.8rem;
  }

  .sales-heading {
    font-size: 2.5rem;
  }

  .discount-label {
    font-size: 1.2rem;
  }
}
</style>
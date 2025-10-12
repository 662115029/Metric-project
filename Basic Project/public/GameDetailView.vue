<!--
**********************************************************************************
THIS PAGE MUST INCLUDE:
**********************************************************************************
 - A redirection to this page when the product is selected in gamelist AND/OR 
   categories!
 - The ability to specify the number of items or product attributes before adding
   to the cart!
 - Products displayed must have original and promotional price visible at ALL
   TIMES and on EVERY PAGE!
**********************************************************************************
-->

<template>
  <div>
    <!-- Navbar (replace with your Navbar component if you have one) -->
    <div id="navbar-container"></div>

    <div class="container">
      <div class="game-content">
        <div class="game-image-container">
          <img
            v-if="game"
            class="game-image"
            :src="game.thumbnail"
            :alt="game.title"
          />
        </div>

        <div class="game-details" v-if="game">
          <h2 class="game-title">{{ game.title }}</h2>
          <div class="game-meta">
            <span>Developer: {{ game.developer || 'Unknown' }}</span>
            <span>Released: {{ formattedReleaseDate }}</span>
          </div>
          <div class="game-description" v-html="game.description || 'No description available.'"></div>
          <div class="game-tags">
            <div class="game-tag" v-for="tag in tags" :key="tag">{{ tag }}</div>
          </div>
        </div>
      </div>

      <div class="purchase-section" v-if="game">
        <h3 class="purchase-title">Add Game to Cart</h3>
        <div class="price-container">
          <span
            v-if="showDiscount"
            class="discount-badge"
          >-{{ discountPercent }}%</span>
          <span
            v-if="showDiscount"
            class="original-price"
          >${{ price.toFixed(2) }}</span>
          <span class="current-price">${{ promoPrice.toFixed(2) }}</span>
        </div>
        <div class="platform-tags">
          <div class="platform-tag">Java</div>
        </div>
        <div class="quantity-selector">
          <label for="quantity">Quantity:</label>
          <select id="quantity" v-model.number="quantity">
            <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <button class="add-to-cart-btn" @click="addToCart">Add to Cart</button>
      </div>

      <div v-if="error" class="error" style="color: red; margin-top: 20px;">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GamePage",
  data() {
    return {
      game: null,
      error: "",
      quantity: 1,
    };
  },
  computed: {
    price() {
      return this.game ? parseFloat(this.game.price) || 0 : 0;
    },
    promoPrice() {
      return this.game
        ? parseFloat(this.game.promo_price) || this.price
        : this.price;
    },
    showDiscount() {
      return this.promoPrice < this.price;
    },
    discountPercent() {
      if (!this.showDiscount) return 0;
      return Math.round((1 - this.promoPrice / this.price) * 100);
    },
    tags() {
      if (!this.game) return [];
      if (this.game.categories && this.game.categories.length > 0)
        return this.game.categories;
      if (this.game.category) return [this.game.category];
      return [];
    },
    formattedReleaseDate() {
      if (!this.game || !this.game.release_date) return "Unknown";
      return new Date(this.game.release_date).toLocaleDateString();
    },
  },
  methods: {
    async fetchGame() {
      const params = new URLSearchParams(window.location.search);
      const gameId = params.get("id");
      if (!gameId) {
        this.error = "Game ID missing in URL.";
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:3000/api/games/${gameId}`
        );
        if (!response.ok) throw new Error("Failed to fetch game details");
        this.game = await response.json();
      } catch (err) {
        this.error = "Error loading game: " + err.message;
      }
    },
    async addToCart() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to add items to cart.");
        return;
      }
      try {
        const response = await fetch(
          "http://localhost:3000/api/cart/add",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              game_id: this.game.id || this.game.game_id,
              quantity: this.quantity,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          alert("Game added to cart successfully!");
        } else {
          alert("Error: " + data.message);
        }
      } catch (err) {
        alert("An error occurred. Please try again.");
      }
    },
  },
  mounted() {
    this.fetchGame();
  },
};
</script>

<style scoped>
body {
    background-color: #250101;
    color: #fff;
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 20px;
}

.gamepage {
    background-color: #700000; /* Dark red/maroon background */
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    color: #fff;
    overflow: hidden;
    padding: 20px;
}

.game-content {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
}

.game-image-container {
    flex: 0 0 100%;
    max-width: 600px;
    background: linear-gradient(to bottom, #2C2C2C 0%, #281616 100%, #250101 100%);
    border-radius: 15px;
    overflow: hidden;
    padding: 15px;
}

.game-image {
    width: 100%;
    height: auto;
    border-radius: 2px;
}

.game-details {
    flex: 1;
    min-width: 300px;
    background: linear-gradient(to bottom, #2C2C2C 0%, #281616 100%, #250101 100%);
    border-radius: 15px;
    padding: 15px 20px;
}

.game-title {
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 15px 0;
}

.game-description {
    line-height: 1.6;
    margin-bottom: 20px;
}

.game-meta {
    margin-bottom: 15px;
}

.game-meta span {
    margin-right: 15px;
    color: #ddd;
    font-size: 14px;
}

.game-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 20px 0;
}

.game-tag {
    background-color: #333;
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 14px;
    display: flex;
    align-items: center;
}

.game-tag::before {
    content: "✓";
    margin-right: 5px;
    color: white;
}

.purchase-section {
    margin-top: 20px;
    background: linear-gradient(to top, #2C2C2C 0%, #281616 100%, #250101 100%);
    border-radius: 15px;
    padding: 15px 20px;
}

.purchase-title {
    font-size: 18px;
    margin-bottom: 15px;
}

.price-container {
    margin-bottom: 15px;
}

.current-price {
    font-size: 22px;
    font-weight: bold;
    color: #fff;
}

.original-price {
    font-size: 16px;
    color: #999;
    text-decoration: line-through;
    margin-right: 10px;
}

.discount-badge {
    background-color: #cc0000;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    display: inline-block;
    margin-right: 10px;
}

.quantity-selector {
    margin-bottom: 15px;
}

.quantity-selector label {
    margin-right: 10px;
}

.quantity-selector select {
    padding: 8px;
    background-color: #333;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
}

.add-to-cart-btn {
    background-color: #ff3333;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
    width: 100%;
    margin-bottom: 10px;
}

.add-to-cart-btn:hover {
    background-color: #e60000;
}

/* Platform/feature tags */
.platform-tags {
    display: flex;
    gap: 15px;
    margin-top: 15px;
}

.platform-tag {
    background-color: #333;
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 14px;
    display: flex;
    align-items: center;
}

.platform-tag::before {
    content: "✓";
    margin-right: 5px;
    color: white;
}

/* Navigation */
.game-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #222;
    padding: 10px 15px;
    border-radius: 4px;
    margin-bottom: 20px;
}

.nav-buttons {
    display: flex;
    gap: 10px;
}

.nav-button {
    background-color: #333;
    border: none;
    color: #fff;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
}

.nav-button:hover {
    background-color: #444;
}

.nav-dropdown {
    position: relative;
}

.nav-dropdown select {
    background-color: #ffffff;
    color: #000;
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.user-section {
    display: flex;
    align-items: center;
    gap: 10px;
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #555;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .game-content {
        flex-direction: column;
    }
    
    .game-image-container,
    .game-details {
        flex: 0 0 100%;
        max-width: 100%;
    }
    
    .nav-buttons {
        flex-wrap: wrap;
    }
}
</style>

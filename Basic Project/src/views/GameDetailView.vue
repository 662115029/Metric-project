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

    <div class="max-w-6xl mx-auto px-5 py-2.5">
      <div class="flex flex-wrap gap-5 mt-5">
        <div class="flex-[0_0_100%] max-w-[600px] bg-gradient-to-b from-neutral-800 via-red-950 to-[#250101] rounded-2xl overflow-hidden p-4">
          <img
            v-if="game"
            class="w-full h-auto rounded"
            :src="game.thumbnail"
            :alt="game.title"
          />
        </div>

        <div class="flex-1 min-w-[300px] bg-gradient-to-b from-neutral-800 via-red-950 to-[#250101] rounded-2xl p-4" v-if="game">
          <h2 class="text-2xl font-bold m-0 mb-4">{{ game.title }}</h2>
          <div class="mb-4">
            <span class="mr-4 text-neutral-300 text-sm">Developer: {{ game.developer || 'Unknown' }}</span>
            <span class="mr-4 text-neutral-300 text-sm">Released: {{ formattedReleaseDate }}</span>
          </div>
          <div class="leading-relaxed mb-5" v-html="game.description || 'No description available.'"></div>
          <div class="flex flex-wrap gap-2.5 my-5">
            <div class="bg-neutral-700 text-white px-2.5 py-1 rounded text-sm flex items-center before:content-['✓'] before:mr-1 before:text-white" v-for="tag in tags" :key="tag">{{ tag }}</div>
          </div>
        </div>
      </div>

      <div class="mt-5 bg-gradient-to-t from-neutral-800 via-red-950 to-[#250101] rounded-2xl p-4" v-if="game">
        <h3 class="text-lg mb-4">Add Game to Cart</h3>
        <div class="mb-4">
          <span
            v-if="showDiscount"
            class="bg-red-700 text-white px-2 py-1 rounded text-sm font-bold inline-block mr-2.5"
          >-{{ discountPercent }}%</span>
          <span
            v-if="showDiscount"
            class="text-base text-neutral-400 line-through mr-2.5"
          >${{ price.toFixed(2) }}</span>
          <span class="text-2xl font-bold text-white">${{ promoPrice.toFixed(2) }}</span>
        </div>
        <div class="flex gap-4 mt-4">
          <div class="bg-neutral-700 text-white px-2.5 py-1 rounded text-sm flex items-center before:content-['✓'] before:mr-1 before:text-white">Java</div>
        </div>
        <div class="mb-4 mt-4">
          <label for="quantity" class="mr-2.5">Quantity:</label>
          <select id="quantity" v-model.number="quantity" class="p-2 bg-neutral-700 text-white border border-neutral-600 rounded">
            <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <button class="bg-red-600 text-white px-5 py-2.5 border-none rounded text-base cursor-pointer transition-colors duration-200 w-full mb-2.5 hover:bg-red-700" @click="addToCart">Add to Cart</button>
      </div>

      <div v-if="error" class="text-red-500 mt-5">
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

/* Responsive adjustments */
@media (max-width: 768px) {
    .flex-wrap > div {
        flex: 0 0 100%;
        max-width: 100%;
    }
}
</style>
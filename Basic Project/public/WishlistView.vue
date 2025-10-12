// idk what to put here


<template>
  <div>
    <!-- Navbar (replace with your Navbar component if you have one) -->
    <div id="navbar-container"></div>
    <div class="container">
      <h1>Wishlist</h1>
      <!-- Add your wishlist items here -->
      <div v-if="wishlist.length === 0" class="no-results">
        Your wishlist is empty.
      </div>
      <div v-else class="wishlist-list">
        <div
          v-for="item in wishlist"
          :key="item.id"
          class="wishlist-item"
        >
          <img :src="item.image" :alt="item.title" class="wishlist-image" />
          <div class="wishlist-details">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <button @click="removeFromWishlist(item.id)">Remove</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WishlistView",
  data() {
    return {
      wishlist: [
        // Example data structure. Replace with actual data or fetch from API.
        // {
        //   id: 1,
        //   title: "Game Title",
        //   description: "Game Description",
        //   image: require('@/assets/images/game1.jpg')
        // }
      ],
    };
  },
  methods: {
    removeFromWishlist(id) {
      this.wishlist = this.wishlist.filter(item => item.id !== id);
    },
    // You can add a method to fetch wishlist items from an API here
  },
  mounted() {
    // Fetch wishlist items here if needed
  },
};
</script>
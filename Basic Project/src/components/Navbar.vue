<template>
  <nav class="navbar">
    <div class="menu-toggle" @click="toggleMobileMenu">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </div>
    <ul class="nav-links" :class="{ open: mobileMenuOpen }">
      <li>
        <router-link to="/">Home</router-link>
      </li>
      <li class="dropdown" @mouseenter="dropdownOpen = true" @mouseleave="dropdownOpen = false">
        <a href="#" @click.prevent="dropdownOpen = !dropdownOpen">
          Games ▾
        </a>
        <ul class="dropdown-menu" v-show="dropdownOpen">
          <li>
            <router-link to="/gamelist">All Games</router-link>
          </li>
          <li>
            <router-link to="/library">Library</router-link>
          </li>
        </ul>
      </li>
      <li>
        <router-link to="/categories">Categories</router-link>
      </li>
      <li class="navbar-search-container">
        <input type="text" v-model="search" placeholder="Search..." />
        <button type="submit" @click="onSearch">
          <i class="fas fa-search"></i>
        </button>
      </li>
      <li>
        <router-link to="/cart">🛒 Basket</router-link>
      </li>
      <li>
        <router-link to="/help">Contact</router-link>
      </li>
      <li id="logout-button-container">
        <button id="logout-button" class="logout-btn" @click="logout">
          Logout
        </button>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: "Navbar",
  data() {
    return {
      dropdownOpen: false,
      mobileMenuOpen: false,
      search: "",
    };
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    onSearch() {
      // Implement your search logic or route to search page
      if (this.search.trim()) {
        this.$router.push({ path: "/gamelist", query: { q: this.search } });
        this.search = "";
      }
    },
    logout() {
      // Implement your logout logic
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
  },
};
</script>
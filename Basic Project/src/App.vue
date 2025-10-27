<template>
  <div>
    <!-- Navbar แสดงเฉพาะถ้า route ไม่ใช่ login หรือ register -->
    <NavbarView v-if="showNavbar" />
    <RouterView />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavbarView from '@/components/Navbar.vue'

const route = useRoute()
const showNavbar = computed(() => {
  return !['login', 'register', 'adminlogin'].includes(route.name)
})
</script>

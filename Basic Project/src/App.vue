<template>
  <div>
    <RouterView v-if="!route.meta?.hideNavbar" />
    <RouterView v-else />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

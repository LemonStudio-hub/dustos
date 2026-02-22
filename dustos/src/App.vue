<template>
  <div class="app-container">
    <div class="theme-flash" :class="{ active: isFlashing }"></div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()
const isFlashing = ref(false)

watch(() => systemStore.isDarkMode, () => {
  isFlashing.value = true
  setTimeout(() => {
    isFlashing.value = false
  }, 300)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.theme-flash {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  opacity: 0;
  pointer-events: none;
  z-index: 99999;
  transition: opacity 0.3s ease;
}

.theme-flash.active {
  opacity: 0.3;
}
</style>
<template>
  <div class="browser">
    <div class="browser-toolbar">
      <div class="navigation-buttons">
        <button class="nav-button" @click="goBack" :disabled="!canGoBack">⬅️</button>
        <button class="nav-button" @click="goForward" :disabled="!canGoForward">➡️</button>
        <button class="nav-button" @click="refresh">🔄</button>
      </div>
      <div class="address-bar">
        <span v-html="securityIcon"></span>
        <input
          type="text"
          v-model="currentUrl"
          @keydown.enter="navigate"
          placeholder="输入网址或搜索"
        />
        <button class="go-button" @click="navigate">→</button>
      </div>
      <div class="action-buttons">
        <button class="nav-button" @click="toggleBookmark" :class="{ active: isBookmarked }">
          {{ isBookmarked ? '⭐' : '☆' }}
        </button>
        <button class="nav-button" @click="showMenu = !showMenu">⋮</button>
      </div>
    </div>

    <div class="browser-menu" v-if="showMenu">
      <div class="menu-item" @click="newTab">新标签页</div>
      <div class="menu-item" @click="zoomIn">放大</div>
      <div class="menu-item" @click="zoomOut">缩小</div>
      <div class="menu-item" @click="zoomReset">重置缩放</div>
      <div class="menu-divider"></div>
      <div class="menu-item" @click="showBookmarks = true">书签</div>
      <div class="menu-item" @click="showHistory = true">历史记录</div>
      <div class="menu-item" @click="toggleDevTools">开发者工具</div>
    </div>

    <div class="browser-content" :style="{ transform: `scale(${zoomLevel})` }">
      <iframe
        v-if="showIframe && isValidUrl"
        :src="currentUrl"
        class="browser-iframe"
        @load="onLoad"
        ref="iframeRef"
      ></iframe>
      <div v-else class="new-tab">
        <div class="logo">🌐</div>
        <h1>dustOS 浏览器</h1>
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            @keydown.enter="search"
            placeholder="搜索或输入网址"
          />
          <button @click="search">搜索</button>
        </div>
        <div class="quick-links">
          <div
            v-for="link in quickLinks"
            :key="link.name"
            class="quick-link"
            @click="navigateTo(link.url)"
          >
            <span>{{ link.icon }}</span>
            <span>{{ link.name }}</span>
          </div>
        </div>
        <div class="bookmarks-list" v-if="bookmarks.length > 0">
          <div class="section-title">书签</div>
          <div class="bookmarks">
            <div
              v-for="bookmark in bookmarks"
              :key="bookmark.id"
              class="bookmark-item"
              @click="navigateTo(bookmark.url)"
            >
              <span>{{ bookmark.icon }}</span>
              <span>{{ bookmark.name }}</span>
              <button class="remove-bookmark" @click.stop="removeBookmark(bookmark.id)">✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loading-bar" v-if="loading">
      <div class="loading-progress" :style="{ width: loadingProgress + '%' }"></div>
    </div>

    <div class="zoom-indicator" v-if="showZoomIndicator">{{ Math.round(zoomLevel * 100) }}%</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Bookmark } from '@/types'

const currentUrl = ref('https://www.example.com')
const searchQuery = ref('')
const history = ref<string[]>([])
const historyIndex = ref(-1)
const loading = ref(false)
const loadingProgress = ref(0)
const zoomLevel = ref(1)
const showMenu = ref(false)
const showBookmarks = ref(false)
const showHistory = ref(false)
const showIframe = ref(false)
const iframeRef = ref<HTMLIFrameElement | null>(null)

const quickLinks = [
  { name: 'Google', icon: '🔍', url: 'https://www.google.com' },
  { name: 'GitHub', icon: '🐙', url: 'https://github.com' },
  { name: 'YouTube', icon: '▶️', url: 'https://www.youtube.com' },
  { name: 'Wikipedia', icon: '📖', url: 'https://www.wikipedia.org' },
  { name: 'Twitter', icon: '🐦', url: 'https://twitter.com' },
  { name: 'Reddit', icon: '🔴', url: 'https://www.reddit.com' },
]

const bookmarks = ref<Bookmark[]>([])

const canGoBack = computed(() => historyIndex.value > 0)
const canGoForward = computed(() => historyIndex.value < history.value.length - 1)
const isValidUrl = computed(() => {
  try {
    new URL(currentUrl.value)
    return true
  } catch {
    return false
  }
})

const isBookmarked = computed(() => {
  return bookmarks.value.some(b => b.url === currentUrl.value)
})

const securityIcon = computed(() => {
  if (currentUrl.value.startsWith('https://')) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
  } else {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
  }
})

let showZoomIndicator = ref(false)
let zoomTimeout: number

function navigate() {
  let url = currentUrl.value.trim()
  if (!url) return

  // 如果不是有效的 URL，将其视为搜索查询
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url
    } else {
      url = 'https://www.google.com/search?q=' + encodeURIComponent(url)
    }
  }

  // 添加到历史记录
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(url)
  historyIndex.value = history.value.length - 1

  currentUrl.value = url
  loadPage()
}

function search() {
  if (searchQuery.value.trim()) {
    currentUrl.value = 'https://www.google.com/search?q=' + encodeURIComponent(searchQuery.value.trim())
    navigate()
  }
}

function loadPage() {
  loading.value = true
  loadingProgress.value = 0
  showIframe.value = false

  const interval = setInterval(() => {
    loadingProgress.value += Math.random() * 20
    if (loadingProgress.value >= 100) {
      clearInterval(interval)
      loadingProgress.value = 100
      setTimeout(() => {
        loading.value = false
        showIframe.value = true
      }, 200)
    }
  }, 200)
}

function onLoad() {
  loading.value = false
  loadingProgress.value = 100
}

function goBack() {
  if (canGoBack.value) {
    historyIndex.value--
    currentUrl.value = history.value[historyIndex.value]
    loadPage()
  }
}

function goForward() {
  if (canGoForward.value) {
    historyIndex.value++
    currentUrl.value = history.value[historyIndex.value]
    loadPage()
  }
}

function refresh() {
  loadPage()
}

function navigateTo(url: string) {
  currentUrl.value = url
  navigate()
}

function toggleBookmark() {
  if (isBookmarked.value) {
    removeBookmarkByUrl(currentUrl.value)
  } else {
    addBookmark()
  }
}

function addBookmark() {
  bookmarks.value.push({
    id: Date.now(),
    name: currentUrl.value,
    url: currentUrl.value,
    icon: '⭐',
  })
}

function removeBookmark(id: number) {
  const index = bookmarks.value.findIndex(b => b.id === id)
  if (index > -1) {
    bookmarks.value.splice(index, 1)
  }
}

function removeBookmarkByUrl(url: string) {
  const index = bookmarks.value.findIndex(b => b.url === url)
  if (index > -1) {
    bookmarks.value.splice(index, 1)
  }
}

function zoomIn() {
  zoomLevel.value = Math.min(zoomLevel.value + 0.1, 2)
  showZoomIndicatorHandler()
}

function zoomOut() {
  zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.5)
  showZoomIndicatorHandler()
}

function zoomReset() {
  zoomLevel.value = 1
  showZoomIndicatorHandler()
}

function showZoomIndicatorHandler() {
  showZoomIndicator.value = true
  clearTimeout(zoomTimeout)
  zoomTimeout = window.setTimeout(() => {
    showZoomIndicator.value = false
  }, 1500)
}

function newTab() {
  currentUrl.value = ''
  showIframe.value = false
  showMenu.value = false
}

function toggleDevTools() {
  alert('开发者工具功能即将推出')
  showMenu.value = false
}

onMounted(() => {
  // 从 localStorage 加载书签
  const savedBookmarks = localStorage.getItem('browser-bookmarks')
  if (savedBookmarks) {
    bookmarks.value = JSON.parse(savedBookmarks)
  }
})

// 保存书签到 localStorage
import { watch } from 'vue'
watch(bookmarks, (newBookmarks) => {
  localStorage.setItem('browser-bookmarks', JSON.stringify(newBookmarks))
}, { deep: true })
</script>

<style scoped>
.browser {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  position: relative;
}

:global(.dark) .browser {
  background: #2a2a2a;
}

.browser-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
}

:global(.dark) .browser-toolbar {
  background: #333333;
  border-bottom-color: #444;
}

.navigation-buttons,
.action-buttons {
  display: flex;
  gap: 4px;
}

.nav-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
  color: inherit;
}

.nav-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

:global(.dark) .nav-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.nav-button.active {
  color: #fbbf24;
}

.address-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
}

:global(.dark) .address-bar {
  background: #444;
  border-color: #555;
}

.address-bar span {
  display: flex;
  align-items: center;
}

.address-bar svg {
  width: 16px;
  height: 16px;
}

.address-bar input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
}

:global(.dark) .address-bar input {
  color: white;
}

.go-button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.go-button:hover {
  opacity: 1;
}

.browser-menu {
  position: absolute;
  top: 100%;
  right: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 180px;
  z-index: 10;
}

:global(.dark) .browser-menu {
  background: #444;
}

.menu-item {
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.15s;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

:global(.dark) .menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.menu-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 4px 0;
}

:global(.dark) .menu-divider {
  background: rgba(255, 255, 255, 0.1);
}

.browser-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  transform-origin: top left;
  transition: transform 0.2s;
}

.browser-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.new-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  overflow-y: auto;
}

.logo {
  font-size: 64px;
  margin-bottom: 16px;
}

h1 {
  margin: 0 0 32px 0;
  font-size: 28px;
  font-weight: 600;
}

.search-box {
  display: flex;
  width: 100%;
  max-width: 500px;
  margin-bottom: 48px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 24px;
  overflow: hidden;
}

.search-box input {
  flex: 1;
  padding: 14px 20px;
  border: none;
  background: #ffffff;
  font-size: 16px;
  outline: none;
}

:global(.dark) .search-box input {
  background: #444;
  color: white;
}

.search-box button {
  padding: 14px 24px;
  border: none;
  background: #667eea;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-box button:hover {
  background: #5568d3;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
  width: 100%;
  max-width: 600px;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.quick-link:hover {
  background: rgba(0, 0, 0, 0.05);
}

:global(.dark) .quick-link:hover {
  background: rgba(255, 255, 255, 0.05);
}

.quick-link span:first-child {
  font-size: 32px;
}

.quick-link span:last-child {
  font-size: 12px;
}

.bookmarks-list {
  margin-top: 40px;
  width: 100%;
  max-width: 600px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  opacity: 0.7;
}

.bookmarks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.bookmark-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.bookmark-item:hover {
  background: rgba(0, 0, 0, 0.1);
}

:global(.dark) .bookmark-item {
  background: rgba(255, 255, 255, 0.05);
}

:global(.dark) .bookmark-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.bookmark-item span:first-child {
  font-size: 20px;
}

.bookmark-item span:nth-child(2) {
  flex: 1;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-bookmark {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.bookmark-item:hover .remove-bookmark {
  opacity: 0.6;
}

.remove-bookmark:hover {
  opacity: 1 !important;
}

.loading-bar {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading-progress {
  height: 100%;
  background: #667eea;
  transition: width 0.1s linear;
}

.zoom-indicator {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 100;
}

@media (max-width: 768px) {
  .browser-toolbar {
    flex-wrap: wrap;
    padding: 8px;
  }

  .address-bar {
    order: 3;
    flex-basis: 100%;
    margin-top: 8px;
  }

  .quick-links {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
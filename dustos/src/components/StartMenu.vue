<template>
  <div class="start-menu-overlay" @click="desktopStore.closeStartMenu">
    <div class="start-menu" :class="{ dark: systemStore.isDarkMode }" @click.stop>
      <div class="start-menu-header">
        <div class="user-info">
          <div class="avatar" v-html="avatarIcon"></div>
          <div class="username">用户</div>
        </div>
      </div>

      <div class="start-menu-body">
        <div class="search-section">
          <div class="search-input-wrapper">
            <span class="search-icon" v-html="searchIcon"></span>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="搜索应用..."
              @input="onSearch"
            />
          </div>
        </div>

        <div class="pinned-section" v-if="!searchQuery">
          <div class="section-title">固定</div>
          <div class="app-grid">
            <div
              v-for="icon in desktopStore.desktopIcons"
              :key="icon.id"
              class="app-item"
              @click="openApp(icon)"
            >
              <div class="app-icon" v-html="icon.icon"></div>
              <span class="app-name">{{ icon.name }}</span>
            </div>
          </div>
        </div>

        <div class="search-results" v-if="searchQuery">
          <div class="section-title">搜索结果</div>
          <div class="search-list">
            <div
              v-for="icon in searchResults"
              :key="icon.id"
              class="search-result-item"
              @click="openApp(icon)"
            >
              <div class="app-icon" v-html="icon.icon"></div>
              <span class="app-name">{{ icon.name }}</span>
            </div>
          </div>
        </div>

        <div class="recommended-section" v-if="!searchQuery">
          <div class="section-title">最近使用</div>
          <div class="recommended-list">
            <div
              v-for="item in recentApps"
              :key="item.id"
              class="recommended-item"
              @click="openApp(item)"
            >
              <span class="icon" v-html="item.icon"></span>
              <span class="name">{{ item.name }}</span>
              <span class="time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="start-menu-footer">
        <button class="footer-item" @click="systemStore.toggleDarkMode">
          <span v-html="themeIcon"></span>
          <span>{{ systemStore.isDarkMode ? '浅色模式' : '深色模式' }}</span>
        </button>
        <button class="footer-item" @click="lockScreen">
          <span v-html="lockIcon"></span>
          <span>锁定</span>
        </button>
        <button class="footer-item">
          <span v-html="powerIcon"></span>
          <span>电源</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDesktopStore } from '@/stores/desktop'
import { useSystemStore } from '@/stores/system'

const desktopStore = useDesktopStore()
const systemStore = useSystemStore()
const searchQuery = ref('')

const avatarIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>')

const searchIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>')

const documentIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>')

const imageIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>')

const musicIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>')

const themeIcon = computed(() => systemStore.isDarkMode
  ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
  : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
)

const lockIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>')

const powerIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>')

// 预构建搜索索引以提高性能
const searchIndex = computed(() => {
  return desktopStore.desktopIcons.map(icon => ({
    ...icon,
    nameLower: icon.name.toLowerCase()
  }))
})

const searchResults = computed(() => {
  if (!searchQuery.value) return []
  const queryLower = searchQuery.value.toLowerCase()
  return searchIndex.value.filter(icon =>
    icon.nameLower.includes(queryLower)
  )
})

const recentApps = computed(() => {
  const allApps = desktopStore.desktopIcons
  return [
    { ...allApps[0], time: '刚刚' },
    { ...allApps[4], time: '5分钟前' },
    { ...allApps[1], time: '1小时前' },
  ]
})

function openApp(icon: any) {
  desktopStore.openWindow(icon)
  desktopStore.closeStartMenu()
}

function onSearch() {
  // 搜索逻辑已在 computed 中处理
}

function lockScreen() {
  desktopStore.closeStartMenu()
  // 锁屏功能将在后续实现
}
</script>

<style scoped>
.start-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: transparent;
}

.start-menu {
  position: absolute;
  bottom: 56px;
  left: 8px;
  width: 500px;
  max-height: 600px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.start-menu.dark {
  background: rgba(40, 40, 40, 0.95);
}

.start-menu-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.start-menu.dark .start-menu-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar svg {
  width: 24px;
  height: 24px;
}

.username {
  font-size: 16px;
  font-weight: 500;
}

.start-menu-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.search-section {
  margin-bottom: 16px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.search-input-wrapper:focus-within {
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.start-menu.dark .search-input-wrapper {
  background: rgba(255, 255, 255, 0.05);
}

.start-menu.dark .search-input-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.1);
}

.search-icon {
  display: flex;
  align-items: center;
  opacity: 0.5;
}

.search-icon svg {
  width: 16px;
  height: 16px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
  min-width: 0;
}

.pinned-section,
.recommended-section,
.search-results {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  opacity: 0.7;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.app-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.start-menu.dark .app-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.app-icon {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
}

.app-icon svg {
  width: 24px;
  height: 24px;
  stroke: #667eea;
}

.app-name {
  font-size: 11px;
  text-align: center;
  word-wrap: break-word;
  line-height: 1.2;
}

.search-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.start-menu.dark .search-result-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.recommended-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recommended-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.recommended-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.start-menu.dark .recommended-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.recommended-item .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.recommended-item .icon svg {
  width: 20px;
  height: 20px;
  stroke: #667eea;
}

.recommended-item .name {
  flex: 1;
  font-size: 13px;
}

.recommended-item .time {
  font-size: 11px;
  opacity: 0.6;
}

.start-menu-footer {
  padding: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 8px;
}

.start-menu.dark .start-menu-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.footer-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.footer-item span:first-child {
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-item svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.footer-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.start-menu.dark .footer-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
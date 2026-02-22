<template>
  <div class="global-search-overlay" :class="{ active: isActive }" @click="close">
    <div class="global-search-container" :class="{ dark: systemStore.isDarkMode }" @click.stop>
      <div class="search-header">
        <div class="search-icon" v-html="searchIcon"></div>
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索应用、文件、设置..."
          @keydown="handleKeydown"
        />
        <div class="search-shortcut">Esc 关闭</div>
      </div>

      <div class="search-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="search-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
          <span v-if="getTabCount(tab.id) > 0" class="tab-count">{{ getTabCount(tab.id) }}</span>
        </button>
      </div>

      <div class="search-results">
        <div v-if="activeTab === 'apps'" class="results-section">
          <div
            v-for="item in appResults"
            :key="item.id"
            class="result-item"
            :class="{ selected: selectedIndex === appResults.indexOf(item) }"
            @click="openApp(item)"
            @mouseenter="selectedIndex = appResults.indexOf(item)"
          >
            <div class="result-icon" v-html="item.icon"></div>
            <div class="result-info">
              <div class="result-title">{{ item.name }}</div>
              <div class="result-subtitle">应用</div>
            </div>
            <div class="result-shortcut">Enter</div>
          </div>
          <div v-if="appResults.length === 0" class="no-results">
            没有找到应用
          </div>
        </div>

        <div v-if="activeTab === 'files'" class="results-section">
          <div
            v-for="item in fileResults"
            :key="item.path"
            class="result-item"
            :class="{ selected: selectedIndex === fileResults.indexOf(item) }"
            @click="openFile(item)"
            @mouseenter="selectedIndex = fileResults.indexOf(item)"
          >
            <div class="result-icon">{{ item.icon }}</div>
            <div class="result-info">
              <div class="result-title">{{ item.name }}</div>
              <div class="result-subtitle">{{ item.path }}</div>
            </div>
            <div class="result-shortcut">Enter</div>
          </div>
          <div v-if="fileResults.length === 0" class="no-results">
            没有找到文件
          </div>
        </div>

        <div v-if="activeTab === 'settings'" class="results-section">
          <div
            v-for="item in settingResults"
            :key="item.id"
            class="result-item"
            :class="{ selected: selectedIndex === settingResults.indexOf(item) }"
            @click="openSetting(item)"
            @mouseenter="selectedIndex = settingResults.indexOf(item)"
          >
            <div class="result-icon">{{ item.icon }}</div>
            <div class="result-info">
              <div class="result-title">{{ item.name }}</div>
              <div class="result-subtitle">{{ item.description }}</div>
            </div>
            <div class="result-shortcut">Enter</div>
          </div>
          <div v-if="settingResults.length === 0" class="no-results">
            没有找到设置
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useDesktopStore } from '@/stores/desktop'
import { useSystemStore } from '@/stores/system'
import { useFilesystemStore } from '@/stores/filesystem'
import type { DesktopIcon, SearchResult, SearchItem } from '@/types'

const props = defineProps<{
  isActive: boolean
}>()

const emit = defineEmits(['close', 'open'])

const desktopStore = useDesktopStore()
const systemStore = useSystemStore()
const filesystemStore = useFilesystemStore()

const searchQuery = ref('')
const activeTab = ref<'apps' | 'files' | 'settings'>('apps')
const selectedIndex = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)

const tabs = [
  { id: 'apps' as const, name: '应用' },
  { id: 'files' as const, name: '文件' },
  { id: 'settings' as const, name: '设置' }
]

const searchIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>')

const appResults = computed<SearchItem[]>(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return desktopStore.desktopIcons.filter(icon =>
    icon.name.toLowerCase().includes(query)
  ).map(icon => ({
    ...icon,
    type: 'app' as const
  }))
})

const fileResults = computed<SearchItem[]>(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return filesystemStore.searchFiles(query)
})

const settingResults = computed<SearchItem[]>(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  const settings: SearchItem[] = [
    { id: 'darkMode', name: '深色模式', description: '切换深色主题', icon: '🌙', type: 'setting' },
    { id: 'wallpaper', name: '壁纸', description: '更换桌面壁纸', icon: '🖼️', type: 'setting' },
    { id: 'volume', name: '音量', description: '调整系统音量', icon: '🔊', type: 'setting' },
    { id: 'sound', name: '音效', description: '系统音效设置', icon: '🔔', type: 'setting' },
    { id: 'wifi', name: 'WiFi', description: '网络连接', icon: '📶', type: 'setting' },
    { id: 'lock', name: '锁屏', description: '锁定屏幕', icon: '🔒', type: 'setting' },
  ]
  return settings.filter(s =>
    s.name.toLowerCase().includes(query) || (s.description && s.description.toLowerCase().includes(query))
  )
})

function getTabCount(tabId: string): number {
  switch (tabId) {
    case 'apps': return appResults.value.length
    case 'files': return fileResults.value.length
    case 'settings': return settingResults.value.length
    default: return 0
  }
}

function handleKeydown(e: KeyboardEvent) {
  const currentResults = getCurrentResults()
  
  if (e.key === 'Escape') {
    close()
    return
  }
  
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, currentResults.length - 1)
    return
  }
  
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
    return
  }
  
  if (e.key === 'Enter') {
    const selectedItem = currentResults[selectedIndex.value]
    if (selectedItem) {
      e.preventDefault()
      selectResult(selectedItem)
    }
    return
  }
  
  if (e.key === 'Tab') {
    e.preventDefault()
    const tabIds: readonly ['apps', 'files', 'settings'] = ['apps', 'files', 'settings']
    const currentIndex = tabIds.indexOf(activeTab.value)
    const nextIndex = (currentIndex + 1) % tabIds.length
    activeTab.value = tabIds[nextIndex] as 'apps' | 'files' | 'settings'
    selectedIndex.value = 0
    return
  }
}

function getCurrentResults(): SearchItem[] {
  const tab = activeTab.value ?? 'apps'
  switch (tab) {
    case 'apps': return appResults.value
    case 'files': return fileResults.value
    case 'settings': return settingResults.value
    default: return []
  }
}

function selectResult(item: SearchItem) {
  if (!item) return

  switch (activeTab.value) {
    case 'apps':
      openApp(item)
      break
    case 'files':
      openFile(item)
      break
    case 'settings':
      openSetting(item)
      break
  }
}

function openApp(icon: SearchItem) {
  desktopStore.openWindow(icon as unknown as DesktopIcon)
  close()
}

function openFile(file: SearchItem) {
  // 打开文件管理器并定位到文件
  const fileManagerIcon = desktopStore.desktopIcons.find(i => i.component === 'FileManager')
  if (fileManagerIcon) {
    desktopStore.openWindow(fileManagerIcon)
  }
  close()
}

function openSetting(setting: SearchItem) {
  switch (setting.id) {
    case 'darkMode':
      systemStore.toggleDarkMode()
      break
    case 'wallpaper':
      // 打开设置并切换到外观
      const settingsIcon = desktopStore.desktopIcons.find(i => i.component === 'Settings')
      if (settingsIcon) {
        desktopStore.openWindow(settingsIcon)
      }
      break
    case 'lock':
      desktopStore.lockScreen()
      break
  }
  close()
}

function close() {
  emit('close')
  searchQuery.value = ''
  selectedIndex.value = 0
}

// 监听激活状态，自动聚焦输入框
watch(() => props.isActive, (active) => {
  if (active) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

// 监听搜索查询变化，重置选中索引
watch(searchQuery, () => {
  selectedIndex.value = 0
})

// 监听标签切换，重置选中索引
watch(activeTab, () => {
  selectedIndex.value = 0
})

// 全局快捷键 Ctrl+Space
function handleGlobalKeydown(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === ' ') {
    e.preventDefault()
    emit('open')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.global-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 10000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.global-search-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.global-search-container {
  width: 600px;
  max-height: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transform: scale(0.95);
  transition: transform 0.2s ease;
}

.global-search-overlay.active .global-search-container {
  transform: scale(1);
}

.global-search-container.dark {
  background: rgba(40, 40, 40, 0.95);
}

.search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.global-search-container.dark .search-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--color-text-secondary);
}

.search-icon svg {
  width: 20px;
  height: 20px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: var(--color-text);
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

.search-shortcut {
  font-size: 12px;
  color: var(--color-text-secondary);
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
}

.global-search-container.dark .search-shortcut {
  background: rgba(255, 255, 255, 0.05);
}

.search-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.global-search-container.dark .search-tabs {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.search-tab {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-tab:hover {
  background: rgba(0, 0, 0, 0.05);
}

.global-search-container.dark .search-tab:hover {
  background: rgba(255, 255, 255, 0.05);
}

.search-tab.active {
  background: var(--color-primary);
  color: white;
}

.tab-count {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
}

.search-results {
  max-height: 350px;
  overflow-y: auto;
  padding: 8px;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.result-item:hover,
.result-item.selected {
  background: rgba(102, 126, 234, 0.1);
}

.result-item.selected {
  background: rgba(102, 126, 234, 0.2);
}

.result-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.global-search-container.dark .result-icon {
  background: rgba(255, 255, 255, 0.05);
}

.result-icon svg {
  width: 24px;
  height: 24px;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-subtitle {
  font-size: 12px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-shortcut {
  font-size: 12px;
  color: var(--color-text-secondary);
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
}

.global-search-container.dark .result-shortcut {
  background: rgba(255, 255, 255, 0.05);
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 滚动条样式 */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.search-results::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.global-search-container.dark .search-results::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}
</style>
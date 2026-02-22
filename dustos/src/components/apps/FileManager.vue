<template>
  <div class="file-manager">
    <div class="sidebar">
      <div class="sidebar-section">
        <div class="section-title">快速访问</div>
        <div
          v-for="item in quickAccess"
          :key="item.id"
          class="sidebar-item"
          :class="{ active: currentPath === item.path }"
          @click="navigateTo(item.path)"
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </div>
      </div>
    </div>
    <div class="main-content">
      <div class="toolbar">
        <div class="navigation-buttons">
          <button class="tool-button" @click="goBack" :disabled="!canGoBack" title="后退">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button class="tool-button" @click="goForward" :disabled="!canGoForward" title="前进">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <button class="tool-button" @click="goUp" :disabled="currentPath === '/'" title="上级">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button class="tool-button" @click="refresh" title="刷新">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
        </div>
        <div class="path-bar" @click="showPathEditor = true">
          <span>🏠</span>
          <span>{{ currentPath || '/' }}</span>
        </div>
        <div class="action-buttons">
          <button class="tool-button" @click="createNewFolder" title="新建文件夹">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
          </button>
          <button class="tool-button" @click="showSearch = !showSearch" title="搜索">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>
      </div>

      <div class="search-bar" v-if="showSearch">
        <div class="search-input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索文件..." 
            @focus="showSearchSuggestions = true"
            @blur="hideSearchSuggestions"
          />
          <button @click="showSearch = false">✕</button>
        </div>
        
        <!-- 搜索建议 -->
        <div v-if="showSearchSuggestions && searchSuggestions.length > 0" class="search-suggestions">
          <div
            v-for="suggestion in searchSuggestions"
            :key="suggestion"
            class="search-suggestion"
            @mousedown="searchQuery = suggestion; showSearchSuggestions = false"
          >
            {{ suggestion }}
          </div>
        </div>
        
        <!-- 搜索过滤器 -->
        <div class="search-filters">
          <div class="filter-group">
            <label>类型：</label>
            <select v-model="searchFilters.type">
              <option value="all">全部</option>
              <option value="file">文件</option>
              <option value="folder">文件夹</option>
            </select>
          </div>
          <div class="filter-group">
            <label>排序：</label>
            <select v-model="searchSort.sortBy">
              <option value="name">名称</option>
              <option value="size">大小</option>
              <option value="date">日期</option>
              <option value="type">类型</option>
            </select>
            <button class="sort-order" @click="toggleSortOrder">
              {{ searchSort.order === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
          <div class="filter-group">
            <button class="clear-history" @click="clearSearchHistory">
              清除历史
            </button>
          </div>
        </div>
      </div>

      <div class="content-area">
        <div class="file-grid" v-if="!showSearch">
          <div
            v-for="file in currentFiles"
            :key="file.id"
            class="file-item"
            :class="{ selected: selectedItems.includes(file.id) }"
            @click="selectFile(file.id, $event)"
            @dblclick="openFile(file)"
          >
            <span class="file-icon">{{ file.icon }}</span>
            <span class="file-name">{{ file.name }}</span>
          </div>
          <div v-if="currentFiles.length === 0" class="empty-state">
            <span>📭</span>
            <p>此文件夹为空</p>
          </div>
        </div>
        <div class="search-results" v-else>
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="file-item"
            :class="{ selected: selectedItems.includes(result.id) }"
            @click="selectFile(result.id, $event)"
            @dblclick="openSearchResult(result)"
          >
            <span class="file-icon">{{ result.icon }}</span>
            <span class="file-name">{{ result.name }}</span>
            <span class="file-path">{{ result.path }}</span>
          </div>
          <div v-if="searchResults.length === 0" class="empty-state">
            <span>🔍</span>
            <p>未找到文件</p>
          </div>
        </div>
      </div>

      <div class="status-bar">
        <span>{{ currentFiles.length }} 项</span>
        <span>{{ selectedItems.length > 0 ? `已选择 ${selectedItems.length} 项` : '' }}</span>
      </div>
    </div>

    <!-- 上下文菜单 -->
    <div
      class="context-menu"
      :class="{ dark: systemStore.isDarkMode }"
      v-if="contextMenu.show"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="openSelected">
        <span>📂</span>
        <span>打开</span>
      </div>
      <div class="context-menu-item" @click="createNewFolder">
        <span>📁</span>
        <span>新建文件夹</span>
      </div>
      <div class="context-menu-item" @click="renameSelected">
        <span>✏️</span>
        <span>重命名</span>
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="deleteSelected" class="danger">
        <span>🗑️</span>
        <span>删除</span>
      </div>
    </div>

    <!-- 模态对话框 -->
    <div class="modal-overlay" v-if="modal.show" @click="closeModal">
      <div class="modal" :class="{ dark: systemStore.isDarkMode }" @click.stop>
        <h3>{{ modal.title }}</h3>
        <input type="text" v-model="modal.value" ref="modalInput" @keydown.enter="confirmModal" />
        <div class="modal-buttons">
          <button @click="closeModal">取消</button>
          <button @click="confirmModal" class="primary">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useFilesystemStore } from '@/stores/filesystem'
import { useSystemStore } from '@/stores/system'
import { useDesktopStore } from '@/stores/desktop'

const fs = useFilesystemStore()
const systemStore = useSystemStore()
const desktopStore = useDesktopStore()

const currentPath = ref('/')
const pathHistory = ref<string[]>([])
const pathHistoryIndex = ref(-1)
const selectedItems = ref<string[]>([])
const showSearch = ref(false)
const searchQuery = ref('')
const showPathEditor = ref(false)
const showSearchSuggestions = ref(false)
const searchFilters = ref({ type: 'all' as 'all' | 'file' | 'folder' })
const searchSort = ref({ sortBy: 'name' as 'name' | 'size' | 'date' | 'type', order: 'asc' as 'asc' | 'desc' })

const contextMenu = ref({ show: false, x: 0, y: 0 })
const modal = ref({ show: false, title: '', value: '', action: '' })
const modalInput = ref<HTMLInputElement | null>(null)

const quickAccess = [
  { id: '1', name: '主目录', icon: '🏠', path: '/' },
  { id: '2', name: '文档', icon: '📁', path: '/文档' },
  { id: '3', name: '下载', icon: '📁', path: '/下载' },
  { id: '4', name: '图片', icon: '📁', path: '/图片' },
  { id: '5', name: '音乐', icon: '📁', path: '/音乐' },
  { id: '6', name: '视频', icon: '📁', path: '/视频' },
]

const currentFiles = computed(() => fs.getCurrentFiles())

const searchResults = computed(() => {
  let results = fs.advancedSearch(searchQuery.value, searchFilters.value)
  results = fs.sortResults(results, searchSort.value.sortBy, searchSort.value.order)
  return results
})

const searchSuggestions = computed(() => fs.getSearchSuggestions(searchQuery.value, 5))

const canGoBack = computed(() => pathHistoryIndex.value > 0)
const canGoForward = computed(() => pathHistoryIndex.value < pathHistory.value.length - 1)

function navigateTo(path: string) {
  // 保存历史
  if (pathHistoryIndex.value < pathHistory.value.length - 1) {
    pathHistory.value = pathHistory.value.slice(0, pathHistoryIndex.value + 1)
  }
  pathHistory.value.push(path)
  pathHistoryIndex.value = pathHistory.value.length - 1
  
  currentPath.value = path
  fs.changePath(path)
  selectedItems.value = []
}

function goBack() {
  if (canGoBack.value) {
    pathHistoryIndex.value--
    currentPath.value = pathHistory.value[pathHistoryIndex.value]
    fs.changePath(currentPath.value)
    selectedItems.value = []
  }
}

function goForward() {
  if (canGoForward.value) {
    pathHistoryIndex.value++
    currentPath.value = pathHistory.value[pathHistoryIndex.value]
    fs.changePath(currentPath.value)
    selectedItems.value = []
  }
}

function goUp() {
  const parentPath = fs.getParentPath()
  navigateTo(parentPath)
}

function refresh() {
  fs.changePath(currentPath.value)
}

function openFile(file: any) {
  if (file.type === 'folder') {
    const newPath = currentPath.value === '/' ? '/' + file.name : currentPath.value + '/' + file.name
    navigateTo(newPath)
  } else {
    // 打开文件内容
    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      openInNotepad(file)
    } else {
      systemStore.addNotification('打开文件', `正在打开 ${file.name}`)
    }
  }
}

function openInNotepad(file: any) {
  const content = fs.getFileContent(file.id) || ''
  // 打开记事本并加载内容
  const notepadIcon = desktopStore.desktopIcons.find(i => i.component === 'Notepad')
  if (notepadIcon) {
    desktopStore.openWindow(notepadIcon)
  }
}

function selectFile(id: string, event: MouseEvent) {
  if (event.ctrlKey || event.metaKey) {
    fs.toggleSelection(id)
  } else {
    selectedItems.value = [id]
  }
}

function openSelected() {
  if (selectedItems.value.length === 1) {
    const file = currentFiles.value.find(f => f.id === selectedItems.value[0])
    if (file) {
      openFile(file)
    }
  }
}

function createNewFolder() {
  showModal('新建文件夹', '新文件夹', 'createFolder')
}

function renameSelected() {
  if (selectedItems.value.length === 1) {
    const file = currentFiles.value.find(f => f.id === selectedItems.value[0])
    if (file) {
      showModal('重命名', file.name, 'rename')
    }
  }
}

function deleteSelected() {
  if (selectedItems.value.length > 0) {
    if (confirm(`确定要删除 ${selectedItems.value.length} 个项目吗？`)) {
      for (const id of selectedItems.value) {
        fs.deleteItem(id)
      }
      selectedItems.value = []
      systemStore.addNotification('删除完成', `已删除 ${selectedItems.value.length} 个项目`)
    }
  }
}

function openSearchResult(result: any) {
  navigateTo(result.path)
  showSearch.value = false
  searchQuery.value = ''
}

function hideSearchSuggestions() {
  setTimeout(() => {
    showSearchSuggestions.value = false
  }, 200)
}

function toggleSortOrder() {
  searchSort.value.order = searchSort.value.order === 'asc' ? 'desc' : 'asc'
}

function clearSearchHistory() {
  fs.clearSearchHistory()
  systemStore.addNotification('历史已清除', '搜索历史已清除')
}

function showModal(title: string, value: string, action: string) {
  modal.value = { show: true, title, value, action }
  nextTick(() => {
    modalInput.value?.focus()
    modalInput.value?.select()
  })
}

function closeModal() {
  modal.value.show = false
}

function confirmModal() {
  const { action, value } = modal.value
  
  if (action === 'createFolder') {
    if (fs.createFolder(value)) {
      systemStore.addNotification('创建成功', `文件夹 "${value}" 已创建`)
    } else {
      systemStore.addNotification('创建失败', '文件夹已存在或名称无效')
    }
  } else if (action === 'rename') {
    if (selectedItems.value.length === 1) {
      if (fs.renameItem(selectedItems.value[0], value)) {
        systemStore.addNotification('重命名成功', `已重命名为 "${value}"`)
      } else {
        systemStore.addNotification('重命名失败', '名称已存在或无效')
      }
    }
  }
  
  closeModal()
}

// 右键菜单
function showContextMenu(e: MouseEvent) {
  e.preventDefault()
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY
  }
}

// 点击关闭菜单
document.addEventListener('click', () => {
  contextMenu.value.show = false
})

onMounted(() => {
  // 初始化路径
  navigateTo('/')
  
  // 添加右键菜单
  document.addEventListener('contextmenu', showContextMenu)
})
</script>

<style scoped>
.file-manager {
  display: flex;
  height: 100%;
  background: #f5f5f5;
}

:global(.dark) .file-manager {
  background: #2a2a2a;
}

.sidebar {
  width: 200px;
  background: #ffffff;
  border-right: 1px solid #e0e0e0;
  padding: 16px;
}

:global(.dark) .sidebar {
  background: #333333;
  border-right-color: #444;
}

.sidebar-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 12px;
  opacity: 0.7;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  margin-bottom: 4px;
}

.sidebar-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

:global(.dark) .sidebar-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-item.active {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

:global(.dark) .toolbar {
  background: #333333;
  border-bottom-color: #444;
}

.navigation-buttons,
.action-buttons {
  display: flex;
  gap: 4px;
}

.tool-button {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.tool-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.tool-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

:global(.dark) .tool-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
}

.tool-button svg {
  width: 18px;
  height: 18px;
}

.path-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 13px;
  cursor: text;
}

:global(.dark) .path-bar {
  background: #444;
}

.search-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

:global(.dark) .search-bar {
  background: #333333;
  border-bottom-color: #444;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.search-input-wrapper svg {
  width: 18px;
  height: 18px;
  color: #999;
}

.search-input-wrapper input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #ffffff;
  font-size: 14px;
}

:global(.dark) .search-input-wrapper input {
  background: #444;
  border-color: #555;
  color: white;
}

.search-input-wrapper button {
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

:global(.dark) .search-input-wrapper button {
  background: #444;
  color: white;
}

.search-input-wrapper button:hover {
  background: #e0e0e0;
}

:global(.dark) .search-input-wrapper button:hover {
  background: #555;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin-top: 4px;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

:global(.dark) .search-suggestions {
  background: rgba(40, 40, 40, 0.98);
}

.search-suggestion {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.15s;
  font-size: 13px;
}

.search-suggestion:hover {
  background: rgba(0, 0, 0, 0.05);
}

:global(.dark) .search-suggestion:hover {
  background: rgba(255, 255, 255, 0.05);
}

.search-filters {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}

:global(.dark) .search-filters {
  border-top-color: #444;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 12px;
  opacity: 0.7;
}

.filter-group select {
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #ffffff;
  font-size: 13px;
  cursor: pointer;
}

:global(.dark) .filter-group select {
  background: #444;
  border-color: #555;
  color: white;
}

.sort-order {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

:global(.dark) .sort-order {
  background: #444;
  border-color: #555;
  color: white;
}

.sort-order:hover {
  background: #f5f5f5;
}

:global(.dark) .sort-order:hover {
  background: #555;
}

.clear-history {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

:global(.dark) .clear-history {
  background: #444;
  border-color: #555;
  color: white;
}

.clear-history:hover {
  background: #fff1f0;
  border-color: #ffccc7;
  color: #ff4d4f;
}

.content-area {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.file-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.file-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

:global(.dark) .file-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.file-item.selected {
  background: rgba(102, 126, 234, 0.15);
  border: 2px solid #667eea;
}

.file-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.file-name {
  font-size: 12px;
  text-align: center;
  word-wrap: break-word;
  line-height: 1.2;
}

.file-path {
  font-size: 10px;
  opacity: 0.6;
  margin-top: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
}

.empty-state span {
  font-size: 48px;
  margin-bottom: 16px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  opacity: 0.7;
}

:global(.dark) .status-bar {
  background: #333333;
  border-top-color: #444;
}

/* 上下文菜单 */
.context-menu {
  position: fixed;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 180px;
  z-index: 9999;
}

.context-menu.dark {
  background: rgba(40, 40, 40, 0.95);
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s;
  font-size: 13px;
}

.context-menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.context-menu.dark .context-menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.context-menu-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.context-menu-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 4px 0;
}

.context-menu.dark .context-menu-divider {
  background: rgba(255, 255, 255, 0.1);
}

/* 模态对话框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  min-width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal.dark {
  background: #333333;
}

.modal h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.modal input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
}

.modal.dark input {
  background: #444;
  border-color: #555;
  color: white;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-buttons button {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.modal.dark button {
  background: #444;
  border-color: #555;
  color: white;
}

.modal-buttons button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.modal.dark button:hover {
  background: rgba(255, 255, 255, 0.05);
}

.modal-buttons button.primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.modal-buttons button.primary:hover {
  background: #5568d3;
}
</style>
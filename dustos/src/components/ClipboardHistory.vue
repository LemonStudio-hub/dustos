<template>
  <div class="clipboard-history-overlay" @click.self="$emit('close')">
    <div class="clipboard-history-panel" :class="{ dark: systemStore.isDarkMode }">
      <div class="panel-header">
        <h3>剪贴板历史</h3>
        <div class="header-actions">
          <button class="action-button" @click="clearAll" title="清空历史">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
          <button class="action-button close" @click="$emit('close')" title="关闭">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <div class="panel-search">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索剪贴板历史..."
          @input="onSearch"
        />
      </div>

      <div class="panel-filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="filter-button"
          :class="{ active: currentFilter === filter.value }"
          @click="currentFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="panel-content">
        <div v-if="filteredHistory.length === 0" class="empty-state">
          <span>📋</span>
          <p>暂无剪贴板历史</p>
        </div>
        <div v-else class="history-list">
          <div
            v-for="item in filteredHistory"
            :key="item.id"
            class="history-item"
            :class="{ hovered: hoveredItemId === item.id }"
            @click="copyItem(item)"
            @mouseenter="hoveredItemId = item.id"
            @mouseleave="hoveredItemId = ''"
          >
            <div class="item-header">
              <span class="item-type" :class="item.type">
                {{ getTypeIcon(item.type) }}
              </span>
              <span class="item-time">{{ formatTime(item.timestamp) }}</span>
              <button class="item-delete" @click.stop="deleteItem(item.id)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
            <div class="item-preview">{{ item.preview }}</div>
          </div>
        </div>
      </div>

      <div class="panel-footer">
        <span class="stats">{{ statsText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClipboardStore } from '@/stores/clipboard'
import { useSystemStore } from '@/stores/system'

defineEmits<{
  close: []
}>()

const clipboardStore = useClipboardStore()
const systemStore = useSystemStore()

const searchQuery = ref('')
const currentFilter = ref<'all' | 'text' | 'html' | 'image'>('all')
const hoveredItemId = ref('')

const filters = [
  { label: '全部', value: 'all' },
  { label: '文本', value: 'text' },
  { label: 'HTML', value: 'html' },
  { label: '图片', value: 'image' }
]

const filteredHistory = computed(() => {
  let items = clipboardStore.history

  // 搜索过滤
  if (searchQuery.value.trim()) {
    items = clipboardStore.searchHistory(searchQuery.value)
  }

  // 类型过滤
  if (currentFilter.value !== 'all') {
    items = clipboardStore.filterByType(currentFilter.value)
  }

  return items
})

const stats = computed(() => clipboardStore.getStats())

const statsText = computed(() => {
  return `${stats.value.total} 项 (${stats.value.text} 文本, ${stats.value.html} HTML, ${stats.value.image} 图片)`
})

function onSearch() {
  // 搜索时自动滚动到顶部
}

function copyItem(item: any) {
  clipboardStore.copyToClipboard(item)
  systemStore.addNotification('已复制', '内容已复制到剪贴板')
}

function deleteItem(id: string) {
  clipboardStore.deleteItem(id)
}

function clearAll() {
  if (confirm('确定要清空所有剪贴板历史吗？')) {
    clipboardStore.clearHistory()
    systemStore.addNotification('已清空', '剪贴板历史已清空')
  }
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'text':
      return '📝'
    case 'html':
      return '🌐'
    case 'image':
      return '📷'
    default:
      return '📄'
  }
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

onMounted(() => {
  // 启动剪贴板监控
  const stopMonitoring = clipboardStore.startMonitoring()
  
  // 组件卸载时停止监控
  onMounted(() => {
    stopMonitoring?.()
  })
})
</script>

<style scoped>
.clipboard-history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.clipboard-history-panel {
  width: 600px;
  max-height: 80vh;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.clipboard-history-panel.dark {
  background: rgba(40, 40, 40, 0.98);
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

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.clipboard-history-panel.dark .panel-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #666;
}

.action-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.clipboard-history-panel.dark .action-button:hover {
  background: rgba(255, 255, 255, 0.05);
}

.action-button.close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.action-button svg {
  width: 20px;
  height: 20px;
}

.panel-search {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.clipboard-history-panel.dark .panel-search {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.panel-search svg {
  width: 18px;
  height: 18px;
  color: #999;
}

.panel-search input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: transparent;
  font-size: 14px;
}

.clipboard-history-panel.dark .panel-search input {
  border-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.panel-search input:focus {
  outline: none;
  border-color: #667eea;
}

.panel-filters {
  display: flex;
  gap: 8px;
  padding: 12px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.clipboard-history-panel.dark .panel-filters {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.filter-button {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.clipboard-history-panel.dark .filter-button {
  border-color: rgba(255, 255, 255, 0.1);
  color: #aaa;
}

.filter-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.clipboard-history-panel.dark .filter-button:hover {
  background: rgba(255, 255, 255, 0.05);
}

.filter-button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 24px;
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

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.clipboard-history-panel.dark .history-item {
  border-color: rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
}

.history-item:hover,
.history-item.hovered {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateX(4px);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.item-type {
  font-size: 14px;
}

.item-type.text {
  color: #667eea;
}

.item-type.html {
  color: #10b981;
}

.item-type.image {
  color: #f59e0b;
}

.item-time {
  flex: 1;
  font-size: 11px;
  color: #999;
}

.item-delete {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
  color: #999;
}

.history-item:hover .item-delete,
.history-item.hovered .item-delete {
  opacity: 1;
}

.item-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.item-delete svg {
  width: 14px;
  height: 14px;
}

.item-preview {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.clipboard-history-panel.dark .item-preview {
  color: #aaa;
}

.panel-footer {
  padding: 12px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 12px;
  color: #999;
}

.clipboard-history-panel.dark .panel-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
}

/* 自定义滚动条 */
.panel-content::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.clipboard-history-panel.dark .panel-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.clipboard-history-panel.dark .panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
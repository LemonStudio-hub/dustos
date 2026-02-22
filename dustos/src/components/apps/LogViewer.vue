<template>
  <div class="log-viewer">
    <div class="log-header">
      <h2>系统日志</h2>
      <div class="header-actions">
        <button class="action-btn" @click="exportLogs" title="导出日志">
          📥
        </button>
        <button class="action-btn" @click="clearLogs" title="清除日志">
          🗑️
        </button>
        <button class="action-btn" @click="autoScroll = !autoScroll" :title="autoScroll ? '关闭自动滚动' : '开启自动滚动'">
          {{ autoScroll ? '📜' : '📋' }}
        </button>
      </div>
    </div>

    <div class="log-controls">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索日志..."
          @input="filterLogs"
        />
      </div>
      <div class="filter-buttons">
        <button
          v-for="level in logLevels"
          :key="level.name"
          class="filter-btn"
          :class="{ active: levelFilters.includes(level.name) }"
          @click="toggleFilter(level.name)"
        >
          {{ level.icon }} {{ level.label }}
        </button>
      </div>
    </div>

    <div class="log-stats">
      <div class="stat-item">
        <span class="stat-label">总日志</span>
        <span class="stat-value">{{ logs.length }}</span>
      </div>
      <div class="stat-item info">
        <span class="stat-label">信息</span>
        <span class="stat-value">{{ logs.filter(l => l.level === 'info').length }}</span>
      </div>
      <div class="stat-item warning">
        <span class="stat-label">警告</span>
        <span class="stat-value">{{ logs.filter(l => l.level === 'warning').length }}</span>
      </div>
      <div class="stat-item error">
        <span class="stat-label">错误</span>
        <span class="stat-value">{{ logs.filter(l => l.level === 'error').length }}</span>
      </div>
    </div>

    <div class="log-content" ref="logContentRef">
      <div v-if="filteredLogs.length === 0" class="empty-logs">
        <div class="empty-icon">📝</div>
        <div class="empty-text">暂无日志</div>
      </div>
      <div v-else class="log-list">
        <div
          v-for="(log, index) in filteredLogs"
          :key="index"
          class="log-item"
          :class="[`level-${log.level}`, { expanded: expandedLogs.has(index) }]"
          @click="toggleExpand(index)"
        >
          <div class="log-header">
            <span class="log-icon">{{ getLogIcon(log.level) }}</span>
            <span class="log-timestamp">{{ formatTimestamp(log.timestamp) }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-source">{{ log.source }}</span>
          </div>
          <div class="log-message">
            <span class="message-text">{{ log.message }}</span>
            <span v-if="log.details" class="toggle-icon">{{ expandedLogs.has(index) ? '▼' : '▶' }}</span>
          </div>
          <div v-if="log.details && expandedLogs.has(index)" class="log-details">
            <pre>{{ log.details }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div class="log-footer">
      <button class="footer-btn" @click="loadMoreLogs" v-if="hasMoreLogs">
        加载更多
      </button>
      <div class="footer-info">
        显示 {{ filteredLogs.length }} / {{ logs.length }} 条日志
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug'
  source: string
  message: string
  details?: string
}

const logs = ref<LogEntry[]>([])
const searchQuery = ref('')
const levelFilters = ref(['info', 'warning', 'error', 'debug'])
const autoScroll = ref(true)
const expandedLogs = ref(new Set<number>())
const logContentRef = ref<HTMLElement | null>(null)

const logLevels = [
  { name: 'debug', label: '调试', icon: '🔧' },
  { name: 'info', label: '信息', icon: 'ℹ️' },
  { name: 'warning', label: '警告', icon: '⚠️' },
  { name: 'error', label: '错误', icon: '❌' }
]

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const matchesLevel = levelFilters.value.includes(log.level)
    const matchesSearch = !searchQuery.value || 
      log.message.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesLevel && matchesSearch
  })
})

const hasMoreLogs = computed(() => false) // 简化示例，实际可以从服务器加载更多

function toggleFilter(level: string) {
  const index = levelFilters.value.indexOf(level)
  if (index > -1) {
    levelFilters.value.splice(index, 1)
  } else {
    levelFilters.value.push(level)
  }
}

function toggleExpand(index: number) {
  if (expandedLogs.value.has(index)) {
    expandedLogs.value.delete(index)
  } else {
    expandedLogs.value.add(index)
  }
}

function filterLogs() {
  // 实时搜索，由computed处理
}

function getLogIcon(level: string): string {
  const icons: Record<string, string> = {
    debug: '🔧',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌'
  }
  return icons[level] || '📄'
}

function formatTimestamp(timestamp: Date): string {
  return timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

function addLog(level: 'info' | 'warning' | 'error' | 'debug', source: string, message: string, details?: string) {
  logs.value.unshift({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    level,
    source,
    message,
    details
  })
  
  // 保持日志数量在合理范围内
  if (logs.value.length > 1000) {
    logs.value = logs.value.slice(0, 1000)
  }
  
  // 自动滚动到顶部
  if (autoScroll.value) {
    nextTick(() => {
      if (logContentRef.value) {
        logContentRef.value.scrollTop = 0
      }
    })
  }
}

function clearLogs() {
  if (confirm('确定要清除所有日志吗？')) {
    logs.value = []
    expandedLogs.value.clear()
  }
}

function exportLogs() {
  if (logs.value.length === 0) {
    alert('没有日志可导出')
    return
  }
  
  const logText = logs.value.map(log => {
    return `[${formatTimestamp(log.timestamp)}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}${log.details ? '\n' + log.details : ''}`
  }).join('\n\n')
  
  const blob = new Blob([logText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dustos_logs_${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function loadMoreLogs() {
  // 简化示例，实际可以从服务器加载更多日志
  addLog('info', 'LogViewer', '加载更多日志...')
}

// 初始化一些示例日志
function initSampleLogs() {
  addLog('info', 'System', 'dustOS 启动成功')
  addLog('debug', 'WindowManager', '窗口管理器初始化完成')
  addLog('info', 'Filesystem', '虚拟文件系统加载完成')
  addLog('info', 'Theme', '主题系统加载完成')
  addLog('warning', 'Network', '网络连接检测：离线模式')
  addLog('info', 'Apps', '加载 19 个应用')
  addLog('debug', 'Hooks', '初始化自定义 hooks')
  addLog('info', 'Storage', 'localStorage 可用')
  addLog('debug', 'Performance', '性能监控已启用')
  addLog('info', 'User', '用户会话已创建')
}

watch(filteredLogs, () => {
  if (autoScroll.value) {
    nextTick(() => {
      if (logContentRef.value) {
        logContentRef.value.scrollTop = 0
      }
    })
  }
})

initSampleLogs()
</script>

<style scoped>
.log-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #d4d4d4;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
}

.log-header h2 {
  margin: 0;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #3c3c3c;
  border-radius: 6px;
  background: #2d2d2d;
  color: #d4d4d4;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #3c3c3c;
}

.log-controls {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #3c3c3c;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
  border-radius: 6px;
  padding: 8px 12px;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  font-size: 14px;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  color: #d4d4d4;
  font-size: 14px;
  outline: none;
}

.search-box input::placeholder {
  color: #858585;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #3c3c3c;
  border-radius: 6px;
  background: #1e1e1e;
  color: #858585;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #2d2d2d;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.log-stats {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #3c3c3c;
  font-size: 12px;
}

.stat-item {
  display: flex;
  gap: 4px;
}

.stat-label {
  opacity: 0.6;
}

.stat-value {
  font-weight: 600;
}

.stat-item.info .stat-value {
  color: #22c55e;
}

.stat-item.warning .stat-value {
  color: #f59e0b;
}

.stat-item.error .stat-value {
  color: #ef4444;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-logs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 12px;
  color: #858585;
}

.empty-icon {
  font-size: 48px;
}

.empty-text {
  font-size: 16px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-item {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  border-left: 3px solid transparent;
}

.log-item:hover {
  background: #2d2d2d;
}

.log-item.level-info {
  border-left-color: #22c55e;
}

.log-item.level-warning {
  border-left-color: #f59e0b;
}

.log-item.level-error {
  border-left-color: #ef4444;
}

.log-item.level-debug {
  border-left-color: #858585;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.log-icon {
  font-size: 14px;
}

.log-timestamp {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  opacity: 0.6;
}

.log-level {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.log-item.level-info .log-level {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.log-item.level-warning .log-level {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.log-item.level-error .log-level {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.log-item.level-debug .log-level {
  background: rgba(133, 133, 133, 0.2);
  color: #858585;
}

.log-source {
  font-size: 12px;
  opacity: 0.6;
}

.log-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.message-text {
  flex: 1;
  font-size: 13px;
  word-wrap: break-word;
}

.toggle-icon {
  font-size: 10px;
  opacity: 0.6;
}

.log-details {
  margin-top: 8px;
  padding: 8px;
  background: #1e1e1e;
  border-radius: 4px;
  overflow-x: auto;
}

.log-details pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.log-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #252526;
  border-top: 1px solid #3c3c3c;
}

.footer-btn {
  padding: 6px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.footer-btn:hover {
  background: #5568d3;
}

.footer-info {
  font-size: 12px;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .log-controls {
    flex-direction: column;
  }
  
  .filter-buttons {
    flex-wrap: wrap;
  }
  
  .log-stats {
    flex-wrap: wrap;
  }
}
</style>
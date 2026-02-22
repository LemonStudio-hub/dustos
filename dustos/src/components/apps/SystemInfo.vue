<template>
  <div class="system-info">
    <div class="info-section">
      <h3>系统信息</h3>
      <div class="info-item">
        <span class="label">操作系统:</span>
        <span class="value">dustOS</span>
      </div>
      <div class="info-item">
        <span class="label">版本:</span>
        <span class="value">1.0.0</span>
      </div>
      <div class="info-item">
        <span class="label">内核:</span>
        <span class="value">Vue 3.4</span>
      </div>
      <div class="info-item">
        <span class="label">浏览器:</span>
        <span class="value">{{ browserInfo }}</span>
      </div>
      <div class="info-item">
        <span class="label">屏幕分辨率:</span>
        <span class="value">{{ screenResolution }}</span>
      </div>
      <div class="info-item">
        <span class="label">DPI:</span>
        <span class="value">{{ dpi }}</span>
      </div>
      <div class="info-item">
        <span class="label">用户代理:</span>
        <span class="value user-agent">{{ userAgent }}</span>
      </div>
    </div>

    <div class="info-section">
      <h3>内存信息</h3>
      <div class="info-item">
        <span class="label">可用内存:</span>
        <span class="value">{{ memoryUsage }}</span>
      </div>
      <div class="info-item">
        <span class="label">内存限制:</span>
        <span class="value">{{ memoryLimit }}</span>
      </div>
      <div class="memory-bar">
        <div class="memory-fill" :style="{ width: memoryPercentage + '%' }"></div>
      </div>
      <span class="memory-percentage">{{ memoryPercentage }}% 已使用</span>
    </div>

    <div class="info-section">
      <h3>存储信息</h3>
      <div class="info-item">
        <span class="label">本地存储:</span>
        <span class="value">{{ localStorageSize }}</span>
      </div>
      <div class="info-item">
        <span class="label">会话存储:</span>
        <span class="value">{{ sessionStorageSize }}</span>
      </div>
      <div class="info-item">
        <span class="label">Cookie:</span>
        <span class="value">{{ cookieCount }} 个</span>
      </div>
    </div>

    <div class="info-section">
      <h3>网络信息</h3>
      <div class="info-item">
        <span class="label">在线状态:</span>
        <span class="value" :class="{ online: isOnline, offline: !isOnline }">
          {{ isOnline ? '在线' : '离线' }}
        </span>
      </div>
      <div class="info-item">
        <span class="label">连接类型:</span>
        <span class="value">{{ connectionType }}</span>
      </div>
      <div class="info-item">
        <span class="label">下载速度:</span>
        <span class="value">{{ downloadSpeed }}</span>
      </div>
      <div class="info-item">
        <span class="label">上传速度:</span>
        <span class="value">{{ uploadSpeed }}</span>
      </div>
    </div>

    <div class="info-section">
      <h3>时间信息</h3>
      <div class="info-item">
        <span class="label">本地时间:</span>
        <span class="value">{{ localTime }}</span>
      </div>
      <div class="info-item">
        <span class="label">UTC 时间:</span>
        <span class="value">{{ utcTime }}</span>
      </div>
      <div class="info-item">
        <span class="label">时区:</span>
        <span class="value">{{ timezone }}</span>
      </div>
      <div class="info-item">
        <span class="label">语言:</span>
        <span class="value">{{ language }}</span>
      </div>
    </div>

    <div class="info-section">
      <h3>性能信息</h3>
      <div class="info-item">
        <span class="label">页面加载时间:</span>
        <span class="value">{{ pageLoadTime }}</span>
      </div>
      <div class="info-item">
        <span class="label">DOM 加载时间:</span>
        <span class="value">{{ domLoadTime }}</span>
      </div>
      <div class="info-item">
        <span class="label">资源数量:</span>
        <span class="value">{{ resourceCount }}</span>
      </div>
    </div>

    <div class="info-section">
      <h3>快捷键</h3>
      <div class="shortcut-list">
        <div class="shortcut-item">
          <kbd>Alt</kbd> + <kbd>Tab</kbd>
          <span>切换窗口</span>
        </div>
        <div class="shortcut-item">
          <kbd>Meta</kbd> + <kbd>D</kbd>
          <span>显示桌面</span>
        </div>
        <div class="shortcut-item">
          <kbd>Meta</kbd> + <kbd>L</kbd>
          <span>锁定屏幕</span>
        </div>
        <div class="shortcut-item">
          <kbd>F5</kbd>
          <span>刷新桌面</span>
        </div>
        <div class="shortcut-item">
          <kbd>Esc</kbd>
          <span>关闭菜单/返回</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { NetworkInfo, MemoryInfo } from '@/types'

const browserInfo = ref('')
const screenResolution = ref('')
const dpi = ref('')
const userAgent = ref('')
const memoryUsage = ref('')
const memoryLimit = ref('')
const memoryPercentage = ref(0)
const localStorageSize = ref('')
const sessionStorageSize = ref('')
const cookieCount = ref(0)
const isOnline = ref(navigator.onLine)
const connectionType = ref('未知')
const downloadSpeed = ref('未知')
const uploadSpeed = ref('未知')
const localTime = ref('')
const utcTime = ref('')
const timezone = ref('')
const language = ref('')
const pageLoadTime = ref('')
const domLoadTime = ref('')
const resourceCount = ref(0)

let timeInterval: number | null = null

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const updateTime = () => {
  const now = new Date()
  localTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  utcTime.value = now.toUTCString()
}

const calculateStorageSize = (): string => {
  let total = 0
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += (localStorage[key].length + key.length) * 2
    }
  }
  return formatBytes(total)
}

const calculateSessionStorageSize = (): string => {
  let total = 0
  for (let key in sessionStorage) {
    if (sessionStorage.hasOwnProperty(key)) {
      total += (sessionStorage[key].length + key.length) * 2
    }
  }
  return formatBytes(total)
}

const updateNetworkInfo = () => {
  const connection = (navigator as unknown as { connection?: NetworkInfo }).connection
  if (connection) {
    connectionType.value = connection.effectiveType || '未知'
    downloadSpeed.value = `${connection.downlink} Mbps`
    uploadSpeed.value = `${connection.rtt} ms`
  }
}

const handleOnlineStatus = () => {
  isOnline.value = navigator.onLine
  updateNetworkInfo()
}

onMounted(() => {
  // 浏览器信息
  const ua = navigator.userAgent
  userAgent.value = ua
  
  if (ua.includes('Chrome')) {
    const match = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)
    browserInfo.value = match ? `Chrome ${match[1]}` : 'Chrome'
  } else if (ua.includes('Firefox')) {
    const match = ua.match(/Firefox\/(\d+\.\d+)/)
    browserInfo.value = match ? `Firefox ${match[1]}` : 'Firefox'
  } else if (ua.includes('Safari')) {
    const match = ua.match(/Version\/(\d+\.\d+)/)
    browserInfo.value = match ? `Safari ${match[1]}` : 'Safari'
  } else if (ua.includes('Edge')) {
    const match = ua.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/)
    browserInfo.value = match ? `Edge ${match[1]}` : 'Edge'
  } else {
    browserInfo.value = '未知浏览器'
  }

  // 屏幕信息
  screenResolution.value = `${window.screen.width} x ${window.screen.height}`
  dpi.value = `${window.devicePixelRatio}x`

  // 内存信息
  const perf = performance as unknown as { memory?: MemoryInfo }
  if (perf.memory) {
    const mem = perf.memory
    const used = mem.usedJSHeapSize
    const total = mem.totalJSHeapSize
    const limit = mem.jsHeapSizeLimit

    memoryUsage.value = formatBytes(used)
    memoryLimit.value = formatBytes(limit)
    memoryPercentage.value = Math.round((used / limit) * 100)
  } else {
    memoryUsage.value = '未知'
    memoryLimit.value = '未知'
    memoryPercentage.value = 0
  }

  // 存储信息
  localStorageSize.value = calculateStorageSize()
  sessionStorageSize.value = calculateSessionStorageSize()
  cookieCount.value = document.cookie.split(';').filter(c => c.trim()).length

  // 网络信息
  updateNetworkInfo()
  window.addEventListener('online', handleOnlineStatus)
  window.addEventListener('offline', handleOnlineStatus)
  const nav = navigator as unknown as { connection?: { addEventListener: (event: string, callback: () => void) => void } }
  if (nav.connection) {
    nav.connection.addEventListener('change', updateNetworkInfo)
  }

  // 时间信息
  timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone
  language.value = navigator.language
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)

  // 性能信息
  const perfData = performance.timing
  if (perfData) {
    const pageLoad = perfData.loadEventEnd - perfData.navigationStart
    const domLoad = perfData.domContentLoadedEventEnd - perfData.navigationStart
    
    pageLoadTime.value = pageLoad > 0 ? `${pageLoad} ms` : '计算中...'
    domLoadTime.value = domLoad > 0 ? `${domLoad} ms` : '计算中...'
  }

  // 资源数量
  if (performance.getEntriesByType) {
    resourceCount.value = performance.getEntriesByType('resource').length
  }

  // 监听内存变化
  setInterval(() => {
    const perf = performance as unknown as { memory?: MemoryInfo }
    if (perf.memory) {
      const mem = perf.memory
      const used = mem.usedJSHeapSize
      const limit = mem.jsHeapSizeLimit

      memoryUsage.value = formatBytes(used)
      memoryPercentage.value = Math.round((used / limit) * 100)
    }

    localStorageSize.value = calculateStorageSize()
    sessionStorageSize.value = calculateSessionStorageSize()
  }, 2000)
})

onUnmounted(() => {
  if (timeInterval !== null) {
    clearInterval(timeInterval)
  }
  window.removeEventListener('online', handleOnlineStatus)
  window.removeEventListener('offline', handleOnlineStatus)
  const nav = navigator as unknown as { connection?: { removeEventListener: (event: string, callback: () => void) => void } }
  if (nav.connection) {
    nav.connection.removeEventListener('change', updateNetworkInfo)
  }
})
</script>

<style scoped>
.system-info {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  background: var(--color-background);
  color: var(--color-text);
}

.info-section {
  margin-bottom: 30px;
  background: var(--color-surface);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-section h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.info-item .value {
  font-weight: 600;
  color: var(--color-text);
}

.info-item .value.user-agent {
  max-width: 60%;
  word-break: break-all;
  text-align: right;
  font-size: 12px;
}

.info-item .value.online {
  color: #4caf50;
}

.info-item .value.offline {
  color: #f44336;
}

.memory-bar {
  height: 20px;
  background: var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
}

.memory-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s ease;
  border-radius: 10px;
}

.memory-percentage {
  font-size: 14px;
  color: var(--color-text-secondary);
  display: block;
  text-align: center;
  margin-top: 5px;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.shortcut-item kbd {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 8px;
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.shortcut-item span {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 滚动条样式 */
.system-info::-webkit-scrollbar {
  width: 8px;
}

.system-info::-webkit-scrollbar-track {
  background: var(--color-background);
}

.system-info::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.system-info::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}
</style>
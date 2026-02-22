<template>
  <div class="task-manager">
    <div class="task-manager-header">
      <h2>任务管理器</h2>
      <div class="header-tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'processes' }"
          @click="activeTab = 'processes'"
        >
          进程
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'performance' }"
          @click="activeTab = 'performance'"
        >
          性能
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'startup' }"
          @click="activeTab = 'startup'"
        >
          启动
        </button>
      </div>
    </div>

    <!-- 进程列表 -->
    <div v-if="activeTab === 'processes'" class="processes-tab">
      <div class="process-list-header">
        <div class="header-cell">名称</div>
        <div class="header-cell">PID</div>
        <div class="header-cell">CPU</div>
        <div class="header-cell">内存</div>
        <div class="header-cell">状态</div>
      </div>
      <div class="process-list">
        <div
          v-for="process in processes"
          :key="process.id"
          class="process-item"
          :class="{ selected: selectedProcess === process.id }"
          @click="selectedProcess = process.id"
        >
          <div class="process-cell">
            <span class="process-icon">{{ process.icon }}</span>
            <span class="process-name">{{ process.name }}</span>
          </div>
          <div class="process-cell">{{ process.pid }}</div>
          <div class="process-cell">
            <div class="cpu-bar">
              <div class="cpu-fill" :style="{ width: process.cpu + '%' }"></div>
            </div>
            <span>{{ process.cpu }}%</span>
          </div>
          <div class="process-cell">
            <div class="memory-bar">
              <div class="memory-fill" :style="{ width: process.memory + '%' }"></div>
            </div>
            <span>{{ formatMemory(process.memory) }}</span>
          </div>
          <div class="process-cell">
            <span class="status" :class="process.status.toLowerCase()">{{ process.status }}</span>
          </div>
        </div>
      </div>
      <div class="process-actions">
        <button class="action-button" @click="endProcess" :disabled="!selectedProcess">
          结束任务
        </button>
        <button class="action-button" @click="refreshProcesses">
          刷新
        </button>
      </div>
    </div>

    <!-- 性能监控 -->
    <div v-if="activeTab === 'performance'" class="performance-tab">
      <div class="performance-cards">
        <div class="performance-card">
          <div class="card-header">
            <span class="card-icon">💻</span>
            <span class="card-title">CPU</span>
          </div>
          <div class="card-value">{{ cpuUsage }}%</div>
          <div class="card-chart">
            <div class="chart-bar">
              <div class="chart-fill" :style="{ width: cpuUsage + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="performance-card">
          <div class="card-header">
            <span class="card-icon">🧠</span>
            <span class="card-title">内存</span>
          </div>
          <div class="card-value">{{ memoryUsage }}%</div>
          <div class="card-chart">
            <div class="chart-bar">
              <div class="chart-fill memory" :style="{ width: memoryUsage + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="performance-card">
          <div class="card-header">
            <span class="card-icon">💾</span>
            <span class="card-title">磁盘</span>
          </div>
          <div class="card-value">{{ diskUsage }}%</div>
          <div class="card-chart">
            <div class="chart-bar">
              <div class="chart-fill disk" :style="{ width: diskUsage + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="performance-card">
          <div class="card-header">
            <span class="card-icon">📡</span>
            <span class="card-title">网络</span>
          </div>
          <div class="card-value">{{ networkSpeed }} MB/s</div>
          <div class="card-chart">
            <div class="chart-bar">
              <div class="chart-fill network" :style="{ width: (networkSpeed / 100) * 100 + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="performance-chart">
        <h3>CPU 使用历史</h3>
        <div class="chart-container">
          <div class="chart-line">
            <div
              v-for="(value, index) in cpuHistory"
              :key="index"
              class="chart-point"
              :style="{ 
                left: (index / (cpuHistory.length - 1)) * 100 + '%',
                bottom: value + '%'
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 启动项 -->
    <div v-if="activeTab === 'startup'" class="startup-tab">
      <div class="startup-list">
        <div
          v-for="item in startupItems"
          :key="item.id"
          class="startup-item"
        >
          <div class="startup-info">
            <span class="startup-icon">{{ item.icon }}</span>
            <div class="startup-details">
              <span class="startup-name">{{ item.name }}</span>
              <span class="startup-path">{{ item.path }}</span>
            </div>
          </div>
          <div class="startup-status">
            <label class="toggle">
              <input type="checkbox" v-model="item.enabled" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const activeTab = ref('processes')
const selectedProcess = ref<string | null>(null)
const cpuUsage = ref(0)
const memoryUsage = ref(0)
const diskUsage = ref(0)
const networkSpeed = ref(0)
const cpuHistory = ref<number[]>([])

const processes = ref([
  { id: '1', name: 'System', pid: 1, cpu: 5, memory: 2, status: 'Running', icon: '⚙️' },
  { id: '2', name: 'dustOS Shell', pid: 100, cpu: 15, memory: 8, status: 'Running', icon: '💻' },
  { id: '3', name: 'Window Manager', pid: 101, cpu: 10, memory: 12, status: 'Running', icon: '🪟' },
  { id: '4', name: 'File Manager', pid: 102, cpu: 3, memory: 5, status: 'Running', icon: '📁' },
  { id: '5', name: 'Terminal', pid: 103, cpu: 2, memory: 4, status: 'Running', icon: '⌨️' },
  { id: '6', name: 'Browser', pid: 104, cpu: 25, memory: 18, status: 'Running', icon: '🌐' },
  { id: '7', name: 'Settings', pid: 105, cpu: 1, memory: 3, status: 'Running', icon: '⚙️' },
  { id: '8', name: 'Notepad', pid: 106, cpu: 1, memory: 2, status: 'Running', icon: '📝' },
  { id: '9', name: 'Calculator', pid: 107, cpu: 1, memory: 1, status: 'Running', icon: '🔢' },
  { id: '10', name: 'Background Service', pid: 200, cpu: 8, memory: 6, status: 'Running', icon: '🔄' },
])

const startupItems = ref([
  { id: '1', name: 'dustOS Shell', path: '/system/shell', enabled: true, icon: '💻' },
  { id: '2', name: 'Window Manager', path: '/system/window-manager', enabled: true, icon: '🪟' },
  { id: '3', name: 'Background Service', path: '/system/background', enabled: true, icon: '🔄' },
  { id: '4', name: 'Auto Update', path: '/system/update', enabled: false, icon: '📥' },
])

let updateInterval: number

function updatePerformance() {
  // 模拟性能数据
  cpuUsage.value = Math.round(20 + Math.random() * 30)
  memoryUsage.value = Math.round(40 + Math.random() * 20)
  diskUsage.value = Math.round(30 + Math.random() * 10)
  networkSpeed.value = Math.round(Math.random() * 50) / 10

  // 更新 CPU 历史数据
  cpuHistory.value.push(cpuUsage.value)
  if (cpuHistory.value.length > 60) {
    cpuHistory.value.shift()
  }

  // 更新进程 CPU 使用率
  processes.value.forEach(p => {
    if (p.status === 'Running') {
      p.cpu = Math.round(Math.random() * 30)
      p.memory = Math.round(1 + Math.random() * 20)
    }
  })
}

function refreshProcesses() {
  updatePerformance()
}

function endProcess() {
  if (selectedProcess.value) {
    const index = processes.value.findIndex(p => p.id === selectedProcess.value)
    if (index > -1) {
      processes.value[index].status = 'Terminated'
      selectedProcess.value = null
    }
  }
}

function formatMemory(value: number): string {
  return value + ' MB'
}

onMounted(() => {
  updatePerformance()
  updateInterval = window.setInterval(updatePerformance, 2000)
})

onUnmounted(() => {
  clearInterval(updateInterval)
})
</script>

<style scoped>
.task-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

:global(.dark) .task-manager {
  background: #2a2a2a;
}

.task-manager-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

:global(.dark) .task-manager-header {
  background: #333333;
  border-bottom-color: #444;
}

.task-manager-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-tabs {
  display: flex;
  gap: 4px;
}

.tab {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.tab:hover {
  background: rgba(0, 0, 0, 0.05);
}

.tab.active {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
}

:global(.dark) .tab:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* 进程列表 */
.process-list-header {
  display: grid;
  grid-template-columns: 2fr 100px 150px 150px 100px;
  gap: 8px;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
  font-size: 13px;
}

:global(.dark) .process-list-header {
  background: #333333;
  border-bottom-color: #444;
}

.process-list {
  flex: 1;
  overflow: auto;
  background: #ffffff;
}

:global(.dark) .process-list {
  background: #333333;
}

.process-item {
  display: grid;
  grid-template-columns: 2fr 100px 150px 150px 100px;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.15s;
}

.process-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.process-item.selected {
  background: rgba(102, 126, 234, 0.1);
}

:global(.dark) .process-item {
  border-bottom-color: #444;
}

:global(.dark) .process-item:hover {
  background: rgba(255, 255, 255, 0.02);
}

.process-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.process-icon {
  font-size: 16px;
}

.process-name {
  font-weight: 500;
}

.cpu-bar,
.memory-bar {
  flex: 1;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  max-width: 60px;
}

.cpu-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s;
}

.memory-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  transition: width 0.3s;
}

.status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.status.running {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status.terminated {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.process-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
}

:global(.dark) .process-actions {
  background: #333333;
  border-top-color: #444;
}

.action-button {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.action-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

:global(.dark) .action-button {
  background: #444;
  border-color: #555;
  color: white;
}

/* 性能监控 */
.performance-tab {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.performance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.performance-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:global(.dark) .performance-card {
  background: #333333;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 24px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.7;
}

.card-value {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 12px;
}

.card-chart {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.chart-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.5s ease;
}

.chart-fill.memory {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.chart-fill.disk {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.chart-fill.network {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.performance-chart {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:global(.dark) .performance-chart {
  background: #333333;
}

.performance-chart h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
}

.chart-container {
  height: 150px;
  position: relative;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

:global(.dark) .chart-container {
  background: #444;
}

.chart-line {
  position: relative;
  height: 100%;
  width: 100%;
}

.chart-point {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #667eea;
  border-radius: 50%;
  transform: translate(-50%, 50%);
}

/* 启动项 */
.startup-tab {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.startup-list {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
}

:global(.dark) .startup-list {
  background: #333333;
}

.startup-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.startup-item:last-child {
  border-bottom: none;
}

:global(.dark) .startup-item {
  border-bottom-color: #444;
}

.startup-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.startup-icon {
  font-size: 24px;
}

.startup-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.startup-name {
  font-weight: 500;
  font-size: 14px;
}

.startup-path {
  font-size: 12px;
  opacity: 0.6;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: #667eea;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(20px);
}
</style>
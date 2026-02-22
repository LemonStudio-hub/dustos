<template>
  <div class="taskbar" :class="{ dark: systemStore.isDarkMode }">
    <div class="taskbar-left">
      <button class="start-button" @click="desktopStore.toggleStartMenu">
        <span class="logo" v-html="startIcon"></span>
      </button>
      <div class="taskbar-apps">
        <div
          v-for="window in desktopStore.windows"
          :key="window.id"
          class="taskbar-item"
          :class="{ active: desktopStore.activeWindowId === window.id, minimized: window.isMinimized }"
          @click="desktopStore.focusWindow(window.id)"
          @mouseenter="showPreview(window.id)"
          @mouseleave="hidePreview"
        >
          <div class="app-icon" v-html="window.icon"></div>
          <span class="app-name">{{ window.title }}</span>
          <div v-if="previewWindowId === window.id" class="window-preview">
            <div class="preview-content">
              <div class="preview-icon" v-html="window.icon"></div>
              <div class="preview-title">{{ window.title }}</div>
              <div class="preview-size">{{ Math.round(window.width / 10) }} x {{ Math.round(window.height / 10) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="taskbar-right">
      <div class="system-tray">
        <button class="tray-item" @click="systemStore.toggleWifi" :title="systemStore.wifiConnected ? '已连接' : '未连接'" v-html="wifiIcon"></button>
        <div class="volume-control" ref="volumePopup">
          <button class="tray-item" title="音量" @click="showVolumePopup = !showVolumePopup" v-html="volumeIcon"></button>
          <div class="volume-popup" v-if="showVolumePopup" @click.stop>
            <input type="range" v-model="systemStore.volume" min="0" max="100" @input="onVolumeChange">
            <span class="volume-value">{{ systemStore.volume }}%</span>
          </div>
        </div>
        <button class="tray-item battery" :title="`电量 ${systemStore.battery}%`" v-html="batteryIcon">
          <span class="battery-text">{{ systemStore.battery }}%</span>
        </button>
      </div>
      <div class="clock">
        <div class="time">{{ systemStore.getFormattedTime() }}</div>
        <div class="date">{{ systemStore.getFormattedDate() }}</div>
      </div>
      <button class="action-button" @click="systemStore.toggleDarkMode" title="切换深色模式" v-html="themeIcon"></button>
    </div>

    <StartMenu v-if="desktopStore.startMenuOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDesktopStore } from '@/stores/desktop'
import { useSystemStore } from '@/stores/system'
import StartMenu from './StartMenu.vue'

const desktopStore = useDesktopStore()
const systemStore = useSystemStore()
const showVolumePopup = ref(false)
const volumePopup = ref<HTMLElement | null>(null)
const previewWindowId = ref<string | null>(null)
let previewTimeout: number | null = null

const startIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>')

const wifiIcon = computed(() => systemStore.wifiConnected
  ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>'
  : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>'
)

const volumeIcon = computed(() => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>${systemStore.volume > 0 ? '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' : '<line x1="1" y1="1" x2="23" y2="23"></line>'}</svg>`)

const batteryIcon = computed(() => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line>${getBatteryFill()}</svg>`)

const themeIcon = computed(() => systemStore.isDarkMode
  ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
  : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
)

function getBatteryFill() {
  const level = systemStore.battery
  const height = (level / 100) * 8
  const y = 10 - (height / 2)
  const color = level > 50 ? '#22c55e' : level > 20 ? '#f59e0b' : '#ef4444'
  return `<rect x="3" y="${y}" width="14" height="${height}" rx="1" fill="${color}"/>`
}

function onVolumeChange() {
  systemStore.setVolume(systemStore.volume)
}

function showPreview(windowId: string) {
  if (previewTimeout) {
    clearTimeout(previewTimeout)
  }
  previewTimeout = window.setTimeout(() => {
    previewWindowId.value = windowId
  }, 300) // 300ms 延迟显示
}

function hidePreview() {
  if (previewTimeout) {
    clearTimeout(previewTimeout)
    previewTimeout = null
  }
  previewWindowId.value = null
}

function handleClickOutside(e: MouseEvent) {
  if (volumePopup.value && !volumePopup.value.contains(e.target as Node)) {
    showVolumePopup.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.taskbar.dark {
  background: rgba(30, 30, 30, 0.9);
}

@media (hover: none) and (pointer: coarse) {
  .taskbar {
    height: 56px;
    padding: 0 12px;
  }
}

.taskbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.start-button {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: background-color 0.2s, transform 0.1s;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.start-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.start-button:active {
  transform: scale(0.95);
}

.taskbar.dark .start-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.logo svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

.tray-item svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.action-button svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.taskbar-apps {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  flex: 1;
  min-width: 0;
}

.taskbar-apps::-webkit-scrollbar {
  display: none;
}

.taskbar-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s, transform 0.1s;
  max-width: 200px;
  min-width: 0;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.taskbar.dark .taskbar-item {
  background: rgba(255, 255, 255, 0.05);
}

.taskbar-item:hover {
  background: rgba(0, 0, 0, 0.1);
}

.taskbar-item:active {
  transform: scale(0.95);
}

@media (hover: none) and (pointer: coarse) {
  .taskbar-item {
    padding: 12px 16px;
  }
  .app-name {
    font-size: 14px;
  }
}

.taskbar.dark .taskbar-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.taskbar-item.active {
  background: rgba(102, 126, 234, 0.2);
  border-bottom: 2px solid #667eea;
}

.taskbar-item.minimized {
  opacity: 0.6;
}

.window-preview {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  animation: fadeInUp 0.2s ease-out;
  z-index: 1000;
}

.taskbar.dark .window-preview {
  background: rgba(40, 40, 40, 0.95);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  border-radius: 8px;
}

.preview-icon svg {
  width: 32px;
  height: 32px;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-size {
  font-size: 12px;
  opacity: 0.6;
}

.app-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(102, 126, 234, 0.15);
  border-radius: 6px;
}

.app-icon svg {
  width: 16px;
  height: 16px;
  stroke: #667eea;
}

.app-name {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.taskbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.system-tray {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tray-item {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background-color 0.2s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.tray-item:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.tray-item:active {
  transform: scale(0.9);
}

.taskbar.dark .tray-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.volume-control {
  position: relative;
}

.volume-popup {
  position: absolute;
  bottom: 52px;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
  z-index: 1001;
}

.taskbar.dark .volume-popup {
  background: rgba(40, 40, 40, 0.95);
}

.volume-popup input[type="range"] {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

.volume-popup input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

.volume-value {
  font-size: 12px;
  min-width: 35px;
  text-align: right;
}

.battery {
  position: relative;
}

.battery-text {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 8px;
  font-weight: 600;
  color: inherit;
}

.clock {
  text-align: right;
  padding: 4px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.clock:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.taskbar.dark .clock:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.time {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
}

.date {
  font-size: 11px;
  opacity: 0.8;
  line-height: 1.2;
}

.taskbar.dark .time,
.taskbar.dark .date {
  color: #ffffff;
}

.action-button {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background-color 0.2s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.action-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.action-button:active {
  transform: scale(0.9);
}

.taskbar.dark .action-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
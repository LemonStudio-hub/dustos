<template>
  <div class="desktop" :class="{ dark: systemStore.isDarkMode }" @click="handleDesktopClick" @contextmenu="handleContextMenu">
    <!-- 启动动画遮罩 -->
    <transition name="boot-fade">
      <div v-if="showBootScreen" class="boot-screen">
        <!-- 阶段1: Logo动画 -->
        <transition name="boot-stage">
          <div v-if="bootStage === 0" class="boot-stage-1">
            <div class="boot-logo">
              <div class="logo-inner">
                <span class="logo-icon">💻</span>
              </div>
            </div>
            <div class="boot-text">
              <span class="text-part">dust</span>
              <span class="text-part-accent">OS</span>
            </div>
            <div class="boot-version">v2.0</div>
          </div>
        </transition>

        <!-- 阶段2: 加载动画 -->
        <transition name="boot-stage">
          <div v-if="bootStage === 1" class="boot-stage-2">
            <div class="boot-loader">
              <div class="loader-container">
                <div class="loader-bar" :style="{ width: bootProgress + '%' }"></div>
                <div class="loader-glow" :style="{ width: bootProgress + '%' }"></div>
              </div>
              <div class="loader-text">
                <span class="loader-percentage">{{ Math.round(bootProgress) }}%</span>
                <span class="loader-status">{{ getBootStatusText() }}</span>
              </div>
            </div>
            <div class="boot-system-info">
              <div class="system-info-item">
                <span class="info-label">系统</span>
                <span class="info-value">dustOS Web Desktop</span>
              </div>
              <div class="system-info-item">
                <span class="info-label">内核</span>
                <span class="info-value">Vue 3 + TypeScript</span>
              </div>
              <div class="system-info-item">
                <span class="info-label">内存</span>
                <span class="info-value">{{ formatMemory() }}</span>
              </div>
            </div>
          </div>
        </transition>

        <!-- 阶段3: 欢迎界面 -->
        <transition name="boot-stage">
          <div v-if="bootStage === 2" class="boot-stage-3">
            <div class="welcome-icon">✨</div>
            <div class="welcome-title">欢迎回来</div>
            <div class="welcome-subtitle">系统已准备就绪</div>
            <div class="welcome-tips">
              <div class="tip-item">
                <span class="tip-icon">💡</span>
                <span class="tip-text">按 Ctrl+Space 打开全局搜索</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">📸</span>
                <span class="tip-text">按 Ctrl+Shift+V 打开剪贴板历史</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">🔒</span>
                <span class="tip-text">按 Win+L 锁定屏幕</span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- 桌面图标 -->
    <transition-group name="icon-fade" tag="div" class="desktop-icons">
      <!-- 应用分组 -->
      <div
        v-for="group in desktopStore.iconGroups"
        :key="group.id"
        class="desktop-icon-group"
        :style="{ 
          left: group.x + 'px', 
          top: group.y + 'px',
          animationDelay: (0) + 'ms'
        }"
      >
        <div class="group-header" @click="desktopStore.toggleIconGroup(group.id)">
          <div class="group-icon-wrapper">
            <span class="group-icon">📁</span>
            <span class="group-count">{{ group.iconIds.length }}</span>
          </div>
          <span class="group-name">{{ group.name }}</span>
          <span class="group-toggle">{{ group.isExpanded ? '▼' : '▶' }}</span>
        </div>
        <transition name="group-expand">
          <div v-if="group.isExpanded" class="group-content">
            <div
              v-for="icon in desktopStore.getGroupIcons(group.id)"
              :key="icon.id"
              class="group-icon-item"
              @click.stop="desktopStore.openWindow(icon)"
            >
              <div class="icon-wrapper" v-html="icon.icon"></div>
              <span class="icon-name">{{ icon.name }}</span>
            </div>
          </div>
        </transition>
      </div>
      <!-- 桌面图标 -->
      <div
        v-for="(icon, index) in getUngroupedIcons()"
        :key="icon.id"
        class="desktop-icon"
        :style="{ 
          left: icon.x + 'px', 
          top: icon.y + 'px',
          animationDelay: (index * 50) + 'ms'
        }"
        @click="desktopStore.openWindow(icon)"
      >
        <div class="icon-wrapper" v-html="icon.icon"></div>
        <span class="icon-name">{{ icon.name }}</span>
      </div>
    </transition-group>

    <!-- 窗口容器 -->
    <div class="windows-container">
      <WindowComponent
        v-for="window in desktopStore.windows"
        :key="window.id"
        :window="window"
      />
    </div>

    <!-- 任务栏 -->
    <Taskbar />

    <!-- 全局搜索 -->
    <GlobalSearch :isActive="showGlobalSearch" @close="showGlobalSearch = false" @open="showGlobalSearch = true" />

    <!-- 剪贴板历史 -->
    <ClipboardHistory v-if="showClipboardHistory" @close="showClipboardHistory = false" />

    <!-- 通知中心 -->
    <div class="notification-center">
      <transition-group name="notification-slide">
        <div
          v-for="notification in systemStore.notifications"
          :key="notification.id"
          class="notification"
          @click="systemStore.removeNotification(notification.id)"
        >
          <div class="notification-header">
            <span class="notification-title">{{ notification.title }}</span>
            <button class="notification-close" @click.stop="systemStore.removeNotification(notification.id)">✕</button>
          </div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
      </transition-group>
    </div>

    <LockScreen v-if="desktopStore.isLocked" @unlocked="desktopStore.unlockScreen" />

    <ContextMenu
      v-if="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @action="handleContextMenuAction"
      @close="closeContextMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDesktopStore } from '@/stores/desktop'
import { useSystemStore } from '@/stores/system'
import Taskbar from '@/components/Taskbar.vue'
import WindowComponent from '@/components/WindowComponent.vue'
import LockScreen from '@/components/LockScreen.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'
import ClipboardHistory from '@/components/ClipboardHistory.vue'

const desktopStore = useDesktopStore()
const systemStore = useSystemStore()
const showBootScreen = ref(true)
const showGlobalSearch = ref(false)
const showClipboardHistory = ref(false)
const contextMenu = ref({ show: false, x: 0, y: 0 })
const bootStage = ref(0) // 0: logo, 1: loading, 2: system, 3: welcome
const bootProgress = ref(0)

let timeInterval: number

onMounted(() => {
  // 启动动画
  setTimeout(() => {
    bootStage.value = 1
    // 模拟加载进度
    const loadInterval = setInterval(() => {
      bootProgress.value += Math.random() * 15
      if (bootProgress.value >= 100) {
        bootProgress.value = 100
        clearInterval(loadInterval)
        setTimeout(() => {
          bootStage.value = 2
          setTimeout(() => {
            showBootScreen.value = false
          }, 2000)
        }, 500)
      }
    }, 100)
  }, 1500)

  // 欢迎通知
  setTimeout(() => {
    systemStore.addNotification('欢迎使用', 'dustOS 已准备就绪')
  }, 4000)

  // 时间更新
  timeInterval = window.setInterval(() => {
    systemStore.updateTime()
  }, 1000)

  // 添加键盘快捷键
  document.addEventListener('keydown', handleKeyDown)
  // 点击关闭右键菜单
  document.addEventListener('click', () => {
    contextMenu.value.show = false
  })
})

onUnmounted(() => {
  clearInterval(timeInterval)
  document.removeEventListener('keydown', handleKeyDown)
})

function handleKeyDown(e: KeyboardEvent) {
  // Alt + Tab 切换窗口
  if (e.altKey && e.key === 'Tab') {
    e.preventDefault()
    desktopStore.switchWindow()
  }

  // Win + D 最小化所有窗口
  if (e.metaKey && e.key === 'd') {
    e.preventDefault()
    desktopStore.minimizeAll()
  }

  // Win + Shift + D 恢复所有窗口
  if (e.metaKey && e.shiftKey && e.key === 'd') {
    e.preventDefault()
    desktopStore.restoreAll()
  }

  // Win + L 锁定屏幕
  if (e.metaKey && e.key === 'l') {
    e.preventDefault()
    desktopStore.lockScreen()
  }

  // F5 刷新
  if (e.key === 'F5') {
    e.preventDefault()
    location.reload()
  }

  // Ctrl + Space 打开全局搜索
  if (e.ctrlKey && e.key === ' ') {
    e.preventDefault()
    showGlobalSearch.value = true
  }

  // Ctrl + Shift + V 打开剪贴板历史
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'v') {
    e.preventDefault()
    showClipboardHistory.value = true
  }
}

function handleDesktopClick() {
  // 点击桌面时关闭开始菜单
  desktopStore.closeStartMenu()
}

function handleContextMenu(e: MouseEvent) {
  e.preventDefault()
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY
  }
}

function closeContextMenu() {
  contextMenu.value.show = false
}

function handleContextMenuAction(action: string) {
  switch (action) {
    case 'refresh':
      location.reload()
      break
    case 'changeWallpaper':
      const nextWallpaper = (systemStore.wallpaper + 1) % systemStore.wallpapers.length
      systemStore.changeWallpaper(nextWallpaper)
      systemStore.addNotification('更换壁纸', `已切换到：${systemStore.wallpapers[nextWallpaper].name}`)
      break
    case 'settings':
      desktopStore.openWindow(desktopStore.desktopIcons[2]) // 设置
      break
    case 'newFolder':
      desktopStore.createIconGroup('新建文件夹', 100, 100)
      systemStore.addNotification('新建文件夹', '文件夹已创建')
      break
    case 'terminal':
      desktopStore.openWindow(desktopStore.desktopIcons[1]) // 终端
      break
    case 'lockScreen':
      desktopStore.lockScreen()
      break
  }
}

function getUngroupedIcons() {
  const groupedIconIds = new Set<string>()
  desktopStore.iconGroups.forEach(group => {
    group.iconIds.forEach(iconId => groupedIconIds.add(iconId))
  })
  return desktopStore.desktopIcons.filter(icon => !groupedIconIds.has(icon.id))
}

function getBootStatusText(): string {
  if (bootProgress.value < 20) return '正在初始化系统...'
  if (bootProgress.value < 40) return '正在加载核心组件...'
  if (bootProgress.value < 60) return '正在启动服务...'
  if (bootProgress.value < 80) return '正在准备桌面...'
  if (bootProgress.value < 100) return '正在完成...'
  return '完成'
}

function formatMemory(): string {
  if (performance && performance.memory) {
    const used = performance.memory.usedJSHeapSize
    const total = performance.memory.totalJSHeapSize
    const usedMB = Math.round(used / 1024 / 1024)
    const totalMB = Math.round(total / 1024 / 1024)
    return `${usedMB} MB / ${totalMB} MB`
  }
  return 'N/A'
}
</script>

<style scoped>
.desktop {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: v-bind('systemStore.getCurrentWallpaper()');
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: background 0.5s ease;
}

.desktop.dark {
  background: v-bind('systemStore.getCurrentWallpaper()');
}

/* 启动屏幕 */
.boot-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  overflow: hidden;
}

.desktop.dark .boot-screen {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

/* 阶段1: Logo */
.boot-stage-1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.boot-logo {
  position: relative;
  margin-bottom: 16px;
}

.logo-inner {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: logoBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes logoBounce {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(0deg);
  }
  70% {
    transform: scale(0.95) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.logo-icon {
  font-size: 56px;
  animation: iconGlow 2s ease-in-out infinite;
}

@keyframes iconGlow {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(255, 255, 255, 0.8));
  }
}

.boot-text {
  font-size: 48px;
  font-weight: 700;
  color: white;
  display: flex;
  gap: 8px;
  animation: textSlideIn 0.8s ease 0.3s backwards;
}

@keyframes textSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.text-part {
  animation: letterReveal 0.6s ease 0.5s backwards;
}

.text-part-accent {
  color: #fbbf24;
  animation: letterReveal 0.6s ease 0.6s backwards;
}

@keyframes letterReveal {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.boot-version {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  animation: fadeInUp 0.6s ease 0.8s backwards;
}

/* 阶段2: 加载 */
.boot-stage-2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  animation: stageFadeIn 0.6s ease;
}

@keyframes stageFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.boot-loader {
  width: 320px;
}

.loader-container {
  position: relative;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 16px;
}

.loader-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.loader-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.loader-glow {
  position: absolute;
  top: -2px;
  left: 0;
  height: 8px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  filter: blur(8px);
  opacity: 0.6;
  transition: width 0.3s ease;
}

.loader-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.loader-percentage {
  font-size: 24px;
  font-weight: 700;
}

.loader-status {
  font-size: 13px;
  opacity: 0.8;
}

.boot-system-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeInUp 0.6s ease 0.3s backwards;
}

.system-info-item {
  display: flex;
  justify-content: space-between;
  gap: 32px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.info-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.info-value {
  font-size: 13px;
  color: white;
  font-weight: 500;
}

/* 阶段3: 欢迎 */
.boot-stage-3 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  animation: welcomeSlideIn 0.8s ease;
}

@keyframes welcomeSlideIn {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-icon {
  font-size: 64px;
  animation: welcomeIconSpin 1s ease;
}

@keyframes welcomeIconSpin {
  from {
    transform: rotate(-180deg) scale(0);
  }
  to {
    transform: rotate(0deg) scale(1);
  }
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  animation: fadeInUp 0.6s ease 0.2s backwards;
}

.welcome-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  animation: fadeInUp 0.6s ease 0.4s backwards;
}

.welcome-tips {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeInUp 0.6s ease 0.6s backwards;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.tip-icon {
  font-size: 20px;
}

.tip-text {
  font-size: 14px;
  color: white;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.boot-stage-enter-active,
.boot-stage-leave-active {
  transition: all 0.5s ease;
}

.boot-stage-enter-from,
.boot-stage-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.boot-fade-enter-active,
.boot-fade-leave-active {
  transition: opacity 0.5s ease;
}

.boot-fade-enter-from,
.boot-fade-leave-to {
  opacity: 0;
}

/* 桌面图标 */
.desktop-icons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 48px;
  padding: 10px;
  overflow-y: auto;
}

/* 自定义滚动条 */
.desktop-icons::-webkit-scrollbar {
  width: 10px;
}

.desktop-icons::-webkit-scrollbar-track {
  background: transparent;
}

.desktop-icons::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.desktop-icons::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.desktop.dark .desktop-icons::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

.desktop.dark .desktop-icons::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.desktop-icon {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s, transform 0.1s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  animation: iconFadeIn 0.4s ease backwards;
}

.desktop-icon:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.desktop-icon:active {
  transform: scale(0.95);
}

.icon-fade-enter-active {
  animation: iconFadeIn 0.4s ease backwards;
}

@keyframes iconFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 应用分组 */
.desktop-icon-group {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 80px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s, transform 0.1s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  animation: iconFadeIn 0.4s ease backwards;
}

.desktop-icon-group:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.desktop-icon-group:active {
  transform: scale(0.95);
}

.group-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.group-icon-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: transform 0.2s;
}

.desktop-icon-group:hover .group-icon-wrapper {
  transform: scale(1.1);
}

.group-icon {
  font-size: 28px;
}

.group-count {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
}

.group-name {
  font-size: 12px;
  color: white;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  word-wrap: break-word;
  line-height: 1.2;
  max-width: 100%;
}

.group-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 4px;
  border-radius: 4px;
}

.group-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 4px;
}

.group-expand-enter-active,
.group-expand-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.group-expand-enter-from,
.group-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.group-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
  transition: background-color 0.15s;
}

.group-icon-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.group-icon-item .icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.group-icon-item .icon-wrapper svg {
  width: 20px;
  height: 20px;
}

.group-icon-item .icon-name {
  font-size: 10px;
  margin-top: 2px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: transform 0.2s;
  will-change: transform;
}

.desktop-icon:hover .icon-wrapper {
  transform: scale(1.1);
}

.icon-wrapper svg {
  width: 28px;
  height: 28px;
  stroke: white;
  will-change: auto;
}

.icon-name {
  margin-top: 4px;
  font-size: 12px;
  color: white;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  word-wrap: break-word;
  line-height: 1.2;
  will-change: auto;
}

.windows-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 48px;
}

/* 通知中心 */
.notification-center {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.notification {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  min-width: 280px;
  max-width: 350px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.notification:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.desktop.dark .notification {
  background: rgba(40, 40, 40, 0.95);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  color: #667eea;
}

.notification-close {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #666;
}

.notification-message {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.desktop.dark .notification-message {
  color: #aaa;
}

.notification-slide-enter-active {
  animation: slideInRight 0.3s ease;
}

.notification-slide-leave-active {
  animation: slideOutRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100px);
  }
}
</style>
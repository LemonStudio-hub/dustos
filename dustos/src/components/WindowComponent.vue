<template>
  <div
    v-if="!window.isMinimized"
    class="window"
    :class="{ dark: systemStore.isDarkMode, maximized: window.isMaximized, active: isActive }"
    :style="windowStyle"
    @mousedown="desktopStore.focusWindow(window.id)"
  >
    <div class="window-header" @mousedown="startDrag" @touchstart="startTouchDrag" @touchmove.prevent="onTouchDrag" @touchend="stopTouchDrag">
      <div class="window-title">
        <span class="window-icon" v-html="window.icon"></span>
        <span class="title-text">{{ window.title }}</span>
      </div>
      <div class="window-controls">
        <button class="control-button minimize" @click="desktopStore.minimizeWindow(window.id)" title="最小化">
          <span>─</span>
        </button>
        <button class="control-button maximize" @click="desktopStore.maximizeWindow(window.id)" :title="window.isMaximized ? '还原' : '最大化'">
          <span>{{ window.isMaximized ? '❐' : '□' }}</span>
        </button>
        <div class="split-menu-container">
          <button class="control-button split" @click="showSplitMenu = !showSplitMenu" title="分屏">
            <span>📐</span>
          </button>
          <div v-if="showSplitMenu" class="split-menu">
            <div class="split-menu-item" @click="splitWindow('left')">
              <span class="split-icon">⬅️</span>
              <span>左半屏</span>
            </div>
            <div class="split-menu-item" @click="splitWindow('right')">
              <span class="split-icon">➡️</span>
              <span>右半屏</span>
            </div>
            <div class="split-menu-item" @click="splitWindow('top')">
              <span class="split-icon">⬆️</span>
              <span>上半屏</span>
            </div>
            <div class="split-menu-item" @click="splitWindow('bottom')">
              <span class="split-icon">⬇️</span>
              <span>下半屏</span>
            </div>
            <div class="split-menu-item" @click="splitWindow('quarter')">
              <span class="split-icon">🔲</span>
              <span>四分屏</span>
            </div>
          </div>
        </div>
        <button class="control-button pin" :class="{ pinned: window.isPinned }" @click="desktopStore.pinWindow(window.id)" :title="window.isPinned ? '取消置顶' : '置顶'">
          <span>{{ window.isPinned ? '📌' : '📍' }}</span>
        </button>
        <div class="opacity-control" @click.stop>
          <button class="control-button opacity" @click="showOpacityMenu = !showOpacityMenu" title="透明度">
            <span>💧</span>
          </button>
          <div v-if="showOpacityMenu" class="opacity-menu">
            <div class="opacity-menu-title">窗口透明度</div>
            <div class="opacity-slider">
              <input
                type="range"
                v-model.number="windowOpacity"
                min="0.1"
                max="1"
                step="0.1"
                @input="updateOpacity"
              />
            </div>
            <div class="opacity-value">{{ Math.round(windowOpacity * 100) }}%</div>
            <div class="opacity-presets">
              <button class="opacity-preset" @click="setOpacity(1)">100%</button>
              <button class="opacity-preset" @click="setOpacity(0.8)">80%</button>
              <button class="opacity-preset" @click="setOpacity(0.6)">60%</button>
              <button class="opacity-preset" @click="setOpacity(0.4)">40%</button>
            </div>
          </div>
        </div>
        <div class="snapshot-control" @click.stop>
          <button class="control-button snapshot" @click="showSnapshotMenu = !showSnapshotMenu" title="快照">
            <span>📸</span>
          </button>
          <div v-if="showSnapshotMenu" class="snapshot-menu">
            <div class="snapshot-menu-title">窗口快照</div>
            <div class="snapshot-menu-item" @click="createCurrentWindowSnapshot">
              <span class="snapshot-icon">💾</span>
              <span>保存当前窗口</span>
            </div>
            <div class="snapshot-menu-item" @click="createAllWindowsSnapshot">
              <span class="snapshot-icon">🖼️</span>
              <span>保存所有窗口</span>
            </div>
            <div v-if="desktopStore.snapshots.length > 0" class="snapshot-divider"></div>
            <div v-if="desktopStore.snapshots.length > 0" class="snapshot-list">
              <div
                v-for="snapshot in desktopStore.snapshots.slice(0, 5)"
                :key="snapshot.id"
                class="snapshot-item"
              >
                <div class="snapshot-item-info" @click="restoreSnapshot(snapshot.id)">
                  <div class="snapshot-item-name">{{ snapshot.name }}</div>
                  <div class="snapshot-item-date">{{ formatSnapshotDate(snapshot.createdAt) }}</div>
                </div>
                <button class="snapshot-item-delete" @click.stop="deleteSnapshot(snapshot.id)">
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button class="control-button close" @click="desktopStore.closeWindow(window.id)" title="关闭">
          <span>✕</span>
        </button>
      </div>
    </div>

    <div class="window-content" ref="contentRef">
      <component :is="windowComponent" />
    </div>

    <div class="resize-handle" @mousedown="startResize" @touchstart="startTouchResize" @touchmove.prevent="onTouchResize" @touchend="stopTouchResize"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, type Component } from 'vue'
import { useDesktopStore } from '@/stores/desktop'
import { useSystemStore } from '@/stores/system'
import type { WindowState, AppComponentName } from '@/types'
import FileManager from './apps/FileManager.vue'
import Terminal from './apps/Terminal.vue'
import Settings from './apps/Settings.vue'
import Browser from './apps/Browser.vue'
import Notepad from './apps/Notepad.vue'
import Calculator from './apps/Calculator.vue'
import TaskManager from './apps/TaskManager.vue'
import ImageViewer from './apps/ImageViewer.vue'
import MusicPlayer from './apps/MusicPlayer.vue'
import SystemInfo from './apps/SystemInfo.vue'
import Calendar from './apps/Calendar.vue'
import Weather from './apps/Weather.vue'
import TaskList from './apps/TaskList.vue'
import VoiceRecorder from './apps/VoiceRecorder.vue'
import VideoPlayer from './apps/VideoPlayer.vue'
import CodeEditor from './apps/CodeEditor.vue'
import Clock from './apps/Clock.vue'
import Minesweeper from './apps/Minesweeper.vue'
import SnakeGame from './apps/SnakeGame.vue'
import LogViewer from './apps/LogViewer.vue'
import AppStore from './apps/AppStore.vue'

const props = defineProps<{
  window: WindowState
}>()

const desktopStore = useDesktopStore()
const systemStore = useSystemStore()
const contentRef = ref<HTMLElement | null>(null)

const components: Record<AppComponentName, Component> = {
  FileManager,
  Terminal,
  Settings,
  Browser,
  Notepad,
  Calculator,
  TaskManager,
  ImageViewer,
  MusicPlayer,
  SystemInfo,
  Calendar,
  Weather,
  TaskList,
  VoiceRecorder,
  VideoPlayer,
  CodeEditor,
  Clock,
  Minesweeper,
  SnakeGame,
  LogViewer,
  AppStore,
}

const showSplitMenu = ref(false)
const showOpacityMenu = ref(false)
const showSnapshotMenu = ref(false)
const windowOpacity = ref(props.window.opacity || 1)

const windowComponent = shallowRef(components[props.window.component])

const isActive = computed(() => desktopStore.activeWindowId === props.window.id)

const windowStyle = computed(() => {
  if (props.window.isMaximized) {
    return {
      left: '0',
      top: '0',
      width: '100%',
      height: 'calc(100% - 48px)',
      zIndex: props.window.zIndex,
      opacity: windowOpacity.value,
    }
  }
  return {
    left: props.window.x + 'px',
    top: props.window.y + 'px',
    width: props.window.width + 'px',
    height: props.window.height + 'px',
    zIndex: props.window.zIndex,
    opacity: windowOpacity.value,
  }
})

let isDragging = false
let isResizing = false
let isTouchDragging = false
let isTouchResizing = false
let dragStartX = 0
let dragStartY = 0
let windowStartX = 0
let windowStartY = 0
let resizeStartWidth = 0
let resizeStartHeight = 0
let touchStartX = 0
let touchStartY = 0

function startDrag(e: MouseEvent) {
  if (props.window.isMaximized) return
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  windowStartX = props.window.x
  windowStartY = props.window.y
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!isDragging) return
  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY
  
  // 边界限制
  const newX = Math.max(0, Math.min(window.innerWidth - 100, windowStartX + dx))
  const newY = Math.max(0, Math.min(window.innerHeight - 100, windowStartY + dy))
  
  desktopStore.moveWindow(props.window.id, newX, newY)
}

function stopDrag() {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  // 窗口吸附检测
  checkSnap()
}

function checkSnap() {
  const snapThreshold = 20
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const taskbarHeight = 48
  
  const wx = props.window.x
  const wy = props.window.y
  const ww = props.window.width
  const wh = props.window.height
  
  // 左半屏
  if (Math.abs(wx) < snapThreshold) {
    desktopStore.resizeWindow(props.window.id, screenWidth / 2, screenHeight - taskbarHeight)
    desktopStore.moveWindow(props.window.id, 0, 0)
    systemStore.addNotification('窗口吸附', '已吸附到左半屏')
    return
  }
  
  // 右半屏
  if (Math.abs(wx + ww - screenWidth) < snapThreshold) {
    desktopStore.resizeWindow(props.window.id, screenWidth / 2, screenHeight - taskbarHeight)
    desktopStore.moveWindow(props.window.id, screenWidth / 2, 0)
    systemStore.addNotification('窗口吸附', '已吸附到右半屏')
    return
  }
  
  // 左上四分之一
  if (wx < snapThreshold && wy < snapThreshold) {
    desktopStore.resizeWindow(props.window.id, screenWidth / 2, (screenHeight - taskbarHeight) / 2)
    desktopStore.moveWindow(props.window.id, 0, 0)
    systemStore.addNotification('窗口吸附', '已吸附到左上')
    return
  }
  
  // 右上四分之一
  if (wx + ww - screenWidth > -snapThreshold && wy < snapThreshold) {
    desktopStore.resizeWindow(props.window.id, screenWidth / 2, (screenHeight - taskbarHeight) / 2)
    desktopStore.moveWindow(props.window.id, screenWidth / 2, 0)
    systemStore.addNotification('窗口吸附', '已吸附到右上')
    return
  }
  
  // 左下四分之一
  if (wx < snapThreshold && wy + wh - (screenHeight - taskbarHeight) > -snapThreshold) {
    desktopStore.resizeWindow(props.window.id, screenWidth / 2, (screenHeight - taskbarHeight) / 2)
    desktopStore.moveWindow(props.window.id, 0, (screenHeight - taskbarHeight) / 2)
    systemStore.addNotification('窗口吸附', '已吸附到左下')
    return
  }
  
  // 右下四分之一
  if (wx + ww - screenWidth > -snapThreshold && wy + wh - (screenHeight - taskbarHeight) > -snapThreshold) {
    desktopStore.resizeWindow(props.window.id, screenWidth / 2, (screenHeight - taskbarHeight) / 2)
    desktopStore.moveWindow(props.window.id, screenWidth / 2, (screenHeight - taskbarHeight) / 2)
    systemStore.addNotification('窗口吸附', '已吸附到右下')
    return
  }
}

function startResize(e: MouseEvent) {
  if (props.window.isMaximized) return
  e.stopPropagation()
  isResizing = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  resizeStartWidth = props.window.width
  resizeStartHeight = props.window.height
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
  if (!isResizing) return
  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY
  
  // 边界限制
  const newWidth = Math.max(300, Math.min(window.innerWidth - windowStartX, resizeStartWidth + dx))
  const newHeight = Math.max(200, Math.min(window.innerHeight - windowStartY, resizeStartHeight + dy))
  
  desktopStore.resizeWindow(props.window.id, newWidth, newHeight)
}

function stopResize() {
  isResizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

function startTouchDrag(e: TouchEvent) {
  if (props.window.isMaximized) return
  isTouchDragging = true
  const touch = e.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  windowStartX = props.window.x
  windowStartY = props.window.y
}

function onTouchDrag(e: TouchEvent) {
  if (!isTouchDragging) return
  const touch = e.touches[0]
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY
  
  // 边界限制
  const newX = Math.max(0, Math.min(window.innerWidth - 100, windowStartX + dx))
  const newY = Math.max(0, Math.min(window.innerHeight - 100, windowStartY + dy))
  
  desktopStore.moveWindow(props.window.id, newX, newY)
}

function stopTouchDrag() {
  isTouchDragging = false
}

function startTouchResize(e: TouchEvent) {
  if (props.window.isMaximized) return
  e.stopPropagation()
  isTouchResizing = true
  const touch = e.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  resizeStartWidth = props.window.width
  resizeStartHeight = props.window.height
}

function onTouchResize(e: TouchEvent) {
  if (!isTouchResizing) return
  const touch = e.touches[0]
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY
  
  // 边界限制
  const newWidth = Math.max(200, Math.min(window.innerWidth - windowStartX, resizeStartWidth + dx))
  const newHeight = Math.max(150, Math.min(window.innerHeight - windowStartY, resizeStartHeight + dy))
  
  desktopStore.resizeWindow(props.window.id, newWidth, newHeight)
}

function stopTouchResize() {
  isTouchResizing = false
}

function splitWindow(direction: 'left' | 'right' | 'top' | 'bottom' | 'quarter') {
  desktopStore.splitWindow(props.window.id, direction)
  showSplitMenu.value = false
}

function updateOpacity() {
  desktopStore.setWindowOpacity(props.window.id, windowOpacity.value)
}

function setOpacity(value: number) {
  windowOpacity.value = value
  desktopStore.setWindowOpacity(props.window.id, value)
}

function createCurrentWindowSnapshot() {
  const name = `${props.window.title} - ${new Date().toLocaleTimeString()}`
  const snapshotId = desktopStore.createSnapshot(name)
  showSnapshotMenu.value = false
  systemStore.addNotification('快照已保存', `已保存窗口快照: ${name}`)
}

function createAllWindowsSnapshot() {
  const name = `所有窗口 - ${new Date().toLocaleString()}`
  const snapshotId = desktopStore.createSnapshot(name)
  showSnapshotMenu.value = false
  systemStore.addNotification('快照已保存', `已保存所有窗口快照: ${name}`)
}

function restoreSnapshot(snapshotId: string) {
  const success = desktopStore.restoreSnapshot(snapshotId)
  if (success) {
    showSnapshotMenu.value = false
  }
}

function deleteSnapshot(snapshotId: string) {
  const success = desktopStore.deleteSnapshot(snapshotId)
  if (success) {
    systemStore.addNotification('快照已删除', '窗口快照已删除')
  }
}

function formatSnapshotDate(timestamp: number): string {
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
  return date.toLocaleDateString()
}
</script>

<style scoped>
.window {
  position: absolute;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.1s, opacity 0.2s;
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

.window:active {
  transform: translateZ(0) scale(0.99);
}

.window.dark {
  background: rgba(40, 40, 40, 0.98);
}

.window.maximized {
  border-radius: 0;
}

.window.active {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}

/* 自定义滚动条 */
.window-content::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.window-content::-webkit-scrollbar-track {
  background: transparent;
}

.window-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.window-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.window.dark .window-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.window.dark .window-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(245, 245, 245, 0.9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  cursor: move;
  user-select: none;
}

.window.dark .window-header {
  background: rgba(50, 50, 50, 0.9);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.window-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.window-icon {
  font-size: 18px;
}

.window-controls {
  display: flex;
  gap: 4px;
}

.control-button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background-color 0.2s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.control-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.control-button:active {
  transform: scale(0.9);
}

@media (hover: none) and (pointer: coarse) {
  .control-button {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
}

.window.dark .control-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.control-button.close:hover {
  background-color: #e81123;
  color: white;
}

.control-button.pin.pinned {
  color: var(--color-primary);
}

.control-button.pin:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

.split-menu-container {
  position: relative;
}

.opacity-control {
  position: relative;
}

.control-button.split:hover {
  background-color: rgba(102, 126, 234, 0.2);
}

.control-button.opacity:hover {
  background-color: rgba(102, 126, 234, 0.2);
}

.control-button.snapshot:hover {
  background-color: rgba(102, 126, 234, 0.2);
}

.opacity-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 16px;
  min-width: 200px;
  z-index: 1000;
  animation: fadeIn 0.15s ease-out;
}

.window.dark .opacity-menu {
  background: rgba(40, 40, 40, 0.98);
}

.opacity-menu-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  opacity: 0.6;
}

.opacity-slider {
  margin-bottom: 12px;
}

.opacity-slider input {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  outline: none;
}

.opacity-value {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.opacity-presets {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.opacity-preset {
  padding: 6px 12px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.opacity-preset:hover {
  background: rgba(102, 126, 234, 0.2);
}

.opacity-preset:active {
  transform: scale(0.95);
}

.snapshot-control {
  position: relative;
}

.snapshot-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 12px;
  min-width: 220px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  animation: fadeIn 0.15s ease-out;
}

.window.dark .snapshot-menu {
  background: rgba(40, 40, 40, 0.98);
}

.snapshot-menu-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  opacity: 0.6;
}

.snapshot-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
  font-size: 13px;
}

.snapshot-menu-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.window.dark .snapshot-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.snapshot-icon {
  font-size: 16px;
}

.snapshot-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 8px 0;
}

.window.dark .snapshot-divider {
  background: rgba(255, 255, 255, 0.1);
}

.snapshot-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.snapshot-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.03);
  transition: background-color 0.15s;
}

.window.dark .snapshot-item {
  background: rgba(255, 255, 255, 0.03);
}

.snapshot-item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.window.dark .snapshot-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.snapshot-item-info {
  flex: 1;
  cursor: pointer;
}

.snapshot-item-name {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.snapshot-item-date {
  font-size: 11px;
  opacity: 0.6;
}

.snapshot-item-delete {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background-color 0.15s;
}

.snapshot-item-delete:hover {
  background: rgba(232, 17, 35, 0.1);
}

.snapshot-item-delete:active {
  transform: scale(0.95);
}

.split-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--color-surface);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 150px;
  z-index: 1000;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.split-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s;
  font-size: 13px;
  color: var(--color-text);
}

.split-menu-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.window.dark .split-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.split-icon {
  font-size: 16px;
}

@media (hover: none) and (pointer: coarse) {
  .control-button {
    width: 44px;
    height: 44px;
  }
}

.window-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  cursor: nwse-resize;
}

.resize-handle::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-right: 2px solid rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid rgba(0, 0, 0, 0.3);
}

@media (hover: none) and (pointer: coarse) {
  .resize-handle {
    width: 48px;
    height: 48px;
  }
}

/* 窗口动画 */
.window-enter-active {
  animation: windowOpen 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.window-leave-active {
  animation: windowClose 0.2s ease-in;
}

@keyframes windowOpen {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes windowClose {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* 最小化动画 */
.window-minimize {
  animation: windowMinimize 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.window-restore {
  animation: windowRestore 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes windowMinimize {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8) translateY(100px);
  }
}

@keyframes windowRestore {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(100px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 最大化动画 */
.window-maximize {
  animation: windowMaximize 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.window-unmaximize {
  animation: windowUnmaximize 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes windowMaximize {
  from {
    transform: scale(0.95);
  }
  to {
    transform: scale(1);
  }
}

@keyframes windowUnmaximize {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0.95);
  }
}
</style>
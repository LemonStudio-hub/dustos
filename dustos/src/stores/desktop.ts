import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useSystemStore } from './system'

export interface Window {
  id: string
  title: string
  icon: string
  component: string
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  isPinned: boolean
  opacity: number
  prevX?: number
  prevY?: number
  prevWidth?: number
  prevHeight?: number
}

export interface WindowState {
  id: string
  title: string
  icon: string
  component: string
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  isPinned: boolean
  opacity: number
  prevX?: number
  prevY?: number
  prevWidth?: number
  prevHeight?: number
}

export interface DesktopIcon {
  id: string
  name: string
  icon: string
  component: string
  x: number
  y: number
}

export interface IconGroup {
  id: string
  name: string
  x: number
  y: number
  iconIds: string[]
  isExpanded: boolean
}

export interface WindowSnapshot {
  id: string
  name: string
  createdAt: number
  windows: WindowState[]
}

export const useDesktopStore = defineStore('desktop', () => {
  const windows = ref<Window[]>([])
  const desktopIcons = ref<DesktopIcon[]>([
    { id: '1', name: '文件管理器', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>', component: 'FileManager', x: 20, y: 20 },
    { id: '2', name: '终端', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>', component: 'Terminal', x: 20, y: 120 },
    { id: '3', name: '设置', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>', component: 'Settings', x: 20, y: 220 },
    { id: '4', name: '浏览器', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>', component: 'Browser', x: 20, y: 320 },
    { id: '5', name: '记事本', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>', component: 'Notepad', x: 20, y: 420 },
    { id: '6', name: '计算器', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="14"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="12" y1="14" x2="12" y2="14"></line><line x1="16" y1="18" x2="16" y2="18"></line><line x1="8" y1="18" x2="8" y2="18"></line><line x1="12" y1="18" x2="12" y2="18"></line></svg>', component: 'Calculator', x: 20, y: 520 },
    { id: '7', name: '任务管理器', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>', component: 'TaskManager', x: 20, y: 620 },
    { id: '8', name: '图片查看器', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>', component: 'ImageViewer', x: 20, y: 720 },
    { id: '9', name: '音乐播放器', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>', component: 'MusicPlayer', x: 20, y: 820 },
    { id: '10', name: '系统信息', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><circle cx="12" cy="10" r="3"></circle><path d="M12 7V4"></path></svg>', component: 'SystemInfo', x: 20, y: 920 },
    { id: '11', name: '日历', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>', component: 'Calendar', x: 20, y: 1020 },
    { id: '12', name: '天气', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19"></path><circle cx="12" cy="7" r="4"></circle></svg>', component: 'Weather', x: 20, y: 1120 },
    { id: '13', name: '任务列表', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>', component: 'TaskList', x: 20, y: 1220 },
    { id: '14', name: '录音机', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>', component: 'VoiceRecorder', x: 20, y: 1320 },
    { id: '15', name: '视频播放器', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>', component: 'VideoPlayer', x: 20, y: 1420 },
    { id: '16', name: '代码编辑器', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>', component: 'CodeEditor', x: 20, y: 1520 },
    { id: '17', name: '时钟', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>', component: 'Clock', x: 20, y: 1620 },
    { id: '18', name: '扫雷', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="12" x2="12" y2="6"></line><line x1="12" y1="12" x2="12" y2="18"></line><line x1="12" y1="12" x2="6" y2="12"></line><line x1="12" y1="12" x2="18" y2="12"></line><line x1="12" y1="12" x2="7" y2="7"></line><line x1="12" y1="12" x2="17" y2="7"></line><line x1="12" y1="12" x2="7" y2="17"></line><line x1="12" y1="12" x2="17" y2="17"></line></svg>', component: 'Minesweeper', x: 20, y: 1720 },
    { id: '19', name: '贪吃蛇', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12a7 7 0 0 1 14 0M5 12c0-3.866 3.134-7 7-7s7 3.134 7 7M5 12h14M12 5v14"></path></svg>', component: 'SnakeGame', x: 20, y: 1820 },
    { id: '20', name: '日志查看器', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>', component: 'LogViewer', x: 20, y: 1920 },
    { id: '21', name: '应用商店', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><path d="M7 15h0M2 9.5h20M2 13.5h20M7 11h0"></path></svg>', component: 'AppStore', x: 20, y: 2020 },
  ])
  const startMenuOpen = ref(false)
  const maxZIndex = ref(100)
  const activeWindowId = ref<string | null>(null)
  const isLocked = ref(false)
  const snapshots = ref<WindowSnapshot[]>([])
  const iconGroups = ref<IconGroup[]>([])

  // 从localStorage加载快照
  function loadSnapshots() {
    const saved = localStorage.getItem('dustos_snapshots')
    if (saved) {
      try {
        snapshots.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to load snapshots:', e)
      }
    }
  }

  // 从localStorage加载分组
  function loadIconGroups() {
    const saved = localStorage.getItem('dustos_iconGroups')
    if (saved) {
      try {
        iconGroups.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to load icon groups:', e)
      }
    }
  }

  // 保存快照到localStorage
  function saveSnapshots() {
    localStorage.setItem('dustos_snapshots', JSON.stringify(snapshots.value))
  }

  // 保存分组到localStorage
  function saveIconGroups() {
    localStorage.setItem('dustos_iconGroups', JSON.stringify(iconGroups.value))
  }

  // 初始化时加载快照和分组
  loadSnapshots()
  loadIconGroups()

  function openWindow(icon: DesktopIcon) {
    const systemStore = useSystemStore()
    const existingWindow = windows.value.find(w => w.component === icon.component)
    if (existingWindow) {
      focusWindow(existingWindow.id)
      if (existingWindow.isMinimized) {
        existingWindow.isMinimized = false
        systemStore.playSystemSound('windowMaximize')
      }
      return
    }

    const isMobile = window.innerWidth < 768
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    const newWindow: Window = {
      id: Date.now().toString(),
      title: icon.name,
      icon: icon.icon,
      component: icon.component,
      x: isMobile ? 0 : 100 + windows.value.length * 30,
      y: isMobile ? 0 : 50 + windows.value.length * 30,
      width: isMobile ? screenWidth : 800,
      height: isMobile ? screenHeight - 48 : 600,
      isMinimized: false,
      isMaximized: isMobile,
      zIndex: ++maxZIndex.value,
      isPinned: false,
      opacity: 1,
    }
    windows.value.push(newWindow)
    activeWindowId.value = newWindow.id
    systemStore.playSystemSound('windowOpen')
  }

  function closeWindow(id: string) {
    const systemStore = useSystemStore()
    const index = windows.value.findIndex(w => w.id === id)
    if (index > -1) {
      windows.value.splice(index, 1)
      systemStore.playSystemSound('windowClose')
      if (activeWindowId.value === id) {
        activeWindowId.value = windows.value.length > 0 ? windows.value[windows.value.length - 1].id : null
      }
    }
  }

  function minimizeWindow(id: string) {
    const systemStore = useSystemStore()
    const window = windows.value.find(w => w.id === id)
    if (window) {
      window.isMinimized = true
      systemStore.playSystemSound('windowMinimize')
    }
  }

  function maximizeWindow(id: string) {
    const systemStore = useSystemStore()
    const window = windows.value.find(w => w.id === id)
    if (window) {
      window.isMaximized = !window.isMaximized
      if (window.isMaximized) {
        // 保存之前的位置和大小
        window.prevX = window.x
        window.prevY = window.y
        window.prevWidth = window.width
        window.prevHeight = window.height
        systemStore.playSystemSound('windowMaximize')
      } else {
        // 恢复之前的位置和大小
        if (window.prevX !== undefined) {
          window.x = window.prevX
          window.y = window.prevY
          window.width = window.prevWidth
          window.height = window.prevHeight
        }
        systemStore.playSystemSound('windowMaximize')
      }
    }
  }

  function focusWindow(id: string) {
    const window = windows.value.find(w => w.id === id)
    if (window) {
      // 如果是置顶窗口，使用更高的zIndex
      if (window.isPinned) {
        window.zIndex = 10000
      } else {
        window.zIndex = ++maxZIndex.value
      }
      activeWindowId.value = id
      if (window.isMinimized) {
        window.isMinimized = false
      }
    }
  }

  function moveWindow(id: string, x: number, y: number) {
    const window = windows.value.find(w => w.id === id)
    if (window && !window.isMaximized) {
      window.x = x
      window.y = y
    }
  }

  function resizeWindow(id: string, width: number, height: number) {
    const window = windows.value.find(w => w.id === id)
    if (window && !window.isMaximized) {
      window.width = width
      window.height = height
    }
  }

  function toggleStartMenu() {
    startMenuOpen.value = !startMenuOpen.value
  }

  function closeStartMenu() {
    startMenuOpen.value = false
  }

  function lockScreen() {
    isLocked.value = true
  }

  function unlockScreen() {
    isLocked.value = false
  }

  function getSortedWindows(): Window[] {
    return [...windows.value].sort((a, b) => b.zIndex - a.zIndex)
  }

  function switchWindow() {
    const sorted = getSortedWindows()
    if (sorted.length === 0) return

    if (activeWindowId.value === sorted[0].id && sorted.length > 1) {
      // 切换到下一个窗口
      focusWindow(sorted[1].id)
    } else {
      // 聚焦最上面的窗口
      focusWindow(sorted[0].id)
    }
  }

  function minimizeAll() {
    windows.value.forEach(w => w.isMinimized = true)
  }

  function restoreAll() {
    windows.value.forEach(w => w.isMinimized = false)
  }

  function pinWindow(id: string) {
    const window = windows.value.find(w => w.id === id)
    if (window) {
      window.isPinned = !window.isPinned
      // 如果是置顶窗口，使用更高的zIndex
      if (window.isPinned) {
        window.zIndex = 9999
      } else {
        window.zIndex = ++maxZIndex.value
      }
    }
  }

  function setWindowOpacity(id: string, opacity: number) {
    const window = windows.value.find(w => w.id === id)
    if (window) {
      window.opacity = Math.max(0.1, Math.min(1, opacity))
    }
  }

  function splitWindow(id: string, direction: 'left' | 'right' | 'top' | 'bottom' | 'quarter') {
    const window = windows.value.find(w => w.id === id)
    if (!window) return

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight - 48 // 减去任务栏高度

    // 先取消最大化状态
    if (window.isMaximized) {
      window.isMaximized = false
    }

    switch (direction) {
      case 'left':
        window.x = 0
        window.y = 0
        window.width = screenWidth / 2
        window.height = screenHeight
        break
      case 'right':
        window.x = screenWidth / 2
        window.y = 0
        window.width = screenWidth / 2
        window.height = screenHeight
        break
      case 'top':
        window.x = 0
        window.y = 0
        window.width = screenWidth
        window.height = screenHeight / 2
        break
      case 'bottom':
        window.x = 0
        window.y = screenHeight / 2
        window.width = screenWidth
        window.height = screenHeight / 2
        break
      case 'quarter':
        // 四分屏（默认为左上）
        window.x = 0
        window.y = 0
        window.width = screenWidth / 2
        window.height = screenHeight / 2
        break
    }

    focusWindow(id)
  }

  function getScreenSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight - 48
    }
  }

  // 创建窗口快照
  function createSnapshot(name: string): string {
    const snapshot: WindowSnapshot = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
      windows: windows.value.map(w => ({ ...w }))
    }
    snapshots.value.unshift(snapshot)
    saveSnapshots()
    return snapshot.id
  }

  // 恢复窗口快照
  function restoreSnapshot(snapshotId: string): boolean {
    const snapshot = snapshots.value.find(s => s.id === snapshotId)
    if (!snapshot) return false

    const systemStore = useSystemStore()
    
    // 关闭所有现有窗口
    windows.value = []
    
    // 恢复快照中的窗口
    snapshot.windows.forEach(windowState => {
      const newWindow: Window = { ...windowState }
      // 重新生成ID以避免冲突
      newWindow.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      windows.value.push(newWindow)
    })
    
    // 更新maxZIndex
    if (windows.value.length > 0) {
      maxZIndex.value = Math.max(...windows.value.map(w => w.zIndex))
    }
    
    activeWindowId.value = windows.value.length > 0 ? windows.value[windows.value.length - 1].id : null
    systemStore.addNotification('快照已恢复', `已恢复快照: ${snapshot.name}`)
    return true
  }

  // 删除窗口快照
  function deleteSnapshot(snapshotId: string): boolean {
    const index = snapshots.value.findIndex(s => s.id === snapshotId)
    if (index === -1) return false
    
    snapshots.value.splice(index, 1)
    saveSnapshots()
    return true
  }

  // 获取所有快照
  function getSnapshots(): WindowSnapshot[] {
    return [...snapshots.value]
  }

  // 更新快照名称
  function updateSnapshotName(snapshotId: string, newName: string): boolean {
    const snapshot = snapshots.value.find(s => s.id === snapshotId)
    if (!snapshot) return false
    
    snapshot.name = newName
    saveSnapshots()
    return true
  }

  // 创建应用分组
  function createIconGroup(name: string, x: number, y: number): string {
    const group: IconGroup = {
      id: Date.now().toString(),
      name,
      x,
      y,
      iconIds: [],
      isExpanded: false
    }
    iconGroups.value.push(group)
    saveIconGroups()
    return group.id
  }

  // 删除应用分组
  function deleteIconGroup(groupId: string): boolean {
    const index = iconGroups.value.findIndex(g => g.id === groupId)
    if (index === -1) return false
    
    iconGroups.value.splice(index, 1)
    saveIconGroups()
    return true
  }

  // 添加应用到分组
  function addIconToGroup(groupId: string, iconId: string): boolean {
    const group = iconGroups.value.find(g => g.id === groupId)
    if (!group || group.iconIds.includes(iconId)) return false
    
    group.iconIds.push(iconId)
    saveIconGroups()
    return true
  }

  // 从分组中移除应用
  function removeIconFromGroup(groupId: string, iconId: string): boolean {
    const group = iconGroups.value.find(g => g.id === groupId)
    if (!group) return false
    
    const index = group.iconIds.indexOf(iconId)
    if (index === -1) return false
    
    group.iconIds.splice(index, 1)
    saveIconGroups()
    return true
  }

  // 展开/折叠分组
  function toggleIconGroup(groupId: string): boolean {
    const group = iconGroups.value.find(g => g.id === groupId)
    if (!group) return false
    
    group.isExpanded = !group.isExpanded
    saveIconGroups()
    return true
  }

  // 获取分组中的应用图标
  function getGroupIcons(groupId: string): DesktopIcon[] {
    const group = iconGroups.value.find(g => g.id === groupId)
    if (!group) return []
    
    return group.iconIds
      .map(iconId => desktopIcons.value.find(icon => icon.id === iconId))
      .filter((icon): icon is DesktopIcon => icon !== undefined)
  }

  // 更新分组位置
  function moveIconGroup(groupId: string, x: number, y: number): boolean {
    const group = iconGroups.value.find(g => g.id === groupId)
    if (!group) return false
    
    group.x = x
    group.y = y
    saveIconGroups()
    return true
  }

  // 更新分组名称
  function updateIconGroupName(groupId: string, newName: string): boolean {
    const group = iconGroups.value.find(g => g.id === groupId)
    if (!group) return false
    
    group.name = newName
    saveIconGroups()
    return true
  }

  return {
    windows,
    desktopIcons,
    startMenuOpen,
    activeWindowId,
    isLocked,
    snapshots,
    iconGroups,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    toggleStartMenu,
    closeStartMenu,
    lockScreen,
    unlockScreen,
    getSortedWindows,
    switchWindow,
    minimizeAll,
    restoreAll,
    pinWindow,
    setWindowOpacity,
    splitWindow,
    getScreenSize,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    getSnapshots,
    updateSnapshotName,
    createIconGroup,
    deleteIconGroup,
    addIconToGroup,
    removeIconFromGroup,
    toggleIconGroup,
    getGroupIcons,
    moveIconGroup,
    updateIconGroupName,
  }
})
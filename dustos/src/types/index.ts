/**
 * 类型定义
 */

// 窗口类型
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
  prevX?: number
  prevY?: number
  prevWidth?: number
  prevHeight?: number
}

// 桌面图标类型
export interface DesktopIcon {
  id: string
  name: string
  icon: string
  component: string
  x: number
  y: number
}

// 文件系统类型
export interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size: number
  modified: Date
  icon: string
  content?: string
  path?: string
}

// 通知类型
export interface Notification {
  id: number
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
}

// 进程类型
export interface Process {
  id: string
  name: string
  pid: number
  cpu: number
  memory: number
  status: 'Running' | 'Terminated' | 'Suspended'
  icon: string
}

// 壁纸类型
export interface Wallpaper {
  id: number
  name: string
  light: string
  dark: string
}

// 应用类型
export interface App {
  id: string
  name: string
  icon: string
  component: string
  description?: string
}

// 系统设置类型
export interface SystemSettings {
  isDarkMode: boolean
  volume: number
  battery: number
  wifiConnected: boolean
  wallpaper: number
  systemSoundsEnabled: boolean
  notificationSoundsEnabled: boolean
  powerSavingMode: boolean
  autoBrightness: boolean
}
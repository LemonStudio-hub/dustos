/**
 * 类型定义
 */

// ==================== 窗口系统类型 ====================

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

// DesktopWindow 是 WindowState 的别名，用于避免与全局 Window 接口冲突
export type DesktopWindow = WindowState

export interface WindowSnapshot {
  id: string
  name: string
  createdAt: number
  windows: WindowState[]
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

// ==================== 文件系统类型 ====================

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

export interface SearchResult extends FileItem {
  path: string
}

export interface SearchFilters {
  type?: 'all' | 'file' | 'folder'
  minSize?: number
  maxSize?: number
  startDate?: Date
  endDate?: Date
  extensions?: string[]
}

export type SortBy = 'name' | 'size' | 'date' | 'type' | 'path'
export type SortOrder = 'asc' | 'desc'

// ==================== 剪贴板类型 ====================

export interface ClipboardItem {
  id: string
  content: string
  timestamp: number
  type: 'text' | 'html' | 'image'
  preview: string
}

export interface ClipboardStats {
  total: number
  text: number
  html: number
  image: number
  oldestTimestamp: number
  newestTimestamp: number
}

// ==================== 通知类型 ====================

export interface Notification {
  id: string
  title: string
  message: string
  time: Date
  type?: 'info' | 'success' | 'warning' | 'error'
}

// ==================== 进程类型 ====================

export interface Process {
  id: string
  name: string
  pid: number
  cpu: number
  memory: number
  status: 'Running' | 'Terminated' | 'Suspended'
  icon: string
}

// ==================== 壁纸类型 ====================

export interface Wallpaper {
  id: number
  name: string
  light: string
  dark: string
}

// ==================== 应用类型 ====================

export interface App {
  id: string
  name: string
  icon: string
  component: string
  description?: string
}

export interface AppCategory {
  id: string
  name: string
  icon: string
}

export interface AppReview {
  user: string
  rating: number
  text: string
  date: string
}

export interface AppDetail extends App {
  category: string
  description: string
  rating: number
  downloads: number
  installed: boolean
  features?: string[]
  screenshots?: string[]
  reviews?: AppReview[]
}

// ==================== 系统设置类型 ====================

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

// ==================== 浏览器类型 ====================

export interface Bookmark {
  id: string
  title: string
  url: string
  favicon?: string
  createdAt: number
}

export interface BrowserHistory {
  id: string
  title: string
  url: string
  visitedAt: number
}

// ==================== 终端类型 ====================

export interface TerminalCommand {
  id: string
  command: string
  output: string
  timestamp: number
}

export interface TerminalFile {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  parentId: string
}

// ==================== 搜索类型 ====================

export interface SearchItem {
  id: string
  name: string
  icon: string
  type?: 'app' | 'file' | 'folder' | 'setting'
  component?: string
  path?: string
  description?: string
  category?: string
  x?: number
  y?: number
}

// ==================== 快捷键类型 ====================

export interface Shortcut {
  id: string
  name: string
  description?: string
  keys: string[]
  action?: string
  enabled?: boolean
  icon?: string
  defaultKeys?: string[]
}

export interface ShortcutCategory {
  id: string
  name: string
  shortcuts: Shortcut[]
}

// ==================== 日志类型 ====================

export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug'
  source: string
  message: string
  details?: string
}

// ==================== 任务列表类型 ====================

export interface Task {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  completedAt?: Date
}

// ==================== 网络类型 ====================

export interface NetworkInfo {
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

export interface MemoryInfo {
  jsHeapSizeLimit: number
  totalJSHeapSize: number
  usedJSHeapSize: number
}

// ==================== 系统信息类型 ====================

export interface SystemInfo {
  browser: {
    name: string
    version: string
    userAgent: string
  }
  platform: {
    os: string
    architecture: string
    language: string
  }
  hardware: {
    cores: number
    memory?: MemoryInfo
  }
  network?: NetworkInfo
  screen: {
    width: number
    height: number
    colorDepth: number
    pixelRatio: number
  }
}

// ==================== 组件 Props 类型 ====================

export interface WindowComponentProps {
  window: WindowState
}

export interface AppIconProps {
  icon: string
  name: string
  onClick?: () => void
}

// ==================== Store Actions 类型 ====================

export interface FilesystemActions {
  getCurrentFiles(): FileItem[]
  changePath(path: string): void
  getParentPath(): string
  createFolder(name: string): boolean
  createFile(name: string, content?: string): boolean
  deleteItem(id: string): boolean
  renameItem(id: string, newName: string): boolean
  getFileContent(id: string): string | undefined
  updateFileContent(id: string, content: string): boolean
  toggleSelection(id: string): void
  clearSelection(): void
  getFileIcon(filename: string): string
  formatFileSize(bytes: number): string
  searchFiles(query: string): SearchResult[]
  advancedSearch(query: string, filters?: SearchFilters): SearchResult[]
  sortResults(results: SearchResult[], sortBy?: SortBy, order?: SortOrder): SearchResult[]
  getSearchSuggestions(query: string, limit?: number): string[]
  clearSearchHistory(): void
  highlightMatch(text: string, query: string): string
}

export interface DesktopActions {
  openWindow(icon: DesktopIcon): void
  closeWindow(id: string): void
  minimizeWindow(id: string): void
  maximizeWindow(id: string): void
  focusWindow(id: string): void
  moveWindow(id: string, x: number, y: number): void
  resizeWindow(id: string, width: number, height: number): void
  toggleStartMenu(): void
  closeStartMenu(): void
  lockScreen(): void
  unlockScreen(): void
  getSortedWindows(): WindowState[]
  switchWindow(): void
  minimizeAll(): void
  restoreAll(): void
  pinWindow(id: string): void
  setWindowOpacity(id: string, opacity: number): void
  splitWindow(id: string, direction: 'left' | 'right' | 'top' | 'bottom' | 'quarter'): void
  getScreenSize(): { width: number; height: number }
  createSnapshot(name: string): string
  restoreSnapshot(snapshotId: string): boolean
  deleteSnapshot(snapshotId: string): boolean
  getSnapshots(): WindowSnapshot[]
  updateSnapshotName(snapshotId: string, newName: string): boolean
  createIconGroup(name: string, x: number, y: number): string
  deleteIconGroup(groupId: string): boolean
  addIconToGroup(groupId: string, iconId: string): boolean
  removeIconFromGroup(groupId: string, iconId: string): boolean
  toggleIconGroup(groupId: string): boolean
  getGroupIcons(groupId: string): DesktopIcon[]
  moveIconGroup(groupId: string, x: number, y: number): boolean
  updateIconGroupName(groupId: string, newName: string): boolean
}

export interface SystemActions {
  updateTime(): void
  toggleDarkMode(): void
  setVolume(value: number): void
  fadeVolumeIn(duration?: number): void
  fadeVolumeOut(duration?: number): void
  fadeInFrom(startVolume: number, duration?: number): void
  fadeOutTo(endVolume: number, duration?: number): void
  setVolumeFadeDuration(duration: number): void
  stopVolumeFade(): void
  setBattery(value: number): void
  toggleWifi(): void
  changeWallpaper(index: number): void
  getCurrentWallpaper(): string
  getFormattedTime(): string
  getFormattedDate(): string
  addNotification(title: string, message: string): void
  removeNotification(id: string): void
  clearNotifications(): void
  toggleSound(): void
  playSystemSound(type: string): void
}

export interface ClipboardActions {
  addToHistory(content: string, type?: 'text' | 'html' | 'image'): void
  copyToClipboard(item: ClipboardItem): Promise<boolean>
  deleteItem(id: string): boolean
  clearHistory(): void
  deleteBeforeTimestamp(timestamp: number): void
  searchHistory(query: string): ClipboardItem[]
  filterByTimeRange(startTime: number, endTime: number): ClipboardItem[]
  filterByType(type: 'text' | 'html' | 'image'): ClipboardItem[]
  getRecentItems(count: number): ClipboardItem[]
  getStats(): ClipboardStats
  setEnabled(enabled: boolean): void
  startMonitoring(): (() => void) | undefined
  loadHistory(): void
  saveHistory(): void
}

// ==================== 应用组件类型 ====================

export type AppComponentName =
  | 'FileManager'
  | 'Terminal'
  | 'Settings'
  | 'Browser'
  | 'Notepad'
  | 'Calculator'
  | 'TaskManager'
  | 'ImageViewer'
  | 'MusicPlayer'
  | 'SystemInfo'
  | 'Calendar'
  | 'Weather'
  | 'TaskList'
  | 'VoiceRecorder'
  | 'VideoPlayer'
  | 'CodeEditor'
  | 'Clock'
  | 'Minesweeper'
  | 'SnakeGame'
  | 'LogViewer'
  | 'AppStore'

// ==================== 工具函数类型 ====================

export interface BackupConfig {
  autoBackup: boolean
  backupInterval: number
  maxBackups: number
  backupLocation: string
}

export interface BackupMetadata {
  id: string
  timestamp: number
  size: number
  items: number
  checksum: string
}

// ==================== 音效类型 ====================

export type SoundType =
  | 'windowOpen'
  | 'windowClose'
  | 'windowMinimize'
  | 'windowMaximize'
  | 'click'
  | 'notification'
  | 'error'
  | 'success'
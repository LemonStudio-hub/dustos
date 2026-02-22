/**
 * 系统备份和恢复工具
 */

import type { FileItem, SystemSettings, ShortcutCategory } from '@/types'

export interface BackupData {
  version: string
  timestamp: number
  filesystem: Map<string, FileItem[]> | null
  systemSettings: Partial<SystemSettings>
  shortcuts: ShortcutCategory[] | null
  appData: Record<string, unknown>
}

export class BackupManager {
  private static readonly BACKUP_KEY = 'dustos_backup'
  private static readonly BACKUP_VERSION = '1.0.0'

  /**
   * 创建系统备份
   */
  static async createBackup(): Promise<string> {
    const backupData: BackupData = {
      version: this.BACKUP_VERSION,
      timestamp: Date.now(),
      filesystem: this.getFilesystemData(),
      systemSettings: this.getSystemSettings(),
      shortcuts: this.getShortcuts(),
      appData: this.getAppData()
    }

    // 保存到 localStorage
    localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData))
    
    // 返回备份文件的内容（用于下载）
    return JSON.stringify(backupData, null, 2)
  }

  /**
   * 从备份文件恢复系统
   */
  static async restoreBackup(backupData: BackupData): Promise<boolean> {
    try {
      // 验证备份版本
      if (backupData.version !== this.BACKUP_VERSION) {
        console.warn('备份版本不匹配，可能存在兼容性问题')
      }

      // 恢复文件系统
      if (backupData.filesystem) {
        this.restoreFilesystem(backupData.filesystem)
      }

      // 恢复系统设置
      if (backupData.systemSettings) {
        this.restoreSystemSettings(backupData.systemSettings)
      }

      // 恢复快捷键
      if (backupData.shortcuts) {
        this.restoreShortcuts(backupData.shortcuts)
      }

      // 恢复应用数据
      if (backupData.appData) {
        this.restoreAppData(backupData.appData)
      }

      // 保存恢复后的数据到 localStorage
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData))

      return true
    } catch (error) {
      console.error('恢复备份失败:', error)
      return false
    }
  }

  /**
   * 从 localStorage 加载最近的备份
   */
  static async loadBackup(): Promise<BackupData | null> {
    try {
      const backupStr = localStorage.getItem(this.BACKUP_KEY)
      if (!backupStr) return null

      const backupData = JSON.parse(backupStr) as BackupData
      return backupData
    } catch (error) {
      console.error('加载备份失败:', error)
      return null
    }
  }

  /**
   * 删除备份
   */
  static deleteBackup(): void {
    localStorage.removeItem(this.BACKUP_KEY)
  }

  /**
   * 获取备份信息
   */
  static getBackupInfo(): { exists: boolean; timestamp?: number; version?: string } {
    const backupStr = localStorage.getItem(this.BACKUP_KEY)
    if (!backupStr) {
      return { exists: false }
    }

    try {
      const backupData = JSON.parse(backupStr) as BackupData
      return {
        exists: true,
        timestamp: backupData.timestamp,
        version: backupData.version
      }
    } catch (error) {
      return { exists: false }
    }
  }

  /**
   * 下载备份文件
   */
  static downloadBackup(): void {
    const backupInfo = this.getBackupInfo()
    if (!backupInfo.exists) {
      throw new Error('没有可用的备份')
    }

    const backupStr = localStorage.getItem(this.BACKUP_KEY)
    if (!backupStr) {
      throw new Error('备份数据不可用')
    }

    const blob = new Blob([backupStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dustos-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * 从文件导入备份
   */
  static async importBackup(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          const backupData = JSON.parse(content) as BackupData
          const success = await this.restoreBackup(backupData)
          resolve(success)
        } catch (error) {
          console.error('导入备份失败:', error)
          resolve(false)
        }
      }
      reader.onerror = () => resolve(false)
      reader.readAsText(file)
    })
  }

  /**
   * 获取文件系统数据
   */
  private static getFilesystemData(): Map<string, FileItem[]> | null {
    // 从 filesystem store 获取数据
    const filesystemData = localStorage.getItem('filesystem')
    if (!filesystemData) return null
    try {
      return new Map(JSON.parse(filesystemData))
    } catch {
      return null
    }
  }

  /**
   * 获取系统设置
   */
  private static getSystemSettings(): Partial<SystemSettings> {
    const darkModeStr = localStorage.getItem('dustos_darkMode')
    const volumeStr = localStorage.getItem('dustos_volume')
    const wifiStr = localStorage.getItem('dustos_wifi')
    const wallpaperStr = localStorage.getItem('dustos_wallpaper')
    const soundEnabledStr = localStorage.getItem('dustos_soundEnabled')

    const settings: Partial<SystemSettings> = {}
    if (darkModeStr !== null) {
      settings.isDarkMode = darkModeStr === 'true'
    }
    if (volumeStr !== null) {
      settings.volume = parseInt(volumeStr, 10)
    }
    if (wifiStr !== null) {
      settings.wifiConnected = wifiStr === 'true'
    }
    if (wallpaperStr !== null) {
      settings.wallpaper = parseInt(wallpaperStr, 10)
    }
    if (soundEnabledStr !== null) {
      settings.systemSoundsEnabled = soundEnabledStr === 'true'
    }
    return settings
  }

  /**
   * 获取快捷键配置
   */
  private static getShortcuts(): ShortcutCategory[] | null {
    const shortcutsStr = localStorage.getItem('dustos_shortcuts')
    if (!shortcutsStr) return null
    try {
      return JSON.parse(shortcutsStr) as ShortcutCategory[]
    } catch {
      return null
    }
  }

  /**
   * 获取应用数据
   */
  private static getAppData(): Record<string, unknown> {
    const appData: Record<string, unknown> = {}
    const notepad = localStorage.getItem('notepad_content')
    if (notepad !== null) appData.notepad = notepad
    const notepadFilename = localStorage.getItem('notepad_filename')
    if (notepadFilename !== null) appData.notepadFilename = notepadFilename
    const calendarEvents = localStorage.getItem('calendar-events')
    if (calendarEvents !== null) appData.calendarEvents = calendarEvents
    const bookmarks = localStorage.getItem('browser-bookmarks')
    if (bookmarks !== null) appData.bookmarks = bookmarks
    const recentApps = localStorage.getItem('recent-apps')
    if (recentApps !== null) appData.recentApps = recentApps
    return appData
  }

  /**
   * 恢复文件系统
   */
  private static restoreFilesystem(filesystemData: Map<string, FileItem[]>): void {
    if (filesystemData) {
      localStorage.setItem('filesystem', JSON.stringify([...filesystemData]))
    }
  }

  /**
   * 恢复系统设置
   */
  private static restoreSystemSettings(settings: Partial<SystemSettings>): void {
    if (settings.isDarkMode !== undefined) {
      localStorage.setItem('dustos_darkMode', settings.isDarkMode.toString())
    }
    if (settings.volume !== undefined) {
      localStorage.setItem('dustos_volume', settings.volume.toString())
    }
    if (settings.wifiConnected !== undefined) {
      localStorage.setItem('dustos_wifi', settings.wifiConnected.toString())
    }
    if (settings.wallpaper !== undefined) {
      localStorage.setItem('dustos_wallpaper', settings.wallpaper.toString())
    }
    if (settings.systemSoundsEnabled !== undefined) {
      localStorage.setItem('dustos_soundEnabled', settings.systemSoundsEnabled.toString())
    }
  }

  /**
   * 恢复快捷键
   */
  private static restoreShortcuts(shortcuts: ShortcutCategory[]): void {
    localStorage.setItem('dustos_shortcuts', JSON.stringify(shortcuts))
  }

  /**
   * 恢复应用数据
   */
  private static restoreAppData(appData: Record<string, unknown>): void {
    if (appData.notepad !== undefined && typeof appData.notepad === 'string') {
      localStorage.setItem('notepad_content', appData.notepad)
    }
    if (appData.notepadFilename !== undefined && typeof appData.notepadFilename === 'string') {
      localStorage.setItem('notepad_filename', appData.notepadFilename)
    }
    if (appData.calendarEvents !== undefined && typeof appData.calendarEvents === 'string') {
      localStorage.setItem('calendar-events', appData.calendarEvents)
    }
    if (appData.bookmarks !== undefined && typeof appData.bookmarks === 'string') {
      localStorage.setItem('browser-bookmarks', appData.bookmarks)
    }
    if (appData.recentApps !== undefined && typeof appData.recentApps === 'string') {
      localStorage.setItem('recent-apps', appData.recentApps)
    }
  }
}

export default BackupManager
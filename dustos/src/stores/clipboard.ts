import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { ClipboardItem } from '@/types'

export const useClipboardStore = defineStore('clipboard', () => {
  const history = ref<ClipboardItem[]>([])
  const maxHistorySize = 50
  const isEnabled = ref(true)
  let lastContent = ''

  // 从localStorage加载历史记录
  function loadHistory() {
    const saved = localStorage.getItem('dustos_clipboardHistory')
    if (saved) {
      try {
        const loaded = JSON.parse(saved) as ClipboardItem[]
        history.value = loaded.map((item: ClipboardItem) => ({
          ...item,
          timestamp: new Date(item.timestamp).getTime()
        }))
      } catch (e) {
        console.error('Failed to load clipboard history:', e)
      }
    }
  }

  // 保存历史记录到localStorage
  function saveHistory() {
    try {
      localStorage.setItem('dustos_clipboardHistory', JSON.stringify(history.value))
    } catch (e) {
      console.error('Failed to save clipboard history:', e)
    }
  }

  // 添加剪贴板内容到历史
  function addToHistory(content: string, type: 'text' | 'html' | 'image' = 'text') {
    if (!isEnabled.value) return
    if (!content || content.trim() === '') return
    if (content === lastContent) return

    const preview = generatePreview(content, type)

    const item: ClipboardItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content,
      timestamp: Date.now(),
      type,
      preview
    }

    history.value.unshift(item)
    lastContent = content

    // 限制历史记录大小
    if (history.value.length > maxHistorySize) {
      history.value = history.value.slice(0, maxHistorySize)
    }

    saveHistory()
  }

  // 生成预览文本
  function generatePreview(content: string, type: string): string {
    if (type === 'image') {
      return '📷 图片'
    }

    // 移除HTML标签
    let text = content.replace(/<[^>]*>/g, '')
    
    // 限制预览长度
    const maxLength = 100
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...'
    }
    
    return text
  }

  // 复制历史项到剪贴板
  async function copyToClipboard(item: ClipboardItem): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(item.content)
      lastContent = item.content
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  // 删除历史项
  function deleteItem(id: string): boolean {
    const index = history.value.findIndex(item => item.id === id)
    if (index === -1) return false

    history.value.splice(index, 1)
    saveHistory()
    return true
  }

  // 清空历史记录
  function clearHistory(): void {
    history.value = []
    lastContent = ''
    saveHistory()
  }

  // 删除指定时间之前的记录
  function deleteBeforeTimestamp(timestamp: number): void {
    history.value = history.value.filter(item => item.timestamp > timestamp)
    saveHistory()
  }

  // 搜索历史记录
  function searchHistory(query: string): ClipboardItem[] {
    if (!query.trim()) return history.value

    const queryLower = query.toLowerCase()
    return history.value.filter(item => 
      item.content.toLowerCase().includes(queryLower) ||
      item.preview.toLowerCase().includes(queryLower)
    )
  }

  // 按时间范围筛选
  function filterByTimeRange(startTime: number, endTime: number): ClipboardItem[] {
    return history.value.filter(item => 
      item.timestamp >= startTime && item.timestamp <= endTime
    )
  }

  // 按类型筛选
  function filterByType(type: 'text' | 'html' | 'image'): ClipboardItem[] {
    return history.value.filter(item => item.type === type)
  }

  // 获取最近N条记录
  function getRecentItems(count: number): ClipboardItem[] {
    return history.value.slice(0, count)
  }

  // 获取统计信息
  function getStats() {
    const stats = {
      total: history.value.length,
      text: 0,
      html: 0,
      image: 0,
      oldestTimestamp: 0,
      newestTimestamp: 0
    }

    if (history.value.length > 0) {
      const oldestItem = history.value[history.value.length - 1]
      const newestItem = history.value[0]
      if (oldestItem) {
        stats.oldestTimestamp = oldestItem.timestamp
      }
      if (newestItem) {
        stats.newestTimestamp = newestItem.timestamp
      }
    }

    for (const item of history.value) {
      switch (item.type) {
        case 'text':
          stats.text++
          break
        case 'html':
          stats.html++
          break
        case 'image':
          stats.image++
          break
      }
    }

    return stats
  }

  // 启用/禁用剪贴板历史
  function setEnabled(enabled: boolean) {
    isEnabled.value = enabled
  }

  // 监听剪贴板变化
  function startMonitoring() {
    if (!isEnabled.value) return

    // 定期检查剪贴板
    const checkInterval = 1000 // 每秒检查一次

    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText()
        if (text && text !== lastContent) {
          addToHistory(text)
        }
      } catch (error) {
        // 可能是权限问题，忽略
      }
    }

    // 初始检查
    checkClipboard()

    // 定期检查
    const intervalId = window.setInterval(checkClipboard, checkInterval)

    // 返回清理函数
    return () => {
      clearInterval(intervalId)
    }
  }

  // 初始化
  loadHistory()

  return {
    history,
    isEnabled,
    maxHistorySize,
    addToHistory,
    copyToClipboard,
    deleteItem,
    clearHistory,
    deleteBeforeTimestamp,
    searchHistory,
    filterByTimeRange,
    filterByType,
    getRecentItems,
    getStats,
    setEnabled,
    startMonitoring,
    loadHistory,
    saveHistory
  }
})
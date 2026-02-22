/**
 * 使用复制到剪贴板 Hook
 */

import { ref } from 'vue'

export function useClipboard() {
  const isSupported = ref(false)
  const text = ref('')
  const copied = ref(false)
  let timeoutId: number | null = null

  // 检查浏览器支持
  if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
    isSupported.value = true
  }

  const copy = async (value: string): Promise<boolean> => {
    if (!isSupported.value) return false

    try {
      await navigator.clipboard.writeText(value)
      text.value = value
      copied.value = true
      
      // 2秒后重置状态
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
      timeoutId = window.setTimeout(() => {
        copied.value = false
      }, 2000)
      
      return true
    } catch (error) {
      console.error('Failed to copy:', error)
      return false
    }
  }

  const paste = async (): Promise<string | null> => {
    if (!isSupported.value) return null

    try {
      const value = await navigator.clipboard.readText()
      text.value = value
      return value
    } catch (error) {
      console.error('Failed to paste:', error)
      return null
    }
  }

  return {
    isSupported,
    text,
    copied,
    copy,
    paste,
  }
}
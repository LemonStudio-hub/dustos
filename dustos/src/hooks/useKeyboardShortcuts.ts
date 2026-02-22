/**
 * 使用键盘快捷键 Hook
 */

import { onMounted, onUnmounted } from 'vue'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  handler: (e: KeyboardEvent) => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = (e: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = !shortcut.ctrl || e.ctrlKey
      const shiftMatch = !shortcut.shift || e.shiftKey
      const altMatch = !shortcut.alt || e.altKey
      const metaMatch = !shortcut.meta || e.metaKey

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        e.preventDefault()
        shortcut.handler(e)
        return
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}
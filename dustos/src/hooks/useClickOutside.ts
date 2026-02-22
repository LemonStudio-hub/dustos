/**
 * 使用点击外部 Hook
 */

import { onMounted, onUnmounted, Ref } from 'vue'

export function useClickOutside(
  elementRef: Ref<HTMLElement | null>,
  callback: (e: MouseEvent) => void
) {
  const handleClick = (e: MouseEvent) => {
    if (elementRef.value && !elementRef.value.contains(e.target as Node)) {
      callback(e)
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClick)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClick)
  })
}
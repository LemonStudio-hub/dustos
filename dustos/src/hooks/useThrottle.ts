/**
 * 使用节流 Hook
 */

import { ref, onUnmounted } from 'vue'

export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  let timeoutId: number | null = null

  const throttledFn = (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastTime >= delay) {
      lastTime = now
      fn(...args)
    } else {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = window.setTimeout(() => {
        lastTime = Date.now()
        fn(...args)
      }, delay - (now - lastTime))
    }
  }

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  onUnmounted(() => {
    cancel()
  })

  return throttledFn
}
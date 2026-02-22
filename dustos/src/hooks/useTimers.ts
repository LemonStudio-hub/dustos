/**
 * 使用定时器 Hook
 */

import { ref, onMounted, onUnmounted } from 'vue'

export function useInterval(callback: () => void, delay: number | null) {
  const intervalId = ref<number | null>(null)

  const start = () => {
    if (delay !== null && intervalId.value === null) {
      intervalId.value = window.setInterval(callback, delay)
    }
  }

  const stop = () => {
    if (intervalId.value !== null) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
  }

  onMounted(() => {
    if (delay !== null) {
      start()
    }
  })

  onUnmounted(() => {
    stop()
  })

  return {
    start,
    stop,
  }
}

export function useTimeout(callback: () => void, delay: number) {
  const timeoutId = ref<number | null>(null)

  const start = () => {
    if (timeoutId.value === null) {
      timeoutId.value = window.setTimeout(() => {
        callback()
        timeoutId.value = null
      }, delay)
    }
  }

  const clear = () => {
    if (timeoutId.value !== null) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }
  }

  onUnmounted(() => {
    clear()
  })

  return {
    start,
    clear,
  }
}
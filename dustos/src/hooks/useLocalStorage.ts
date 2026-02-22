/**
 * 使用本地存储 Hook
 */

import { ref, watch, onUnmounted } from 'vue'
import { saveToStorage, loadFromStorage, isStorageAvailable } from '@/utils/storage'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const value = ref<T>(loadFromStorage(key, defaultValue))
  const available = isStorageAvailable()

  const setValue = (newValue: T) => {
    value.value = newValue
  }

  const clearValue = () => {
    value.value = defaultValue
  }

  if (available) {
    watch(value, (newValue) => {
      saveToStorage(key, newValue)
    })
  }

  return {
    value,
    setValue,
    clearValue,
    available,
  }
}
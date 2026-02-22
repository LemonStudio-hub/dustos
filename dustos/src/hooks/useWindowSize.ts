/**
 * 使用窗口大小 Hook
 */

import { ref, onMounted, onUnmounted } from 'vue'

export function useWindowSize() {
  const width = ref(0)
  const height = ref(0)

  const update = () => {
    if (typeof window !== 'undefined') {
      width.value = window.innerWidth
      height.value = window.innerHeight
    }
  }

  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)

  const updateBreakpoints = () => {
    if (typeof window !== 'undefined') {
      isMobile.value = window.innerWidth < 768
      isTablet.value = window.innerWidth >= 768 && window.innerWidth < 1024
      isDesktop.value = window.innerWidth >= 1024
    }
  }

  onMounted(() => {
    update()
    updateBreakpoints()
    
    window.addEventListener('resize', update)
    window.addEventListener('resize', updateBreakpoints)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
    window.removeEventListener('resize', updateBreakpoints)
  })

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
  }
}
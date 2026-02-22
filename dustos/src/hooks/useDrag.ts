/**
 * 使用拖拽 Hook
 */

import { ref, onMounted, onUnmounted } from 'vue'

export interface DragOptions {
  onDragStart?: (e: MouseEvent) => void
  onDrag?: (e: MouseEvent, dx: number, dy: number) => void
  onDragEnd?: () => void
  disabled?: boolean
}

export function useDrag(options: DragOptions = {}) {
  const isDragging = ref(false)
  const startX = ref(0)
  const startY = ref(0)

  const handleMouseDown = (e: MouseEvent) => {
    if (options.disabled) return
    
    isDragging.value = true
    startX.value = e.clientX
    startY.value = e.clientY
    
    options.onDragStart?.(e)
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return
    
    const dx = e.clientX - startX.value
    const dy = e.clientY - startY.value
    
    options.onDrag?.(e, dx, dy)
  }

  const handleMouseUp = () => {
    isDragging.value = false
    options.onDragEnd?.()
    
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })

  return {
    isDragging,
    handleMouseDown,
  }
}
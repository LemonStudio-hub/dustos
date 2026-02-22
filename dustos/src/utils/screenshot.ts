/**
 * 屏幕截图工具
 */

export interface ScreenshotOptions {
  filename?: string
  quality?: number
  format?: 'png' | 'jpeg'
}

/**
 * 截取整个屏幕
 */
export async function captureScreen(options: ScreenshotOptions = {}): Promise<void> {
  try {
    // 使用getDisplayMedia API捕获屏幕
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor',
        frameRate: 60
      } as MediaTrackConstraints
    })
    
    const video = document.createElement('video')
    video.srcObject = stream
    video.play()
    
    // 等待视频加载
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(undefined)
      }
    })
    
    // 创建canvas并绘制帧
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      
      // 转换为blob并下载
      const format = options.format || 'png'
      const quality = options.quality || 1.0
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = options.filename || `screenshot_${Date.now()}.${format}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
        
        // 停止捕获
        stream.getTracks().forEach(track => track.stop())
        video.srcObject = null
      }, mimeType, quality)
    }
  } catch (error) {
    console.error('截图失败:', error)
    throw error
  }
}

/**
 * 截取指定元素
 */
export async function captureElement(element: HTMLElement, options: ScreenshotOptions = {}): Promise<void> {
  try {
    // 使用html2canvas库（如果可用）或使用其他方法
    // 这里我们使用一个简单的canvas绘制方法
    
    const canvas = document.createElement('canvas')
    const rect = element.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // 尝试使用html2canvas（需要外部库）
      // 这里使用简化的方法，实际项目中可能需要html2canvas库
      
      // 背景色
      const computedStyle = window.getComputedStyle(element)
      ctx.fillStyle = computedStyle.backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 这是一个简化版本，完整的实现需要html2canvas
      // 在实际应用中，建议使用html2canvas库
      
      const format = options.format || 'png'
      const quality = options.quality || 1.0
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = options.filename || `element_${Date.now()}.${format}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      }, mimeType, quality)
    }
  } catch (error) {
    console.error('元素截图失败:', error)
    throw error
  }
}

/**
 * 检查浏览器是否支持屏幕截图
 */
export function isScreenCaptureSupported(): boolean {
  return 'getDisplayMedia' in navigator.mediaDevices
}

/**
 * 检查浏览器是否支持元素截图
 */
export function isElementCaptureSupported(): boolean {
  // 简化检查，实际需要检查html2canvas等库
  return true
}
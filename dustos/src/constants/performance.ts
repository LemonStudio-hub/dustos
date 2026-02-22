/**
 * 性能优化配置
 */

export const PERFORMANCE_CONFIG = {
  // 虚拟滚动配置
  virtualScroll: {
    itemSize: 50,
    bufferSize: 10,
    overscan: 5,
  },

  // 防抖配置
  debounce: {
    search: 300,
    resize: 200,
    scroll: 100,
  },

  // 节流配置
  throttle: {
    scroll: 100,
    resize: 200,
    mouseMove: 50,
  },

  // 懒加载配置
  lazyLoad: {
    imageThreshold: 100,
    componentThreshold: 100,
  },

  // 缓存配置
  cache: {
    maxSize: 100,
    ttl: 5 * 60 * 1000, // 5分钟
  },

  // 动画配置
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
  },

  // 渲染配置
  rendering: {
    maxFPS: 60,
    minFPS: 30,
    frameBudget: 16.67, // ms
  },
} as const

/**
 * 性能监控配置
 */
export const PERFORMANCE_MONITOR_CONFIG = {
  enabled: true,
  sampleInterval: 1000, // ms
  reportThreshold: 50, // ms
  memoryWarningThreshold: 100 * 1024 * 1024, // 100MB
} as const

/**
 * 资源优化配置
 */
export const RESOURCE_OPTIMIZATION_CONFIG = {
  // 图片优化
  images: {
    lazy: true,
    placeholder: true,
    quality: 80,
    format: 'webp',
  },

  // 字体优化
  fonts: {
    preload: true,
    subset: true,
    display: 'swap',
  },

  // 代码分割
  codeSplitting: {
    enabled: true,
    chunks: true,
    prefetch: true,
  },
} as const
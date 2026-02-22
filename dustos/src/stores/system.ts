import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { WALLPAPERS } from '@/constants'
import { playSound, setSoundEnabled as setSoundManagerEnabled, setSoundVolume as setSoundManagerVolume } from '@/utils/sound'

interface Notification {
  id: string
  title: string
  message: string
  time: Date
}

export const useSystemStore = defineStore('system', () => {
  // 从 localStorage 加载设置
  const savedDarkMode = localStorage.getItem('dustos_darkMode')
  const savedVolume = localStorage.getItem('dustos_volume')
  const savedWifi = localStorage.getItem('dustos_wifi')
  const savedWallpaper = localStorage.getItem('dustos_wallpaper')
  const savedSoundEnabled = localStorage.getItem('dustos_soundEnabled')
  
  const currentTime = ref(new Date())
  const isDarkMode = ref(savedDarkMode ? savedDarkMode === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches)
  const volume = ref(savedVolume ? parseInt(savedVolume) : 50)
  const targetVolume = ref(volume.value)
  const battery = ref(85)
  const wifiConnected = ref(savedWifi ? savedWifi === 'true' : true)
  const wallpaper = ref(savedWallpaper ? parseInt(savedWallpaper) : 0)
  const soundEnabled = ref(savedSoundEnabled ? savedSoundEnabled === 'true' : true)
  const notifications = ref<Notification[]>([])
  const wallpapers = WALLPAPERS
  
  let volumeFadeInterval: number | null = null
  let volumeFadeDuration = 300 // 渐变持续时间（毫秒）
  let volumeFadeSteps = 10 // 渐变步数

  // 监听设置变化并保存
  watch(isDarkMode, (value) => {
    localStorage.setItem('dustos_darkMode', String(value))
  })

  watch(volume, (value) => {
    localStorage.setItem('dustos_volume', String(value))
  })

  watch(wifiConnected, (value) => {
    localStorage.setItem('dustos_wifi', String(value))
  })

  watch(wallpaper, (value) => {
    localStorage.setItem('dustos_wallpaper', String(value))
  })

  watch(soundEnabled, (value) => {
    localStorage.setItem('dustos_soundEnabled', String(value))
    setSoundManagerEnabled(value)
  })

  function updateTime() {
    currentTime.value = new Date()
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
  }

  function setVolume(value: number) {
    const clampedValue = Math.max(0, Math.min(100, value))
    targetVolume.value = clampedValue
    startVolumeFade(clampedValue)
  }
  
  function startVolumeFade(target: number) {
    // 清除之前的渐变
    if (volumeFadeInterval !== null) {
      clearInterval(volumeFadeInterval)
    }
    
    const startVolume = volume.value
    const difference = target - startVolume
    
    if (difference === 0) return
    
    const stepSize = difference / volumeFadeSteps
    const stepDelay = volumeFadeDuration / volumeFadeSteps
    let currentStep = 0
    
    volumeFadeInterval = window.setInterval(() => {
      currentStep++
      volume.value = Math.round(startVolume + stepSize * currentStep)
      
      if (currentStep >= volumeFadeSteps) {
        volume.value = target
        if (volumeFadeInterval !== null) {
          clearInterval(volumeFadeInterval)
          volumeFadeInterval = null
        }
      }
    }, stepDelay)
  }
  
  function fadeVolumeIn(duration?: number) {
    if (duration !== undefined) {
      volumeFadeDuration = duration
    }
    setVolume(100)
  }
  
  function fadeVolumeOut(duration?: number) {
    if (duration !== undefined) {
      volumeFadeDuration = duration
    }
    setVolume(0)
  }
  
  function fadeInFrom(startVolume: number, duration?: number) {
    if (duration !== undefined) {
      volumeFadeDuration = duration
    }
    volume.value = startVolume
    setVolume(100)
  }
  
  function fadeOutTo(endVolume: number, duration?: number) {
    if (duration !== undefined) {
      volumeFadeDuration = duration
    }
    setVolume(endVolume)
  }
  
  function setVolumeFadeDuration(duration: number) {
    volumeFadeDuration = Math.max(50, Math.min(2000, duration))
  }
  
  function stopVolumeFade() {
    if (volumeFadeInterval !== null) {
      clearInterval(volumeFadeInterval)
      volumeFadeInterval = null
    }
    targetVolume.value = volume.value
  }
  function setBattery(value: number) {
    battery.value = Math.max(0, Math.min(100, value))
  }

  function toggleWifi() {
    wifiConnected.value = !wifiConnected.value
  }

  function changeWallpaper(index: number) {
    if (index >= 0 && index < wallpapers.length) {
      wallpaper.value = index
    }
  }

  function getCurrentWallpaper() {
    const wp = wallpapers[wallpaper.value]
    return isDarkMode.value ? wp.dark : wp.light
  }

  function getFormattedTime(): string {
    return currentTime.value.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getFormattedDate(): string {
    return currentTime.value.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  function addNotification(title: string, message: string) {
    const id = Date.now().toString()
    notifications.value.push({ id, title, message, time: new Date() })
    
    // 5秒后自动移除
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clearNotifications() {
    notifications.value = []
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
  }

  function playSystemSound(type: string) {
    if (soundEnabled.value) {
      playSound(type as any)
    }
  }

  return {
    currentTime,
    isDarkMode,
    volume,
    targetVolume,
    battery,
    wifiConnected,
    wallpaper,
    wallpapers,
    soundEnabled,
    notifications,
    updateTime,
    toggleDarkMode,
    setVolume,
    fadeVolumeIn,
    fadeVolumeOut,
    fadeInFrom,
    fadeOutTo,
    setVolumeFadeDuration,
    stopVolumeFade,
    setBattery,
    toggleWifi,
    changeWallpaper,
    toggleSound,
    playSystemSound,
    getCurrentWallpaper,
    getFormattedTime,
    getFormattedDate,
    addNotification,
    removeNotification,
    clearNotifications,
  }
})
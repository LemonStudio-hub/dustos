/**
 * 系统音效管理工具
 */

export type SoundType = 
  | 'windowOpen'
  | 'windowClose'
  | 'windowMinimize'
  | 'windowMaximize'
  | 'click'
  | 'notification'
  | 'error'
  | 'success'

// 使用Web Audio API生成简单音效
class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true
  private volume: number = 0.3

  constructor() {
    this.init()
  }

  private init() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API 不支持:', e)
      this.enabled = false
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  playSound(type: SoundType) {
    if (!this.enabled || !this.audioContext) return

    // 恢复AudioContext（某些浏览器需要用户交互后才能播放声音）
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    const now = this.audioContext.currentTime

    switch (type) {
      case 'windowOpen':
        this.playWindowOpenSound(oscillator, gainNode, now)
        break
      case 'windowClose':
        this.playWindowCloseSound(oscillator, gainNode, now)
        break
      case 'windowMinimize':
        this.playWindowMinimizeSound(oscillator, gainNode, now)
        break
      case 'windowMaximize':
        this.playWindowMaximizeSound(oscillator, gainNode, now)
        break
      case 'click':
        this.playClickSound(oscillator, gainNode, now)
        break
      case 'notification':
        this.playNotificationSound(oscillator, gainNode, now)
        break
      case 'error':
        this.playErrorSound(oscillator, gainNode, now)
        break
      case 'success':
        this.playSuccessSound(oscillator, gainNode, now)
        break
    }

    oscillator.start(now)
    oscillator.stop(now + 0.2)
  }

  private playWindowOpenSound(oscillator: OscillatorNode, gainNode: GainNode, now: number) {
    oscillator.frequency.setValueAtTime(440, now)
    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.05)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.15)
  }

  private playWindowCloseSound(oscillator: OscillatorNode, gainNode: GainNode, now: number) {
    oscillator.frequency.setValueAtTime(880, now)
    oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.1)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.05)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.15)
  }

  private playWindowMinimizeSound(oscillator: OscillatorNode, gainNode: GainNode, now: number) {
    oscillator.frequency.setValueAtTime(880, now)
    oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.1)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.25, now + 0.03)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.12)
  }

  private playWindowMaximizeSound(oscillator: OscillatorNode, gainNode: GainNode, now: number) {
    oscillator.frequency.setValueAtTime(220, now)
    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.25, now + 0.03)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.12)
  }

  private playClickSound(oscillator: OscillatorNode, gainNode: GainNode, now: number) {
    oscillator.frequency.setValueAtTime(800, now)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.05)
  }

  private playNotificationSound(oscillator: OscillatorNode, gainNode: GainNode, now: number) {
    oscillator.frequency.setValueAtTime(523.25, now) // C5
    oscillator.frequency.setValueAtTime(659.25, now + 0.1) // E5
    oscillator.frequency.setValueAtTime(783.99, now + 0.2) // G5
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.05)
    gainNode.gain.setValueAtTime(this.volume * 0.3, now + 0.2)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.3)
  }

  private playErrorSound(oscillator: OscillatorNode, gainNode: GainNode, now: number) {
    oscillator.frequency.setValueAtTime(200, now)
    oscillator.frequency.setValueAtTime(150, now + 0.1)
    oscillator.type = 'sawtooth'
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.05)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.15)
  }

  private playSuccessSound(oscillator: OscillatorNode, gainNode: GainNode, now: number) {
    oscillator.frequency.setValueAtTime(523.25, now)
    oscillator.frequency.setValueAtTime(659.25, now + 0.08)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.05)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.18)
  }
}

// 创建全局单例
export const soundManager = new SoundManager()

// 便捷函数
export function playSound(type: SoundType) {
  soundManager.playSound(type)
}

export function setSoundEnabled(enabled: boolean) {
  soundManager.setEnabled(enabled)
}

export function setSoundVolume(volume: number) {
  soundManager.setVolume(volume)
}
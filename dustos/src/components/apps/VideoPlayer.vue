<template>
  <div class="video-player">
    <div class="player-header">
      <h2>视频播放器</h2>
      <div class="header-actions">
        <button class="action-btn" @click="openFile" title="打开文件">
          📂
        </button>
        <button class="action-btn" @click="toggleFullscreen" title="全屏">
          ⛶
        </button>
      </div>
    </div>

    <div class="player-content">
      <!-- 视频容器 -->
      <div class="video-container" ref="videoContainer">
        <video
          ref="videoRef"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
          @ended="onEnded"
          @play="onPlay"
          @pause="onPause"
          @click="togglePlay"
        ></video>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-overlay">
          <div class="spinner"></div>
          <div class="loading-text">加载中...</div>
        </div>

        <!-- 播放按钮覆盖层 -->
        <div v-if="!isPlaying && !loading" class="play-overlay" @click="togglePlay">
          <div class="play-button">▶️</div>
        </div>

        <!-- 控制栏 -->
        <div class="controls" @click.stop>
          <!-- 进度条 -->
          <div class="progress-bar" @click="seek">
            <div class="progress-buffered" :style="{ width: bufferedProgress + '%' }"></div>
            <div class="progress-current" :style="{ width: progress + '%' }"></div>
            <div class="progress-thumb" :style="{ left: progress + '%' }"></div>
          </div>

          <!-- 控制按钮 -->
          <div class="control-buttons">
            <button class="control-btn" @click="seekBackward" title="后退10秒">
              ⏪
            </button>
            <button class="control-btn play-btn" @click="togglePlay" title="播放/暂停">
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            <button class="control-btn" @click="seekForward" title="前进10秒">
              ⏩
            </button>
            <button class="control-btn" @click="stop" title="停止">
              ⏹️
            </button>

            <!-- 音量控制 -->
            <div class="volume-control">
              <button class="control-btn volume-btn" @click="toggleMute" title="静音">
                {{ isMuted ? '🔇' : '🔊' }}
              </button>
              <input
                type="range"
                class="volume-slider"
                v-model="volume"
                min="0"
                max="1"
                step="0.1"
                @input="onVolumeChange"
              />
            </div>

            <!-- 播放速度 -->
            <div class="speed-control">
              <button class="control-btn speed-btn" @click="cycleSpeed" title="播放速度">
                {{ playbackRate }}x
              </button>
            </div>

            <!-- 时间显示 -->
            <div class="time-display">
              <span class="current-time">{{ formatTime(currentTime) }}</span>
              <span class="time-separator">/</span>
              <span class="total-time">{{ formatTime(duration) }}</span>
            </div>

            <!-- 画中画 -->
            <button
              v-if="supportsPiP"
              class="control-btn"
              @click="togglePiP"
              title="画中画"
            >
              📺
            </button>
          </div>
        </div>
      </div>

      <!-- 播放列表 -->
      <div class="playlist" v-if="playlist.length > 0">
        <div class="playlist-header">
          <h3>播放列表 ({{ playlist.length }})</h3>
          <button class="clear-btn" @click="clearPlaylist" v-if="playlist.length > 0">
            🗑️
          </button>
        </div>
        <div class="playlist-items">
          <div
            v-for="(item, index) in playlist"
            :key="index"
            class="playlist-item"
            :class="{ playing: currentVideoIndex === index }"
            @click="playVideo(index)"
          >
            <div class="item-icon">🎬</div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-duration">{{ item.duration || '未知' }}</div>
            </div>
            <button class="remove-btn" @click.stop="removeFromPlaylist(index)">
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🎥</div>
        <div class="empty-text">暂无视频</div>
        <div class="empty-hint">点击打开文件按钮选择视频文件</div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      type="file"
      ref="fileInput"
      accept="video/*"
      multiple
      @change="onFileSelected"
      style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface PlaylistItem {
  name: string
  url: string
  duration?: string
}

const videoRef = ref<HTMLVideoElement | null>(null)
const videoContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const isPlaying = ref(false)
const loading = ref(false)
const isMuted = ref(false)
const volume = ref(1)
const currentTime = ref(0)
const duration = ref(0)
const bufferedProgress = ref(0)
const playbackRate = ref(1)
const currentVideoIndex = ref(-1)
const playlist = ref<PlaylistItem[]>([])
const isPiPActive = ref(false)

const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const supportsPiP = computed(() => {
  return document.pictureInPictureEnabled && !videoRef.value?.disablePictureInPicture
})

function openFile() {
  fileInput.value?.click()
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  Array.from(files).forEach(file => {
    const url = URL.createObjectURL(file)
    playlist.value.push({
      name: file.name,
      url,
    })
  })

  if (currentVideoIndex.value === -1 && playlist.value.length > 0) {
    playVideo(0)
  }

  // 清空input以允许选择相同文件
  target.value = ''
}

function playVideo(index: number) {
  const item = playlist.value[index]
  if (!item || !videoRef.value) return

  currentVideoIndex.value = index
  videoRef.value.src = item.url
  videoRef.value.play().catch(console.error)
}

function togglePlay() {
  if (!videoRef.value) return

  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play().catch(console.error)
  }
}

function stop() {
  if (!videoRef.value) return
  videoRef.value.pause()
  videoRef.value.currentTime = 0
}

function seek(event: MouseEvent) {
  if (!videoRef.value) return

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const percentage = x / rect.width
  videoRef.value.currentTime = percentage * duration.value
}

function seekForward() {
  if (!videoRef.value) return
  videoRef.value.currentTime = Math.min(duration.value, currentTime.value + 10)
}

function seekBackward() {
  if (!videoRef.value) return
  videoRef.value.currentTime = Math.max(0, currentTime.value - 10)
}

function onVolumeChange() {
  if (!videoRef.value) return
  videoRef.value.volume = volume.value
  videoRef.value.muted = false
  isMuted.value = false
}

function toggleMute() {
  if (!videoRef.value) return
  videoRef.value.muted = !videoRef.value.muted
  isMuted.value = videoRef.value.muted
}

function cycleSpeed() {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
  const currentRate = playbackRate.value ?? 1
  const currentIndex = speeds.indexOf(currentRate)
  const newRate = speeds[(currentIndex + 1) % speeds.length]!
  playbackRate.value = newRate

  if (videoRef.value) {
    videoRef.value.playbackRate = newRate!
  }
}

async function togglePiP() {
  if (!videoRef.value) return

  if (isPiPActive.value) {
    await document.exitPictureInPicture()
  } else {
    await videoRef.value.requestPictureInPicture()
  }
}

function toggleFullscreen() {
  if (!videoContainer.value) return

  if (!document.fullscreenElement) {
    videoContainer.value.requestFullscreen().catch(console.error)
  } else {
    document.exitFullscreen().catch(console.error)
  }
}

function onTimeUpdate() {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  
  // 更新缓冲进度
  if (videoRef.value.buffered.length > 0) {
    const bufferedEnd = videoRef.value.buffered.end(videoRef.value.buffered.length - 1)
    bufferedProgress.value = (bufferedEnd / duration.value) * 100
  }
}

function onLoadedMetadata() {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
  loading.value = false
}

function onEnded() {
  isPlaying.value = false
  
  // 自动播放下一个视频
  if (currentVideoIndex.value < playlist.value.length - 1) {
    playVideo(currentVideoIndex.value + 1)
  }
}

function onPlay() {
  isPlaying.value = true
  loading.value = false
}

function onPause() {
  isPlaying.value = false
}

function removeFromPlaylist(index: number) {
  if (index === currentVideoIndex.value) {
    stop()
    currentVideoIndex.value = -1
    if (videoRef.value) {
      videoRef.value.src = ''
    }
  }
  
  // 释放URL对象
  const video = playlist.value[index]
  if (video) {
    URL.revokeObjectURL(video.url)
  }
  playlist.value.splice(index, 1)
  
  if (currentVideoIndex.value > index) {
    currentVideoIndex.value--
  }
  
  if (playlist.value.length > 0 && currentVideoIndex.value === -1) {
    playVideo(0)
  }
}

function clearPlaylist() {
  if (confirm('确定要清空播放列表吗？')) {
    stop()
    playlist.value.forEach(item => {
      URL.revokeObjectURL(item.url)
    })
    playlist.value = []
    currentVideoIndex.value = -1
    if (videoRef.value) {
      videoRef.value.src = ''
    }
  }
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '00:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  
  if (mins >= 60) {
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  // 监听画中画变化
  videoRef.value?.addEventListener('enterpictureinpicture', () => {
    isPiPActive.value = true
  })
  
  videoRef.value?.addEventListener('leavepictureinpicture', () => {
    isPiPActive.value = false
  })
})

onUnmounted(() => {
  stop()
  clearPlaylist()
})
</script>

<style scoped>
.video-player {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000;
  color: white;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.player-header h2 {
  margin: 0;
  font-size: 20px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.player-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.video-container {
  flex: 1;
  position: relative;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-container video {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  opacity: 0.8;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background 0.2s;
}

.play-overlay:hover {
  background: rgba(0, 0, 0, 0.5);
}

.play-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  transition: transform 0.2s;
}

.play-button:hover {
  transform: scale(1.1);
}

.controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
}

.progress-bar {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin-bottom: 12px;
  cursor: pointer;
}

.progress-buffered {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  pointer-events: none;
}

.progress-current {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #667eea;
  border-radius: 3px;
  pointer-events: none;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.play-btn {
  width: 44px;
  height: 44px;
  font-size: 20px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider {
  width: 80px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.speed-btn {
  padding: 0 12px;
  width: auto;
  font-size: 14px;
  font-weight: 600;
}

.time-display {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.time-separator {
  opacity: 0.5;
}

.playlist {
  height: 200px;
  background: rgba(0, 0, 0, 0.3);
  overflow-y: auto;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.5);
}

.playlist-header h3 {
  margin: 0;
  font-size: 14px;
}

.clear-btn {
  padding: 4px 8px;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.playlist-items {
  padding: 8px;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.playlist-item.playing {
  background: rgba(102, 126, 234, 0.3);
}

.item-icon {
  font-size: 24px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-duration {
  font-size: 12px;
  opacity: 0.6;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 64px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
}

.empty-hint {
  font-size: 14px;
}

@media (max-width: 768px) {
  .control-buttons {
    gap: 8px;
  }
  
  .control-btn {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  
  .volume-slider {
    width: 60px;
  }
  
  .playlist {
    height: 150px;
  }
}
</style>
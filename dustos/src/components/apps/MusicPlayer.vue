<template>
  <div class="music-player">
    <div class="player-main">
      <div class="album-art">
        <div class="album-placeholder" v-if="!currentTrack">
          <span>🎵</span>
        </div>
        <div class="album-image" v-else :style="{ background: currentTrack.artwork }">
          <img :src="currentTrack.artwork" :alt="currentTrack.title" @error="handleImageError" />
        </div>
      </div>
      
      <div class="track-info">
        <div class="track-title">{{ currentTrack ? currentTrack.title : '未播放' }}</div>
        <div class="track-artist">{{ currentTrack ? currentTrack.artist : '选择一首音乐' }}</div>
        
        <div class="progress-container">
          <div class="time-labels">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
          <div class="progress-bar" @click="seek">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
        
        <div class="controls">
          <button class="control-button" @click="shuffleTracks" :class="{ active: shuffle }" title="随机播放">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 3 21"></polyline><line x1="4" y1="20" x2="4" y2="20"></line><polyline points="12 3 17 3 17 3 17"></polyline><line x1="8" y1="20" x2="8" y2="20"></line><polyline points="20 3 2 21 2 21 2 21"></polyline><line x1="16" y1="20" x2="16" y2="20"></line></svg>
          </button>
          <button class="control-button" @click="previousTrack" title="上一首">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 15 12 15 5 20"></polygon><line x1="5" y1="19" x2="19" y2="19"></line></svg>
          </button>
          <button class="control-button play" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
            <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          </button>
          <button class="control-button" @click="nextTrack" title="下一首">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
          </button>
          <button class="control-button" @click="toggleRepeat" :class="{ active: repeatMode !== 'none' }" title="循环播放">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path></svg>
            <span v-if="repeatMode === 'one'" class="repeat-badge">1</span>
          </button>
        </div>
        
        <div class="volume-control">
          <button class="control-button" @click="toggleMute" :title="isMuted ? '取消静音' : '静音'">
            <svg v-if="!isMuted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 12 2 12 17 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 12 2 12 17 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
          </button>
          <input type="range" v-model="volume" min="0" max="100" class="volume-slider" />
        </div>
      </div>
    </div>
    
    <div class="playlist">
      <div class="playlist-header">
        <h3>播放列表</h3>
        <button class="add-button" @click="openFileDialog" title="添加音乐">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
      <div class="playlist-tracks">
        <div
          v-for="(track, index) in playlist"
          :key="track.id"
          class="playlist-item"
          :class="{ active: currentIndex === index, playing: currentIndex === index && isPlaying }"
          @click="playTrack(index)"
        >
          <div class="track-number">{{ index + 1 }}</div>
          <div class="track-details">
            <div class="track-name">{{ track.title }}</div>
            <div class="track-artist">{{ track.artist }}</div>
          </div>
          <div class="track-duration">{{ formatTime(track.duration) }}</div>
          <button class="remove-button" @click.stop="removeTrack(index)" title="移除">
            ✕
          </button>
        </div>
        <div v-if="playlist.length === 0" class="empty-playlist">
          <span>🎵</span>
          <p>播放列表为空</p>
          <button class="upload-button" @click="openFileDialog">
            添加音乐
          </button>
        </div>
      </div>
    </div>
    
    <input type="file" ref="fileInput" @change="handleFileSelect" accept="audio/*" multiple style="display: none" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const playlist = ref([
  {
    id: '1',
    title: 'Background Music',
    artist: 'dustOS',
    duration: 245,
    url: '/background.mp3',
    artwork: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: '2',
    title: 'Peaceful Moment',
    artist: 'Nature Sounds',
    duration: 180,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artwork: 'https://picsum.photos/seed/music1/300/300',
  },
  {
    id: '3',
    title: 'Focus Flow',
    artist: 'Productivity Beats',
    duration: 210,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    artwork: 'https://picsum.photos/seed/music2/300/300',
  },
  {
    id: '4',
    title: 'Morning Vibes',
    artist: 'Chillout Collective',
    duration: 195,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    artwork: 'https://picsum.photos/seed/music3/300/300',
  },
])

const currentIndex = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(50)
const isMuted = ref(false)
const shuffle = ref(false)
const repeatMode = ref<'none' | 'all' | 'one'>('none')

const audio = ref<HTMLAudioElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
let updateInterval: number | null = null

const currentTrack = computed(() => playlist.value[currentIndex.value])
const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

function initAudio() {
  if (audio.value) {
    audio.value.pause()
  }
  
  audio.value = new Audio()
  setupAudioListeners()
}

function setupAudioListeners() {
  if (!audio.value) return
  
  audio.value.addEventListener('loadedmetadata', () => {
    if (audio.value) {
      duration.value = audio.value.duration
    }
  })
  
  audio.value.addEventListener('timeupdate', () => {
    if (audio.value) {
      currentTime.value = audio.value.currentTime
    }
  })
  
  audio.value.addEventListener('ended', () => {
    onTrackEnded()
  })
  
  audio.value.addEventListener('error', () => {
    isPlaying.value = false
    console.error('Audio playback error')
  })
}

function playTrack(index: number) {
  currentIndex.value = index
  const track = playlist.value[index]
  
  if (!audio.value) {
    initAudio()
  }
  
  if (audio.value) {
    audio.value.src = track.url
    audio.value.volume = isMuted.value ? 0 : volume.value / 100
    audio.value.play()
    isPlaying.value = true
    startUpdateInterval()
  }
}

function togglePlay() {
  if (!audio.value || !currentTrack.value) {
    if (playlist.value.length > 0) {
      playTrack(0)
    }
    return
  }
  
  if (isPlaying.value) {
    audio.value.pause()
    isPlaying.value = false
    stopUpdateInterval()
  } else {
    audio.value.play()
    isPlaying.value = true
    startUpdateInterval()
  }
}

function stopUpdateInterval() {
  if (updateInterval !== null) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

function startUpdateInterval() {
  stopUpdateInterval()
  updateInterval = window.setInterval(() => {
    if (audio.value) {
      currentTime.value = audio.value.currentTime
    }
  }, 1000)
}

function previousTrack() {
  let newIndex = currentIndex.value - 1
  if (newIndex < 0) {
    newIndex = playlist.value.length - 1
  }
  playTrack(newIndex)
}

function nextTrack() {
  let newIndex = currentIndex.value + 1
  if (newIndex >= playlist.value.length) {
    if (repeatMode.value === 'all') {
      newIndex = 0
    } else {
      return
    }
  }
  playTrack(newIndex)
}

function onTrackEnded() {
  if (repeatMode.value === 'one') {
    playTrack(currentIndex.value)
  } else {
    nextTrack()
  }
}

function shuffleTracks() {
  shuffle.value = !shuffle.value
}

function toggleRepeat() {
  const modes: Array<'none' | 'all' | 'one'> = ['none', 'all', 'one']
  const currentIndex = modes.indexOf(repeatMode.value)
  repeatMode.value = modes[(currentIndex + 1) % modes.length]
}

function seek(e: MouseEvent) {
  if (!audio.value || duration.value === 0) return
  
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percentage = (e.clientX - rect.left) / rect.width
  audio.value.currentTime = percentage * duration.value
}

function toggleMute() {
  isMuted.value = !isMuted.value
  if (audio.value) {
    audio.value.muted = isMuted.value
  }
}

function removeTrack(index: number) {
  const wasPlaying = isPlaying.value && currentIndex.value === index
  
  playlist.value.splice(index, 1)
  
  if (playlist.value.length === 0) {
    if (audio.value) {
      audio.value.pause()
      audio.value.src = ''
    }
    isPlaying.value = false
    currentIndex.value = 0
    currentTime.value = 0
    duration.value = 0
    stopUpdateInterval()
  } else if (wasPlaying) {
    const newIndex = Math.min(index, playlist.value.length - 1)
    playTrack(newIndex)
  } else if (index <= currentIndex.value) {
    currentIndex.value = Math.max(0, currentIndex.value - 1)
  }
}

function openFileDialog() {
  fileInput.value?.click()
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const url = URL.createObjectURL(file)
    playlist.value.push({
      id: Date.now() + i,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: '未知艺术家',
      duration: 0,
      url: url,
      artwork: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    })
  }
}

function handleImageError() {
  // Handle image error
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 监听音量变化
import { watch } from 'vue'
watch(volume, (newVolume) => {
  if (audio.value) {
    audio.value.volume = newVolume / 100
    isMuted.value = newVolume === 0
  }
})

onMounted(() => {
  initAudio()
})

onUnmounted(() => {
  stopUpdateInterval()
  if (audio.value) {
    audio.value.pause()
    audio.value = null
  }
})
</script>

<style scoped>
.music-player {
  display: flex;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

:global(.dark) .music-player {
  background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
}

.player-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.album-art {
  width: 250px;
  height: 250px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin-bottom: 24px;
}

.album-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
}

.album-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.album-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-info {
  text-align: center;
  margin-bottom: 24px;
  width: 100%;
  max-width: 400px;
}

.track-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-artist {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-container {
  margin-bottom: 20px;
}

.time-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.1s linear;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.control-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.control-button:active {
  transform: scale(0.95);
}

.control-button.active {
  background: #667eea;
}

.control-button.play {
  width: 64px;
  height: 64px;
  font-size: 24px;
}

.control-button svg {
  width: 20px;
  height: 20px;
}

.control-button.play svg {
  width: 24px;
  height: 24px;
}

.repeat-badge {
  position: absolute;
  bottom: 4px;
  font-size: 10px;
  font-weight: bold;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}

.playlist {
  width: 350px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.playlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.playlist-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: white;
}

.add-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.add-button svg {
  width: 16px;
  height: 16px;
}

.playlist-tracks {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: white;
  position: relative;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.playlist-item.active {
  background: rgba(102, 126, 234, 0.2);
}

.playlist-item.playing .track-name {
  color: #667eea;
}

.track-number {
  font-size: 12px;
  opacity: 0.5;
  min-width: 24px;
}

.track-details {
  flex: 1;
  min-width: 0;
}

.track-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-artist {
  font-size: 12px;
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-duration {
  font-size: 12px;
  opacity: 0.5;
  min-width: 40px;
  text-align: right;
}

.remove-button {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s;
}

.remove-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.empty-playlist {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
  height: 200px;
}

.empty-playlist span {
  font-size: 48px;
}

.empty-playlist p {
  font-size: 14px;
}

.upload-button {
  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.upload-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .music-player {
    flex-direction: column;
  }
  
  .playlist {
    width: 100%;
    height: 200px;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .album-art {
    width: 180px;
    height: 180px;
  }
  
  .track-info {
    max-width: 300px;
  }
  
  .control-button {
    width: 40px;
    height: 40px;
  }
  
  .control-button.play {
    width: 56px;
    height: 56px;
  }
  
  .volume-slider {
    width: 80px;
  }
}
</style>
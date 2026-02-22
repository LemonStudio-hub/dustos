<template>
  <div class="voice-recorder">
    <div class="recorder-header">
      <h2>录音机</h2>
      <div class="recorder-status" :class="{ recording: isRecording }">
        <span class="status-dot"></span>
        <span class="status-text">{{ statusText }}</span>
      </div>
    </div>

    <div class="recorder-content">
      <!-- 录音控制 -->
      <div class="recorder-controls">
        <button
          class="control-btn record-btn"
          :class="{ recording: isRecording }"
          @click="toggleRecording"
          :disabled="!isRecording && recordings.length >= 50"
        >
          <span class="icon">{{ isRecording ? '⏹️' : '🎤' }}</span>
          <span class="text">{{ isRecording ? '停止录音' : '开始录音' }}</span>
        </button>
      </div>

      <!-- 录音时长 -->
      <div class="recording-time" v-if="isRecording || currentRecordingTime > 0">
        <div class="time-display">{{ formatTime(currentRecordingTime) }}</div>
        <div class="time-label">{{ isRecording ? '录音中...' : '上次录音时长' }}</div>
      </div>

      <!-- 录音列表 -->
      <div class="recordings-list" v-if="recordings.length > 0">
        <div class="list-header">
          <h3>录音列表 ({{ recordings.length }})</h3>
          <button class="clear-btn" @click="clearAllRecordings" v-if="recordings.length > 0">
            🗑️ 清空
          </button>
        </div>
        <div class="recordings">
          <transition-group name="recording">
            <div
              v-for="recording in recordings"
              :key="recording.id"
              class="recording-item"
              :class="{ playing: playingRecordingId === recording.id }"
            >
              <div class="recording-info">
                <div class="recording-name">{{ recording.name }}</div>
                <div class="recording-meta">
                  <span class="recording-date">{{ formatDate(recording.createdAt) }}</span>
                  <span class="recording-duration">{{ formatTime(recording.duration) }}</span>
                </div>
              </div>
              <div class="recording-actions">
                <button
                  class="action-btn play-btn"
                  @click="playRecording(recording.id)"
                  :disabled="playingRecordingId === recording.id && isPlaying"
                >
                  {{ playingRecordingId === recording.id && isPlaying ? '⏸️' : '▶️' }}
                </button>
                <button class="action-btn download-btn" @click="downloadRecording(recording)">
                  ⬇️
                </button>
                <button class="action-btn delete-btn" @click="deleteRecording(recording.id)">
                  🗑️
                </button>
              </div>
            </div>
          </transition-group>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🎙️</div>
        <div class="empty-text">暂无录音</div>
        <div class="empty-hint">点击开始录音按钮录制你的第一段录音</div>
      </div>

      <!-- 录音波形可视化 -->
      <div class="waveform" v-if="isRecording">
        <canvas ref="waveformCanvas" width="600" height="100"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface Recording {
  id: string
  name: string
  blob: Blob
  duration: number
  createdAt: Date
}

const isRecording = ref(false)
const isPlaying = ref(false)
const currentRecordingTime = ref(0)
const playingRecordingId = ref<string | null>(null)
const recordings = ref<Recording[]>([])

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recordingTimer: number
let audio: HTMLAudioElement | null = null
let playbackTimer: number
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let dataArray: Uint8Array | null = null
let animationId: number

const waveformCanvas = ref<HTMLCanvasElement | null>(null)

const statusText = computed(() => {
  if (isRecording.value) return '正在录音'
  if (isPlaying.value) return '正在播放'
  return '就绪'
})

async function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    // 设置音频上下文用于波形可视化
    audioContext = new AudioContext()
    analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)
    analyser.fftSize = 256
    dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      recordings.value.unshift({
        id: Date.now().toString(),
        name: `录音 ${recordings.value.length + 1}`,
        blob,
        duration: currentRecordingTime.value,
        createdAt: new Date(),
      })
      currentRecordingTime.value = 0
    }
    
    mediaRecorder.start(100)
    isRecording.value = true
    
    // 开始计时
    recordingTimer = window.setInterval(() => {
      currentRecordingTime.value++
    }, 1000)
    
    // 开始绘制波形
    drawWaveform()
    
  } catch (error) {
    console.error('无法访问麦克风:', error)
    alert('无法访问麦克风，请确保已授权麦克风权限')
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach(track => track.stop())
  }
  
  isRecording.value = false
  clearInterval(recordingTimer)
  
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
}

function playRecording(id: string) {
  const recording = recordings.value.find(r => r.id === id)
  if (!recording) return
  
  if (playingRecordingId.value === id && isPlaying.value) {
    // 暂停当前播放
    if (audio) {
      audio.pause()
      isPlaying.value = false
    }
    return
  }
  
  // 停止之前的播放
  if (audio) {
    audio.pause()
    audio = null
  }
  
  // 播放新的录音
  audio = new Audio(URL.createObjectURL(recording.blob))
  playingRecordingId.value = id
  isPlaying.value = true
  
  audio.onended = () => {
    isPlaying.value = false
    playingRecordingId.value = null
  }
  
  audio.play()
}

function downloadRecording(recording: Recording) {
  const url = URL.createObjectURL(recording.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${recording.name}.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function deleteRecording(id: string) {
  if (confirm('确定要删除这段录音吗？')) {
    const index = recordings.value.findIndex(r => r.id === id)
    if (index > -1) {
      if (playingRecordingId.value === id) {
        if (audio) {
          audio.pause()
          audio = null
        }
        playingRecordingId.value = null
        isPlaying.value = false
      }
      recordings.value.splice(index, 1)
    }
  }
}

function clearAllRecordings() {
  if (confirm('确定要清空所有录音吗？此操作不可恢复。')) {
    if (audio) {
      audio.pause()
      audio = null
    }
    recordings.value = []
    playingRecordingId.value = null
    isPlaying.value = false
  }
}

function drawWaveform() {
  if (!isRecording.value || !analyser || !waveformCanvas.value) return
  
  const canvas = waveformCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const draw = () => {
    if (!isRecording.value) return
    
    animationId = requestAnimationFrame(draw)
    
    analyser!.getByteFrequencyData(dataArray!)
    
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const barWidth = (canvas.width / dataArray!.length) * 2.5
    let barHeight
    let x = 0
    
    for (let i = 0; i < dataArray!.length; i++) {
      barHeight = (dataArray![i] / 255) * canvas.height
      
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      
      ctx.fillStyle = gradient
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
      
      x += barWidth + 1
    }
  }
  
  draw()
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
  // 检查浏览器是否支持录音
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('您的浏览器不支持录音功能')
  }
})

onUnmounted(() => {
  if (isRecording.value) {
    stopRecording()
  }
  if (audio) {
    audio.pause()
  }
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.voice-recorder {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  color: #333;
}

.voice-recorder.dark {
  background: #1a1a2e;
  color: #e0e0e0;
}

.recorder-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voice-recorder.dark .recorder-header {
  background: #16213e;
  border-bottom-color: #2a2a4e;
}

.recorder-header h2 {
  margin: 0;
  font-size: 24px;
}

.recorder-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 14px;
}

.voice-recorder.dark .recorder-status {
  background: #2a2a4e;
}

.recorder-status.recording {
  background: #fee2e2;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ccc;
  animation: pulse 1s infinite;
}

.recorder-status.recording .status-dot {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.recorder-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.recorder-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.record-btn {
  background: #667eea;
  color: white;
}

.record-btn:hover:not(:disabled) {
  background: #5568d3;
  transform: scale(1.05);
}

.record-btn.recording {
  background: #ef4444;
  animation: recording 1s infinite;
}

@keyframes recording {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.record-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recording-time {
  text-align: center;
  margin-bottom: 30px;
}

.time-display {
  font-size: 48px;
  font-weight: 300;
  margin-bottom: 8px;
}

.time-label {
  font-size: 14px;
  opacity: 0.6;
}

.recordings-list {
  margin-bottom: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.list-header h3 {
  margin: 0;
  font-size: 18px;
}

.clear-btn {
  padding: 6px 12px;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #fecaca;
}

.recordings {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recording-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-radius: 12px;
  transition: all 0.2s;
}

.voice-recorder.dark .recording-item {
  background: #16213e;
}

.recording-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recording-item.playing {
  border: 2px solid #667eea;
}

.recording-info {
  flex: 1;
  min-width: 0;
}

.recording-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.recording-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  opacity: 0.6;
}

.recording-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #f0f0f0;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.voice-recorder.dark .action-btn {
  background: #2a2a4e;
}

.action-btn:hover {
  background: #e0e0e0;
}

.voice-recorder.dark .action-btn:hover {
  background: #3a3a5e;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  opacity: 0.6;
}

.waveform {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.voice-recorder.dark .waveform {
  background: #16213e;
}

.waveform canvas {
  width: 100%;
  height: 100px;
}

.recording-enter-active,
.recording-leave-active {
  transition: all 0.3s;
}

.recording-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.recording-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@media (max-width: 768px) {
  .recorder-controls {
    flex-direction: column;
  }
  
  .control-btn {
    width: 100%;
    justify-content: center;
  }
  
  .time-display {
    font-size: 36px;
  }
  
  .recording-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .recording-actions {
    width: 100%;
    justify-content: space-around;
  }
}
</style>
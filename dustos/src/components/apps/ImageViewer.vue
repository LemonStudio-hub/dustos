<template>
  <div class="image-viewer">
    <div class="viewer-toolbar">
      <div class="toolbar-group">
        <button class="tool-button" @click="previousImage" :disabled="!hasPrevious" title="上一张">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button class="tool-button" @click="nextImage" :disabled="!hasNext" title="下一张">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
      
      <div class="image-counter" v-if="currentImage">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
      
      <div class="toolbar-group">
        <button class="tool-button" @click="zoomOut" :disabled="scale <= 0.5" title="缩小">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
        <button class="tool-button" @click="resetZoom" title="重置缩放">
          <span>{{ Math.round(scale * 100) }}%</span>
        </button>
        <button class="tool-button" @click="zoomIn" :disabled="scale >= 3" title="放大">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
      </div>
      
      <div class="toolbar-group">
        <button class="tool-button" @click="rotateLeft" title="向左旋转">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
        </button>
        <button class="tool-button" @click="rotateRight" title="向右旋转">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
        </button>
        <button class="tool-button" @click="flipHorizontal" title="水平翻转">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path></svg>
        </button>
        <button class="tool-button" @click="flipVertical" title="垂直翻转">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4v5H17"></path><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 15A9 9 0 0 0 18.36 18.36L23 14m-22 4v-5h5"></path></svg>
        </button>
      </div>
      
      <div class="toolbar-group">
        <button class="tool-button" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
        </button>
        <button class="tool-button" @click="downloadImage" title="下载">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
      </div>
    </div>

    <div class="viewer-content" @wheel.prevent="handleWheel" @mousedown="startDrag" @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">
      <div class="image-container" :style="imageContainerStyle" v-if="currentImage">
        <img
          :src="currentImage.url"
          :alt="currentImage.name"
          :style="imageStyle"
          @load="onImageLoad"
          @error="onImageError"
        />
        <div v-if="loading" class="image-loading">
          <div class="loading-spinner"></div>
        </div>
      </div>
      
      <div v-if="!currentImage && !loading" class="empty-state">
        <span>🖼️</span>
        <p>没有可显示的图片</p>
        <button class="upload-button" @click="openFileDialog">
          选择图片
        </button>
        <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*" multiple style="display: none" />
      </div>
      
      <div v-if="error" class="error-state">
        <span>⚠️</span>
        <p>无法加载图片</p>
      </div>
    </div>

    <div class="thumbnail-bar" v-if="images.length > 1">
      <div class="thumbnails">
        <div
          v-for="(image, index) in images"
          :key="image.id"
          class="thumbnail"
          :class="{ active: index === currentIndex }"
          @click="selectImage(index)"
        >
          <img :src="image.url" :alt="image.name" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const currentIndex = ref(0)
const scale = ref(1)
const rotation = ref(0)
const flipH = ref(false)
const flipV = ref(false)
const isFullscreen = ref(false)
const loading = ref(false)
const error = ref(false)

const images = ref([
  { id: '1', name: 'wallpaper.png', url: '/wallpaper.png', size: 2097152 },
  { id: '2', name: 'avatar.jpg', url: '/avatar.jpg', size: 524288 },
  { id: '3', name: 'screenshot.png', url: '/screenshot.png', size: 1048576 },
  { id: '4', name: 'photo1.jpg', url: 'https://picsum.photos/800/600?random=1', size: 1024000 },
  { id: '5', name: 'photo2.jpg', url: 'https://picsum.photos/800/600?random=2', size: 1024000 },
])

const fileInput = ref<HTMLInputElement | null>(null)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const currentImage = computed(() => images.value[currentIndex.value])
const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < images.value.length - 1)

const imageStyle = computed(() => ({
  transform: `scale(${scale.value}) rotate(${rotation.value}deg) scaleX(${flipH.value ? -1 : 1}) scaleY(${flipV.value ? -1 : 1})`,
  transition: isDragging.value ? 'none' : 'transform 0.3s ease',
}))

const imageContainerStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px)`,
  transition: isDragging.value ? 'none' : 'transform 0.3s ease',
}))

function selectImage(index: number) {
  currentIndex.value = index
  resetView()
}

function previousImage() {
  if (hasPrevious.value) {
    currentIndex.value--
    resetView()
  }
}

function nextImage() {
  if (hasNext.value) {
    currentIndex.value++
    resetView()
  }
}

function resetView() {
  scale.value = 1
  rotation.value = 0
  flipH.value = false
  flipV.value = false
  position.value = { x: 0, y: 0 }
}

function zoomIn() {
  scale.value = Math.min(3, scale.value + 0.25)
}

function zoomOut() {
  scale.value = Math.max(0.5, scale.value - 0.25)
}

function resetZoom() {
  scale.value = 1
}

function rotateLeft() {
  rotation.value = (rotation.value - 90) % 360
}

function rotateRight() {
  rotation.value = (rotation.value + 90) % 360
}

function flipHorizontal() {
  flipH.value = !flipH.value
}

function flipVertical() {
  flipV.value = !flipV.value
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

function downloadImage() {
  if (!currentImage.value) return
  
  const link = document.createElement('a')
  link.href = currentImage.value.url
  link.download = currentImage.value.name
  link.click()
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
    if (!file) continue
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        images.value.push({
          id: (Date.now() + i).toString(),
          name: file.name,
          url: result,
          size: file.size,
        })
      }
    }
    reader.readAsDataURL(file)
  }
}

function handleWheel(e: WheelEvent) {
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

function startDrag(e: MouseEvent) {
  if (scale.value <= 1) return
  isDragging.value = true
  dragStart.value = { x: e.clientX - position.value.x, y: e.clientY - position.value.y }
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value) return
  position.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y,
  }
}

function stopDrag() {
  isDragging.value = false
}

function onImageLoad() {
  loading.value = false
  error.value = false
}

function onImageError() {
  loading.value = false
  error.value = true
}

// 键盘导航
function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
    case '_':
      zoomOut()
      break
    case '0':
      resetZoom()
      break
    case 'r':
    case 'R':
      if (e.shiftKey) {
        rotateRight()
      } else {
        rotateLeft()
      }
      break
    case 'f':
    case 'F':
      flipHorizontal()
      break
    case 'v':
    case 'V':
      flipVertical()
      break
    case 'Escape':
      if (isFullscreen.value) {
        toggleFullscreen()
      }
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.image-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
}

:global(.dark) .image-viewer {
  background: #0a0a0a;
}

.viewer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(40, 40, 40, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tool-button {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.tool-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.tool-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.tool-button svg {
  width: 18px;
  height: 18px;
}

.image-counter {
  color: white;
  font-size: 14px;
  min-width: 60px;
  text-align: center;
}

.viewer-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.image-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state span,
.error-state span {
  font-size: 64px;
}

.empty-state p,
.error-state p {
  font-size: 14px;
}

.upload-button {
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.upload-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.thumbnail-bar {
  height: 80px;
  background: rgba(40, 40, 40, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
}

.thumbnails {
  display: flex;
  gap: 8px;
  padding: 12px;
  height: 100%;
}

.thumbnail {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.thumbnail:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.thumbnail.active {
  border-color: #667eea;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .viewer-toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .toolbar-group {
    gap: 2px;
  }
  
  .tool-button {
    width: 36px;
    height: 36px;
  }
  
  .image-counter {
    font-size: 12px;
    min-width: 50px;
  }
  
  .thumbnail-bar {
    height: 60px;
  }
  
  .thumbnail {
    width: 48px;
    height: 48px;
  }
}
</style>
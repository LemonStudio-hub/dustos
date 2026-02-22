<template>
  <div
    ref="menuRef"
    class="context-menu"
    :class="{ dark: systemStore.isDarkMode }"
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
  >
    <div class="context-menu-item" @click="handleAction('refresh')">
      <span class="icon" v-html="refreshIcon"></span>
      <span>刷新</span>
      <span class="shortcut">F5</span>
    </div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-item" @click="handleAction('changeWallpaper')">
      <span class="icon" v-html="imageIcon"></span>
      <span>更换壁纸</span>
    </div>
    <div class="context-menu-item" @click="handleAction('settings')">
      <span class="icon" v-html="settingsIcon"></span>
      <span>显示设置</span>
    </div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-item" @click="handleAction('newFolder')">
      <span class="icon" v-html="folderIcon"></span>
      <span>新建文件夹</span>
    </div>
    <div class="context-menu-item" @click="handleAction('terminal')">
      <span class="icon" v-html="terminalIcon"></span>
      <span>打开终端</span>
    </div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-item" @click="handleAction('lockScreen')">
      <span class="icon" v-html="lockIcon"></span>
      <span>锁定屏幕</span>
    </div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-item" @click="handleAction('screenshot')" v-if="isScreenCaptureSupported">
      <span class="icon" v-html="screenshotIcon"></span>
      <span>屏幕截图</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useSystemStore } from '@/stores/system'
import { useDesktopStore } from '@/stores/desktop'
import { captureScreen, isScreenCaptureSupported as checkScreenCaptureSupported } from '@/utils/screenshot'

const props = defineProps<{
  x: number
  y: number
}>()

const emit = defineEmits(['action', 'close'])

const menuRef = ref<HTMLElement | null>(null)

const systemStore = useSystemStore()
const desktopStore = useDesktopStore()

const refreshIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>')

const imageIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>')

const settingsIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>')

const folderIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>')

const terminalIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>')

const lockIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>')

const screenshotIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>')

const isScreenCaptureSupported = computed(() => checkScreenCaptureSupported())

function handleAction(action: string) {
  emit('action', action)
  emit('close')
  
  if (action === 'screenshot') {
    handleScreenshot()
  }
}

async function handleScreenshot() {
  try {
    await captureScreen({
      filename: `dustos_screenshot_${Date.now()}.png`,
      format: 'png',
      quality: 1.0
    })
    systemStore.addNotification('截图成功', '屏幕截图已保存')
  } catch (error) {
    console.error('截图失败:', error)
    systemStore.addNotification('截图失败', '无法捕获屏幕，请确保已授权屏幕权限')
  }
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 200px;
  z-index: 9999;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.context-menu.dark {
  background: rgba(40, 40, 40, 0.95);
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s;
  font-size: 13px;
}

.context-menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.context-menu.dark .context-menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.context-menu-item .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.context-menu-item .icon svg {
  width: 16px;
  height: 16px;
}

.context-menu-item .shortcut {
  margin-left: auto;
  font-size: 11px;
  opacity: 0.5;
}

.context-menu-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 4px 0;
}

.context-menu.dark .context-menu-divider {
  background: rgba(255, 255, 255, 0.1);
}
</style>
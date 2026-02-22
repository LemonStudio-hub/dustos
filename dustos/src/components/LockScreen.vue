<template>
  <div class="lock-screen" :class="{ dark: systemStore.isDarkMode }" @click="unlock">
    <div class="lock-screen-content">
      <div class="time-display">
        <div class="time">{{ currentTime.time }}</div>
        <div class="date">{{ currentTime.date }}</div>
      </div>

      <div class="avatar-wrapper">
        <div class="avatar" v-html="avatarIcon"></div>
        <div class="username">用户</div>
      </div>

      <div class="unlock-hint">点击或滑动以解锁</div>

      <div class="lock-status" v-if="isLocked">
        <div class="status-icon" v-html="lockIcon"></div>
        <div class="status-text">已锁定</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()
const isLocked = ref(true)
const currentTime = ref({ time: '', date: '' })

const avatarIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>')

const lockIcon = computed(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>')

let timeInterval: number

function updateTime() {
  const now = new Date()
  currentTime.value = {
    time: now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    date: now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }),
  }
}

function unlock() {
  isLocked.value = false
  emit('unlocked')
}

function handleKeyPress(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    unlock()
  }
}

onMounted(() => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)
  document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  clearInterval(timeInterval)
  document.removeEventListener('keydown', handleKeyPress)
})

const emit = defineEmits(['unlocked'])
</script>

<style scoped>
.lock-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
  transition: opacity 0.5s ease-out;
}

.lock-screen.dark {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.lock-screen-content {
  text-align: center;
  color: white;
  padding: 40px;
}

.time-display {
  margin-bottom: 40px;
}

.time {
  font-size: 80px;
  font-weight: 300;
  line-height: 1;
  margin-bottom: 8px;
}

.date {
  font-size: 24px;
  opacity: 0.9;
}

.avatar-wrapper {
  margin-bottom: 32px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  backdrop-filter: blur(10px);
}

.avatar svg {
  width: 50px;
  height: 50px;
}

.username {
  font-size: 20px;
  font-weight: 500;
}

.unlock-hint {
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 24px;
}

.lock-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  backdrop-filter: blur(10px);
}

.status-icon svg {
  width: 18px;
  height: 18px;
}

.status-text {
  font-size: 14px;
}

@media (max-width: 768px) {
  .time {
    font-size: 60px;
  }

  .date {
    font-size: 18px;
  }

  .avatar {
    width: 80px;
    height: 80px;
  }

  .avatar svg {
    width: 40px;
    height: 40px;
  }
}
</style>
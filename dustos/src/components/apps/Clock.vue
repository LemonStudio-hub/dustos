<template>
  <div class="clock">
    <div class="clock-header">
      <h2>时钟</h2>
      <div class="header-tabs">
        <button
          class="tab"
          :class="{ active: currentTab === 'clock' }"
          @click="currentTab = 'clock'"
        >
          时钟
        </button>
        <button
          class="tab"
          :class="{ active: currentTab === 'alarm' }"
          @click="currentTab = 'alarm'"
        >
          闹钟
        </button>
        <button
          class="tab"
          :class="{ active: currentTab === 'stopwatch' }"
          @click="currentTab = 'stopwatch'"
        >
          秒表
        </button>
        <button
          class="tab"
          :class="{ active: currentTab === 'world' }"
          @click="currentTab = 'world'"
        >
          世界时钟
        </button>
      </div>
    </div>

    <div class="clock-content">
      <!-- 时钟页面 -->
      <div v-if="currentTab === 'clock'" class="tab-content">
        <div class="clock-display">
          <!-- 模拟时钟 -->
          <div class="analog-clock">
            <div class="clock-face">
              <div class="clock-center"></div>
              <div class="hour-hand" :style="hourStyle"></div>
              <div class="minute-hand" :style="minuteStyle"></div>
              <div class="second-hand" :style="secondStyle"></div>
              <div class="clock-markers">
                <div v-for="i in 12" :key="i" class="marker" :style="{ transform: `rotate(${i * 30}deg)` }">
                  <span class="marker-number">{{ i }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 数字时钟 -->
          <div class="digital-clock">
            <div class="time-display">
              <span class="time">{{ currentTime.time }}</span>
              <span class="period">{{ currentTime.period }}</span>
            </div>
            <div class="date-display">{{ currentTime.date }}</div>
            <div class="weekday-display">{{ currentTime.weekday }}</div>
          </div>
        </div>
      </div>

      <!-- 闹钟页面 -->
      <div v-if="currentTab === 'alarm'" class="tab-content">
        <div class="alarm-section">
          <h3>我的闹钟</h3>
          <div class="alarm-list">
            <div
              v-for="(alarm, index) in alarms"
              :key="alarm.id"
              class="alarm-item"
            >
              <div class="alarm-time">{{ alarm.time }}</div>
              <div class="alarm-label">{{ alarm.label }}</div>
              <div class="alarm-days">{{ alarm.days.join(' ') }}</div>
              <button
                class="alarm-toggle"
                :class="{ active: alarm.active }"
                @click="toggleAlarm(index)"
              >
                {{ alarm.active ? '开启' : '关闭' }}
              </button>
              <button class="alarm-delete" @click="deleteAlarm(index)">🗑️</button>
            </div>
            <div v-if="alarms.length === 0" class="empty-alarms">
              暂无闹钟
            </div>
          </div>
          <button class="add-alarm-btn" @click="showAlarmDialog = true">
            + 添加闹钟
          </button>
        </div>

        <!-- 闹钟设置对话框 -->
        <div v-if="showAlarmDialog" class="alarm-dialog">
          <div class="dialog-content">
            <h3>添加闹钟</h3>
            <div class="alarm-form">
              <div class="form-group">
                <label>时间</label>
                <input type="time" v-model="newAlarm.time" />
              </div>
              <div class="form-group">
                <label>标签</label>
                <input type="text" v-model="newAlarm.label" placeholder="闹钟名称" />
              </div>
              <div class="form-group">
                <label>重复</label>
                <div class="day-selector">
                  <button
                    v-for="(day, index) in weekDays"
                    :key="index"
                    class="day-btn"
                    :class="{ selected: newAlarm.days.includes(day) }"
                    @click="toggleDay(day)"
                  >
                    {{ day }}
                  </button>
                </div>
              </div>
            </div>
            <div class="dialog-actions">
              <button class="cancel-btn" @click="showAlarmDialog = false">取消</button>
              <button class="confirm-btn" @click="addAlarm">确定</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 秒表页面 -->
      <div v-if="currentTab === 'stopwatch'" class="tab-content">
        <div class="stopwatch-display">
          <div class="stopwatch-time">{{ formatStopwatchTime(stopwatchTime) }}</div>
        </div>
        <div class="stopwatch-laps">
          <div class="lap-list">
            <div
              v-for="(lap, index) in laps"
              :key="index"
              class="lap-item"
            >
              <span class="lap-number">#{{ index + 1 }}</span>
              <span class="lap-time">{{ formatStopwatchTime(lap) }}</span>
              <span class="lap-total">{{ formatStopwatchTime(index === 0 ? lap : lap - laps[index - 1]) }}</span>
            </div>
          </div>
        </div>
        <div class="stopwatch-controls">
          <button class="control-btn" @click="resetStopwatch" :disabled="isRunning">
            重置
          </button>
          <button class="control-btn primary" @click="toggleStopwatch">
            {{ isRunning ? '暂停' : '开始' }}
          </button>
          <button class="control-btn" @click="recordLap" :disabled="!isRunning && stopwatchTime === 0">
            计次
          </button>
        </div>
      </div>

      <!-- 世界时钟页面 -->
      <div v-if="currentTab === 'world'" class="tab-content">
        <div class="world-clock-list">
          <div class="world-clock-item main">
            <div class="city-name">本地时间</div>
            <div class="clock-time">{{ currentTime.time }}</div>
            <div class="clock-date">{{ currentTime.date }}</div>
          </div>
          <div
            v-for="city in worldClocks"
            :key="city.timezone"
            class="world-clock-item"
          >
            <div class="city-name">{{ city.name }}</div>
            <div class="clock-time">{{ getWorldTime(city.timezone) }}</div>
            <div class="clock-date">{{ getWorldDate(city.timezone) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const currentTab = ref('clock')
const currentTime = ref({
  time: '00:00:00',
  period: 'AM',
  date: '',
  weekday: ''
})

const alarms = ref([
  { id: '1', time: '07:00', label: '起床', days: ['一', '二', '三', '四', '五'], active: true },
  { id: '2', time: '09:00', label: '工作', days: ['一', '二', '三', '四', '五'], active: true }
])

const showAlarmDialog = ref(false)
const newAlarm = ref({
  time: '07:00',
  label: '',
  days: ['一', '二', '三', '四', '五']
})

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

const stopwatchTime = ref(0)
const isRunning = ref(false)
const laps = ref<number[]>([])

const worldClocks = [
  { name: '北京', timezone: 'Asia/Shanghai' },
  { name: '纽约', timezone: 'America/New_York' },
  { name: '伦敦', timezone: 'Europe/London' },
  { name: '东京', timezone: 'Asia/Tokyo' },
  { name: '悉尼', timezone: 'Australia/Sydney' },
  { name: '巴黎', timezone: 'Europe/Paris' }
]

let timeInterval: number
let stopwatchInterval: number

const hourStyle = computed(() => {
  const now = new Date()
  const hours = now.getHours() % 12
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  const angle = (hours * 30) + (minutes * 0.5) + (seconds * 0.00833)
  return { transform: `rotate(${angle}deg)` }
})

const minuteStyle = computed(() => {
  const now = new Date()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  const angle = (minutes * 6) + (seconds * 0.1)
  return { transform: `rotate(${angle}deg)` }
})

const secondStyle = computed(() => {
  const now = new Date()
  const seconds = now.getSeconds()
  const milliseconds = now.getMilliseconds()
  const angle = (seconds * 6) + (milliseconds * 0.006)
  return { transform: `rotate(${angle}deg)` }
})

function updateTime() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  
  currentTime.value.time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  currentTime.value.period = hours >= 12 ? 'PM' : 'AM'
  currentTime.value.date = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  currentTime.value.weekday = now.toLocaleDateString('zh-CN', { weekday: 'long' })
  
  checkAlarms(hours, minutes, seconds)
}

function checkAlarms(hours: number, minutes: number, seconds: number) {
  const currentTimeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  const currentDay = weekDays[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  
  alarms.value.forEach(alarm => {
    if (alarm.active && alarm.time === currentTimeStr && seconds === 0) {
      if (alarm.days.includes(currentDay) || alarm.days.length === 0) {
        // 触发闹钟
        if (Notification.permission === 'granted') {
          new Notification('闹钟提醒', {
            body: alarm.label,
            icon: '⏰'
          })
        }
        alert(`⏰ ${alarm.label}`)
      }
    }
  })
}

function toggleAlarm(index: number) {
  alarms.value[index].active = !alarms.value[index].active
}

function deleteAlarm(index: number) {
  alarms.value.splice(index, 1)
}

function addAlarm() {
  if (newAlarm.value.time) {
    alarms.value.push({
      id: Date.now().toString(),
      time: newAlarm.value.time,
      label: newAlarm.value.label || '闹钟',
      days: [...newAlarm.value.days],
      active: true
    })
    showAlarmDialog.value = false
    // 重置表单
    newAlarm.value = {
      time: '07:00',
      label: '',
      days: ['一', '二', '三', '四', '五']
    }
  }
}

function toggleDay(day: string) {
  const index = newAlarm.value.days.indexOf(day)
  if (index > -1) {
    newAlarm.value.days.splice(index, 1)
  } else {
    newAlarm.value.days.push(day)
  }
}

function toggleStopwatch() {
  isRunning.value = !isRunning.value
  if (isRunning.value) {
    stopwatchInterval = window.setInterval(() => {
      stopwatchTime.value += 10
    }, 10)
  } else {
    clearInterval(stopwatchInterval)
  }
}

function resetStopwatch() {
  isRunning.value = false
  clearInterval(stopwatchInterval)
  stopwatchTime.value = 0
  laps.value = []
}

function recordLap() {
  laps.value.push(stopwatchTime.value)
}

function formatStopwatchTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((ms % 1000) / 10)
  
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
}

function getWorldTime(timezone: string): string {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  return new Intl.DateTimeFormat('zh-CN', options).format(now)
}

function getWorldDate(timezone: string): string {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  }
  return new Intl.DateTimeFormat('zh-CN', options).format(now)
}

onMounted(() => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)
  
  // 请求通知权限
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

onUnmounted(() => {
  clearInterval(timeInterval)
  clearInterval(stopwatchInterval)
})
</script>

<style scoped>
.clock {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  color: #333;
}

.clock.dark {
  background: #1a1a2e;
  color: #e0e0e0;
}

.clock-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clock.dark .clock-header {
  background: #16213e;
  border-bottom-color: #2a2a4e;
}

.clock-header h2 {
  margin: 0;
  font-size: 24px;
}

.header-tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.clock.dark .tab {
  border-color: #2a2a4e;
  background: #1a1a2e;
  color: #e0e0e0;
}

.tab:hover {
  background: #f0f0f0;
}

.clock.dark .tab:hover {
  background: #2a2a4e;
}

.tab.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.clock-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.tab-content {
  height: 100%;
}

/* 时钟页面 */
.clock-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 40px;
}

.analog-clock {
  width: 300px;
  height: 300px;
}

.clock-face {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  border: 8px solid #333;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.clock.dark .clock-face {
  background: #1a1a2e;
  border-color: #e0e0e0;
}

.clock-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  background: #333;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.clock.dark .clock-center {
  background: #e0e0e0;
}

.hour-hand {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 80px;
  background: #333;
  border-radius: 4px;
  transform-origin: bottom center;
  transform: translate(-50%, -100%);
  z-index: 3;
}

.clock.dark .hour-hand {
  background: #e0e0e0;
}

.minute-hand {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 110px;
  background: #667eea;
  border-radius: 3px;
  transform-origin: bottom center;
  transform: translate(-50%, -100%);
  z-index: 2;
}

.second-hand {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 120px;
  background: #ef4444;
  border-radius: 1px;
  transform-origin: bottom center;
  transform: translate(-50%, -100%);
  z-index: 1;
}

.clock-markers {
  position: absolute;
  inset: 0;
}

.marker {
  position: absolute;
  top: 10px;
  left: 50%;
  transform-origin: 50% 140px;
  font-size: 16px;
  font-weight: 600;
}

.digital-clock {
  text-align: center;
}

.time-display {
  display: flex;
  align-items: baseline;
  gap: 8px;
  justify-content: center;
}

.time {
  font-size: 72px;
  font-weight: 300;
  font-family: 'Courier New', monospace;
}

.period {
  font-size: 24px;
  opacity: 0.6;
}

.date-display {
  font-size: 24px;
  margin-top: 8px;
  opacity: 0.8;
}

.weekday-display {
  font-size: 18px;
  opacity: 0.6;
}

/* 闹钟页面 */
.alarm-section h3 {
  margin-bottom: 20px;
}

.alarm-list {
  margin-bottom: 20px;
}

.alarm-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: box-shadow 0.2s;
}

.clock.dark .alarm-item {
  background: #16213e;
}

.alarm-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.alarm-time {
  font-size: 32px;
  font-weight: 300;
  font-family: 'Courier New', monospace;
}

.alarm-label {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
}

.alarm-days {
  font-size: 14px;
  opacity: 0.6;
}

.alarm-toggle {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.clock.dark .alarm-toggle {
  border-color: #2a2a4e;
  background: #1a1a2e;
  color: #e0e0e0;
}

.alarm-toggle.active {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
}

.alarm-delete {
  padding: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.alarm-delete:hover {
  opacity: 1;
}

.empty-alarms {
  text-align: center;
  padding: 40px;
  color: #999;
}

.add-alarm-btn {
  width: 100%;
  padding: 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.add-alarm-btn:hover {
  background: #5568d3;
}

.alarm-dialog {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
}

.clock.dark .dialog-content {
  background: #16213e;
  color: #e0e0e0;
}

.dialog-content h3 {
  margin: 0 0 20px 0;
}

.alarm-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input[type="time"],
.form-group input[type="text"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.clock.dark .form-group input {
  background: #1a1a2e;
  border-color: #2a2a4e;
  color: #e0e0e0;
}

.day-selector {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.day-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.clock.dark .day-btn {
  border-color: #2a2a4e;
  background: #1a1a2e;
  color: #e0e0e0;
}

.day-btn:hover {
  background: #f0f0f0;
}

.clock.dark .day-btn:hover {
  background: #2a2a4e;
}

.day-btn.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn {
  background: #f0f0f0;
  color: #333;
}

.clock.dark .cancel-btn {
  background: #2a2a4e;
  color: #e0e0e0;
}

.confirm-btn {
  background: #667eea;
  color: white;
}

.confirm-btn:hover {
  background: #5568d3;
}

/* 秒表页面 */
.stopwatch-display {
  text-align: center;
  padding: 60px 20px;
}

.stopwatch-time {
  font-size: 72px;
  font-weight: 300;
  font-family: 'Courier New', monospace;
}

.stopwatch-laps {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 0 20px;
}

.lap-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
}

.clock.dark .lap-item {
  background: #16213e;
}

.lap-number {
  font-weight: 600;
}

.lap-time {
  color: #667eea;
}

.stopwatch-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px;
}

.control-btn {
  padding: 16px 32px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
}

.clock.dark .control-btn {
  border-color: #2a2a4e;
  background: #1a1a2e;
  color: #e0e0e0;
}

.control-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.clock.dark .control-btn:hover:not(:disabled) {
  background: #2a2a4e;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.control-btn.primary:hover:not(:disabled) {
  background: #5568d3;
}

/* 世界时钟页面 */
.world-clock-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.world-clock-item {
  padding: 24px;
  background: white;
  border-radius: 16px;
  text-align: center;
  transition: box-shadow 0.2s;
}

.clock.dark .world-clock-item {
  background: #16213e;
}

.world-clock-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.world-clock-item.main {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.city-name {
  font-size: 14px;
  opacity: 0.6;
  margin-bottom: 8px;
}

.world-clock-item.main .city-name {
  opacity: 0.8;
}

.clock-time {
  font-size: 36px;
  font-weight: 300;
  font-family: 'Courier New', monospace;
  margin-bottom: 8px;
}

.clock-date {
  font-size: 14px;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .clock-display {
    padding: 20px;
  }
  
  .analog-clock {
    width: 200px;
    height: 200px;
  }
  
  .time {
    font-size: 48px;
  }
  
  .stopwatch-time {
    font-size: 48px;
  }
  
  .stopwatch-controls {
    flex-direction: column;
  }
  
  .control-btn {
    width: 100%;
  }
}
</style>
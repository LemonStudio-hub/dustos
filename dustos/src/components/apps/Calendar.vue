<template>
  <div class="calendar">
    <div class="calendar-header">
      <button class="nav-button" @click="previousMonth" title="上个月">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <div class="month-year">
        <h2>{{ monthYear }}</h2>
      </div>
      <button class="nav-button" @click="nextMonth" title="下个月">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    </div>

    <div class="calendar-body">
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      </div>
      <div class="days">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="day"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'selected': isSelected(day.date),
            'has-events': hasEvents(day.date)
          }"
          @click="selectDate(day.date)"
          @dblclick="openEventModal(day.date)"
          :title="day.formattedDate"
        >
          <span class="day-number">{{ day.dayNumber }}</span>
          <div v-if="hasEvents(day.date)" class="event-dots">
            <div v-for="n in Math.min(3, getEvents(day.date).length)" :key="n" class="event-dot"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="calendar-footer">
      <button class="today-button" @click="goToToday">今天</button>
      <button class="event-button" @click="openEventModal(selectedDate)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        添加事件
      </button>
    </div>

    <div v-if="showEventsPanel" class="events-panel">
      <div class="events-panel-header">
        <h3>{{ selectedDateFormatted }} 的事件</h3>
        <button class="close-button" @click="showEventsPanel = false">✕</button>
      </div>
      <div class="events-list">
        <div v-if="selectedDateEvents.length === 0" class="no-events">
          没有事件
        </div>
        <div v-for="event in selectedDateEvents" :key="event.id" class="event-item" :class="{ completed: event.completed }">
          <div class="event-info">
            <div class="event-title">{{ event.title }}</div>
            <div class="event-time">{{ event.time }}</div>
          </div>
          <div class="event-actions">
            <button class="action-button complete" @click="toggleEventComplete(event.id)" title="标记完成">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <button class="action-button delete" @click="deleteEvent(event.id)" title="删除">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEventModal" class="event-modal-overlay" @click.self="closeEventModal">
      <div class="event-modal">
        <div class="event-modal-header">
          <h3>添加事件</h3>
          <button class="close-button" @click="closeEventModal">✕</button>
        </div>
        <div class="event-modal-body">
          <div class="form-group">
            <label>日期</label>
            <input type="date" v-model="newEvent.date" class="form-input">
          </div>
          <div class="form-group">
            <label>时间</label>
            <input type="time" v-model="newEvent.time" class="form-input">
          </div>
          <div class="form-group">
            <label>标题</label>
            <input type="text" v-model="newEvent.title" placeholder="事件标题" class="form-input">
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="newEvent.description" placeholder="事件描述（可选）" class="form-input" rows="3"></textarea>
          </div>
        </div>
        <div class="event-modal-footer">
          <button class="cancel-button" @click="closeEventModal">取消</button>
          <button class="save-button" @click="saveEvent">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Event {
  id: string
  date: string
  time: string
  title: string
  description: string
  completed: boolean
}

interface CalendarDay {
  dayNumber: number
  date: string
  isCurrentMonth: boolean
  isToday: boolean
  formattedDate: string
}

const currentDate = ref(new Date())
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showEventsPanel = ref(false)
const showEventModal = ref(false)
const events = ref<Event[]>([])

const newEvent = ref({
  date: '',
  time: '',
  title: '',
  description: ''
})

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const monthYear = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年 ${month}月`
})

const selectedDateFormatted = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value)
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

const selectedDateEvents = computed(() => {
  return events.value.filter(e => e.date === selectedDate.value)
})

const calendarDays = computed((): CalendarDay[] => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  
  const firstDayOfWeek = firstDayOfMonth.getDay()
  
  const prevMonth = new Date(year, month, 0)
  const prevMonthDays = prevMonth.getDate()
  
  const today = new Date()
  const todayDate = today.toISOString().split('T')[0]
  
  const days: CalendarDay[] = []
  
  // 上个月的日期
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const date = new Date(year, month - 1, day)
    days.push({
      dayNumber: day,
      date: date.toISOString().split('T')[0] || '',
      isCurrentMonth: false,
      isToday: false,
      formattedDate: `${date.getMonth() + 1}月${day}日`
    })
  }

  // 当前月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const dateStr = date.toISOString().split('T')[0] || ''
    days.push({
      dayNumber: i,
      date: dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayDate,
      formattedDate: `${month + 1}月${i}日`
    })
  }

  // 下个月的日期
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      dayNumber: i,
      date: date.toISOString().split('T')[0] || '',
      isCurrentMonth: false,
      isToday: false,
      formattedDate: `${date.getMonth() + 1}月${i}日`
    })
  }
  
  return days
})

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

const goToToday = () => {
  currentDate.value = new Date()
  selectedDate.value = new Date().toISOString().split('T')[0]
}

const selectDate = (date: string) => {
  selectedDate.value = date
  showEventsPanel.value = true
}

const isSelected = (date: string): boolean => {
  return date === selectedDate.value
}

const openEventModal = (date?: string) => {
  if (date) {
    selectedDate.value = date
  }
  newEvent.value = {
    date: selectedDate.value || '',
    time: '',
    title: '',
    description: ''
  }
  showEventModal.value = true
}

const closeEventModal = () => {
  showEventModal.value = false
}

const saveEvent = () => {
  if (!newEvent.value.title.trim()) {
    alert('请输入事件标题')
    return
  }

  const event: Event = {
    id: Date.now().toString(),
    date: newEvent.value.date || '',
    time: newEvent.value.time || '',
    title: newEvent.value.title,
    description: newEvent.value.description || '',
    completed: false
  }

  events.value.push(event)
  saveEvents()
  closeEventModal()
}

const hasEvents = (date: string): boolean => {
  return events.value.some(e => e.date === date)
}

const getEvents = (date: string): Event[] => {
  return events.value.filter(e => e.date === date)
}

const toggleEventComplete = (id: string) => {
  const event = events.value.find(e => e.id === id)
  if (event) {
    event.completed = !event.completed
    saveEvents()
  }
}

const deleteEvent = (id: string) => {
  events.value = events.value.filter(e => e.id !== id)
  saveEvents()
}

const saveEvents = () => {
  try {
    localStorage.setItem('calendar-events', JSON.stringify(events.value))
  } catch (e) {
    console.error('保存事件失败:', e)
  }
}

const loadEvents = () => {
  try {
    const saved = localStorage.getItem('calendar-events')
    if (saved) {
      events.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('加载事件失败:', e)
  }
}

onMounted(() => {
  loadEvents()
  selectedDate.value = new Date().toISOString().split('T')[0]
})
</script>

<style scoped>
.calendar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  color: var(--color-text);
  padding: 20px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.nav-button {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.month-year h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.calendar-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 10px 0;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  flex: 1;
}

.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 5px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: var(--color-surface);
  min-height: 60px;
  position: relative;
}

.day:hover {
  background: var(--color-primary);
  color: white;
  transform: scale(1.05);
}

.day.other-month {
  opacity: 0.3;
}

.day.today {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
}

.day.selected {
  border: 2px solid var(--color-primary);
}

.day.has-events {
  background: var(--color-surface);
  border-left: 3px solid var(--color-primary);
}

.day.has-events:hover {
  background: var(--color-primary);
  border-left-color: white;
}

.day-number {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
}

.event-dots {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
}

.event-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
}

.calendar-footer {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.today-button,
.event-button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.today-button {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.today-button:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.event-button {
  background: var(--color-primary);
  color: white;
}

.event-button:hover {
  background: var(--color-primary-dark);
  transform: scale(1.02);
}

.events-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  padding: 20px;
  overflow-y: auto;
  z-index: 10;
}

.events-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.events-panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text);
  padding: 5px;
  line-height: 1;
}

.close-button:hover {
  color: var(--color-primary);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.no-events {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 20px;
}

.event-item {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.event-item:hover {
  border-color: var(--color-primary);
}

.event-item.completed {
  opacity: 0.5;
}

.event-item.completed .event-title {
  text-decoration: line-through;
}

.event-info {
  flex: 1;
}

.event-title {
  font-weight: 600;
  margin-bottom: 5px;
}

.event-time {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.event-actions {
  display: flex;
  gap: 5px;
}

.action-button {
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
  color: var(--color-text);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: var(--color-surface);
}

.action-button.complete:hover {
  color: #4caf50;
}

.action-button.delete:hover {
  color: #f44336;
}

.event-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.event-modal {
  background: var(--color-surface);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.event-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
}

.event-modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.event-modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.event-modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid var(--color-border);
}

.cancel-button,
.save-button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cancel-button {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.cancel-button:hover {
  background: var(--color-background);
}

.save-button {
  background: var(--color-primary);
  color: white;
}

.save-button:hover {
  background: var(--color-primary-dark);
  transform: scale(1.02);
}
</style>
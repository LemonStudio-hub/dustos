<template>
  <div class="task-list">
    <div class="task-list-header">
      <h2>任务列表</h2>
      <div class="header-actions">
        <button class="filter-btn" :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
        <button class="filter-btn" :class="{ active: filter === 'active' }" @click="filter = 'active'">进行中</button>
        <button class="filter-btn" :class="{ active: filter === 'completed' }" @click="filter = 'completed'">已完成</button>
      </div>
    </div>

    <div class="task-list-content">
      <!-- 添加任务 -->
      <div class="add-task">
        <input
          v-model="newTask"
          type="text"
          placeholder="添加新任务..."
          @keyup.enter="addTask"
        />
        <button class="add-btn" @click="addTask">添加</button>
      </div>

      <!-- 任务统计 -->
      <div class="task-stats">
        <div class="stat-item">
          <span class="stat-label">总任务</span>
          <span class="stat-value">{{ tasks.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">进行中</span>
          <span class="stat-value active">{{ activeTasks.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已完成</span>
          <span class="stat-value completed">{{ completedTasks.length }}</span>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="tasks">
        <transition-group name="task">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed }"
          >
            <div class="task-checkbox" @click="toggleTask(task.id)">
              <span v-if="task.completed" class="check-icon">✓</span>
            </div>
            <div class="task-content">
              <div class="task-text">{{ task.text }}</div>
              <div class="task-meta">
                <span class="task-date">{{ formatDate(task.createdAt) }}</span>
                <span v-if="task.priority === 'high'" class="task-priority high">高优先级</span>
                <span v-if="task.priority === 'medium'" class="task-priority medium">中优先级</span>
                <span v-if="task.priority === 'low'" class="task-priority low">低优先级</span>
              </div>
            </div>
            <div class="task-actions">
              <button class="action-btn priority-btn" @click="cyclePriority(task.id)" title="切换优先级">
                {{ getPriorityIcon(task.priority) }}
              </button>
              <button class="action-btn edit-btn" @click="editTask(task.id)" title="编辑">
                ✏️
              </button>
              <button class="action-btn delete-btn" @click="deleteTask(task.id)" title="删除">
                🗑️
              </button>
            </div>
          </div>
        </transition-group>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-text">暂无任务</div>
        <div class="empty-hint">添加一个新任务开始吧！</div>
      </div>

      <!-- 批量操作 -->
      <div v-if="hasTasks" class="bulk-actions">
        <button class="bulk-btn" @click="markAllCompleted">全部完成</button>
        <button class="bulk-btn" @click="clearCompleted">清除已完成</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface Task {
  id: string
  text: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  createdAt: Date
}

const tasks = useLocalStorage<Task[]>('tasklist_tasks', [])
const newTask = ref('')
const filter = ref<'all' | 'active' | 'completed'>('all')
const editingTaskId = ref<string | null>(null)

const activeTasks = computed(() => tasks.value.filter(t => !t.completed))
const completedTasks = computed(() => tasks.value.filter(t => t.completed))

const filteredTasks = computed(() => {
  if (filter.value === 'active') return activeTasks.value
  if (filter.value === 'completed') return completedTasks.value
  return tasks.value
})

const hasTasks = computed(() => tasks.value.length > 0)

function addTask() {
  if (newTask.value.trim()) {
    tasks.value.unshift({
      id: Date.now().toString(),
      text: newTask.value.trim(),
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
    })
    newTask.value = ''
  }
}

function toggleTask(id: string) {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    task.completed = !task.completed
  }
}

function editTask(id: string) {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    const newText = prompt('编辑任务:', task.text)
    if (newText !== null && newText.trim()) {
      task.text = newText.trim()
    }
  }
}

function deleteTask(id: string) {
  if (confirm('确定要删除这个任务吗？')) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index > -1) {
      tasks.value.splice(index, 1)
    }
  }
}

function cyclePriority(id: string) {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    const priorities: ('high' | 'medium' | 'low')[] = ['low', 'medium', 'high']
    const currentIndex = priorities.indexOf(task.priority)
    task.priority = priorities[(currentIndex + 1) % priorities.length]
  }
}

function getPriorityIcon(priority: string) {
  const icons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  }
  return icons[priority as keyof typeof icons] || '🟡'
}

function markAllCompleted() {
  if (confirm('确定要将所有任务标记为已完成吗？')) {
    tasks.value.forEach(t => t.completed = true)
  }
}

function clearCompleted() {
  if (confirm('确定要清除所有已完成的任务吗？')) {
    tasks.value = tasks.value.filter(t => !t.completed)
  }
}

function formatDate(date: Date) {
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
  // 初始化一些示例任务
  if (tasks.value.length === 0) {
    tasks.value = [
      { id: '1', text: '完成项目文档', completed: false, priority: 'high', createdAt: new Date(Date.now() - 3600000) },
      { id: '2', text: '修复系统bug', completed: false, priority: 'medium', createdAt: new Date(Date.now() - 7200000) },
      { id: '3', text: '学习新技术', completed: true, priority: 'low', createdAt: new Date(Date.now() - 86400000) },
    ]
  }
})
</script>

<style scoped>
.task-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  color: #333;
}

.task-list.dark {
  background: #1a1a2e;
  color: #e0e0e0;
}

.task-list-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.task-list.dark .task-list-header {
  background: #16213e;
  border-bottom-color: #2a2a4e;
}

.task-list-header h2 {
  margin: 0 0 15px 0;
  font-size: 24px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.task-list.dark .filter-btn {
  border-color: #2a2a4e;
  background: #1a1a2e;
  color: #e0e0e0;
}

.filter-btn:hover {
  background: #f0f0f0;
}

.task-list.dark .filter-btn:hover {
  background: #2a2a4e;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.task-list-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.add-task {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.add-task input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.task-list.dark .add-task input {
  background: #1a1a2e;
  border-color: #2a2a4e;
  color: #e0e0e0;
}

.add-task input:focus {
  outline: none;
  border-color: #667eea;
}

.add-btn {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #5568d3;
}

.task-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.stat-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.task-list.dark .stat-item {
  background: #16213e;
}

.stat-label {
  display: block;
  font-size: 12px;
  opacity: 0.6;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
}

.stat-value.active {
  color: #22c55e;
}

.stat-value.completed {
  color: #667eea;
}

.tasks {
  margin-bottom: 20px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: all 0.2s;
}

.task-list.dark .task-item {
  background: #16213e;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
  opacity: 0.6;
}

.task-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.task-list.dark .task-checkbox {
  border-color: #2a2a4e;
}

.task-checkbox:hover {
  border-color: #667eea;
}

.task-item.completed .task-checkbox {
  background: #22c55e;
  border-color: #22c55e;
}

.check-icon {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-text {
  font-size: 16px;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.task-item.completed .task-text {
  text-decoration: line-through;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.task-date {
  font-size: 12px;
  opacity: 0.6;
}

.task-priority {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.task-priority.high {
  background: #fee2e2;
  color: #ef4444;
}

.task-priority.medium {
  background: #fef3c7;
  color: #f59e0b;
}

.task-priority.low {
  background: #d1fae5;
  color: #22c55e;
}

.task-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #f0f0f0;
}

.task-list.dark .action-btn:hover {
  background: #2a2a4e;
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

.bulk-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.bulk-btn {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.bulk-btn:hover {
  background: #5568d3;
}

.task-enter-active,
.task-leave-active {
  transition: all 0.3s;
}

.task-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.task-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@media (max-width: 768px) {
  .task-stats {
    grid-template-columns: 1fr;
  }

  .task-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .task-actions {
    flex-direction: column;
  }
}
</style>
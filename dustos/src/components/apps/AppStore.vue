<template>
  <div class="app-store">
    <div class="store-header">
      <h2>应用商店</h2>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索应用..."
        />
      </div>
    </div>

    <div class="store-categories">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-btn"
        :class="{ active: selectedCategory === category.id }"
        @click="selectedCategory = category.id"
      >
        {{ category.icon }} {{ category.name }}
      </button>
    </div>

    <div class="store-content">
      <div class="app-grid">
        <div
          v-for="app in filteredApps"
          :key="app.id"
          class="app-card"
          @click="showAppDetail(app)"
        >
          <div class="app-icon">{{ app.icon }}</div>
          <div class="app-info">
            <div class="app-name">{{ app.name }}</div>
            <div class="app-category">{{ app.category }}</div>
            <div class="app-rating">
              {{ '⭐'.repeat(Math.floor(app.rating)) }}
              <span class="rating-value">{{ app.rating }}</span>
            </div>
            <div class="app-price">{{ app.installed ? '已安装' : '免费' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 应用详情对话框 -->
    <div v-if="selectedApp" class="app-detail-modal" @click.self="selectedApp = null">
      <div class="modal-content">
        <div class="modal-header">
          <div class="app-header">
            <div class="app-icon-large">{{ selectedApp.icon }}</div>
            <div class="app-header-info">
              <h3>{{ selectedApp.name }}</h3>
              <div class="app-meta">
                <span class="app-category">{{ selectedApp.category }}</span>
                <span class="app-rating">{{ selectedApp.rating }} ⭐</span>
                <span class="app-downloads">{{ selectedApp.downloads }} 下载</span>
              </div>
            </div>
          </div>
          <button class="close-btn" @click="selectedApp = null">✕</button>
        </div>

        <div class="modal-body">
          <div class="app-description">
            <h4>简介</h4>
            <p>{{ selectedApp.description }}</p>
          </div>

          <div class="app-features" v-if="selectedApp.features">
            <h4>功能特点</h4>
            <ul>
              <li v-for="(feature, index) in selectedApp.features" :key="index">
                {{ feature }}
              </li>
            </ul>
          </div>

          <div class="app-screenshots" v-if="selectedApp.screenshots">
            <h4>截图</h4>
            <div class="screenshot-list">
              <div
                v-for="(screenshot, index) in selectedApp.screenshots"
                :key="index"
                class="screenshot-item"
              >
                {{ screenshot }}
              </div>
            </div>
          </div>

          <div class="app-reviews" v-if="selectedApp.reviews">
            <h4>用户评价</h4>
            <div class="review-list">
              <div
                v-for="(review, index) in selectedApp.reviews"
                :key="index"
                class="review-item"
              >
                <div class="review-header">
                  <span class="review-user">{{ review.user }}</span>
                  <span class="review-rating">{{ '⭐'.repeat(review.rating) }}</span>
                  <span class="review-date">{{ review.date }}</span>
                </div>
                <div class="review-text">{{ review.text }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="install-btn"
            :class="{ installed: selectedApp.installed }"
            @click="toggleAppInstallation"
          >
            {{ selectedApp.installed ? '卸载' : '安装' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface App {
  id: string
  name: string
  icon: string
  category: string
  description: string
  rating: number
  downloads: number
  installed: boolean
  features?: string[]
  screenshots?: string[]
  reviews?: Review[]
}

interface Review {
  user: string
  rating: number
  text: string
  date: string
}

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedApp = ref<App | null>(null)

const categories = [
  { id: 'all', name: '全部', icon: '📱' },
  { id: 'productivity', name: '生产力', icon: '📊' },
  { id: 'entertainment', name: '娱乐', icon: '🎮' },
  { id: 'tools', name: '工具', icon: '🔧' },
  { id: 'media', name: '媒体', icon: '🎬' },
  { id: 'system', name: '系统', icon: '⚙️' }
]

const allApps: App[] = [
  {
    id: '1',
    name: '文件管理器',
    icon: '📁',
    category: 'productivity',
    description: '完整的文件管理解决方案，支持文件夹操作、搜索、预览等功能。',
    rating: 4.8,
    downloads: 15420,
    installed: true,
    features: [
      '创建、删除、重命名文件和文件夹',
      '文件搜索和过滤',
      '文件预览功能',
      '拖拽文件操作',
      '路径导航和历史记录'
    ],
    reviews: [
      { user: '用户A', rating: 5, text: '非常好用的文件管理器！', date: '2024-01-15' },
      { user: '用户B', rating: 4, text: '功能齐全，使用流畅。', date: '2024-01-10' }
    ]
  },
  {
    id: '2',
    name: '终端',
    icon: '💻',
    category: 'tools',
    description: '强大的命令行终端，支持多种命令和快捷键。',
    rating: 4.9,
    downloads: 23150,
    installed: true,
    features: [
      '完整的Linux命令支持',
      '命令历史和自动补全',
      '自定义颜色主题',
      '多标签页支持'
    ],
    reviews: [
      { user: '用户C', rating: 5, text: '开发者必备工具！', date: '2024-01-20' }
    ]
  },
  {
    id: '3',
    name: '扫雷',
    icon: '💣',
    category: 'entertainment',
    description: '经典的扫雷游戏，三种难度级别，挑战你的逻辑思维。',
    rating: 4.7,
    downloads: 32890,
    installed: true,
    features: [
      '三种难度级别',
      '自定义游戏设置',
      '计时和计分功能',
      '最高分记录'
    ],
    reviews: [
      { user: '用户D', rating: 5, text: '童年回忆，玩不腻！', date: '2024-01-18' }
    ]
  },
  {
    id: '4',
    name: '贪吃蛇',
    icon: '🐍',
    category: 'entertainment',
    description: '经典的贪吃蛇游戏，多种速度选择，挑战最高分。',
    rating: 4.6,
    downloads: 28450,
    installed: true,
    features: [
      '多种速度选择',
      '触摸屏控制支持',
      '最高分记录',
      '平滑的动画效果'
    ],
    reviews: [
      { user: '用户E', rating: 4, text: '游戏体验很好！', date: '2024-01-12' }
    ]
  },
  {
    id: '5',
    name: '代码编辑器',
    icon: '📝',
    category: 'productivity',
    description: '功能丰富的代码编辑器，支持多种编程语言和语法高亮。',
    rating: 4.8,
    downloads: 18960,
    installed: true,
    features: [
      '多语言语法高亮',
      '代码折叠功能',
      '多文件编辑',
      '自动补全和代码片段'
    ],
    reviews: [
      { user: '用户F', rating: 5, text: '开发利器！', date: '2024-01-22' }
    ]
  },
  {
    id: '6',
    name: '音乐播放器',
    icon: '🎵',
    category: 'media',
    description: '优雅的音乐播放器，支持播放列表和多种音效设置。',
    rating: 4.7,
    downloads: 21450,
    installed: true,
    features: [
      '播放列表管理',
      '随机播放和循环模式',
      '均衡器设置',
      '歌词显示'
    ],
    reviews: [
      { user: '用户G', rating: 5, text: '音质很好，功能丰富！', date: '2024-01-16' }
    ]
  },
  {
    id: '7',
    name: '视频播放器',
    icon: '🎬',
    category: 'media',
    description: '功能强大的视频播放器，支持多种格式和画中画模式。',
    rating: 4.6,
    downloads: 17680,
    installed: true,
    features: [
      '多种视频格式支持',
      '画中画模式',
      '播放速度控制',
      '字幕支持'
    ],
    reviews: [
      { user: '用户H', rating: 4, text: '播放流畅，功能齐全。', date: '2024-01-14' }
    ]
  },
  {
    id: '8',
    name: '天气',
    icon: '🌤️',
    category: 'tools',
    description: '实时天气预报，支持多城市查询和未来7天预报。',
    rating: 4.5,
    downloads: 24320,
    installed: true,
    features: [
      '实时天气显示',
      '未来7天预报',
      '24小时预报',
      '天气预警提示'
    ],
    reviews: [
      { user: '用户I', rating: 5, text: '天气预报很准确！', date: '2024-01-19' }
    ]
  },
  {
    id: '9',
    name: '日历',
    icon: '📅',
    category: 'productivity',
    description: '功能完整的日历应用，支持事件管理和提醒功能。',
    rating: 4.7,
    downloads: 19230,
    installed: true,
    features: [
      '月历视图',
      '事件管理',
      '提醒功能',
      '多视图切换'
    ],
    reviews: [
      { user: '用户J', rating: 4, text: '日历功能很实用！', date: '2024-01-11' }
    ]
  }
]

const filteredApps = computed(() => {
  return allApps.filter(app => {
    const matchesCategory = selectedCategory.value === 'all' || app.category === selectedCategory.value
    const matchesSearch = !searchQuery.value || 
      app.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

function showAppDetail(app: App) {
  selectedApp.value = app
}

function toggleAppInstallation() {
  if (!selectedApp.value) return
  
  selectedApp.value.installed = !selectedApp.value.installed
  
  if (selectedApp.value.installed) {
    selectedApp.value.downloads++
  }
}
</script>

<style scoped>
.app-store {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  color: #333;
}

.app-store.dark {
  background: #1a1a2e;
  color: #e0e0e0;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.app-store.dark .store-header {
  background: #16213e;
  border-bottom-color: #2a2a4e;
}

.store-header h2 {
  margin: 0;
  font-size: 24px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 8px 12px;
  width: 300px;
}

.app-store.dark .search-box {
  background: #2a2a4e;
}

.search-icon {
  font-size: 14px;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
}

.app-store.dark .search-box input {
  color: #e0e0e0;
}

.store-categories {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  overflow-x: auto;
}

.app-store.dark .store-categories {
  background: #16213e;
  border-bottom-color: #2a2a4e;
}

.category-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.2s;
}

.app-store.dark .category-btn {
  border-color: #2a2a4e;
  background: #1a1a2e;
  color: #e0e0e0;
}

.category-btn:hover {
  background: #f0f0f0;
}

.app-store.dark .category-btn:hover {
  background: #2a2a4e;
}

.category-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.store-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.app-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-store.dark .app-card {
  background: #16213e;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.app-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.app-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.app-category {
  font-size: 12px;
  opacity: 0.6;
  margin-bottom: 8px;
}

.app-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 14px;
}

.rating-value {
  font-weight: 600;
}

.app-price {
  display: inline-block;
  padding: 4px 12px;
  background: #667eea;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.app-card .app-price {
  background: #22c55e;
}

/* 应用详情对话框 */
.app-detail-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.app-store.dark .modal-content {
  background: #16213e;
  color: #e0e0e0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.app-store.dark .modal-header {
  border-bottom-color: #2a2a4e;
}

.app-header {
  display: flex;
  gap: 16px;
}

.app-icon-large {
  font-size: 64px;
}

.app-header-info {
  flex: 1;
}

.app-header-info h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.app-meta {
  display: flex;
  gap: 12px;
  font-size: 14px;
}

.app-meta span {
  opacity: 0.6;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  background: transparent;
  color: #333;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.app-store.dark .close-btn {
  border-color: #2a2a4e;
  color: #e0e0e0;
}

.close-btn:hover {
  background: #f0f0f0;
}

.app-store.dark .close-btn:hover {
  background: #2a2a4e;
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.app-description,
.app-features,
.app-screenshots,
.app-reviews {
  margin-bottom: 24px;
}

.app-description h4,
.app-features h4,
.app-screenshots h4,
.app-reviews h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
}

.app-description p {
  line-height: 1.6;
  opacity: 0.8;
}

.app-features ul {
  margin: 0;
  padding-left: 20px;
}

.app-features li {
  margin-bottom: 8px;
  opacity: 0.8;
}

.screenshot-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
}

.screenshot-item {
  flex-shrink: 0;
  width: 200px;
  height: 150px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}

.app-store.dark .screenshot-item {
  background: #2a2a4e;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.app-store.dark .review-item {
  background: #1a1a2e;
}

.review-header {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.review-user {
  font-weight: 600;
}

.review-date {
  margin-left: auto;
  opacity: 0.6;
  font-size: 12px;
}

.review-text {
  opacity: 0.8;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.app-store.dark .modal-footer {
  border-top-color: #2a2a4e;
}

.install-btn {
  padding: 12px 32px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.install-btn:hover {
  background: #5568d3;
}

.install-btn.installed {
  background: #ef4444;
}

.install-btn.installed:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .store-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
  
  .app-grid {
    grid-template-columns: 1fr;
  }
}
</style>
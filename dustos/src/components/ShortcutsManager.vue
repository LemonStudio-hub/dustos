<template>
  <div class="shortcuts-manager">
    <div class="shortcuts-header">
      <h2>快捷键管理</h2>
      <p>查看和自定义系统快捷键</p>
    </div>

    <div class="shortcuts-categories">
      <div
        v-for="category in shortcutCategories"
        :key="category.id"
        class="category-section"
      >
        <h3 class="category-title">{{ category.name }}</h3>
        <div class="shortcuts-list">
          <div
            v-for="shortcut in category.shortcuts"
            :key="shortcut.id"
            class="shortcut-item"
            :class="{ editing: editingShortcut === shortcut.id }"
          >
            <div class="shortcut-info">
              <div class="shortcut-icon">{{ shortcut.icon }}</div>
              <div class="shortcut-details">
                <div class="shortcut-name">{{ shortcut.name }}</div>
                <div class="shortcut-description">{{ shortcut.description }}</div>
              </div>
            </div>
            <div class="shortcut-keys">
              <div v-if="editingShortcut !== shortcut.id" class="keys-display">
                <kbd v-for="(key, index) in shortcut.keys" :key="index">{{ key }}</kbd>
              </div>
              <div v-else class="keys-editor">
                <input
                  v-model="newKeys"
                  type="text"
                  placeholder="按下快捷键..."
                  @keydown="handleKeydown"
                  @focus="captureFocus"
                  @blur="cancelEdit"
                  ref="keyInput"
                  class="key-input"
                />
              </div>
              <button
                v-if="editingShortcut !== shortcut.id"
                class="edit-button"
                @click="startEdit(shortcut)"
                title="编辑快捷键"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button
                v-else
                class="save-button"
                @click="saveEdit(shortcut)"
                title="保存"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="shortcuts-actions">
      <button class="action-button reset" @click="resetToDefaults">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"></path><path d="M3 3v9h9"></path></svg>
        重置为默认
      </button>
      <button class="action-button export" @click="exportShortcuts">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        导出配置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Shortcut {
  id: string
  name: string
  description: string
  keys: string[]
  icon: string
  defaultKeys: string[]
}

interface ShortcutCategory {
  id: string
  name: string
  shortcuts: Shortcut[]
}

const editingShortcut = ref<string | null>(null)
const newKeys = ref('')
const keyInput = ref<HTMLInputElement | null>(null)
let capturedKeys: string[] = []

const shortcutCategories = ref<ShortcutCategory[]>([
  {
    id: 'window',
    name: '窗口管理',
    shortcuts: [
      {
        id: 'close-window',
        name: '关闭窗口',
        description: '关闭当前活动窗口',
        keys: ['Alt', 'F4'],
        icon: '✕',
        defaultKeys: ['Alt', 'F4']
      },
      {
        id: 'minimize-window',
        name: '最小化窗口',
        description: '最小化当前窗口',
        keys: ['Meta', 'M'],
        icon: '─',
        defaultKeys: ['Meta', 'M']
      },
      {
        id: 'maximize-window',
        name: '最大化窗口',
        description: '最大化/还原当前窗口',
        keys: ['Meta', '↑'],
        icon: '□',
        defaultKeys: ['Meta', '↑']
      },
      {
        id: 'switch-window',
        name: '切换窗口',
        description: '在打开的窗口之间切换',
        keys: ['Alt', 'Tab'],
        icon: '🔄',
        defaultKeys: ['Alt', 'Tab']
      },
      {
        id: 'show-desktop',
        name: '显示桌面',
        description: '最小化所有窗口显示桌面',
        keys: ['Meta', 'D'],
        icon: '🖥️',
        defaultKeys: ['Meta', 'D']
      }
    ]
  },
  {
    id: 'system',
    name: '系统操作',
    shortcuts: [
      {
        id: 'lock-screen',
        name: '锁定屏幕',
        description: '锁定计算机屏幕',
        keys: ['Meta', 'L'],
        icon: '🔒',
        defaultKeys: ['Meta', 'L']
      },
      {
        id: 'global-search',
        name: '全局搜索',
        description: '打开全局搜索',
        keys: ['Ctrl', 'Space'],
        icon: '🔍',
        defaultKeys: ['Ctrl', 'Space']
      },
      {
        id: 'open-settings',
        name: '打开设置',
        description: '打开系统设置',
        keys: ['Ctrl', ','],
        icon: '⚙️',
        defaultKeys: ['Ctrl', ',']
      },
      {
        id: 'open-terminal',
        name: '打开终端',
        description: '打开命令行终端',
        keys: ['Ctrl', 'Alt', 'T'],
        icon: '⌨️',
        defaultKeys: ['Ctrl', 'Alt', 'T']
      }
    ]
  },
  {
    id: 'navigation',
    name: '导航操作',
    shortcuts: [
      {
        id: 'go-back',
        name: '返回',
        description: '返回上一页/上一目录',
        keys: ['Alt', '←'],
        icon: '←',
        defaultKeys: ['Alt', '←']
      },
      {
        id: 'go-forward',
        name: '前进',
        description: '前进到下一页/下一目录',
        keys: ['Alt', '→'],
        icon: '→',
        defaultKeys: ['Alt', '→']
      },
      {
        id: 'go-up',
        name: '向上',
        description: '返回上一级目录',
        keys: ['Alt', '↑'],
        icon: '↑',
        defaultKeys: ['Alt', '↑']
      },
      {
        id: 'refresh',
        name: '刷新',
        description: '刷新当前视图',
        keys: ['F5'],
        icon: '🔄',
        defaultKeys: ['F5']
      }
    ]
  }
])

function startEdit(shortcut: Shortcut) {
  editingShortcut.value = shortcut.id
  newKeys.value = shortcut.keys.join(' + ')
  capturedKeys = [...shortcut.keys]
  
  // 自动聚焦输入框
  setTimeout(() => {
    keyInput.value?.focus()
  }, 100)
}

function captureFocus() {
  newKeys.value = ''
  capturedKeys = []
}

function handleKeydown(e: KeyboardEvent) {
  e.preventDefault()
  e.stopPropagation()
  
  // 处理特殊键
  const keyMap: { [key: string]: string } = {
    ' ': 'Space',
    'Control': 'Ctrl',
    'Meta': 'Meta',
    'Alt': 'Alt',
    'Shift': 'Shift',
    'Escape': 'Esc',
    'Delete': 'Del',
    'Insert': 'Ins',
    'Home': 'Home',
    'End': 'End',
    'PageUp': 'PgUp',
    'PageDown': 'PgDn',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→'
  }
  
  const key = keyMap[e.key] || e.key
  
  // 添加到捕获的键列表
  if (!capturedKeys.includes(key)) {
    capturedKeys.push(key)
  }
  
  // 更新显示
  newKeys.value = capturedKeys.join(' + ')
}

function saveEdit(shortcut: Shortcut) {
  if (capturedKeys.length > 0) {
    shortcut.keys = [...capturedKeys]
    saveShortcuts()
  }
  cancelEdit()
}

function cancelEdit() {
  editingShortcut.value = null
  newKeys.value = ''
  capturedKeys = []
}

function resetToDefaults() {
  if (confirm('确定要重置所有快捷键为默认值吗？')) {
    shortcutCategories.value.forEach(category => {
      category.shortcuts.forEach(shortcut => {
        shortcut.keys = [...shortcut.defaultKeys]
      })
    })
    saveShortcuts()
  }
}

function exportShortcuts() {
  const config = shortcutCategories.value.map(category => ({
    name: category.name,
    shortcuts: category.shortcuts.map(s => ({
      name: s.name,
      keys: s.keys
    }))
  }))
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'shortcuts-config.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function saveShortcuts() {
  const config = shortcutCategories.value.map(category => ({
    id: category.id,
    shortcuts: category.shortcuts.map(s => ({
      id: s.id,
      keys: s.keys
    }))
  }))
  localStorage.setItem('dustos_shortcuts', JSON.stringify(config))
}

function loadShortcuts() {
  const saved = localStorage.getItem('dustos_shortcuts')
  if (saved) {
    try {
      const config = JSON.parse(saved)
      config.forEach((categoryConfig: any) => {
        const category = shortcutCategories.value.find(c => c.id === categoryConfig.id)
        if (category) {
          categoryConfig.shortcuts.forEach((shortcutConfig: any) => {
            const shortcut = category.shortcuts.find(s => s.id === shortcutConfig.id)
            if (shortcut) {
              shortcut.keys = shortcutConfig.keys
            }
          })
        }
      })
    } catch (e) {
      console.error('加载快捷键配置失败:', e)
    }
  }
}

onMounted(() => {
  loadShortcuts()
})

onUnmounted(() => {
  // 组件卸载时保存配置
  saveShortcuts()
})
</script>

<style scoped>
.shortcuts-manager {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.shortcuts-header {
  text-align: center;
  margin-bottom: 30px;
}

.shortcuts-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.shortcuts-header p {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.shortcuts-categories {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.category-section {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-border);
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 8px;
  background: var(--color-background);
  transition: all 0.2s ease;
}

.shortcut-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.shortcut-item.editing {
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid var(--color-primary);
}

.shortcut-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.shortcut-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.shortcut-details {
  flex: 1;
}

.shortcut-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 4px;
}

.shortcut-description {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 12px;
}

.keys-display {
  display: flex;
  gap: 4px;
}

.keys-display kbd {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-family: monospace;
  color: var(--color-text);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.keys-editor {
  width: 200px;
}

.key-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  font-size: 13px;
  font-family: monospace;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
}

.edit-button,
.save-button {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: var(--color-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  transition: all 0.2s ease;
  padding: 0;
}

.edit-button:hover {
  background: var(--color-primary);
  color: white;
}

.save-button {
  background: var(--color-primary);
  color: white;
}

.save-button:hover {
  background: var(--color-primary-dark);
}

.edit-button svg,
.save-button svg {
  width: 16px;
  height: 16px;
}

.shortcuts-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 30px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.reset {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.action-button.reset:hover {
  background: var(--color-border);
}

.action-button.export {
  background: var(--color-primary);
  color: white;
}

.action-button.export:hover {
  background: var(--color-primary-dark);
  transform: scale(1.02);
}

.action-button svg {
  width: 18px;
  height: 18px;
}
</style>
<template>
  <div class="notepad" @click="focusEditor">
    <div class="notepad-toolbar">
      <div class="menu-bar">
        <div class="menu-item" @click="toggleMenu('file')" :class="{ active: activeMenu === 'file' }">
          文件
        </div>
        <div class="menu-item" @click="toggleMenu('edit')" :class="{ active: activeMenu === 'edit' }">
          编辑
        </div>
        <div class="menu-item" @click="toggleMenu('format')" :class="{ active: activeMenu === 'format' }">
          格式
        </div>
        <div class="menu-item" @click="toggleMenu('view')" :class="{ active: activeMenu === 'view' }">
          查看
        </div>
      </div>
    </div>

    <!-- 文件菜单下拉 -->
    <div v-if="activeMenu === 'file'" class="dropdown-menu file-menu">
      <div class="menu-item" @click="newFile">新建</div>
      <div class="menu-item" @click="openFile">打开...</div>
      <div class="menu-item" @click="saveFile">保存</div>
      <div class="menu-item" @click="saveFileAs">另存为...</div>
      <div class="separator"></div>
      <div class="menu-item" @click="showFileInfo">文件信息</div>
    </div>

    <!-- 编辑菜单下拉 -->
    <div v-if="activeMenu === 'edit'" class="dropdown-menu edit-menu">
      <div class="menu-item" @click="undo" :disabled="!canUndo">撤销</div>
      <div class="menu-item" @click="redo" :disabled="!canRedo">重做</div>
      <div class="separator"></div>
      <div class="menu-item" @click="cut">剪切</div>
      <div class="menu-item" @click="copy">复制</div>
      <div class="menu-item" @click="paste">粘贴</div>
      <div class="separator"></div>
      <div class="menu-item" @click="selectAll">全选</div>
      <div class="menu-item" @click="showFindDialog">查找...</div>
      <div class="menu-item" @click="showReplaceDialog">替换...</div>
    </div>

    <!-- 格式菜单下拉 -->
    <div v-if="activeMenu === 'format'" class="dropdown-menu format-menu">
      <div class="menu-item" @click="toggleWordWrap">自动换行</div>
      <div class="menu-item" @click="toggleLineNumbers">显示行号</div>
      <div class="separator"></div>
      <div class="menu-item" @click="changeFontSize('small')">小字体</div>
      <div class="menu-item" @click="changeFontSize('medium')">中字体</div>
      <div class="menu-item" @click="changeFontSize('large')">大字体</div>
    </div>

    <!-- 查看菜单下拉 -->
    <div v-if="activeMenu === 'view'" class="dropdown-menu view-menu">
      <div class="menu-item" @click="zoomIn">放大</div>
      <div class="menu-item" @click="zoomOut">缩小</div>
      <div class="menu-item" @click="resetZoom">重置缩放</div>
    </div>

    <div class="format-toolbar">
      <button class="format-button" @click="undo" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 14L4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path></svg>
      </button>
      <button class="format-button" @click="redo" :disabled="!canRedo" title="重做 (Ctrl+Y)">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14l5-5-5-5"></path><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"></path></svg>
      </button>
      <div class="separator"></div>
      <button class="format-button" @click="cut" title="剪切 (Ctrl+X)">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
      </button>
      <button class="format-button" @click="copy" title="复制 (Ctrl+C)">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
      <button class="format-button" @click="paste" title="粘贴 (Ctrl+V)">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
      </button>
      <div class="separator"></div>
      <select v-model="fontSize" @change="applyFontSize" class="font-size-select" title="字体大小">
        <option value="12">12</option>
        <option value="14">14</option>
        <option value="16">16</option>
        <option value="18">18</option>
        <option value="20">20</option>
        <option value="24">24</option>
      </select>
      <div class="separator"></div>
      <button class="format-button" @click="toggleWordWrap" :class="{ active: wordWrap }" title="自动换行">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
      </button>
      <button class="format-button" @click="showFindDialog" title="查找 (Ctrl+F)">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </button>
    </div>

    <div class="editor-container">
      <div v-if="showLineNumbers" class="line-numbers">
        <div v-for="line in lineCount" :key="line" class="line-number">{{ line }}</div>
      </div>
      <textarea
        ref="editorRef"
        v-model="content"
        class="notepad-content"
        :class="{ 'with-line-numbers': showLineNumbers, 'word-wrap': wordWrap }"
        :style="{ fontSize: fontSize + 'px' }"
        placeholder="在这里输入文字..."
        @input="onInput"
        @scroll="syncScroll"
        @keydown="handleKeydown"
      ></textarea>
    </div>

    <div class="status-bar">
      <span>行 {{ currentLine }}, 列 {{ currentCol }}</span>
      <span>{{ characterCount }} 个字符</span>
      <span>{{ wordCount }} 个词</span>
      <span>{{ zoom }}%</span>
    </div>

    <!-- 查找对话框 -->
    <div v-if="showFind" class="modal-overlay" @click.self="showFind = false">
      <div class="modal">
        <h3>查找</h3>
        <input v-model="findText" type="text" placeholder="查找内容" ref="findInput" @keyup.enter="findNext">
        <div class="find-controls">
          <button class="btn" @click="findPrevious">上一个</button>
          <button class="btn" @click="findNext">下一个</button>
          <span class="find-result">{{ findResult }}</span>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="showFind = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- 替换对话框 -->
    <div v-if="showReplace" class="modal-overlay" @click.self="showReplace = false">
      <div class="modal">
        <h3>替换</h3>
        <input v-model="findText" type="text" placeholder="查找内容" ref="replaceInput" @keyup.enter="findNext">
        <input v-model="replaceText" type="text" placeholder="替换为" @keyup.enter="replaceNext">
        <div class="replace-controls">
          <button class="btn" @click="replaceNext">替换</button>
          <button class="btn" @click="replaceAll">全部替换</button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showReplace = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- 文件信息对话框 -->
    <div v-if="showInfo" class="modal-overlay" @click.self="showInfo = false">
      <div class="modal">
        <h3>文件信息</h3>
        <div class="info-list">
          <div class="info-row">
            <span>字符数：</span>
            <span>{{ characterCount }}</span>
          </div>
          <div class="info-row">
            <span>词数：</span>
            <span>{{ wordCount }}</span>
          </div>
          <div class="info-row">
            <span>行数：</span>
            <span>{{ lineCount }}</span>
          </div>
          <div class="info-row">
            <span>文件大小：</span>
            <span>{{ fileSize }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="showInfo = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input ref="fileInput" type="file" accept=".txt,.md,.json,.js,.html,.css,.ts,.vue" style="display: none" @change="handleFileSelect">
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const content = ref(`欢迎使用 dustOS 记事本

这是一个功能丰富的文本编辑器。

功能特点：
• 文件操作：新建、打开、保存、另存为
• 编辑功能：撤销、重做、复制、粘贴、查找替换
• 格式设置：字体大小、自动换行、行号显示
• 快捷键支持：Ctrl+S 保存，Ctrl+F 查找等
• 字符统计：实时显示字符数、词数、行数
• 自动保存：使用 localStorage 本地存储

快捷键：
Ctrl+N - 新建      Ctrl+O - 打开
Ctrl+S - 保存      Ctrl+Z - 撤销
Ctrl+Y - 重做      Ctrl+F - 查找
Ctrl+H - 替换      Ctrl+A - 全选

开始编写您的文档吧！`)

const editorRef = ref<HTMLTextAreaElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const findInput = ref<HTMLInputElement | null>(null)
const replaceInput = ref<HTMLInputElement | null>(null)

const activeMenu = ref('')
const fontSize = ref(14)
const wordWrap = ref(true)
const showLineNumbers = ref(false)
const zoom = ref(100)
const showFind = ref(false)
const showReplace = ref(false)
const showInfo = ref(false)
const findText = ref('')
const replaceText = ref('')
const findResult = ref('')
const currentFileName = ref('未命名.txt')
const isModified = ref(false)

const history = ref<string[]>([])
const historyIndex = ref(-1)
const maxHistory = 100

const currentLine = ref(1)
const currentCol = ref(1)

onMounted(() => {
  loadFromLocalStorage()
  addToHistory()
  setupKeyboardShortcuts()
})

onUnmounted(() => {
  saveToLocalStorage()
})

function toggleMenu(menu: string) {
  if (activeMenu.value === menu) {
    activeMenu.value = ''
  } else {
    activeMenu.value = menu
  }
}

function focusEditor() {
  if (activeMenu.value) {
    activeMenu.value = ''
  } else {
    editorRef.value?.focus()
  }
}

function onInput() {
  isModified.value = true
  updateCursorPosition()
  addToHistory()
  saveToLocalStorage()
}

function handleKeydown(e: KeyboardEvent) {
  updateCursorPosition()
}

function updateCursorPosition() {
  if (!editorRef.value) return
  const textarea = editorRef.value
  const text = textarea.value.substring(0, textarea.selectionStart)
  const lines = text.split('\n')
  currentLine.value = lines.length
  const lastLine = lines[lines.length - 1]
  currentCol.value = (lastLine ? lastLine.length : 0) + 1
}

function addToHistory() {
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(content.value)
  if (history.value.length > maxHistory) {
    history.value.shift()
  }
  historyIndex.value = history.value.length - 1
}

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

function undo() {
  if (canUndo.value) {
    historyIndex.value--
    const historyItem = history.value[historyIndex.value]
    if (historyItem !== undefined) {
      content.value = historyItem
      isModified.value = true
    }
  }
}

function redo() {
  if (canRedo.value) {
    historyIndex.value++
    const historyItem = history.value[historyIndex.value]
    if (historyItem !== undefined) {
      content.value = historyItem
      isModified.value = true
    }
  }
}

function cut() {
  document.execCommand('cut')
}

function copy() {
  document.execCommand('copy')
}

function paste() {
  navigator.clipboard.readText().then(text => {
    const textarea = editorRef.value
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      content.value = content.value.substring(0, start) + text + content.value.substring(end)
      isModified.value = true
      addToHistory()
    }
  })
}

function selectAll() {
  editorRef.value?.select()
}

function newFile() {
  if (isModified.value) {
    if (!confirm('当前文件未保存，确定要新建吗？')) {
      return
    }
  }
  content.value = ''
  currentFileName.value = '未命名.txt'
  isModified.value = false
  history.value = []
  historyIndex.value = -1
  addToHistory()
  activeMenu.value = ''
}

function openFile() {
  fileInput.value?.click()
  activeMenu.value = ''
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      content.value = e.target?.result as string
      currentFileName.value = file.name
      isModified.value = false
      history.value = []
      historyIndex.value = -1
      addToHistory()
    }
    reader.readAsText(file)
  }
}

function saveFile() {
  const blob = new Blob([content.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = currentFileName.value
  a.click()
  URL.revokeObjectURL(url)
  isModified.value = false
  activeMenu.value = ''
}

function saveFileAs() {
  const fileName = prompt('请输入文件名:', currentFileName.value)
  if (fileName) {
    currentFileName.value = fileName
    saveFile()
  }
  activeMenu.value = ''
}

function showFileInfo() {
  showInfo.value = true
  activeMenu.value = ''
}

function toggleWordWrap() {
  wordWrap.value = !wordWrap.value
  activeMenu.value = ''
}

function toggleLineNumbers() {
  showLineNumbers.value = !showLineNumbers.value
  activeMenu.value = ''
}

function changeFontSize(size: string) {
  switch (size) {
    case 'small':
      fontSize.value = 12
      break
    case 'medium':
      fontSize.value = 16
      break
    case 'large':
      fontSize.value = 20
      break
  }
  activeMenu.value = ''
}

function applyFontSize() {
  // 字体大小已通过 v-model 绑定
}

function zoomIn() {
  if (zoom.value < 200) {
    zoom.value += 10
    fontSize.value = Math.round(fontSize.value * 1.1)
  }
  activeMenu.value = ''
}

function zoomOut() {
  if (zoom.value > 50) {
    zoom.value -= 10
    fontSize.value = Math.round(fontSize.value * 0.9)
  }
  activeMenu.value = ''
}

function resetZoom() {
  zoom.value = 100
  fontSize.value = 14
  activeMenu.value = ''
}

function showFindDialog() {
  showFind.value = true
  activeMenu.value = ''
  nextTick(() => {
    findInput.value?.focus()
  })
}

function showReplaceDialog() {
  showReplace.value = true
  activeMenu.value = ''
  nextTick(() => {
    replaceInput.value?.focus()
  })
}

function findNext() {
  if (!findText.value || !editorRef.value) return
  const textarea = editorRef.value
  const text = textarea.value
  const start = textarea.selectionEnd
  const index = text.indexOf(findText.value, start)
  
  if (index !== -1) {
    textarea.focus()
    textarea.setSelectionRange(index, index + findText.value.length)
    findResult.value = `找到第 ${countOccurrences(text, findText.value, index + 1)} 个`
  } else {
    // 从头开始查找
    const newIndex = text.indexOf(findText.value)
    if (newIndex !== -1) {
      textarea.focus()
      textarea.setSelectionRange(newIndex, newIndex + findText.value.length)
      findResult.value = `找到第 1 个（从头开始）`
    } else {
      findResult.value = '未找到'
    }
  }
}

function findPrevious() {
  if (!findText.value || !editorRef.value) return
  const textarea = editorRef.value
  const text = textarea.value
  const start = textarea.selectionStart
  const index = text.lastIndexOf(findText.value, start - 1)
  
  if (index !== -1) {
    textarea.focus()
    textarea.setSelectionRange(index, index + findText.value.length)
    findResult.value = '找到'
  } else {
    findResult.value = '未找到'
  }
}

function countOccurrences(text: string, search: string, upTo?: number): number {
  let count = 0
  let pos = 0
  while (true) {
    const index = text.indexOf(search, pos)
    if (index === -1) break
    if (upTo !== undefined && index >= upTo) break
    count++
    pos = index + 1
  }
  return count
}

function replaceNext() {
  if (!findText.value || !editorRef.value) return
  const textarea = editorRef.value
  const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
  
  if (selectedText === findText.value) {
    const start = textarea.selectionStart
    content.value = textarea.value.substring(0, start) + replaceText.value + textarea.value.substring(start + findText.value.length)
    isModified.value = true
    addToHistory()
    findNext()
  } else {
    findNext()
  }
}

function replaceAll() {
  if (!findText.value) return
  const regex = new RegExp(findText.value, 'g')
  content.value = content.value.replace(regex, replaceText.value)
  isModified.value = true
  addToHistory()
  findResult.value = `已替换 ${countOccurrences(content.value, replaceText.value)} 处`
}

function syncScroll() {
  // 同步行号滚动
}

const lineCount = computed(() => content.value.split('\n').length)

const characterCount = computed(() => content.value.length)

const wordCount = computed(() => {
  const text = content.value.trim()
  if (!text) return 0
  return text.split(/\s+/).filter(word => word.length > 0).length
})

const fileSize = computed(() => {
  const bytes = new Blob([content.value]).size
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
})

function saveToLocalStorage() {
  localStorage.setItem('notepad_content', content.value)
  localStorage.setItem('notepad_filename', currentFileName.value)
}

function loadFromLocalStorage() {
  const savedContent = localStorage.getItem('notepad_content')
  const savedFilename = localStorage.getItem('notepad_filename')
  if (savedContent) {
    content.value = savedContent
  }
  if (savedFilename) {
    currentFileName.value = savedFilename
  }
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (!editorRef.value || document.activeElement !== editorRef.value) return
    
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault()
          saveFile()
          break
        case 'n':
          e.preventDefault()
          newFile()
          break
        case 'o':
          e.preventDefault()
          openFile()
          break
        case 'f':
          e.preventDefault()
          showFindDialog()
          break
        case 'h':
          e.preventDefault()
          showReplaceDialog()
          break
        case 'a':
          e.preventDefault()
          selectAll()
          break
      }
    }
  })
}
</script>

<style scoped>
.notepad {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  position: relative;
}

:global(.dark) .notepad {
  background: #2a2a2a;
}

.notepad-toolbar {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 4px 8px;
}

:global(.dark) .notepad-toolbar {
  background: #333333;
  border-bottom-color: #444;
}

.menu-bar {
  display: flex;
  gap: 2px;
}

.menu-item {
  padding: 6px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  border-radius: 4px;
  transition: background-color 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.menu-item.active {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
}

:global(.dark) .menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

:global(.dark) .menu-item.active {
  background: rgba(102, 126, 234, 0.25);
}

.dropdown-menu {
  position: absolute;
  top: 40px;
  left: 0;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 150px;
  padding: 4px;
}

:global(.dark) .dropdown-menu {
  background: #333333;
  border-color: #444;
}

.dropdown-menu .menu-item {
  padding: 8px 16px;
  text-align: left;
  white-space: nowrap;
}

.dropdown-menu .menu-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.dropdown-menu .separator {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 8px;
}

:global(.dark) .dropdown-menu .separator {
  background: #444;
}

.dropdown-menu .menu-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.format-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

:global(.dark) .format-toolbar {
  background: #333333;
  border-bottom-color: #444;
}

.format-button {
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.format-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.format-button:active:not(:disabled) {
  transform: scale(0.95);
}

.format-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.format-button.active {
  background: rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

:global(.dark) .format-button {
  background: #444;
  border-color: #555;
}

:global(.dark) .format-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
}

:global(.dark) .format-button.active {
  background: rgba(102, 126, 234, 0.25);
  border-color: #667eea;
}

.separator {
  width: 1px;
  height: 24px;
  background: #e0e0e0;
  margin: 0 4px;
}

:global(.dark) .separator {
  background: #555;
}

.font-size-select {
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #ffffff;
  font-size: 13px;
  cursor: pointer;
  height: 32px;
}

:global(.dark) .font-size-select {
  background: #444;
  border-color: #555;
  color: white;
}

.editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.line-numbers {
  background: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  padding: 12px 8px;
  overflow: hidden;
  font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  text-align: right;
  user-select: none;
  min-width: 40px;
}

:global(.dark) .line-numbers {
  background: #2a2a2a;
  border-right-color: #444;
}

.line-number {
  padding: 0 4px;
  color: #999;
}

.notepad-content {
  flex: 1;
  padding: 12px;
  border: none;
  background: #ffffff;
  font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  white-space: pre;
  overflow: auto;
}

.notepad-content.word-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.notepad-content.with-line-numbers {
  padding-left: 12px;
}

:global(.dark) .notepad-content {
  background: #2a2a2a;
  color: #e0e0e0;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  opacity: 0.8;
  flex-wrap: wrap;
  gap: 8px;
}

:global(.dark) .status-bar {
  background: #333333;
  border-top-color: #444;
}

.status-bar span {
  white-space: nowrap;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

:global(.dark) .modal {
  background: #333333;
}

.modal h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.modal input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.modal input:nth-of-type(2) {
  margin-bottom: 16px;
}

:global(.dark) .modal input {
  background: #444;
  border-color: #555;
  color: #fff;
}

.find-controls,
.replace-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}

.find-result {
  flex: 1;
  font-size: 13px;
  opacity: 0.7;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-row span:first-child {
  opacity: 0.7;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.btn:active {
  transform: scale(0.98);
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

:global(.dark) .btn {
  background: #444;
  border-color: #555;
  color: white;
}

:global(.dark) .btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

:global(.dark) .btn-secondary {
  background: #555;
}

@media (hover: none) and (pointer: coarse) {
  .notepad-toolbar {
    padding: 4px;
  }

  .format-toolbar {
    padding: 6px 8px;
    gap: 2px;
  }

  .format-button {
    width: 36px;
    height: 36px;
  }

  .notepad-content {
    font-size: 14px;
    padding: 10px;
  }

  .line-numbers {
    min-width: 32px;
    padding: 10px 4px;
  }

  .status-bar {
    font-size: 11px;
    padding: 4px 8px;
  }

  .modal {
    padding: 20px;
    width: 95%;
  }
}
</style>
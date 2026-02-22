<template>
  <div class="code-editor">
    <div class="editor-header">
      <div class="header-left">
        <h2>代码编辑器</h2>
        <select v-model="currentLanguage" class="language-selector">
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="json">JSON</option>
          <option value="markdown">Markdown</option>
        </select>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="newFile" title="新建文件">
          📄
        </button>
        <button class="action-btn" @click="openFile" title="打开文件">
          📂
        </button>
        <button class="action-btn" @click="saveFile" title="保存文件">
          💾
        </button>
        <button class="action-btn" @click="toggleTheme" title="切换主题">
          🎨
        </button>
      </div>
    </div>

    <div class="editor-tabs" v-if="files.length > 0">
      <div
        v-for="(file, index) in files"
        :key="file.id"
        class="tab"
        :class="{ active: currentFileIndex === index, modified: file.modified }"
        @click="switchFile(index)"
      >
        <span class="tab-icon">{{ getFileIcon(file.name) }}</span>
        <span class="tab-name">{{ file.name }}</span>
        <button class="tab-close" @click.stop="closeFile(index)" v-if="files.length > 1">
          ✕
        </button>
      </div>
    </div>

    <div class="editor-content">
      <div class="editor-container" :class="`theme-${currentTheme}`">
        <div class="line-numbers">
          <div
            v-for="line in totalLines"
            :key="line"
            class="line-number"
            :class="{ current: line === currentLine }"
          >
            {{ line }}
          </div>
        </div>
        <div class="code-area">
          <textarea
            ref="textareaRef"
            v-model="currentCode"
            @input="handleInput"
            @scroll="syncScroll"
            @keydown="handleKeydown"
            @click="updateCursorPosition"
            @keyup="updateCursorPosition"
            spellcheck="false"
            class="code-input"
          ></textarea>
          <div class="code-highlight" ref="highlightRef">
            <pre><code v-html="highlightedCode"></code></pre>
          </div>
        </div>
      </div>

      <!-- 状态栏 -->
      <div class="status-bar">
        <div class="status-item">
          <span class="status-label">行</span>
          <span class="status-value">{{ currentLine }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">列</span>
          <span class="status-value">{{ currentColumn }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">字符</span>
          <span class="status-value">{{ currentCode.length }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">编码</span>
          <span class="status-value">UTF-8</span>
        </div>
        <div class="status-item" v-if="currentFile">
          <span class="status-label">{{ currentFile.modified ? '●' : '✓' }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="files.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <div class="empty-text">暂无文件</div>
      <div class="empty-hint">点击新建文件或打开文件开始编辑</div>
      <div class="empty-actions">
        <button class="empty-btn" @click="newFile">新建文件</button>
        <button class="empty-btn" @click="openFile">打开文件</button>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      type="file"
      ref="fileInput"
      accept=".js,.ts,.html,.css,.py,.java,.cpp,.json,.md,.txt"
      @change="onFileSelected"
      style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface File {
  id: string
  name: string
  content: string
  language: string
  modified: boolean
}

const files = ref<File[]>([])
const currentFileIndex = ref(0)
const currentLanguage = ref('javascript')
const currentTheme = ref('dark')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const highlightRef = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const currentCode = ref('')
const currentLine = ref(1)
const currentColumn = ref(1)

const currentFile = computed(() => files.value[currentFileIndex.value])

const totalLines = computed(() => currentCode.value.split('\n').length)

const highlightedCode = computed(() => {
  return highlightCode(currentCode.value, currentLanguage.value)
})

function newFile() {
  const newFile: File = {
    id: Date.now().toString(),
    name: `untitled${files.value.length + 1}.${getFileExtension(currentLanguage.value)}`,
    content: '',
    language: currentLanguage.value,
    modified: false
  }
  files.value.push(newFile)
  currentFileIndex.value = files.value.length - 1
  currentCode.value = ''
}

function openFile() {
  fileInput.value?.click()
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    const language = detectLanguage(file.name)
    const newFile: File = {
      id: Date.now().toString(),
      name: file.name,
      content,
      language,
      modified: false
    }
    files.value.push(newFile)
    currentFileIndex.value = files.value.length - 1
    currentCode.value = content
    currentLanguage.value = language
  }
  reader.readAsText(file)
  target.value = ''
}

function saveFile() {
  if (!currentFile.value) return

  const blob = new Blob([currentCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = currentFile.value.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  currentFile.value.modified = false
}

function switchFile(index: number) {
  if (currentFile.value) {
    currentFile.value.content = currentCode.value
  }
  currentFileIndex.value = index
  if (currentFile.value) {
    currentCode.value = currentFile.value.content
    currentLanguage.value = currentFile.value.language
  } else {
    currentCode.value = ''
  }
}

function closeFile(index: number) {
  if (currentFile.value?.modified) {
    if (!confirm('文件已修改，确定要关闭吗？')) {
      return
    }
  }
  files.value.splice(index, 1)
  if (currentFileIndex.value >= files.value.length) {
    currentFileIndex.value = Math.max(0, files.value.length - 1)
  }
  if (currentFile.value) {
    currentCode.value = currentFile.value.content
    currentLanguage.value = currentFile.value.language
  } else {
    currentCode.value = ''
  }
}

function handleInput() {
  if (currentFile.value) {
    currentFile.value.modified = true
    currentFile.value.content = currentCode.value
  }
  updateCursorPosition()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    event.preventDefault()
    const start = (event.target as HTMLTextAreaElement).selectionStart
    const end = (event.target as HTMLTextAreaElement).selectionEnd
    currentCode.value = currentCode.value.substring(0, start) + '  ' + currentCode.value.substring(end)
    nextTick(() => {
      (event.target as HTMLTextAreaElement).selectionStart = (event.target as HTMLTextAreaElement).selectionEnd = start + 2
    })
  }
}

function updateCursorPosition() {
  if (!textareaRef.value) return
  const pos = textareaRef.value.selectionStart
  const textBefore = currentCode.value.substring(0, pos)
  const lines = textBefore.split('\n')
  currentLine.value = lines.length
  const lastLine = lines[lines.length - 1] || ''
  currentColumn.value = lastLine.length + 1
}

function syncScroll() {
  if (!textareaRef.value || !highlightRef.value) return
  highlightRef.value.scrollTop = textareaRef.value.scrollTop
  highlightRef.value.scrollLeft = textareaRef.value.scrollLeft
}

function toggleTheme() {
  currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    js: '📜',
    ts: '📘',
    html: '🌐',
    css: '🎨',
    py: '🐍',
    java: '☕',
    cpp: '⚙️',
    json: '📋',
    md: '📝',
    txt: '📄'
  }
  return icons[ext || ''] || '📄'
}

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    html: 'html',
    css: 'css',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    json: 'json',
    markdown: 'md'
  }
  return extensions[language] || 'txt'
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const languages: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    html: 'html',
    css: 'css',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    json: 'json',
    md: 'markdown'
  }
  return languages[ext || ''] || 'javascript'
}

function highlightCode(code: string, language: string): string {
  // 简单的语法高亮实现
  let highlighted = escapeHtml(code)

  // 关键字
  const keywords = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined'],
    python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is'],
    java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'if', 'else', 'for', 'while', 'return', 'new', 'this', 'true', 'false', 'null', 'void', 'int', 'String', 'boolean'],
    cpp: ['class', 'public', 'private', 'protected', 'if', 'else', 'for', 'while', 'return', 'new', 'this', 'true', 'false', 'null', 'void', 'int', 'string', 'bool', 'include']
  }

  const keywordsList = keywords[language as keyof typeof keywords] || keywords.javascript
  keywordsList.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g')
    highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`)
  })

  // 字符串
  highlighted = highlighted.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="string">$&</span>')

  // 注释
  if (language === 'javascript' || language === 'typescript' || language === 'java' || language === 'cpp') {
    highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
    highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
  } else if (language === 'python') {
    highlighted = highlighted.replace(/#.*$/gm, '<span class="comment">$&</span>')
  }

  // 数字
  highlighted = highlighted.replace(/\b\d+\.?\d*\b/g, '<span class="number">$&</span>')

  // 函数调用
  highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="function">$1</span>(')

  return highlighted
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

watch(currentLanguage, (newLang) => {
  if (currentFile.value) {
    currentFile.value.language = newLang
  }
})

// 初始化示例文件
files.value = [{
  id: '1',
  name: 'example.js',
  content: `// 欢迎使用 dustOS 代码编辑器
// 这是一个简单的 JavaScript 示例

function greet(name) {
  const message = ` + "`Hello, ${name}!`" + `;
  console.log(message);
  return message;
}

const fruits = ['苹果', '香蕉', '橙子'];
fruits.forEach(fruit => {
  console.log(fruit);
});

// 异步函数示例
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

greet('World');
`,
  language: 'javascript',
  modified: false
}]

currentCode.value = files.value[0]?.content || ''
</script>

<style scoped>
.code-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #d4d4d4;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.editor-header h2 {
  margin: 0;
  font-size: 16px;
}

.language-selector {
  padding: 6px 12px;
  background: #3c3c3c;
  border: 1px solid #555;
  border-radius: 6px;
  color: #d4d4d4;
  font-size: 13px;
  cursor: pointer;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #3c3c3c;
  color: #d4d4d4;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #505050;
}

.editor-tabs {
  display: flex;
  background: #2d2d2d;
  border-bottom: 1px solid #3c3c3c;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #2d2d2d;
  border-right: 1px solid #3c3c3c;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 13px;
  white-space: nowrap;
}

.tab:hover {
  background: #373737;
}

.tab.active {
  background: #1e1e1e;
}

.tab.modified .tab-name::after {
  content: '●';
  margin-left: 4px;
  color: #f1c40f;
}

.tab-close {
  padding: 2px 6px;
  border: none;
  background: transparent;
  color: #d4d4d4;
  cursor: pointer;
  font-size: 12px;
  border-radius: 4px;
  transition: background 0.2s;
}

.tab-close:hover {
  background: #505050;
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.editor-container.theme-dark {
  background: #1e1e1e;
}

.editor-container.theme-light {
  background: #ffffff;
}

.line-numbers {
  padding: 12px 0;
  background: #1e1e1e;
  color: #858585;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  text-align: right;
  user-select: none;
  min-width: 50px;
  padding-right: 16px;
  border-right: 1px solid #3c3c3c;
}

.line-number {
  padding: 0 8px;
}

.line-number.current {
  background: #37373d;
  color: #d4d4d4;
}

.code-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.code-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 12px;
  background: transparent;
  border: none;
  color: transparent;
  caret-color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  white-space: pre;
  overflow: auto;
  z-index: 2;
}

.code-highlight {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 12px;
  background: transparent;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre;
  overflow: auto;
  pointer-events: none;
  z-index: 1;
}

.code-highlight pre {
  margin: 0;
}

.code-highlight code {
  font-family: inherit;
}

/* 语法高亮颜色 */
.keyword {
  color: #569cd6;
  font-weight: bold;
}

.string {
  color: #ce9178;
}

.number {
  color: #b5cea8;
}

.function {
  color: #dcdcaa;
}

.comment {
  color: #6a9955;
  font-style: italic;
}

.status-bar {
  display: flex;
  gap: 20px;
  padding: 8px 16px;
  background: #007acc;
  color: white;
  font-size: 12px;
}

.status-item {
  display: flex;
  gap: 4px;
}

.status-label {
  opacity: 0.8;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #858585;
}

.empty-icon {
  font-size: 64px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
}

.empty-hint {
  font-size: 14px;
}

.empty-actions {
  display: flex;
  gap: 12px;
}

.empty-btn {
  padding: 10px 24px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.empty-btn:hover {
  background: #005a9e;
}

/* 滚动条样式 */
.code-input::-webkit-scrollbar,
.code-highlight::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.code-input::-webkit-scrollbar-track,
.code-highlight::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.code-input::-webkit-scrollbar-thumb,
.code-highlight::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 5px;
}

.code-input::-webkit-scrollbar-thumb:hover,
.code-highlight::-webkit-scrollbar-thumb:hover {
  background: #4f4f4f;
}
</style>
<template>
  <div class="terminal" @click="focusInput">
    <div class="terminal-output" ref="outputRef">
      <div v-for="(line, index) in output" :key="index" class="output-line" :class="line.type">
        <span v-if="line.prompt" class="prompt">{{ line.prompt }}</span>
        <span class="text">{{ line.text }}</span>
      </div>
    </div>
    <div class="terminal-input-line">
      <span class="prompt">{{ currentPrompt }}</span>
      <input
        ref="inputRef"
        v-model="currentInput"
        type="text"
        class="terminal-input"
        @keydown.enter="executeCommand"
        @keydown.up="historyUp"
        @keydown.down="historyDown"
        @keydown.tab="handleTab"
        @blur="handleBlur"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed, watch } from 'vue'

interface OutputLine {
  prompt: string
  text: string
  type?: 'normal' | 'error' | 'success' | 'info'
}

interface VirtualFile {
  name: string
  type: 'file' | 'folder'
  content: string
  parentId: string | null
}

interface TerminalTheme {
  name: string
  background: string
  foreground: string
  cursor: string
  prompt: string
  error: string
  success: string
  info: string
  selection: string
}

const terminalThemes: Record<string, TerminalTheme> = {
  default: {
    name: 'Default',
    background: '#1e1e1e',
    foreground: '#00ff00',
    cursor: '#00ff00',
    prompt: '#00ffff',
    error: '#ff6b6b',
    success: '#51cf66',
    info: '#74c0fc',
    selection: 'rgba(0, 255, 0, 0.3)'
  },
  dracula: {
    name: 'Dracula',
    background: '#282a36',
    foreground: '#f8f8f2',
    cursor: '#f8f8f2',
    prompt: '#bd93f9',
    error: '#ff5555',
    success: '#50fa7b',
    info: '#8be9fd',
    selection: 'rgba(189, 147, 249, 0.3)'
  },
  'solarized-light': {
    name: 'Solarized Light',
    background: '#fdf6e3',
    foreground: '#657b83',
    cursor: '#657b83',
    prompt: '#b58900',
    error: '#dc322f',
    success: '#859900',
    info: '#268bd2',
    selection: 'rgba(181, 137, 0, 0.3)'
  },
  'solarized-dark': {
    name: 'Solarized Dark',
    background: '#002b36',
    foreground: '#839496',
    cursor: '#839496',
    prompt: '#2aa198',
    error: '#dc322f',
    success: '#859900',
    info: '#268bd2',
    selection: 'rgba(42, 161, 152, 0.3)'
  },
  nord: {
    name: 'Nord',
    background: '#2e3440',
    foreground: '#d8dee9',
    cursor: '#d8dee9',
    prompt: '#88c0d0',
    error: '#bf616a',
    success: '#a3be8c',
    info: '#81a1c1',
    selection: 'rgba(136, 192, 208, 0.3)'
  },
  'one-dark': {
    name: 'One Dark',
    background: '#282c34',
    foreground: '#abb2bf',
    cursor: '#abb2bf',
    prompt: '#61afef',
    error: '#e06c75',
    success: '#98c379',
    info: '#56b6c2',
    selection: 'rgba(97, 175, 239, 0.3)'
  },
  monokai: {
    name: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f2',
    prompt: '#f92672',
    error: '#f92672',
    success: '#a6e22e',
    info: '#66d9ef',
    selection: 'rgba(249, 38, 114, 0.3)'
  }
}

const output = ref<OutputLine[]>([
  { prompt: '', text: 'dustOS Terminal v2.0.0', type: 'info' },
  { prompt: '', text: '输入 "help" 查看可用命令', type: 'info' },
  { prompt: '', text: '输入 "theme" 查看可用主题', type: 'info' },
  { prompt: '', text: '' },
])
const currentInput = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const outputRef = ref<HTMLElement | null>(null)
const commandHistory = ref<string[]>([])
const historyIndex = ref(-1)
const currentPath = ref('/home/user')
const currentTheme = ref('default')

// 从localStorage加载主题
function loadTheme() {
  const saved = localStorage.getItem('dustos_terminalTheme')
  if (saved && terminalThemes[saved]) {
    currentTheme.value = saved
  }
}

// 保存主题到localStorage
function saveTheme() {
  localStorage.setItem('dustos_terminalTheme', currentTheme.value)
}

// 获取当前主题
const theme = computed(() => terminalThemes[currentTheme.value])

const virtualFileSystem = ref<VirtualFile[]>([
  { name: 'home', type: 'folder', content: '', parentId: null },
  { name: 'user', type: 'folder', content: '', parentId: 'home' },
  { name: 'documents', type: 'folder', content: '', parentId: 'user' },
  { name: 'downloads', type: 'folder', content: '', parentId: 'user' },
  { name: 'pictures', type: 'folder', content: '', parentId: 'user' },
  { name: 'music', type: 'folder', content: '', parentId: 'user' },
  { name: 'videos', type: 'folder', content: '', parentId: 'user' },
  { name: 'readme.txt', type: 'file', content: '欢迎使用 dustOS Terminal!', parentId: 'user' },
  { name: 'notes.txt', type: 'file', content: '这是我的笔记文件', parentId: 'user' },
  { name: 'hello.txt', type: 'file', content: 'Hello, World!', parentId: 'documents' },
  { name: 'todo.txt', type: 'file', content: '- 完成项目\n- 学习 Vue 3\n- 优化性能', parentId: 'documents' },
])

const currentPrompt = computed(() => {
  const displayPath = currentPath.value.replace('/home/user', '~')
  return `user@dustos:${displayPath}$ `
})

const currentFolderId = computed(() => {
  const parts = currentPath.value.split('/').filter(Boolean)
  if (parts.length === 0) return null
  if (parts.length === 1 && parts[0] === 'home') return 'home'
  if (parts.length === 2 && parts[1] === 'user') return 'user'
  
  let currentId = 'home'
  for (let i = 1; i < parts.length; i++) {
    const folder = virtualFileSystem.value.find(f => f.name === parts[i] && f.parentId === currentId)
    if (folder) {
      currentId = folder.name
    }
  }
  return currentId
})

onMounted(() => {
  loadTheme()
  inputRef.value?.focus()
})

function focusInput() {
  inputRef.value?.focus()
}

function handleBlur() {
  setTimeout(() => inputRef.value?.focus(), 100)
}

function addOutput(prompt: string, text: string, type: OutputLine['type'] = 'normal') {
  output.value.push({ prompt, text, type })
}

function executeCommand() {
  const cmd = currentInput.value.trim()
  if (!cmd) {
    addOutput(currentPrompt.value, '')
    return
  }

  addOutput(currentPrompt.value, cmd)
  commandHistory.value.push(cmd)
  historyIndex.value = commandHistory.value.length

  const [command, ...args] = parseCommand(cmd)
  executeCommandInternal(command, args)

  currentInput.value = ''
  nextTick(() => {
    inputRef.value?.focus()
    scrollToEnd()
  })
}

function parseCommand(cmd: string): [string, string[]] {
  const args: string[] = []
  let currentArg = ''
  let inQuotes = false
  let quoteChar = ''

  for (let i = 0; i < cmd.length; i++) {
    const char = cmd[i]
    
    if ((char === '"' || char === "'") && (i === 0 || cmd[i - 1] !== '\\')) {
      if (inQuotes && char === quoteChar) {
        inQuotes = false
      } else if (!inQuotes) {
        inQuotes = true
        quoteChar = char
      } else {
        currentArg += char
      }
    } else if (char === ' ' && !inQuotes) {
      if (currentArg) {
        args.push(currentArg)
        currentArg = ''
      }
    } else {
      currentArg += char
    }
  }

  if (currentArg) {
    args.push(currentArg)
  }

  return [args[0] || '', args.slice(1)]
}

function executeCommandInternal(command: string, args: string[]) {
  switch (command.toLowerCase()) {
    case 'help':
      showHelp()
      break
    case 'clear':
    case 'cls':
      clearScreen()
      break
    case 'date':
      addOutput('', new Date().toLocaleString('zh-CN'))
      break
    case 'whoami':
      addOutput('', 'user')
      break
    case 'pwd':
      addOutput('', currentPath.value)
      break
    case 'ls':
    case 'll':
      listFiles(args)
      break
    case 'cd':
      changeDirectory(args)
      break
    case 'cat':
      catFile(args)
      break
    case 'mkdir':
      makeDirectory(args)
      break
    case 'touch':
      touchFile(args)
      break
    case 'rm':
      removeFile(args)
      break
    case 'echo':
      echoCommand(args)
      break
    case 'neofetch':
      showNeofetch()
      break
    case 'uname':
      showUname(args)
      break
    case 'history':
      showHistory()
      break
    case 'theme':
      handleTheme(args)
      break
    case 'exit':
      addOutput('', '无法退出终端', 'error')
      break
    default:
      addOutput('', `命令未找到: ${command}`, 'error')
  }
}

function showHelp() {
  const helpText = `
可用命令:
  help          显示此帮助信息
  clear/cls     清空屏幕
  date          显示当前日期时间
  whoami        显示当前用户
  pwd           显示当前工作目录
  ls            列出当前目录文件
  cd            切换目录
  cat           显示文件内容
  mkdir         创建目录
  touch         创建文件
  rm            删除文件
  echo          输出文本
  neofetch      显示系统信息
  uname         显示系统信息
  history       显示命令历史
  theme         切换终端主题
  exit          退出终端
`
  addOutput('', helpText.trim())
}
  ls [path]     列出文件和目录
  cd [path]     切换目录
  cat [file]    显示文件内容
  mkdir [name]  创建目录
  touch [name]  创建空文件
  rm [file]     删除文件
  echo [text]   输出文本
  neofetch      显示系统信息
  uname [-a]    显示系统信息
  history       显示命令历史
  exit          退出终端（不可用）
`
  addOutput('', helpText.trim())
}

function clearScreen() {
  output.value = []
}

function listFiles(args: string[]) {
  const targetPath = args[0] || currentPath.value
  const folderId = getFolderId(targetPath)
  
  if (folderId === null) {
    addOutput('', `目录不存在: ${targetPath}`, 'error')
    return
  }

  const files = virtualFileSystem.value.filter(f => f.parentId === folderId)
  if (files.length === 0) {
    addOutput('', '(目录为空)')
    return
  }

  const maxNameLength = Math.max(...files.map(f => f.name.length))
  const lines: string[] = []
  
  files.forEach(file => {
    const typeIndicator = file.type === 'folder' ? '/' : ''
    const padding = ' '.repeat(maxNameLength - file.name.length + 2)
    lines.push(`${file.name}${typeIndicator}${padding}`)
  })

  const cols = 4
  const rows = Math.ceil(lines.length / cols)
  
  for (let i = 0; i < rows; i++) {
    const rowLines: string[] = []
    for (let j = 0; j < cols; j++) {
      const index = i + j * rows
      if (index < lines.length) {
        rowLines.push(lines[index])
      }
    }
    addOutput('', rowLines.join(''))
  }
}

function changeDirectory(args: string[]) {
  const target = args[0] || '/home/user'
  
  if (target === '~' || target === '') {
    currentPath.value = '/home/user'
    return
  }

  if (target === '..') {
    const parts = currentPath.value.split('/').filter(Boolean)
    if (parts.length > 2) {
      parts.pop()
      currentPath.value = '/' + parts.join('/')
    } else if (parts.length === 2) {
      currentPath.value = '/home/user'
    }
    return
  }

  if (target === '/') {
    currentPath.value = '/home/user'
    return
  }

  if (target.startsWith('/')) {
    const folderId = getFolderId(target)
    if (folderId !== null) {
      currentPath.value = target
    } else {
      addOutput('', `目录不存在: ${target}`, 'error')
    }
    return
  }

  const newPath = currentPath.value === '/home/user' 
    ? `/home/user/${target}`
    : `${currentPath.value}/${target}`
  
  const folderId = getFolderId(newPath)
  if (folderId !== null) {
    currentPath.value = newPath
  } else {
    addOutput('', `目录不存在: ${target}`, 'error')
  }
}

function getFolderId(path: string): string | null {
  const parts = path.split('/').filter(Boolean)
  if (parts.length === 0) return 'home'
  
  let currentId = 'home'
  for (let i = 1; i < parts.length; i++) {
    const folder = virtualFileSystem.value.find(f => f.name === parts[i] && f.parentId === currentId)
    if (folder) {
      currentId = folder.name
    } else {
      return null
    }
  }
  return currentId
}

function catFile(args: string[]) {
  if (!args[0]) {
    addOutput('', '用法: cat [文件名]', 'error')
    return
  }

  const fileName = args[0]
  const file = virtualFileSystem.value.find(f => f.name === fileName && f.parentId === currentFolderId.value)
  
  if (!file) {
    addOutput('', `文件不存在: ${fileName}`, 'error')
    return
  }

  if (file.type === 'folder') {
    addOutput('', `${fileName} 是一个目录`, 'error')
    return
  }

  addOutput('', file.content)
}

function makeDirectory(args: string[]) {
  if (!args[0]) {
    addOutput('', '用法: mkdir [目录名]', 'error')
    return
  }

  const dirName = args[0]
  const existing = virtualFileSystem.value.find(f => f.name === dirName && f.parentId === currentFolderId.value)
  
  if (existing) {
    addOutput('', `目录已存在: ${dirName}`, 'error')
    return
  }

  virtualFileSystem.value.push({
    name: dirName,
    type: 'folder',
    content: '',
    parentId: currentFolderId.value,
  })
  
  addOutput('', `目录已创建: ${dirName}`, 'success')
}

function touchFile(args: string[]) {
  if (!args[0]) {
    addOutput('', '用法: touch [文件名]', 'error')
    return
  }

  const fileName = args[0]
  const existing = virtualFileSystem.value.find(f => f.name === fileName && f.parentId === currentFolderId.value)
  
  if (existing) {
    if (existing.type === 'file') {
      addOutput('', `文件已存在: ${fileName}`)
    } else {
      addOutput('', `${fileName} 是一个目录`, 'error')
    }
    return
  }

  virtualFileSystem.value.push({
    name: fileName,
    type: 'file',
    content: '',
    parentId: currentFolderId.value,
  })
  
  addOutput('', `文件已创建: ${fileName}`, 'success')
}

function removeFile(args: string[]) {
  if (!args[0]) {
    addOutput('', '用法: rm [文件名]', 'error')
    return
  }

  const fileName = args[0]
  const index = virtualFileSystem.value.findIndex(f => f.name === fileName && f.parentId === currentFolderId.value)
  
  if (index === -1) {
    addOutput('', `文件不存在: ${fileName}`, 'error')
    return
  }

  const file = virtualFileSystem.value[index]
  if (file.type === 'folder') {
    const hasChildren = virtualFileSystem.value.some(f => f.parentId === file.name)
    if (hasChildren) {
      addOutput('', `目录不为空: ${fileName}`, 'error')
      return
    }
  }

  virtualFileSystem.value.splice(index, 1)
  addOutput('', `已删除: ${fileName}`, 'success')
}

function echoCommand(args: string[]) {
  addOutput('', args.join(' '))
}

function showNeofetch() {
  const neofetchText = `
     ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄    
    ██░░░░░░░░░░░░░░░░░░░░██   
   ██░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄░░██  
  ██░░██████████████████░░██ 
  ██░░██ dustOS Terminal ██░░██ 
  ██░░██████████████████░░██ 
   ██░░░░░░░░░░░░░░░░░░░░██  
    ███████████████████████   

   user@dustos
   -----------
   OS: dustOS v2.0.0
   Host: Virtual Machine
   Kernel: Linux 6.17.0
   Uptime: ${(performance.now() / 1000 / 60).toFixed(0)} mins
   Shell: dust-shell
   Resolution: ${window.innerWidth}x${window.innerHeight}
   DE: Vue 3
   Theme: Dark
   CPU: ARM64 @ 2.4GHz
   Memory: 8GB
  `
  addOutput('', neofetchText.trim())
}

function showUname(args: string[]) {
  if (args.includes('-a') || args.includes('--all')) {
    addOutput('', 'dustOS localhost 6.17.0-dustos #1 SMP PREEMPT_DYNAMIC Thu Feb 12 2026 aarch64 GNU/Linux')
  } else {
    addOutput('', 'dustOS')
  }
}

function showHistory() {
  commandHistory.value.forEach((cmd, index) => {
    addOutput('', `  ${index + 1}  ${cmd}`)
  })
}

function historyUp() {
  if (commandHistory.value.length === 0) return
  
  if (historyIndex.value > 0) {
    historyIndex.value--
    currentInput.value = commandHistory.value[historyIndex.value]
  }
}

function historyDown() {
  if (commandHistory.value.length === 0) return
  
  if (historyIndex.value < commandHistory.value.length - 1) {
    historyIndex.value++
    currentInput.value = commandHistory.value[historyIndex.value]
  } else {
    historyIndex.value = commandHistory.value.length
    currentInput.value = ''
  }
}

function handleTab(event: Event) {
  event.preventDefault()
  
  const inputParts = currentInput.value.split(' ')
  const lastPart = inputParts[inputParts.length - 1]
  
  if (!lastPart) return
  
  const currentFiles = virtualFileSystem.value.filter(f => f.parentId === currentFolderId.value)
  const matches = currentFiles.filter(f => f.name.startsWith(lastPart))
  
  if (matches.length === 0) return
  
  if (matches.length === 1) {
    inputParts[inputParts.length - 1] = matches[0].name + (matches[0].type === 'folder' ? '/' : '')
    currentInput.value = inputParts.join(' ')
  } else {
    addOutput(currentPrompt.value, currentInput.value)
    const maxLength = Math.max(...matches.map(m => m.name.length))
    matches.forEach(m => {
      addOutput('', m.name + ' '.repeat(maxLength - m.name.length + 2))
    })
  }
}

function handleTheme(args: string[]) {
  if (args.length === 0) {
    // 显示可用主题列表
    addOutput('', '可用主题:', 'info')
    for (const [key, theme] of Object.entries(terminalThemes)) {
      const current = key === currentTheme.value ? ' [当前]' : ''
      addOutput('', `  ${key.padEnd(15)} - ${theme.name}${current}`)
    }
    addOutput('', '', 'info')
    addOutput('', '用法: theme <主题名称>', 'info')
    addOutput('', '示例: theme dracula', 'info')
    return
  }

  const themeName = args[0].toLowerCase()
  if (!terminalThemes[themeName]) {
    addOutput('', `主题不存在: ${themeName}`, 'error')
    addOutput('', '输入 "theme" 查看可用主题', 'info')
    return
  }

  currentTheme.value = themeName
  saveTheme()
  addOutput('', `主题已切换为: ${terminalThemes[themeName].name}`, 'success')
}

function scrollToEnd() {
  nextTick(() => {
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight
    }
  })
}

watch(output, () => {
  scrollToEnd()
}, { deep: true })
</script>

<style scoped>
.terminal {
  height: 100%;
  background: v-bind('theme.background');
  color: v-bind('theme.foreground');
  font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
  padding: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background 0.3s ease, color 0.3s ease;
}

.terminal-output {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.terminal-output::-webkit-scrollbar {
  width: 8px;
}

.terminal-output::-webkit-scrollbar-track {
  background: v-bind('theme.background');
}

.terminal-output::-webkit-scrollbar-thumb {
  background: v-bind('theme.foreground');
  opacity: 0.3;
  border-radius: 4px;
}

.terminal-output::-webkit-scrollbar-thumb:hover {
  opacity: 0.5;
}

.output-line {
  margin-bottom: 2px;
  line-height: 1.5;
}

.output-line.error {
  color: v-bind('theme.error');
}

.output-line.success {
  color: v-bind('theme.success');
}

.output-line.info {
  color: v-bind('theme.info');
}

.prompt {
  color: v-bind('theme.prompt');
  font-weight: bold;
}

.terminal-input-line {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding-bottom: 4px;
}

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  color: v-bind('theme.foreground');
  font-family: inherit;
  font-size: inherit;
  outline: none;
  margin-left: 8px;
  caret-color: v-bind('theme.cursor');
}

.terminal-input::selection {
  background: v-bind('theme.selection');
}

@media (hover: none) and (pointer: coarse) {
  .terminal {
    padding: 8px;
    font-size: 13px;
  }

  .terminal-input-line {
    margin-top: 12px;
  }

  .terminal-input {
    font-size: 16px;
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
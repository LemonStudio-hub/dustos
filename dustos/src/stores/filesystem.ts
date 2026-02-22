import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import type { FileItem, SearchResult, SearchFilters, SortBy, SortOrder } from '@/types'

export const useFilesystemStore = defineStore('filesystem', () => {
  const currentPath = ref('/')
  const selectedItems = ref<string[]>([])
  const searchIndex = ref<Map<string, SearchResult[]>>(new Map())
  const lastUpdate = ref(0)
  const searchHistory = ref<string[]>([])
  
  // 虚拟文件系统
  const filesystem = reactive<Map<string, FileItem[]>>(new Map())
  
  // 更新搜索索引
  function updateSearchIndex() {
    const index = new Map<string, SearchResult[]>()
    const now = Date.now()
    
    function buildIndex(path: string) {
      const files = filesystem.get(path)
      if (!files) return
      
      for (const file of files) {
        const searchItem: SearchResult = { 
          ...file, 
          path 
        }
        
        // 为文件名的每个前缀创建索引
        const nameLower = file.name.toLowerCase()
        for (let i = 1; i <= nameLower.length; i++) {
          const prefix = nameLower.substring(0, i)
          if (!index.has(prefix)) {
            index.set(prefix, [])
          }
          index.get(prefix)!.push(searchItem)
        }
        
        // 递归处理文件夹
        if (file.type === 'folder') {
          const folderPath = path === '/' ? '/' + file.name : path + '/' + file.name
          buildIndex(folderPath)
        }
      }
    }
    
    buildIndex('/')
    searchIndex.value = index
    lastUpdate.value = now
  }
  
  // 初始化根目录
  function initFilesystem() {
    if (filesystem.size === 0) {
      filesystem.set('/', [
        { id: '1', name: '文档', type: 'folder', size: 0, modified: new Date(), icon: '📁' },
        { id: '2', name: '下载', type: 'folder', size: 0, modified: new Date(), icon: '📁' },
        { id: '3', name: '图片', type: 'folder', size: 0, modified: new Date(), icon: '📁' },
        { id: '4', name: '音乐', type: 'folder', size: 0, modified: new Date(), icon: '📁' },
        { id: '5', name: '视频', type: 'folder', size: 0, modified: new Date(), icon: '📁' },
        { id: '6', name: 'readme.txt', type: 'file', size: 1024, modified: new Date(), icon: '📄', content: '欢迎使用 dustOS 文件系统！\n\n这是一个基于 Web 技术构建的虚拟文件系统。\n\n功能特点：\n- 创建文件夹\n- 创建文件\n- 删除文件\n- 重命名文件\n- 查看文件内容' },
        { id: '7', name: 'notes.md', type: 'file', size: 512, modified: new Date(), icon: '📝', content: '# 笔记\n\n这里是我的个人笔记。\n\n## 待办事项\n- [ ] 完成项目文档\n- [ ] 修复 bug\n- [ ] 发布新版本' },
      ])
      
      // 初始化子目录
      filesystem.set('/文档', [
        { id: '8', name: '工作计划.txt', type: 'file', size: 2048, modified: new Date(), icon: '📄', content: '工作计划\n\n1. 完成需求分析\n2. 设计系统架构\n3. 开发核心功能\n4. 测试和优化' },
      ])
      
      filesystem.set('/下载', [
        { id: '9', name: '安装包.zip', type: 'file', size: 10485760, modified: new Date(), icon: '📦' },
      ])
      
      filesystem.set('/图片', [
        { id: '10', name: 'wallpaper.png', type: 'file', size: 2097152, modified: new Date(), icon: '🖼️' },
        { id: '11', name: 'avatar.jpg', type: 'file', size: 524288, modified: new Date(), icon: '🖼️' },
      ])
      
      filesystem.set('/音乐', [
        { id: '12', name: 'background.mp3', type: 'file', size: 5242880, modified: new Date(), icon: '🎵' },
      ])
      
      filesystem.set('/视频', [
        { id: '13', name: 'demo.mp4', type: 'file', size: 52428800, modified: new Date(), icon: '🎬' },
      ])
      
      // 构建搜索索引
      updateSearchIndex()
    }
  }
  
  // 获取当前目录的文件列表
  function getCurrentFiles(): FileItem[] {
    return filesystem.get(currentPath.value) || []
  }
  
  // 改变当前目录
  function changePath(path: string) {
    // 规范化路径
    const normalizedPath = path.startsWith('/') ? path : '/' + path
    
    // 检查路径是否存在
    if (!filesystem.has(normalizedPath) && normalizedPath !== '/') {
      // 如果路径不存在，尝试创建
      const parts = normalizedPath.split('/').filter(p => p)
      let current = ''
      for (const part of parts) {
        current += '/' + part
        if (!filesystem.has(current)) {
          filesystem.set(current, [])
        }
      }
    }
    
    currentPath.value = normalizedPath
  }
  
  // 获取父目录路径
  function getParentPath(): string {
    const parts = currentPath.value.split('/').filter(p => p)
    if (parts.length === 0) return '/'
    parts.pop()
    return '/' + parts.join('/')
  }
  
  // 创建文件夹
  function createFolder(name: string): boolean {
    if (!name.trim()) return false
    
    const files = getCurrentFiles()
    if (files.some(f => f.name === name)) return false
    
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name,
      type: 'folder',
      size: 0,
      modified: new Date(),
      icon: '📁',
    }
    
    files.push(newFolder)
    
    // 创建新目录
    const newPath = currentPath.value === '/' ? '/' + name : currentPath.value + '/' + name
    filesystem.set(newPath, [])
    
    // 更新搜索索引
    updateSearchIndex()
    
    return true
  }
  
  // 创建文件
  function createFile(name: string, content: string = ''): boolean {
    if (!name.trim()) return false
    
    const files = getCurrentFiles()
    if (files.some(f => f.name === name)) return false
    
    const newFile: FileItem = {
      id: Date.now().toString(),
      name,
      type: 'file',
      size: content.length,
      modified: new Date(),
      icon: getFileIcon(name),
      content,
    }
    
    files.push(newFile)
    
    // 更新搜索索引
    updateSearchIndex()
    
    return true
  }
  
  // 删除文件或文件夹
  function deleteItem(id: string): boolean {
    const files = getCurrentFiles()
    const index = files.findIndex(f => f.id === id)
    if (index === -1) return false
    
    const item = files[index]
    
    // 如果是文件夹，删除其内容
    if (item.type === 'folder') {
      const folderPath = currentPath.value === '/' ? '/' + item.name : currentPath.value + '/' + item.name
      filesystem.delete(folderPath)
    }
    
    files.splice(index, 1)
    
    // 更新搜索索引
    updateSearchIndex()
    
    return true
  }
  
  // 重命名文件或文件夹
  function renameItem(id: string, newName: string): boolean {
    if (!newName.trim()) return false
    
    const files = getCurrentFiles()
    const index = files.findIndex(f => f.id === id)
    if (index === -1) return false
    
    // 检查名称是否已存在
    if (files.some(f => f.name === newName && f.id !== id)) return false
    
    const item = files[index]
    const oldName = item.name
    item.name = newName
    item.modified = new Date()
    
    // 如果是文件夹，更新文件系统中的路径
    if (item.type === 'folder') {
      const oldPath = currentPath.value === '/' ? '/' + oldName : currentPath.value + '/' + oldName
      const newPath = currentPath.value === '/' ? '/' + newName : currentPath.value + '/' + newName
      const contents = filesystem.get(oldPath)
      if (contents) {
        filesystem.delete(oldPath)
        filesystem.set(newPath, contents)
      }
    }
    
    // 更新搜索索引
    updateSearchIndex()
    
    return true
  }
  
  // 获取文件内容
  function getFileContent(id: string): string | undefined {
    const files = getCurrentFiles()
    const file = files.find(f => f.id === id)
    return file?.content
  }
  
  // 更新文件内容
  function updateFileContent(id: string, content: string): boolean {
    const files = getCurrentFiles()
    const file = files.find(f => f.id === id)
    if (!file) return false
    
    file.content = content
    file.size = content.length
    file.modified = new Date()
    return true
  }
  
  // 选择/取消选择文件
  function toggleSelection(id: string) {
    const index = selectedItems.value.indexOf(id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    } else {
      selectedItems.value.push(id)
    }
  }
  
  // 清除选择
  function clearSelection() {
    selectedItems.value = []
  }
  
  // 获取文件图标
  function getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    const iconMap: Record<string, string> = {
      'txt': '📄',
      'md': '📝',
      'pdf': '📕',
      'doc': '📘',
      'docx': '📘',
      'xls': '📗',
      'xlsx': '📗',
      'ppt': '📙',
      'pptx': '📙',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
      'svg': '🖼️',
      'mp3': '🎵',
      'wav': '🎵',
      'mp4': '🎬',
      'avi': '🎬',
      'mkv': '🎬',
      'zip': '📦',
      'rar': '📦',
      '7z': '📦',
      'exe': '⚙️',
      'sh': '⚙️',
      'js': '📜',
      'ts': '📜',
      'html': '🌐',
      'css': '🎨',
      'json': '📋',
    }
    return iconMap[ext || ''] || '📄'
  }
  
  // 格式化文件大小
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }
  
  // 搜索文件
  function searchFiles(query: string): SearchResult[] {
    if (!query.trim()) return []
    
    const queryLower = query.toLowerCase()
    
    // 添加到搜索历史
    addToSearchHistory(query)
    
    // 使用索引快速查找
    if (searchIndex.value.has(queryLower)) {
      return searchIndex.value.get(queryLower) || []
    }
    
    // 如果索引中没有精确匹配，查找包含查询的文件
    const results: SearchResult[] = []
    for (const [key, files] of searchIndex.value) {
      if (key.includes(queryLower)) {
        results.push(...files)
      }
    }
    
    // 去重
    const uniqueResults = new Map<string, SearchResult>()
    for (const result of results) {
      const uniqueKey = `${result.path}/${result.id}`
      if (!uniqueResults.has(uniqueKey)) {
        uniqueResults.set(uniqueKey, result)
      }
    }
    
    return Array.from(uniqueResults.values())
  }
  
  // 高级搜索 - 支持过滤器
  function advancedSearch(query: string, filters: SearchFilters = {}): SearchResult[] {
    if (!query.trim()) return []
    
    const queryLower = query.toLowerCase()
    const results = searchFiles(query)
    
    return results.filter(result => {
      // 类型过滤
      if (filters.type && filters.type !== 'all') {
        if (filters.type === 'folder' && result.type !== 'folder') return false
        if (filters.type === 'file' && result.type !== 'file') return false
      }
      
      // 大小过滤
      if (filters.minSize !== undefined && result.size < filters.minSize) return false
      if (filters.maxSize !== undefined && result.size > filters.maxSize) return false
      
      // 日期过滤
      if (filters.startDate && result.modified < filters.startDate) return false
      if (filters.endDate && result.modified > filters.endDate) return false
      
      // 扩展名过滤
      if (filters.extensions && filters.extensions.length > 0) {
        const ext = result.name.split('.').pop()?.toLowerCase()
        if (!filters.extensions.includes(ext || '')) return false
      }
      
      return true
    })
  }
  
  // 排序搜索结果
  function sortResults(results: SearchResult[], sortBy: SortBy = 'name', order: SortOrder = 'asc'): SearchResult[] {
    return [...results].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'date':
          comparison = a.modified.getTime() - b.modified.getTime()
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'path':
          comparison = a.path.localeCompare(b.path)
          break
      }
      
      return order === 'asc' ? comparison : -comparison
    })
  }
  
  // 获取搜索建议
  function getSearchSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) return []
    
    const queryLower = query.toLowerCase()
    const suggestions = new Set<string>()
    
    // 从历史记录中获取建议
    for (const historyItem of searchHistory.value) {
      if (historyItem.toLowerCase().includes(queryLower) && suggestions.size < limit) {
        suggestions.add(historyItem)
      }
    }
    
    // 从文件名中获取建议
    for (const [key] of searchIndex.value) {
      if (key.includes(queryLower) && suggestions.size < limit) {
        suggestions.add(key)
      }
    }
    
    return Array.from(suggestions).slice(0, limit)
  }
  
  // 添加到搜索历史
  function addToSearchHistory(query: string) {
    if (!query.trim()) return
    
    // 移除已存在的相同查询
    const index = searchHistory.value.indexOf(query)
    if (index > -1) {
      searchHistory.value.splice(index, 1)
    }
    
    // 添加到开头
    searchHistory.value.unshift(query)
    
    // 限制历史记录数量
    if (searchHistory.value.length > 20) {
      searchHistory.value = searchHistory.value.slice(0, 20)
    }
    
    // 保存到localStorage
    saveSearchHistory()
  }
  
  // 清除搜索历史
  function clearSearchHistory() {
    searchHistory.value = []
    saveSearchHistory()
  }
  
  // 保存搜索历史到localStorage
  function saveSearchHistory() {
    localStorage.setItem('dustos_searchHistory', JSON.stringify(searchHistory.value))
  }
  
  // 从localStorage加载搜索历史
  function loadSearchHistory() {
    const saved = localStorage.getItem('dustos_searchHistory')
    if (saved) {
      try {
        searchHistory.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to load search history:', e)
      }
    }
  }
  
  // 高亮匹配文本
  function highlightMatch(text: string, query: string): string {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }
  
  initFilesystem()
  
  // 加载搜索历史
  loadSearchHistory()
  
  return {
    currentPath,
    selectedItems,
    searchHistory,
    getCurrentFiles,
    changePath,
    getParentPath,
    createFolder,
    createFile,
    deleteItem,
    renameItem,
    getFileContent,
    updateFileContent,
    toggleSelection,
    clearSelection,
    getFileIcon,
    formatFileSize,
    searchFiles,
    advancedSearch,
    sortResults,
    getSearchSuggestions,
    clearSearchHistory,
    highlightMatch,
  }
})
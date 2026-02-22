/**
 * 文件工具函数
 */

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * 获取文件图标
 */
export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename)
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
    'webp': '🖼️',
    'bmp': '🖼️',
    'mp3': '🎵',
    'wav': '🎵',
    'flac': '🎵',
    'aac': '🎵',
    'ogg': '🎵',
    'mp4': '🎬',
    'avi': '🎬',
    'mkv': '🎬',
    'mov': '🎬',
    'wmv': '🎬',
    'zip': '📦',
    'rar': '📦',
    '7z': '📦',
    'tar': '📦',
    'gz': '📦',
    'exe': '⚙️',
    'msi': '⚙️',
    'sh': '⚙️',
    'bash': '⚙️',
    'js': '📜',
    'ts': '📜',
    'jsx': '📜',
    'tsx': '📜',
    'vue': '📜',
    'html': '🌐',
    'htm': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'less': '🎨',
    'json': '📋',
    'xml': '📋',
    'yaml': '📋',
    'yml': '📋',
    'toml': '📋',
    'sql': '🗃️',
    'db': '🗃️',
    'sqlite': '🗃️',
    'py': '🐍',
    'java': '☕',
    'cpp': '⚙️',
    'c': '⚙️',
    'h': '⚙️',
    'cs': '⚙️',
    'go': '🐹',
    'rs': '🦀',
    'php': '🐘',
    'rb': '💎',
    'swift': '🍎',
    'kt': '🅺️',
    'dart': '🎯',
  }
  return iconMap[ext] || '📄'
}

/**
 * 验证文件名
 */
export function isValidFilename(filename: string): boolean {
  if (!filename || filename.trim().length === 0) return false
  
  // 检查非法字符
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/
  if (invalidChars.test(filename)) return false
  
  // 检查保留名称
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
  if (reservedNames.includes(filename.toUpperCase())) return false
  
  return true
}

/**
 * 规范化路径
 */
export function normalizePath(path: string): string {
  // 移除重复的斜杠
  let normalized = path.replace(/\/+/g, '/')
  
  // 确保以 / 开头
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }
  
  // 移除尾部的斜杠（除非是根目录）
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  
  return normalized
}

/**
 * 获取父目录路径
 */
export function getParentPath(path: string): string {
  const normalized = normalizePath(path)
  if (normalized === '/') return '/'
  
  const parts = normalized.split('/').filter(p => p)
  if (parts.length === 0) return '/'
  
  parts.pop()
  return '/' + parts.join('/')
}

/**
 * 连接路径
 */
export function joinPaths(...paths: string[]): string {
  let result = ''
  
  for (const path of paths) {
    if (!path) continue
    result = normalizePath(result + '/' + path)
  }
  
  return result || '/'
}

/**
 * 获取路径的最后一部分
 */
export function getBasename(path: string): string {
  const normalized = normalizePath(path)
  const parts = normalized.split('/').filter(p => p)
  return parts[parts.length - 1] || ''
}

/**
 * 检查是否为有效 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
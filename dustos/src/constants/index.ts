/**
 * 常量配置
 */

// 应用列表
export const APPS = [
  {
    id: '1',
    name: '文件管理器',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    component: 'FileManager',
    description: '管理文件和文件夹'
  },
  {
    id: '2',
    name: '终端',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',
    component: 'Terminal',
    description: '命令行终端'
  },
  {
    id: '3',
    name: '设置',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    component: 'Settings',
    description: '系统设置'
  },
  {
    id: '4',
    name: '浏览器',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
    component: 'Browser',
    description: '网页浏览器'
  },
  {
    id: '5',
    name: '记事本',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    component: 'Notepad',
    description: '文本编辑器'
  },
  {
    id: '6',
    name: '计算器',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="14"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="12" y1="14" x2="12" y2="14"></line><line x1="16" y1="18" x2="16" y2="18"></line><line x1="8" y1="18" x2="8" y2="18"></line><line x1="12" y1="18" x2="12" y2="18"></line></svg>',
    component: 'Calculator',
    description: '科学计算器'
  },
  {
    id: '7',
    name: '任务管理器',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
    component: 'TaskManager',
    description: '系统进程监控'
  },
  {
    id: '8',
    name: '图片查看器',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
    component: 'ImageViewer',
    description: '图片浏览和编辑'
  },
  {
    id: '9',
    name: '音乐播放器',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',
    component: 'MusicPlayer',
    description: '音乐播放和管理'
  },
  {
    id: '10',
    name: '系统信息',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><circle cx="12" cy="10" r="3"></circle><path d="M12 7V4"></path></svg>',
    component: 'SystemInfo',
    description: '系统详细信息'
  },
  {
    id: '11',
    name: '日历',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    component: 'Calendar',
    description: '日历和事件管理'
  },
  {
    id: '12',
    name: '天气',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    component: 'Weather',
    description: '天气预报和天气信息'
  },
  {
    id: '13',
    name: '任务列表',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
    component: 'TaskList',
    description: '任务管理和待办事项'
  },
  {
    id: '14',
    name: '录音机',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
    component: 'VoiceRecorder',
    description: '音频录制和管理'
  },
  {
    id: '15',
    name: '视频播放器',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
    component: 'VideoPlayer',
    description: '视频播放和管理'
  },
  {
    id: '16',
    name: '代码编辑器',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    component: 'CodeEditor',
    description: '代码编辑和语法高亮'
  },
  {
    id: '17',
    name: '时钟',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    component: 'Clock',
    description: '时钟、闹钟、秒表和世界时钟'
  },
  {
    id: '18',
    name: '扫雷',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="12" x2="12" y2="6"></line><line x1="12" y1="12" x2="12" y2="18"></line><line x1="12" y1="12" x2="6" y2="12"></line><line x1="12" y1="12" x2="18" y2="12"></line><line x1="12" y1="12" x2="7" y2="7"></line><line x1="12" y1="12" x2="17" y2="7"></line><line x1="12" y1="12" x2="7" y2="17"></line><line x1="12" y1="12" x2="17" y2="17"></line></svg>',
    component: 'Minesweeper',
    description: '经典扫雷游戏'
  },
  {
    id: '19',
    name: '贪吃蛇',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12a7 7 0 0 1 14 0M5 12c0-3.866 3.134-7 7-7s7 3.134 7 7M5 12h14M12 5v14"></path></svg>',
    component: 'SnakeGame',
    description: '经典贪吃蛇游戏'
  },
  {
    id: '20',
    name: '日志查看器',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    component: 'LogViewer',
    description: '系统日志查看和管理'
  },
  {
    id: '21',
    name: '应用商店',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><path d="M7 15h0M2 9.5h20M2 13.5h20M7 11h0"></path></svg>',
    component: 'AppStore',
    description: '应用下载和管理'
  },
] as const

// 壁纸列表
export const WALLPAPERS = [
  { id: 0, name: '默认渐变', light: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', dark: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
  { id: 1, name: '星空', light: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', dark: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 2, name: '海洋', light: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)', dark: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { id: 3, name: '森林', light: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', dark: 'linear-gradient(135deg, #000428 0%, #004e92 100%)' },
  { id: 4, name: '日落', light: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', dark: 'linear-gradient(135deg, #434343 0%, #000000 100%)' },
  { id: 5, name: '紫夜', light: 'linear-gradient(135deg, #8e44ad 0%, #c0392b 100%)', dark: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { id: 6, name: '樱花', light: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', dark: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)' },
  { id: 7, name: '极光', light: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', dark: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { id: 8, name: '火焰', light: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)', dark: 'linear-gradient(135deg, #200122 0%, #6f0000 100%)' },
  { id: 9, name: '冰霜', light: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', dark: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)' },
  { id: 10, name: '彩虹', light: 'linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)', dark: 'linear-gradient(135deg, #2d3436, #636e72, #b2bec3, #dfe6e9)' },
  { id: 11, name: '深蓝', light: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', dark: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 12, name: '薄荷', light: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', dark: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' },
  { id: 13, name: '珊瑚', light: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', dark: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)' },
  { id: 14, name: '紫罗兰', light: 'linear-gradient(135deg, #a855f7 0%, #3f37c9 100%)', dark: 'linear-gradient(135deg, #240046 0%, #3c096c 100%)' },
  { id: 15, name: '青柠', light: 'linear-gradient(135deg, #06ffa5 0%, #17b978 100%)', dark: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)' },
  { id: 16, name: '琥珀', light: 'linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%)', dark: 'linear-gradient(135deg, #451a03 0%, #92400e 100%)' },
  { id: 17, name: '天空', light: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', dark: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' },
  { id: 18, name: '粉红', light: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', dark: 'linear-gradient(135deg, #831843 0%, #9f1239 100%)' },
  { id: 19, name: '青色', light: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)', dark: 'linear-gradient(135deg, #164e63 0%, #0f766e 100%)' },
  { id: 20, name: '金色', light: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', dark: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)' },
] as const

// 快速访问路径
export const QUICK_ACCESS = [
  { id: '1', name: '主目录', icon: '🏠', path: '/' },
  { id: '2', name: '文档', icon: '📁', path: '/文档' },
  { id: '3', name: '下载', icon: '📁', path: '/下载' },
  { id: '4', name: '图片', icon: '📁', path: '/图片' },
  { id: '5', name: '音乐', icon: '📁', path: '/音乐' },
  { id: '6', name: '视频', icon: '📁', path: '/视频' },
] as const

// 窗口默认配置
export const WINDOW_DEFAULTS = {
  minWidth: 300,
  minHeight: 200,
  defaultWidth: 800,
  defaultHeight: 600,
  maxWidth: window.innerWidth,
  maxHeight: window.innerHeight - 48,
} as const

// 任务栏配置
export const TASKBAR_CONFIG = {
  height: 48,
  mobileHeight: 56,
  iconSize: 24,
} as const

// 动画配置
export const ANIMATION_CONFIG = {
  windowOpen: 300,
  windowClose: 200,
  windowMinimize: 300,
  windowRestore: 300,
  windowMaximize: 300,
  windowUnmaximize: 300,
  slideIn: 300,
  fade: 300,
} as const

// 存储键
export const STORAGE_KEYS = {
  SYSTEM_SETTINGS: 'system-settings',
  FILESYSTEM: 'filesystem',
  BOOKMARKS: 'browser-bookmarks',
  RECENT_APPS: 'recent-apps',
} as const

// 快捷键配置
export const SHORTCUTS = {
  ALT_TAB: 'Alt+Tab',
  WIN_D: 'Meta+D',
  WIN_SHIFT_D: 'Meta+Shift+D',
  WIN_L: 'Meta+L',
  F5: 'F5',
  ESCAPE: 'Escape',
} as const
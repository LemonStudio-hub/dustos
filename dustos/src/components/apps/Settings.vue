<template>
  <div class="settings">
    <div class="sidebar">
      <div
        v-for="section in sections"
        :key="section.id"
        class="sidebar-item"
        :class="{ active: activeSection === section.id }"
        @click="activeSection = section.id"
      >
        <span v-html="section.icon"></span>
        <span>{{ section.name }}</span>
      </div>
    </div>
    <div class="main-content">
      <!-- 外观设置 -->
      <div v-if="activeSection === 'appearance'" class="section-content">
        <h2>外观设置</h2>

        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>深色模式</h3>
              <p>启用深色主题以减少眼睛疲劳</p>
            </div>
            <button
              class="toggle-button"
              :class="{ active: systemStore.isDarkMode }"
              @click="systemStore.toggleDarkMode"
            >
              <span class="toggle-circle"></span>
            </button>
          </div>
        </div>

        <div class="setting-group">
          <h3>壁纸</h3>
          <div class="wallpaper-grid">
            <div
              v-for="wp in systemStore.wallpapers"
              :key="wp.id"
              class="wallpaper-item"
              :class="{ active: systemStore.wallpaper === wp.id }"
              :style="{ background: wp.light }"
              @click="selectWallpaper(wp.id)"
            >
              <span class="wallpaper-name">{{ wp.name }}</span>
              <span v-if="systemStore.wallpaper === wp.id" class="check-mark">✓</span>
            </div>
          </div>
        </div>

        <div class="setting-group">
          <h3>系统信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">操作系统</span>
              <span class="info-value">dustOS v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">内核版本</span>
              <span class="info-value">Linux 6.17.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">架构</span>
              <span class="info-value">ARM64</span>
            </div>
            <div class="info-item">
              <span class="info-label">处理器</span>
              <span class="info-value">8 核心</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 声音设置 -->
      <div v-if="activeSection === 'sound'" class="section-content">
        <h2>声音设置</h2>

        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>系统音量</h3>
              <p>调整系统主音量</p>
            </div>
            <div class="volume-control">
              <button class="volume-btn" @click="decreaseVolume">−</button>
              <input
                type="range"
                v-model="systemStore.volume"
                min="0"
                max="100"
                @input="systemStore.setVolume(systemStore.volume)"
              />
              <button class="volume-btn" @click="increaseVolume">+</button>
              <span class="volume-value">{{ systemStore.volume }}%</span>
            </div>
          </div>
        </div>

        <div class="setting-group">
          <h3>音效</h3>
          <div class="setting-item">
            <div class="setting-info">
              <h3>系统音效</h3>
              <p>启用系统提示音</p>
            </div>
            <button
              class="toggle-button"
              :class="{ active: systemStore.soundEnabled }"
              @click="systemStore.toggleSound()"
            >
              <span class="toggle-circle"></span>
            </button>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h3>通知音效</h3>
              <p>启用通知提示音</p>
            </div>
            <button
              class="toggle-button"
              :class="{ active: notificationSoundsEnabled }"
              @click="notificationSoundsEnabled = !notificationSoundsEnabled"
            >
              <span class="toggle-circle"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- 网络设置 -->
      <div v-if="activeSection === 'network'" class="section-content">
        <h2>网络设置</h2>

        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Wi-Fi</h3>
              <p>{{ systemStore.wifiConnected ? '已连接到网络' : '未连接到网络' }}</p>
            </div>
            <button
              class="toggle-button"
              :class="{ active: systemStore.wifiConnected }"
              @click="systemStore.toggleWifi"
            >
              <span class="toggle-circle"></span>
            </button>
          </div>
        </div>

        <div class="setting-group">
          <h3>网络状态</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">状态</span>
              <span class="info-value">{{ systemStore.wifiConnected ? '已连接' : '未连接' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">信号强度</span>
              <span class="info-value">强</span>
            </div>
            <div class="info-item">
              <span class="info-label">IP 地址</span>
              <span class="info-value">192.168.1.100</span>
            </div>
            <div class="info-item">
              <span class="info-label">网关</span>
              <span class="info-value">192.168.1.1</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 电源设置 -->
      <div v-if="activeSection === 'power'" class="section-content">
        <h2>电源设置</h2>

        <div class="setting-group">
          <div class="battery-display">
            <div class="battery-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="18" height="10" rx="2"></rect>
                <line x1="22" y1="11" x2="22" y2="13"></line>
                <rect :x="3" :y="10 - (systemStore.battery / 100) * 6" width="16" :height="(systemStore.battery / 100) * 6" :fill="getBatteryColor()"></rect>
              </svg>
              <span class="battery-percentage">{{ systemStore.battery }}%</span>
            </div>
          </div>
        </div>

        <div class="setting-group">
          <h3>电池设置</h3>
          <div class="setting-item">
            <div class="setting-info">
              <h3>省电模式</h3>
              <p>延长电池续航时间</p>
            </div>
            <button
              class="toggle-button"
              :class="{ active: powerSavingMode }"
              @click="powerSavingMode = !powerSavingMode"
            >
              <span class="toggle-circle"></span>
            </button>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h3>自动亮度</h3>
              <p>根据环境光线自动调节屏幕亮度</p>
            </div>
            <button
              class="toggle-button"
              :class="{ active: autoBrightness }"
              @click="autoBrightness = !autoBrightness"
            >
              <span class="toggle-circle"></span>
            </button>
          </div>
        </div>
      </div>

<!-- 备份与恢复 -->
      <div v-if="activeSection === 'backup'" class="section-content">
        <h2>备份与恢复</h2>
        <BackupManager />
      </div>

      <!-- 快捷键设置 -->
      <div v-if="activeSection === 'shortcuts'" class="section-content">
        <h2>快捷键设置</h2>
        <ShortcutsManager />
      </div>

      <!-- 关于 -->
      <div v-if="activeSection === 'about'" class="section-content">
        <h2>关于 dustOS</h2>

        <div class="about-content">
          <div class="about-logo">💻</div>
          <div class="about-title">dustOS</div>
          <div class="about-version">版本 1.0.0</div>

          <div class="setting-group">
            <h3>系统信息</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="info-label">操作系统</span>
                <span class="info-value">dustOS</span>
              </div>
              <div class="info-row">
                <span class="info-label">版本</span>
                <span class="info-value">1.0.0</span>
              </div>
              <div class="info-row">
                <span class="info-label">内核</span>
                <span class="info-value">Linux 6.17.0</span>
              </div>
              <div class="info-row">
                <span class="info-label">架构</span>
                <span class="info-value">ARM64</span>
              </div>
              <div class="info-row">
                <span class="info-label">框架</span>
                <span class="info-value">Vue 3 + TypeScript</span>
              </div>
              <div class="info-row">
                <span class="info-label">构建工具</span>
                <span class="info-value">Vite</span>
              </div>
            </div>
          </div>

          <div class="about-footer">
            <p>© 2026 dustOS. 保留所有权利。</p>
            <p>基于 Web 技术构建的桌面操作系统模拟器</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ShortcutsManager from '@/components/ShortcutsManager.vue'
import BackupManager from '@/components/BackupManager.vue'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()
const activeSection = ref('appearance')
// 音效设置已移至 systemStore
const notificationSoundsEnabled = ref(true)
const powerSavingMode = ref(false)
const autoBrightness = ref(true)

const sections = [
  { id: 'appearance', name: '外观', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>' },
  { id: 'sound', name: '声音', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>' },
  { id: 'network', name: '网络', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>' },
  { id: 'power', name: '电源', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line></svg>' },
  { id: 'backup', name: '备份', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>' },
  { id: 'shortcuts', name: '快捷键', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M7 15h0M2 9.5h20M2 13.5h20M7 11h0"></path></svg>' },
  { id: 'about', name: '关于', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>' },
]

function selectWallpaper(id: number) {
  systemStore.changeWallpaper(id)
  const wallpaper = systemStore.wallpapers[id]
  if (wallpaper) {
    systemStore.addNotification('更换壁纸', `已切换到：${wallpaper.name}`)
  }
}

function increaseVolume() {
  const newVolume = Math.min(100, systemStore.volume + 5)
  systemStore.setVolume(newVolume)
}

function decreaseVolume() {
  const newVolume = Math.max(0, systemStore.volume - 5)
  systemStore.setVolume(newVolume)
}

function getBatteryColor() {
  const level = systemStore.battery
  if (level > 50) return '#22c55e'
  if (level > 20) return '#f59e0b'
  return '#ef4444'
}
</script>

<style scoped>
.settings {
  display: flex;
  height: 100%;
  background: #f5f5f5;
}

:global(.dark) .settings {
  background: #2a2a2a;
}

.sidebar {
  width: 200px;
  background: #ffffff;
  border-right: 1px solid #e0e0e0;
  padding: 16px;
}

:global(.dark) .sidebar {
  background: #333333;
  border-right-color: #444;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  margin-bottom: 4px;
}

.sidebar-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

:global(.dark) .sidebar-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-item.active {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
}

.sidebar-item svg {
  width: 18px;
  height: 18px;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.section-content {
  max-width: 800px;
}

h2 {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
}

.setting-group {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

:global(.dark) .setting-group {
  background: #333333;
}

.setting-group h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #e0e0e0;
}

:global(.dark) .setting-item {
  border-bottom-color: #444;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
}

.setting-info p {
  margin: 0;
  font-size: 12px;
  opacity: 0.7;
}

.toggle-button {
  width: 48px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: #e0e0e0;
  cursor: pointer;
  position: relative;
  transition: background-color 0.3s;
}

.toggle-button.active {
  background: #667eea;
}

.toggle-circle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-button.active .toggle-circle {
  transform: translateX(20px);
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.wallpaper-item {
  position: relative;
  height: 100px;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.wallpaper-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.wallpaper-item.active {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

.wallpaper-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 12px;
  text-align: center;
}

.check-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #667eea;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  opacity: 0.7;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.volume-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

:global(.dark) .volume-btn {
  background: #444;
  border-color: #555;
}

.volume-btn:active {
  transform: scale(0.95);
}

.volume-control input[type="range"] {
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

.volume-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

.volume-value {
  font-size: 12px;
  min-width: 35px;
  text-align: right;
}

.battery-display {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.battery-icon {
  position: relative;
  width: 120px;
  height: 120px;
}

.battery-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
}

.battery-percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: 600;
}

.about-content {
  text-align: center;
}

.about-logo {
  font-size: 80px;
  margin-bottom: 16px;
}

.about-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.about-version {
  font-size: 16px;
  opacity: 0.7;
  margin-bottom: 32px;
}

.info-list {
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
}

:global(.dark) .info-row {
  border-bottom-color: #444;
}

.info-row:last-child {
  border-bottom: none;
}

.about-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

:global(.dark) .about-footer {
  border-top-color: #444;
}

.about-footer p {
  margin: 8px 0;
  font-size: 13px;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
    padding: 8px;
  }

  .sidebar-item span:last-child {
    display: none;
  }

  .sidebar-item {
    justify-content: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .wallpaper-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
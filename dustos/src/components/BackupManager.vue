<template>
  <div class="backup-manager">
    <div class="backup-header">
      <h2>系统备份与恢复</h2>
      <p>备份或恢复您的系统设置和数据</p>
    </div>

    <!-- 当前备份状态 -->
    <div class="backup-status">
      <div class="status-card">
        <div class="status-icon" :class="{ hasBackup: backupInfo.exists }">
          {{ backupInfo.exists ? '✓' : '○' }}
        </div>
        <div class="status-info">
          <div class="status-title">{{ backupInfo.exists ? '有可用备份' : '无备份' }}</div>
          <div class="status-subtitle">
            {{ backupInfo.exists && backupInfo.timestamp ? formatBackupDate(backupInfo.timestamp) : '创建您的第一个备份' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 备份操作 -->
    <div class="backup-actions">
      <div class="action-section">
        <h3>创建备份</h3>
        <p>将当前系统状态保存为备份</p>
        <button class="primary-button" @click="createBackup" :disabled="isCreating">
          <span v-if="isCreating">创建中...</span>
          <span v-else>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            创建备份
          </span>
        </button>
      </div>

      <div class="action-section">
        <h3>恢复备份</h3>
        <p>从备份恢复系统状态</p>
        <div class="restore-buttons">
          <button 
            class="secondary-button" 
            @click="restoreFromStorage" 
            :disabled="!backupInfo.exists || isRestoring"
          >
            <span v-if="isRestoring">恢复中...</span>
            <span v-else>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              恢复备份
            </span>
          </button>
          <button 
            class="import-button" 
            @click="triggerFileInput"
            :disabled="isRestoring"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            导入文件
          </button>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="handleFileImport"
            style="display: none"
          />
        </div>
      </div>

      <div class="action-section" v-if="backupInfo.exists">
        <h3>导出备份</h3>
        <p>将备份文件下载到本地</p>
        <button class="export-button" @click="downloadBackup">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          下载备份文件
        </button>
      </div>

      <div class="action-section" v-if="backupInfo.exists">
        <h3>删除备份</h3>
        <p>删除当前备份文件</p>
        <button class="danger-button" @click="deleteBackup">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          删除备份
        </button>
      </div>
    </div>

    <!-- 备份内容预览 -->
    <div class="backup-preview" v-if="backupInfo.exists">
      <h3>备份内容</h3>
      <div class="preview-list">
        <div class="preview-item">
          <span class="preview-icon">📁</span>
          <span class="preview-name">文件系统</span>
          <span class="preview-status">包含</span>
        </div>
        <div class="preview-item">
          <span class="preview-icon">⚙️</span>
          <span class="preview-name">系统设置</span>
          <span class="preview-status">包含</span>
        </div>
        <div class="preview-item">
          <span class="preview-icon">⌨️</span>
          <span class="preview-name">快捷键配置</span>
          <span class="preview-status">包含</span>
        </div>
        <div class="preview-item">
          <span class="preview-icon">📝</span>
          <span class="preview-name">应用数据</span>
          <span class="preview-status">包含</span>
        </div>
      </div>
    </div>

    <!-- 提示信息 -->
    <div class="backup-tips">
      <h3>使用提示</h3>
      <ul>
        <li>定期备份系统数据以防止意外丢失</li>
        <li>恢复备份将覆盖当前系统状态</li>
        <li>建议在恢复前创建新的备份</li>
        <li>备份文件可以保存到本地或云端</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BackupManager from '@/utils/backup'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()

const backupInfo = ref(BackupManager.getBackupInfo())
const isCreating = ref(false)
const isRestoring = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function formatBackupDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function createBackup() {
  isCreating.value = true
  try {
    await BackupManager.createBackup()
    backupInfo.value = BackupManager.getBackupInfo()
    systemStore.addNotification('备份创建成功', '系统状态已保存')
  } catch (error) {
    console.error('创建备份失败:', error)
    systemStore.addNotification('备份创建失败', '请稍后重试')
  }
  isCreating.value = false
}

async function restoreFromStorage() {
  if (!confirm('确定要恢复备份吗？这将覆盖当前系统状态。')) {
    return
  }

  isRestoring.value = true
  try {
    const backupData = await BackupManager.loadBackup()
if (!backupData) {
  systemStore.addNotification('恢复失败', '未找到备份文件')
  isRestoring.value = false
  return
}
const success = await BackupManager.restoreBackup(backupData)
    if (success) {
      systemStore.addNotification('恢复成功', '系统已恢复到备份状态')
      setTimeout(() => {
        location.reload()
      }, 1500)
    } else {
      systemStore.addNotification('恢复失败', '请检查备份文件')
    }
  } catch (error) {
    console.error('恢复备份失败:', error)
    systemStore.addNotification('恢复失败', '请稍后重试')
  }
  isRestoring.value = false
}

function downloadBackup() {
  try {
    BackupManager.downloadBackup()
    systemStore.addNotification('下载成功', '备份文件已下载')
  } catch (error) {
    console.error('下载备份失败:', error)
    systemStore.addNotification('下载失败', '请稍后重试')
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!confirm('确定要导入此备份吗？这将覆盖当前系统状态。')) {
    return
  }

  isRestoring.value = true
  try {
    const success = await BackupManager.importBackup(file)
    if (success) {
      systemStore.addNotification('导入成功', '系统已恢复到备份状态')
      setTimeout(() => {
        location.reload()
      }, 1500)
    } else {
      systemStore.addNotification('导入失败', '请检查备份文件格式')
    }
  } catch (error) {
    console.error('导入备份失败:', error)
    systemStore.addNotification('导入失败', '请稍后重试')
  }
  isRestoring.value = false

  // 清空文件输入
  target.value = ''
}

function deleteBackup() {
  if (!confirm('确定要删除此备份吗？此操作不可撤销。')) {
    return
  }

  try {
    BackupManager.deleteBackup()
    backupInfo.value = BackupManager.getBackupInfo()
    systemStore.addNotification('删除成功', '备份已删除')
  } catch (error) {
    console.error('删除备份失败:', error)
    systemStore.addNotification('删除失败', '请稍后重试')
  }
}

onMounted(() => {
  backupInfo.value = BackupManager.getBackupInfo()
})
</script>

<style scoped>
.backup-manager {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.backup-header {
  text-align: center;
  margin-bottom: 30px;
}

.backup-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.backup-header p {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.backup-status {
  margin-bottom: 30px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-surface);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--color-text-secondary);
}

.status-icon.hasBackup {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
}

.status-subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.backup-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.action-section {
  background: var(--color-surface);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
}

.action-section p {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.primary-button,
.secondary-button,
.export-button,
.import-button,
.danger-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.primary-button {
  background: var(--color-primary);
  color: white;
}

.primary-button:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: scale(1.02);
}

.secondary-button,
.import-button {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.secondary-button:hover:not(:disabled),
.import-button:hover:not(:disabled) {
  background: var(--color-border);
}

.export-button {
  background: rgba(102, 126, 234, 0.1);
  color: var(--color-primary);
}

.export-button:hover {
  background: rgba(102, 126, 234, 0.2);
}

.danger-button {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.danger-button:hover {
  background: rgba(239, 68, 68, 0.2);
}

.primary-button:disabled,
.secondary-button:disabled,
.import-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.restore-buttons {
  display: flex;
  gap: 12px;
}

.backup-preview {
  background: var(--color-surface);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.backup-preview h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-background);
  border-radius: 8px;
}

.preview-icon {
  font-size: 20px;
}

.preview-name {
  flex: 1;
  font-size: 14px;
  color: var(--color-text);
}

.preview-status {
  font-size: 12px;
  color: #22c55e;
  font-weight: 500;
}

.backup-tips {
  background: rgba(102, 126, 234, 0.1);
  padding: 20px;
  border-radius: 12px;
}

.backup-tips h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.backup-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.backup-tips li {
  font-size: 14px;
  color: var(--color-text);
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
}

.backup-tips li:before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary);
}
</style>
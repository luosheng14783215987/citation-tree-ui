<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import { usePaperStore } from '@/stores/paper'
import { uploadPaper } from '@/api/paper'
import type { UploadFile } from 'element-plus'

const paperStore = usePaperStore()

// 上传进度相关状态（模拟进度）
const uploadProgress = ref(0)
const isUploading = ref(false)
const uploadFileName = ref('')
let progressTimer: number | null = null

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 上传前的验证
const beforeUpload = (file: File): boolean => {
  const isPDF = file.type === 'application/pdf'
  const isLt100M = file.size / 1024 / 1024 < 100

  if (!isPDF) {
    ElMessage.error('只能上传 PDF 格式的文件!')
    return false
  }
  if (!isLt100M) {
    ElMessage.error('文件大小不能超过 100MB!')
    return false
  }
  return true
}

// 上传成功处理
const handleUploadSuccess = async (response: any, file: UploadFile): Promise<void> => {
  try {
    ElMessage.success(`论文 "${response.title}" 上传成功，已提取 ${response.citationCount} 条引文`)
    // 刷新论文列表
    await paperStore.fetchPaperList()
    // 自动选中刚上传的论文
    if (response.paperId) {
      paperStore.setCurrentPaper(response.paperId)
    }
  } catch (error) {
    console.error('上传成功后的处理失败:', error)
  }
}

// 上传失败处理
const handleUploadError = (error: any): void => {
  const message = error?.message || error?.response?.data?.message || '文件上传失败，请重试'
  ElMessage.error(message)
}

// 模拟进度增长
const simulateProgress = (): void => {
  uploadProgress.value = 0
  progressTimer = window.setInterval(() => {
    if (uploadProgress.value < 90) {
      // 在90%之前快速增长
      uploadProgress.value += Math.random() * 15
      if (uploadProgress.value > 90) {
        uploadProgress.value = 90
      }
    }
  }, 200)
}

// 停止进度模拟
const stopProgressSimulation = (): void => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

// 自定义上传方法
const customUpload = async (options: any): Promise<void> => {
  const { file } = options
  
  // 开始上传，显示进度条
  isUploading.value = true
  uploadProgress.value = 0
  uploadFileName.value = file.name
  
  // 开始模拟进度
  simulateProgress()
  
  try {
    const response = await uploadPaper(file)
    
    // 上传完成，进度到100%
    stopProgressSimulation()
    uploadProgress.value = 100
    
    // 延迟一下再隐藏进度条，让用户看到100%
    setTimeout(() => {
      isUploading.value = false
      uploadProgress.value = 0
      uploadFileName.value = ''
    }, 500)
    
    handleUploadSuccess(response, file)
  } catch (error: any) {
    // 上传失败，重置状态
    stopProgressSimulation()
    isUploading.value = false
    uploadProgress.value = 0
    uploadFileName.value = ''
    handleUploadError(error)
    throw error
  }
}

// 菜单点击处理
const handleMenuSelect = async (key: string): Promise<void> => {
  const paperId = parseInt(key, 10)
  if (!isNaN(paperId)) {
    paperStore.setCurrentPaper(paperId)
    // 如果 store 中没有该论文的完整信息，从后端获取
    const paper = paperStore.getPaperById(paperId)
    if (!paper || !paper.doi) {
      try {
        const { getPaperById } = await import('@/api/paper')
        const fullPaper = await getPaperById(paperId)
        paperStore.addPaper(fullPaper)
      } catch (error) {
        console.error('获取论文详情失败:', error)
      }
    }
  }
}

// 组件挂载时获取论文列表
onMounted(async () => {
  try {
    await paperStore.fetchPaperList()
  } catch (error) {
    console.error('获取论文列表失败:', error)
    ElMessage.error('获取论文列表失败，请检查后端服务是否正常运行')
  }
})
</script>

<template>
  <div class="paper-sidebar">
    <!-- 上传按钮 -->
    <div class="upload-section">
      <el-upload
        :auto-upload="true"
        :before-upload="beforeUpload"
        :http-request="customUpload"
        :show-file-list="false"
        :disabled="isUploading"
        accept=".pdf"
      >
        <template #trigger>
          <el-button 
            type="primary" 
            :icon="UploadFilled" 
            class="upload-button"
            :disabled="isUploading"
            :loading="isUploading"
          >
            {{ isUploading ? '上传中...' : '上传 PDF' }}
          </el-button>
        </template>
        <template #tip>
          <div class="upload-tip">仅支持 PDF 格式，文件大小不超过 100MB</div>
        </template>
      </el-upload>
      
      <!-- 上传进度条（模拟进度） -->
      <div v-if="isUploading" class="upload-progress-container">
        <div class="upload-file-name">{{ uploadFileName }}</div>
        <el-progress 
          :percentage="Math.round(uploadProgress)" 
          :status="uploadProgress === 100 ? 'success' : undefined"
          :stroke-width="8"
          class="upload-progress"
        />
        <div class="upload-progress-text">{{ Math.round(uploadProgress) }}%</div>
      </div>
    </div>

    <!-- 论文列表 -->
    <div class="paper-list-section">
      <div class="list-header">
        <el-icon><Document /></el-icon>
        <span>论文列表</span>
        <el-badge :value="paperStore.paperList.length" class="badge" />
      </div>

      <el-scrollbar class="menu-scrollbar">
        <div v-if="paperStore.isEmpty" class="empty-paper">
          <el-empty description="暂无论文，请先上传" :image-size="60" />
        </div>
        <el-menu
          v-else
          :default-active="paperStore.currentPaperId?.toString()"
          @select="handleMenuSelect"
          class="paper-menu"
        >
          <el-menu-item
            v-for="paper in paperStore.paperList"
            :key="paper.id"
            :index="paper.id.toString()"
            class="paper-menu-item"
          >
            <template #title>
              <div class="paper-item">
                <div class="paper-title">{{ paper.title }}</div>
                <div class="paper-meta">
                  <span v-if="paper.doi" class="doi">DOI: {{ paper.doi }}</span>
                  <span class="date">{{ formatDate(paper.createdAt) }}</span>
                </div>
              </div>
            </template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </div>
  </div>
</template>

<style scoped>
.paper-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.upload-section {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.upload-button {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
}

.upload-tip {
  font-size: 12px;
  color: #6c757d;
  margin-top: 8px;
  text-align: center;
}

.upload-progress-container {
  margin-top: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.upload-file-name {
  font-size: 13px;
  color: #495057;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.upload-progress {
  margin-bottom: 4px;
}

.upload-progress-text {
  font-size: 12px;
  color: #6c757d;
  text-align: right;
  margin-top: 4px;
}

.paper-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
  background-color: #ffffff;
}

.badge {
  margin-left: auto;
}

.menu-scrollbar {
  flex: 1;
  overflow: hidden;
}

.menu-scrollbar :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

.paper-menu {
  border: none;
  background-color: transparent;
  width: 100%;
}

.paper-menu-item {
  height: auto;
  min-height: 60px;
  line-height: normal;
  padding: 12px 20px !important;
  margin: 0;
  border-bottom: 1px solid #f0f0f0;
}

.paper-menu-item:last-child {
  border-bottom: none;
}

.paper-menu-item:hover {
  background-color: #f5f5f5;
}

.paper-menu-item.is-active {
  background-color: #e8e3ff;
  color: #8b5cf6;
}

.paper-item {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.paper-title {
  font-size: 14px;
  color: #212529;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
  font-weight: 500;
}

.paper-menu-item.is-active .paper-title {
  color: #8b5cf6;
}

.paper-meta {
  font-size: 12px;
  color: #6c757d;
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.4;
}

.doi {
  color: #8b5cf6;
  font-weight: 400;
}

.date {
  color: #6c757d;
}

.empty-paper {
  padding: 60px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>

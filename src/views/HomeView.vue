<script setup lang="ts">
import { computed } from 'vue'
import { usePaperStore } from '@/stores/paper'
import PaperSidebar from '@/components/PaperSidebar.vue'
import CitationTree from '@/components/CitationTree.vue'

const paperStore = usePaperStore()

// 当前选中的论文ID
const currentPaperId = computed(() => paperStore.currentPaperId)
</script>

<template>
  <div class="home-view">
    <el-container class="home-container">
      <!-- 左侧：论文功能侧边栏 -->
      <el-aside width="280px" class="paper-sidebar-container">
        <PaperSidebar />
      </el-aside>

      <!-- 右侧：ECharts 容器 -->
      <el-main class="chart-main">
        <div class="chart-container">
          <div v-if="!currentPaperId" class="chart-placeholder">
            <el-empty description="请从左侧选择一篇论文查看引用树" :image-size="100" />
          </div>
          <CitationTree v-else :paper-id="currentPaperId" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.home-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
}

.paper-sidebar-container {
  background-color: #f8f9fa;
  border-right: 1px solid #e9ecef;
  overflow: hidden;
  height: 100%;
  flex-shrink: 0;
}

.chart-main {
  background-color: #ffffff;
  padding: 0;
  margin: 0;
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #ffffff;
  overflow: hidden;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
}
</style>

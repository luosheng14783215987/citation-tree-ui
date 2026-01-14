import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Paper } from '@/api/paper'
import { listPapers } from '@/api/paper'

/**
 * 论文 Store
 */
export const usePaperStore = defineStore('paper', () => {
  // State
  /**
   * 论文列表
   */
  const paperList = ref<Paper[]>([])

  /**
   * 当前选中的论文ID
   */
  const currentPaperId = ref<number | null>(null)

  // Getters
  /**
   * 当前选中的论文
   */
  const currentPaper = computed<Paper | null>(() => {
    if (currentPaperId.value === null) {
      return null
    }
    return paperList.value.find((paper) => paper.id === currentPaperId.value) || null
  })

  /**
   * 论文列表是否为空
   */
  const isEmpty = computed<boolean>(() => {
    return paperList.value.length === 0
  })

  // Actions
  /**
   * 获取论文列表
   */
  async function fetchPaperList(): Promise<void> {
    try {
      const papers = await listPapers()
      paperList.value = papers
    } catch (error) {
      console.error('获取论文列表失败:', error)
      throw error
    }
  }

  /**
   * 设置当前选中的论文ID
   *
   * @param id 论文ID，如果为 null 则清除选中状态
   */
  function setCurrentPaper(id: number | null): void {
    currentPaperId.value = id
  }

  /**
   * 清除当前选中的论文
   */
  function clearCurrentPaper(): void {
    currentPaperId.value = null
  }

  /**
   * 根据ID查找论文
   *
   * @param id 论文ID
   * @returns 论文对象，如果不存在返回 undefined
   */
  function getPaperById(id: number): Paper | undefined {
    return paperList.value.find((paper) => paper.id === id)
  }

  /**
   * 添加论文到列表（用于上传后添加）
   *
   * @param paper 论文对象
   */
  function addPaper(paper: Paper): void {
    // 检查是否已存在
    const existingIndex = paperList.value.findIndex((p) => p.id === paper.id)
    if (existingIndex !== -1) {
      // 如果已存在，更新
      paperList.value[existingIndex] = paper
    } else {
      // 如果不存在，添加到列表开头
      paperList.value.unshift(paper)
    }
  }

  /**
   * 重置 store 状态
   */
  function reset(): void {
    paperList.value = []
    currentPaperId.value = null
  }

  return {
    // State
    paperList,
    currentPaperId,
    // Getters
    currentPaper,
    isEmpty,
    // Actions
    fetchPaperList,
    setCurrentPaper,
    clearCurrentPaper,
    getPaperById,
    addPaper,
    reset
  }
})

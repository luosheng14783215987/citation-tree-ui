<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getPaperTree } from '@/api/paper'
import type { CitationTreeNodeVO } from '@/api/paper'
import { ElMessage } from 'element-plus'

interface Props {
  paperId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  paperId: null
})

// ECharts 实例
let chartInstance: echarts.ECharts | null = null
const chartContainer = ref<HTMLDivElement | null>(null)
let resizeObserver: ResizeObserver | null = null

/**
 * 截断长文本
 */
const truncateText = (text: string, maxLength: number = 60): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * 将后端数据转换为 ECharts Tree 格式
 */
const convertToEChartsData = (node: CitationTreeNodeVO, parentName = ''): any => {
  // 保存完整文本用于 tooltip
  const fullText = node.name || node.rawText || ''
  const rawText = node.rawText || node.name || ''
  
  // 构建节点标签，如果有引用序号则显示序号
  // 对长文本进行截断处理（仅用于显示）
  let displayName = truncateText(fullText, 60)
  let nodeLabel = displayName
  if (node.citeOrder != null && node.citeOrder > 0) {
    nodeLabel = `[${node.citeOrder}] ${displayName}`
  }
  
  const echartNode: any = {
    name: nodeLabel, // 节点标签显示截断后的文本
    value: fullText, // 保存完整文本用于 tooltip
    rawText: rawText, // 保存原始文本用于 tooltip
    isResolved: node.isResolved,
    citeOrder: node.citeOrder,
    itemStyle: {
      color: getNodeColor(node)
    },
    label: {
      show: true,
      fontSize: 12,
      fontWeight: node.isResolved === 1 ? 'bold' : 'normal',
      overflow: 'truncate', // 文本溢出处理
      ellipsis: '...' // 省略号
    }
  }

  // 如果有子节点，递归处理
  if (node.children && node.children.length > 0) {
    echartNode.children = node.children.map((child) => convertToEChartsData(child, node.name))
  }

  return echartNode
}

/**
 * 获取节点颜色
 */
const getNodeColor = (node: CitationTreeNodeVO): string => {
  // 根节点：蓝色
  if (node.paperId && node.isResolved === 1) {
    return '#3b82f6' // 蓝色
  }
  // 已解析的子节点：绿色
  if (node.isResolved === 1) {
    return '#10b981' // 绿色
  }
  // 未解析的子节点：灰色
  return '#9ca3af' // 灰色
}

/**
 * 初始化图表
 */
const initChart = (): void => {
  if (!chartContainer.value) {
    return
  }

  // 如果已存在实例，先销毁
  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartContainer.value)
  
  // 设置初始配置（空数据）
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        const data = params.data
        return `<div style="padding: 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
          <div style="font-size: 12px; color: #666;">
            ${data.isResolved === 1 ? '已解析' : '未解析'}
          </div>
        </div>`
      }
    },
    series: [
      {
        type: 'tree',
        data: [],
        top: '5%',
        left: '7%',
        bottom: '5%',
        right: '20%',
        symbolSize: 10,
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 12
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        },
        emphasis: {
          focus: 'descendant'
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
        lineStyle: {
          color: '#ccc',
          width: 1.5,
          curveness: 0.5
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

/**
 * 加载并渲染引用树
 */
const loadTree = async (): Promise<void> => {
  if (!props.paperId) {
    // 清空图表
    if (chartInstance) {
      chartInstance.setOption({
        series: [{ data: [] }]
      })
    }
    return
  }

  try {
    const treeData = await getPaperTree(props.paperId)
    
    // 转换为 ECharts 格式
    const echartData = convertToEChartsData(treeData)
    
    // 更新图表
    if (chartInstance) {
      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          formatter: (params: any) => {
            const data = params.data
            // 优先使用 value（完整文本），如果没有则使用 rawText，最后使用 name（截断后的）
            const fullText = data.value || data.rawText || data.name || ''
            const citeOrder = data.citeOrder ? `引用序号: ${data.citeOrder}` : ''
            return `<div style="padding: 10px; max-width: 500px;">
              <div style="font-weight: 600; margin-bottom: 6px; color: #333; word-break: break-word; white-space: normal;">${fullText}</div>
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                ${data.isResolved === 1 ? '<span style="color: #10b981;">✓ 已解析</span>' : '<span style="color: #9ca3af;">○ 未解析</span>'}
                ${citeOrder ? ` <span style="color: #8b5cf6; margin-left: 8px;">${citeOrder}</span>` : ''}
              </div>
            </div>`
          }
        },
        series: [
          {
            type: 'tree',
            data: [echartData],
            top: '5%',
            left: '7%',
            bottom: '5%',
            right: '20%',
            symbolSize: 12,
            label: {
              position: 'left',
              verticalAlign: 'middle',
              align: 'right',
              fontSize: 13,
              color: '#333',
              width: 250, // 限制标签宽度，超出部分会省略
              overflow: 'truncate', // 文本溢出处理
              ellipsis: '...' // 省略号
            },
            leaves: {
              label: {
                position: 'right',
                verticalAlign: 'middle',
                align: 'left',
                fontSize: 12,
                width: 250, // 限制标签宽度，超出部分会省略
                overflow: 'truncate', // 文本溢出处理
                ellipsis: '...' // 省略号
              }
            },
            emphasis: {
              focus: 'descendant',
              itemStyle: {
                borderColor: '#8b5cf6',
                borderWidth: 2
              }
            },
            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750,
            lineStyle: {
              color: '#d1d5db',
              width: 2,
              curveness: 0.5
            }
          }
        ]
      }
      
      chartInstance.setOption(option, true)
    }
  } catch (error) {
    console.error('加载引用树失败:', error)
    ElMessage.error('加载引用树失败')
  }
}

/**
 * 处理窗口大小变化
 */
const handleResize = (): void => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听 paperId 变化
watch(
  () => props.paperId,
  async (newPaperId) => {
    if (newPaperId) {
      await nextTick()
      await loadTree()
    } else {
      // 清空图表
      if (chartInstance) {
        chartInstance.setOption({
          series: [{ data: [] }]
        })
      }
    }
  },
  { immediate: true }
)

// 组件挂载
onMounted(async () => {
  await nextTick()
  initChart()
  await loadTree()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 使用 ResizeObserver 监听容器大小变化
  if (chartContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(chartContainer.value)
  }
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<template>
  <div ref="chartContainer" class="citation-tree-container"></div>
</template>

<style scoped>
.citation-tree-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>

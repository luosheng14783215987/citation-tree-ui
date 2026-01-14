import request from '@/utils/request'

/**
 * 论文上传响应
 */
export interface PaperUploadVO {
  paperId: number
  title: string
  filePath: string
  fileHash: string
  citationCount: number
}

/**
 * 论文实体
 */
export interface Paper {
  id: number
  title: string
  doi?: string
  filePath: string
  fileHash: string
  createdAt: string
  updatedAt: string
}

/**
 * 引用树节点
 */
export interface CitationTreeNodeVO {
  name: string
  paperId?: number
  isResolved: number
  rawText?: string
  citeOrder?: number
  children?: CitationTreeNodeVO[]
}

/**
 * 上传论文PDF文件
 *
 * @param file PDF文件
 * @returns 上传结果
 */
export const uploadPaper = (file: File): Promise<PaperUploadVO> => {
  const formData = new FormData()
  formData.append('file', file)
  
  return request.post<PaperUploadVO>('/papers/upload', formData)
}

/**
 * 查询论文列表
 *
 * @returns 论文列表
 */
export const listPapers = (): Promise<Paper[]> => {
  return request.get<Paper[]>('/papers/list')
}

/**
 * 获取论文引用树
 *
 * @param id 论文ID
 * @returns 引用树结构
 */
export const getPaperTree = (id: number): Promise<CitationTreeNodeVO> => {
  return request.get<CitationTreeNodeVO>(`/papers/${id}/tree`)
}

/**
 * 根据ID查询论文详情
 *
 * @param id 论文ID
 * @returns 论文信息
 */
export const getPaperById = (id: number): Promise<Paper> => {
  return request.get<Paper>(`/papers/${id}`)
}

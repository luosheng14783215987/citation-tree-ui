import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import router from '@/router'
import { useUserStore } from '@/stores/user'

/**
 * 响应数据接口
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
}

/**
 * 创建 Axios 实例
 */
const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token 并添加到请求头
    const userStore = useUserStore()
    const token = userStore.token || localStorage.getItem('satoken')
    if (token) {
      config.headers['satoken'] = token
    }

    // 如果是 FormData，不设置 Content-Type，让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    
    // 如果返回的 code 不是 200，直接 reject，让业务层处理错误提示
    if (res.code !== 200) {
      // 创建一个包含完整错误信息的 Error 对象
      const error = new Error(res.message || '请求失败') as any
      error.response = {
        data: {
          code: res.code,
          message: res.message
        }
      }
      return Promise.reject(error)
    }
    
    return res.data
  },
  (error) => {
    // 处理 HTTP 错误
    let message = '请求失败'
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          // 401 未授权，清除 token 并跳转到登录页
          message = '未授权，请重新登录'
          const userStore = useUserStore()
          userStore.clearUserData()
          // 避免重复跳转
          if (router.currentRoute.value.path !== '/login') {
            router.push('/login')
          }
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求失败：${error.response.status}`
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络'
    } else {
      message = error.message || '请求失败'
    }
    
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UserInfo, UserInfoVO } from '@/api/auth'
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUserInfo as getCurrentUserInfoApi } from '@/api/auth'
import type { LoginDTO, RegisterDTO } from '@/api/auth'
import router from '@/router'

/**
 * Token 存储键名
 */
const TOKEN_KEY = 'satoken'

/**
 * 用户 Store
 */
export const useUserStore = defineStore('user', () => {
  // State
  /**
   * Token 值
   */
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))

  /**
   * 用户信息
   */
  const userInfo = ref<UserInfo | null>(null)

  /**
   * 用户角色列表
   */
  const roles = ref<string[]>([])

  /**
   * 用户权限列表
   */
  const permissions = ref<string[]>([])

  // Getters
  /**
   * 是否已登录
   */
  const isLoggedIn = computed<boolean>(() => {
    return token.value !== null && token.value !== ''
  })

  /**
   * 是否为管理员
   */
  const isAdmin = computed<boolean>(() => {
    return roles.value.includes('admin')
  })

  // Actions
  /**
   * 设置 Token
   *
   * @param tokenValue Token 值
   */
  function setToken(tokenValue: string | null): void {
    token.value = tokenValue
    if (tokenValue) {
      localStorage.setItem(TOKEN_KEY, tokenValue)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  /**
   * 设置用户信息
   *
   * @param info 用户信息
   */
  function setUserInfo(info: UserInfo | null): void {
    userInfo.value = info
  }

  /**
   * 设置用户角色
   *
   * @param roleList 角色列表
   */
  function setRoles(roleList: string[]): void {
    roles.value = roleList
  }

  /**
   * 设置用户权限
   *
   * @param permList 权限列表
   */
  function setPermissions(permList: string[]): void {
    permissions.value = permList
  }

  /**
   * 用户登录
   *
   * @param loginDTO 登录信息
   */
  async function login(loginDTO: LoginDTO): Promise<void> {
    try {
      const loginVO = await loginApi(loginDTO)
      // 保存 Token
      setToken(loginVO.tokenValue)
      // 登录成功后获取用户信息（包括角色和权限）
      await fetchUserInfo()
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  /**
   * 用户注册
   *
   * @param registerDTO 注册信息
   */
  async function register(registerDTO: RegisterDTO): Promise<void> {
    try {
      const userInfo = await registerApi(registerDTO)
      setUserInfo(userInfo)
      // 注册成功后自动登录
      await login({
        username: registerDTO.username,
        password: registerDTO.password
      })
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  }

  /**
   * 用户注销
   */
  async function logout(): Promise<void> {
    try {
      await logoutApi()
    } catch (error) {
      console.error('注销失败:', error)
    } finally {
      // 无论注销接口是否成功，都清除本地数据
      setToken(null)
      setUserInfo(null)
      setRoles([])
      // 跳转到登录页
      router.push('/login')
    }
  }

  /**
   * 获取当前用户信息（包括角色和权限）
   */
  async function fetchUserInfo(): Promise<void> {
    try {
      const userInfoVO = await getCurrentUserInfoApi()
      setUserInfo({
        id: userInfoVO.id,
        username: userInfoVO.username,
        nickname: userInfoVO.nickname,
        avatar: userInfoVO.avatar
      })
      setRoles(userInfoVO.roles || [])
      setPermissions(userInfoVO.permissions || [])
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  /**
   * 检查用户是否有指定权限
   *
   * @param permission 权限标识
   * @returns 是否有权限
   */
  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  /**
   * 检查用户是否有指定角色
   *
   * @param role 角色标识
   * @returns 是否有角色
   */
  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  /**
   * 清除用户数据（用于未登录时清除本地残留数据）
   */
  function clearUserData(): void {
    setToken(null)
    setUserInfo(null)
    setRoles([])
    setPermissions([])
  }

  return {
    // State
    token,
    userInfo,
    roles,
    permissions,
    // Getters
    isLoggedIn,
    isAdmin,
    // Actions
    setToken,
    setUserInfo,
    setRoles,
    setPermissions,
    login,
    register,
    logout,
    fetchUserInfo,
    hasPermission,
    hasRole,
    clearUserData
  }
})

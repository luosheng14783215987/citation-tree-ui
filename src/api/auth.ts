import request from '@/utils/request'

/**
 * 登录请求参数
 */
export interface LoginDTO {
  username: string
  password: string
}

/**
 * 注册请求参数
 */
export interface RegisterDTO {
  username: string
  password: string
  nickname?: string
}

/**
 * 登录响应
 */
export interface LoginVO {
  tokenName: string
  tokenValue: string
}

/**
 * 用户信息（基础信息）
 */
export interface UserInfo {
  id: number
  username: string
  nickname?: string
  avatar?: string
}

/**
 * 用户信息VO（包含角色和权限）
 */
export interface UserInfoVO {
  id: number
  username: string
  nickname?: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

/**
 * 用户登录
 *
 * @param loginDTO 登录信息
 * @returns 登录响应（包含 token）
 */
export const login = (loginDTO: LoginDTO): Promise<LoginVO> => {
  return request.post<LoginVO>('/auth/login', loginDTO)
}

/**
 * 用户注册
 *
 * @param registerDTO 注册信息
 * @returns 注册成功的用户信息
 */
export const register = (registerDTO: RegisterDTO): Promise<UserInfo> => {
  return request.post<UserInfo>('/auth/register', registerDTO)
}

/**
 * 用户注销
 */
export const logout = (): Promise<void> => {
  return request.post<void>('/auth/logout')
}

/**
 * 获取当前登录用户信息（包含角色和权限）
 *
 * @returns 用户信息VO
 */
export const getCurrentUserInfo = (): Promise<UserInfoVO> => {
  return request.get<UserInfoVO>('/auth/info')
}

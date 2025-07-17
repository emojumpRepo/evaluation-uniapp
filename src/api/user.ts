import type { IUserBaseInfo, IUserInfoVo } from './types/login'
import type { PolicyType } from './types/user'
import { http } from '@/http/http'

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return http.get<IUserInfoVo>('/member/user/get')
}

/**
 * 修改用户信息
 */
export function updateInfo(data: IUserBaseInfo) {
  return http.put('/member/user/update', data)
}

/**
 * 获取服务协议
 */
export function getAgreement(type: PolicyType) {
  return http.get<{ content: string }>('/system/policy/get-by-type', { type })
}

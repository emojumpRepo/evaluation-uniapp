import type { ICaptcha, IUpdatePassword, IUserLogin } from './types/login'
import { http } from '@/http/http'

/**
 * 登录表单
 */
export interface ILoginForm {
  username: string
  password: string
  code: string
  uuid: string
}

/**
 * 获取验证码
 * @returns ICaptcha 验证码
 */
export function getCode() {
  return http.get<ICaptcha>('/user/getCode')
}

/**
 * 用户微信小程序登录
 * @param loginForm 登录表单
 */
export function wxLogin(data: { type: number, code: string, state: string }) {
  return http.post<IUserLogin>('/member/auth/social-login', data)
}

/**
 * 用户手机号快速登录
 * @param loginForm 登录表单
 */
export function phoneLogin(data: { phoneCode: string, loginCode: string, state: string }) {
  return http.post<IUserLogin>('/member/auth/weixin-mini-app-login', data)
}

/**
 * 登出系统
 */
export function logout() {
  return http.post('/member/auth/logout')
}

/**
 * 修改用户密码
 */
export function updateUserPassword(data: IUpdatePassword) {
  return http.post('/user/updatePassword', data)
}

/**
 * 刷新令牌
 */
export function refreshToken(refreshToken: string) {
  return http.post(`/member/auth/refresh-token?refreshToken=${refreshToken}`)
}

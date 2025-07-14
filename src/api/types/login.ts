/**
 * 用户信息
 */
export interface IUserInfoVo {
  userId: number
  avatar: string
  nickname: string
  accessToken: string
  refreshToken: string
  openid: string
  expiresTime: number
  mobile: string
}

/**
 * 登录返回的信息
 */
export interface IUserLogin {
  userId: number
  accessToken: string
  refreshToken: string
  openid: string
  expiresTime: number
}

/**
 * 获取验证码
 */
export interface ICaptcha {
  captchaEnabled: boolean
  uuid: string
  image: string
}
/**
 * 上传成功的信息
 */
export interface IUploadSuccessInfo {
  fileId: number
  originalName: string
  fileName: string
  storagePath: string
  fileHash: string
  fileType: string
  fileBusinessType: string
  fileSize: number
}
/**
 * 更新用户信息
 */
export interface IUpdateInfo {
  id: number
  name: string
  sex: string
}
/**
 * 更新用户信息
 */
export interface IUpdatePassword {
  id: number
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

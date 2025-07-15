/**
 * 用户信息
 */
export type IUserInfoVo = IUserBaseInfo & IUserLogin

/**
 * 用户基本信息
 */
export interface IUserBaseInfo {
  avatar: string // 头像
  nickname: string // 昵称
  mobile: string // 手机号
  idCard: string // 身份证号
  name: string // 真实姓名
  sex: number // 性别
  height: number // 身高
  weight: number // 体重
  bloodType: string // 血型
  address: string // 地址
  school: string // 学校
  familyRole: number // 家庭角色 1: 父亲 2: 母亲 3: 其他
}

export function getDefaultUserBaseInfo(): IUserBaseInfo {
  return {
    avatar: '',
    nickname: '',
    mobile: '',
    idCard: '',
    name: '',
    sex: 0,
    height: 0,
    weight: 0,
    bloodType: '',
    address: '',
    school: '',
    familyRole: 0,
  }
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

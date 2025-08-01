// 全局要用的类型放到这里

declare global {
  interface IResData<T> {
    code: number
    msg: string
    data: T
  }

  // uni.uploadFile文件上传参数
  interface IUniUploadFileOptions {
    file?: File
    files?: UniApp.UploadFileOptionFiles[]
    filePath?: string
    name?: string
    formData?: any
  }

  interface IUserInfo {
    nickname?: string
    avatar?: string
    /** 微信的 openid，非微信没有这个字段 */
    openid?: string
    token?: string
  }

  // 微信云开发类型定义
  interface WxCloudTempFileURLResult {
    fileList: Array<{
      fileID: string
      tempFileURL: string
      maxAge: number
      errMsg?: string
    }>
  }

  interface WxCloudUploadResult {
    fileID: string
    statusCode: number
  }

  interface WxCloudDeleteResult {
    fileList: Array<{
      fileID: string
      status: number
      errMsg: string
    }>
  }

  interface WxCloudFunctionResult {
    result: any
    requestId: string
  }

  interface WxCloudInitOptions {
    env: string
    traceUser?: boolean
  }

  interface WxCloud {
    inited?: boolean
    init: (options: WxCloudInitOptions) => void
    getTempFileURL: (options: {
      fileList: string[]
      success?: (res: WxCloudTempFileURLResult) => void
      fail?: (err: any) => void
      complete?: () => void
    }) => void
    uploadFile: (options: {
      cloudPath: string
      filePath: string
      success?: (res: WxCloudUploadResult) => void
      fail?: (err: any) => void
      complete?: () => void
    }) => void
    deleteFile: (options: {
      fileList: string[]
      success?: (res: WxCloudDeleteResult) => void
      fail?: (err: any) => void
      complete?: () => void
    }) => void
    callFunction: (options: {
      name: string
      data?: any
      success?: (res: WxCloudFunctionResult) => void
      fail?: (err: any) => void
      complete?: () => void
    }) => void
    database: () => any
  }

  interface Wx {
    cloud: WxCloud
  }
}

export {} // 防止模块污染

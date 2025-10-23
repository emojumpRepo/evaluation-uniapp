export type BirthType = '自然' | '剖腹产' | '早产' | '足月'
export type Guardian = '父母' | '老人' | '其他'

export interface IBabyInfo {
  id?: number
  userId?: number
  name: string
  birthday: string | number
  gender: number
  height: number
  weight: number
  birthType: BirthType
  guardian: Guardian
  avatar: string
  // 添加月龄字段
  monthAge?: number
}

// 宝宝附件接口类型
export interface BabyFile {
  id: number
  babyId: number
  assessmentId?: number
  fileId: number
  fileName: string
  fileType: string
  fileSize: number
  description?: string
  fileUrl?: string
  createTime: string
  uploadUserId?: number
}

// 附件下载响应类型
export interface FileDownloadResponse {
  url: string
  fileName: string
}

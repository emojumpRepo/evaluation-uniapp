import type { BabyFile, FileDownloadResponse, IBabyInfo } from './types/baby'
import { http } from '@/http/http'

export function createBaby(data: IBabyInfo) {
  return http.post('/member/baby/create', data)
}

export function getBabyList(userId: number) {
  return http.get<IBabyInfo[]>('/member/baby/list-by-user-id', { userId })
}

export function getBabyInfo(babyId: number) {
  return http.get<IBabyInfo>('/member/baby/get', { id: babyId })
}

export function updateBabyInfo(data: IBabyInfo) {
  return http.put('/member/baby/update', data)
}

// 获取宝宝附件列表
export function getBabyFileList(babyId: number) {
  return http.get<BabyFile[]>('/member/baby/file/list', { babyId })
}

// 下载宝宝附件
export function downloadBabyFile(fileId: number) {
  return http.get<FileDownloadResponse>('/member/baby/file/download', { fileId })
}

/**
 * 导出测评报告
 * @param exportType 1-单个测评报告PDF, 2-所有测评PDF合集, 3-附件打包, 4-完整报告包
 */
export interface ExportAssessmentReqVO {
  babyId: number
  assessmentId?: number
  exportType: number
}

export interface ExportAssessmentRespVO {
  exportTaskId: string
  downloadUrl: string
  fileName: string
  fileSize: number
  status: number // 1-处理中, 2-完成, 3-失败
}

// 测评结果VO
export interface AssessmentResultVO {
  id: number
  assessmentId: number
  assessmentTitle: string
  babyId: number
  babyName: string
  completedTime: string
  totalScore: number
  status: number
}

// 通用导出接口
export function exportAssessmentReport(data: ExportAssessmentReqVO) {
  return http.post<ExportAssessmentRespVO>('/emojump/assessment-result/export', data)
}

// 导出单个测评结果报告PDF
export function exportAssessmentPdf(babyId: number, assessmentId: number) {
  return exportAssessmentReport({
    babyId,
    assessmentId,
    exportType: 1, // SINGLE_ASSESSMENT_REPORT
  })
}

// 导出所有测评PDF合集
export function exportAllAssessmentsPdf(babyId: number) {
  return exportAssessmentReport({
    babyId,
    exportType: 2, // ALL_ASSESSMENTS_PDF
  })
}

// 导出测评附件打包
export function exportAssessmentFiles(babyId: number, assessmentId?: number) {
  return exportAssessmentReport({
    babyId,
    assessmentId,
    exportType: 3, // FILES_PACKAGE
  })
}

// 导出完整报告包（PDF+附件）
export function exportAssessmentPackage(babyId: number) {
  return exportAssessmentReport({
    babyId,
    exportType: 4, // COMPLETE_PACKAGE
  })
}

// 获取宝宝的所有测评结果列表
export function getAssessmentResultList(babyId: number) {
  return http.get<AssessmentResultVO[]>('/emojump/assessment-result/list-by-baby', { babyId })
}

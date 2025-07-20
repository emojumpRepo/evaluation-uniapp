import type { IAssessment } from '@/api/types/evaluation'
import { http } from '@/http/http'

// 获取测评列表
export function getAssessmentList(params: { page: number, pageSize: number, category?: string }) {
  return http.get<{ list: IAssessment[], total: number }>('/emojump/assessment/list', params)
}

// 获取测评详情
export function getAssessmentDetail(params: { id: number }) {
  return http.get<IAssessment>('/emojump/assessment/get', params)
}

// 获得已发布测评列表
export function getPublishedAssessmentList(params: { page: number, pageSize: number }) {
  return http.get<{ list: IAssessment[], total: number }>('/emojump/assessment/published', params)
}

// 参与测评
export function participateAssessment(params: { id: number }) {
  return http.post('/emojump/assessment/participate', params)
}

// 提交单个问卷结果（回调）
export function submitQuestionnaireResult(params: { id: number, questionnaireId: number, answers: string[] }) {
  return http.post('/emojump/assessment/submit-questionnaire', params)
}

// 提交测评结果
export function submitAssessmentResult(params: { id: number, answers: string[] }) {
  return http.post('/emojump/assessment/submit', params)
}

// 获得我的测评列表
export function getMyAssessmentList(params: { page: number, pageSize: number }) {
  return http.get<{ list: IAssessment[], total: number }>('/emojump/assessment/my-assessments', params)
}

// 获得某个测评结果
export function getAssessmentResult(params: { id: number }) {
  return http.get<{ result: string }>('/emojump/assessment/result', params)
}

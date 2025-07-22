import type { IAssessment, IQuestionnaire } from '@/api/types/evaluation'
import { http } from '@/http/http'

// ================= 测评接口 =================
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

// =================== 问卷接口 ===================
// 获取问卷列表
export function getQuestionnaires(params?: { page: number, pageSize: number }) {
  return http.get<{ list: IQuestionnaire[], total: number }>('/emojump/questionnaire/published', params)
}

// 获取问卷信息
export function getQuestionnaireInfo(params: { id: number }) {
  return http.get<IQuestionnaire>('/emojump/questionnaire/get', params)
}

// 获取问卷访问链接
export function getQuestionnaireLink(params: { id: number }) {
  return http.get<{ link: string }>('/emojump/questionnaire/access', params)
}

// 记录问卷访问
export function recordQuestionnaireAccess(params: { id: number }) {
  return http.post('/emojump/questionnaire/record-access', params)
}

// 获得热门问卷列表
export function getHotQuestionnaires(params?: { page: number, pageSize: number }) {
  return http.get<{ list: IQuestionnaire[], total: number }>('/emojump/questionnaire/popular', params)
}

// 搜索问卷
export function searchQuestionnaires(params: { keyword: string }) {
  return http.get<{ list: IQuestionnaire[], total: number }>('/emojump/questionnaire/search', params)
}

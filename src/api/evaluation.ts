import type { AssessmentResultRespVO, IAssessment, IAssessmentSubmitReq, IQuestionnaire, IQuestionnaireAnswerSubmitReq, IQuestionnaireResult, IQuestionnaireResultList, IQuestionnaireSubmitReq, LatestAssessmentResultRespVO } from '@/api/types/evaluation'
import { http } from '@/http/http'

// ================= 测评接口 =================
// 获取测评列表
export function getAssessmentList(params: { page: number, pageSize: number, category?: string }) {
  return http.get<{ list: IAssessment[], total: number }>('/emojump/assessment/list', params)
}

// 获取测评详情
export function getAssessmentDetail(params: { id: number, babyId: number }) {
  return http.get<IAssessment>('/emojump/assessment/get', params)
}

// 获得已发布测评列表
export function getPublishedAssessmentList(params: { page: number, pageSize: number }) {
  console.log('获取已发布测评列表', params)
  return http.get<{ list: IAssessment[], total: number }>('/emojump/assessment/published', {
    pageNo: params.page,
    pageSize: params.pageSize,
  })
}

// 参与测评
export function participateAssessment(params: { assessmentId: number, babyId: number }) {
  return http.post(`/emojump/assessment/participate?assessmentId=${params.assessmentId}&babyId=${params.babyId}`)
}

// 提交单个问卷结果（回调）
export function submitQuestionnaireResult(params: IQuestionnaireSubmitReq) {
  return http.post('/emojump/assessment/submit-questionnaire', params)
}

// 提交测评结果
export function submitAssessmentResult(params: IAssessmentSubmitReq) {
  return http.post('/emojump/assessment/submit', params)
}

// 获得宝宝的测评列表
export function getBabyAssessmentList(params: { page: number, pageSize: number, babyId: number }) {
  return http.get<{ list: IAssessment[], total: number }>('/emojump/assessment/baby-assessments', params)
}

// 查看宝宝的测评结果
export function getAssessmentResult(params: { id: number, babyId: number }) {
  return http.get<{ result: string }>('/emojump/assessment/result', params)
}

// =================== 问卷接口 ===================
// 获得已发布问卷列表
export function getPublishedQuestionnaires(params?: { assessmentId: number, babyId: number }) {
  return http.get<IQuestionnaire[]>('/emojump/questionnaire/published', params)
}

// 查看问卷信息
export function getQuestionnaireInfo(params: { id: number, babyId: number }) {
  return http.get<IQuestionnaire>('/emojump/questionnaire/get', params)
}

// 获取问卷访问链接
export function getQuestionnaireLink(params: { id: number }) {
  return http.get<{ link: string }>('/emojump/questionnaire/access', params)
}

// 记录问卷访问
export function recordQuestionnaireAccess(params: { id: number, babyId: number }) {
  return http.post(`/emojump/questionnaire/record-access?id=${params.id}&babyId=${params.babyId}`)
}

// 获得热门问卷列表
export function getHotQuestionnaires(params?: { page: number, pageSize: number }) {
  return http.get<{ list: IQuestionnaire[], total: number }>('/emojump/questionnaire/popular', params)
}

// 搜索问卷
export function searchQuestionnaires(params: { keyword: string }) {
  return http.get<{ list: IQuestionnaire[], total: number }>('/emojump/questionnaire/search', params)
}

// 获取宝宝问卷测评结果
export function getBabyQuestionnaireResult(params: { babyId: number }) {
  return http.get<{ list: IQuestionnaire[], total: number }>('/emojump/questionnaire-result/baby-result-list', params)
}

// 获取某个测评的问卷结果列表
export function getHistoryQuestionnaireResult(params: { questionnaireId: number, assessmentId: number, babyId: number }) {
  return http.get<IQuestionnaireResultList[]>('/emojump/questionnaire-result/history-record', params)
}

// 获取问卷结果
export function getQuestionnaireResult(params: { id: number }) {
  return http.get<IQuestionnaireResult>('/emojump/questionnaire-result/get', params)
}

// 提交问卷答案
export function submitQuestionnaireAnswer(params: IQuestionnaireAnswerSubmitReq) {
  return http.post('/emojump/questionnaire-result/submit-answer', params)
}

// 生成测评结果
export function generateAssessmentResult(params: { assessmentId: number, babyId: number }) {
  return http.get('/emojump/assessment-result/generate-result', params)
}

// 获取最新的测评结果
export function getLatestAssessmentResult(params: { assessmentId: number, babyId: number }) {
  return http.get<LatestAssessmentResultRespVO>('/emojump/assessment-result/latest-result', params)
}

// 获取历史测评结果
export function getHistoryAssessmentResult(params: { assessmentId: number, babyId: number }) {
  return http.get<AssessmentResultRespVO[]>('/emojump/assessment-result/history-results', params)
}

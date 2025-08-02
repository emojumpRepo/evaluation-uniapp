export interface AssessmentQuestionnaire {
  questionnaireId: number
  sortOrder?: number
  isRequired?: boolean
  weight?: number
}

export interface IAssessment {
  id?: number
  title: string
  description?: string
  coverImage?: string
  questionnaires: AssessmentQuestionnaire[]
  type: number
  status?: number
  targetAudience?: string
  duration?: number
  startTime?: string
  endTime?: string
  needAppointment?: boolean
  isRepeatable?: boolean
  maxParticipants?: number
  currentParticipants?: number
  remark?: string
  createTime?: string
  creator?: string
}

export interface IQuestionnaire {
  id?: number
  title: string
  description?: string
  completed?: boolean
  link: string
  estimatedDuration?: number
  accessCount?: number
  isPopular?: boolean
}

export interface IQuestionnaireSubmitReq {
  assessmentResultId: number
  questionnaireId: number
  resultData: string
  score: number
  level: string
  report: string
  completeTime: string
}

export interface IAssessmentSubmitReq {
  assessmentId: number
  babyId: number
  resultData: string
  completeTime: string
}

export interface IAssessmentResult {
  assessmentId: number
  assessmentTitle: string
  questionnaireCount: number
  overallScore: number
  overallLevel: string
  completedTime: string
  overallReport: string
  questionnaireResults: [
    {
      id: number
      questionnaireId: number
      questionnaireTitle: string
      completedTime: string
      score: number
      level: string
    },
  ]
}

export interface IAssessmentResultGroup {
  assessmentId: number
  assessmentTitle: string
  questionnaires: IAssessmentResult[]
}

// 问卷结果响应VO
export interface QuestionnaireResultRespVO {
  id: number
  questionnaireId: number
  questionnaireTitle: string
  score: number
  level: string
  weight: number
  contribution: number
  completedTime: string
}

// 最新测评结果响应VO
export interface LatestAssessmentResultRespVO {
  id: number
  assessmentId: number
  babyId: number
  assessmentTitle: string
  babyName: string
  overallScore: number
  overallLevel: string
  overallReport: string
  completedTime: string
  createTime: string
  questionnaireResults: QuestionnaireResultRespVO[]
}

// 历史测评结果响应VO
export interface AssessmentResultRespVO {
  id: number
  assessmentId: number
  babyId: number
  assessmentName: string
  babyName: string
  babyGender: string
  babyBirthday: string
  overallScore: number
  overallLevel: string
  report: string
  completedTime: string
  createTime: string
  questionnaireResults: QuestionnaireResultRespVO[]
  hasLatestRecord: boolean
}

// 问卷结果详细VO
export interface QuestionnaireResultRespVO {
  id: number
  questionnaireId: number
  questionnaireTitle: string
  resultData: string
  answerData: string
  score: number
  level: string
  report: string
  completedTime: string
}

// 项目掌握情况
export interface ProjectMastery {
  mastered: string[] // 已掌握项目
  pending: string[] // 待发展项目
}

export interface IQuestionnaireResultList {
  id: number
  questionnaireId: number
  title: string
  completedTime: number
  score: number
  level: string
}

export interface IQuestionnaireResult extends IQuestionnaireResultList {
  babyId: number
  assessmentId: number
  resultData: string
  answer: string
  report: string
}

export interface IQuestionnaireAnswerSubmitReq {
  encryptedUserId: string
  encryptedAssessmentId: string
  encryptedQuestionnaireId: string
  encryptedAnswerData: string
  completedTime: number
}

export const LEVEL_COLOR_MAP: Record<string, { color: string, bg: string, icon: string }> = {
  正常范围: { color: 'text-green-600', bg: 'bg-green-50', icon: '🟢' },
  可能抑郁: { color: 'text-red-600', bg: 'bg-red-50', icon: '🔴' },
  需要提升: { color: 'text-orange-600', bg: 'bg-orange-50', icon: '⚠️' },
  需关注: { color: 'text-orange-600', bg: 'bg-orange-50', icon: '⚠️' },
  明显: { color: 'text-red-600', bg: 'bg-red-50', icon: '🔴' },
  一般: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🟡' },
  正常: { color: 'text-green-600', bg: 'bg-green-50', icon: '🟢' },
  优秀: { color: 'text-green-600', bg: 'bg-green-50', icon: '🟢' },
  低风险: { color: 'text-blue-600', bg: 'bg-blue-50', icon: '🟢' },
  中度风险: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🟡' },
  高风险: { color: 'text-red-600', bg: 'bg-red-50', icon: '🔴' },
  严重: { color: 'text-red-600', bg: 'bg-red-50', icon: '🔴' },
  中等: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🟡' },
}

export type LevelType = 'color' | 'bg' | 'icon'

// 获取等级样式
export function getLevelClass(level: string, type: LevelType | LevelType[]): string {
  const info = LEVEL_COLOR_MAP[level] || { color: 'text-gray-600', bg: 'bg-gray-50', icon: '📊' }
  if (Array.isArray(type)) {
    return type.map(t => info[t] || '').filter(Boolean).join(' ')
  }
  else {
    return info[type] || ''
  }
}

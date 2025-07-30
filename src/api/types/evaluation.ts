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
  completedTime: string
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

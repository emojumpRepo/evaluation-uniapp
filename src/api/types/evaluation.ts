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
